/**
 * Copyright (c) 2021-2022 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  AppMenu,
  AppIcon,
  ScrollerComponent,
} from '@ohos/common/component'
import {
  LauncherDragItemInfo,
  DockItemInfo,
  CommonConstants,
  StyleConstants,
  ResourceManager,
  Log,
  MenuInfo
} from '@ohos/common';
import { SmartDockStyleConfig } from '../config/SmartDockStyleConfig';

let mSmartDockStyleConfig: SmartDockStyleConfig | null = null;
const TAG = 'RecentLayout';

interface DockRecentPopup {
  show: boolean;
  showItem: string;
  popup: CustomPopupOptions | null;
}

interface DockPadding {
  right: number;
  left: number;
  top: number;
  bottom: number;
}

@Component
export default struct RecentLayout {
  @StorageLink('sysUiRecentOnClickEvent') @Watch('sysUiRecentOnClick') sysUiRecentOnClickEvent: number = 0;
  @StorageLink('dockPadding') dockPadding: DockPadding = {right: 0, left: 0, top: 0, bottom: 0};
  @State isHover: boolean = false;
  @State showPopup: boolean = false;
  @State onHoverItem: string = '';
  @Link @Watch('onDockListChange') appList: Array<DockItemInfo>;
  mRecentMaxNum: number = 0;
  @Link mSmartDockStyleConfig: SmartDockStyleConfig;
  onItemClick: Function = () => {};
  buildMenu: (item: DockItemInfo) => MenuInfo[] = (item: DockItemInfo): MenuInfo[] => [];
  onHoverEvent: Function = () => {};
  onDockListChangeFunc: Function = () => {};
  isScrollHover: boolean = false;
  popup: DockRecentPopup = { show: false, showItem: '', popup: null };
  onClickWithPopup: boolean = false;
  autoCancel: boolean = false;
  private updateData: Function = () => {};

  aboutToAppear(): void {
    mSmartDockStyleConfig = this.mSmartDockStyleConfig;
  }

  aboutToDisappear(): void {
    this.isHover = false;
    this.showPopup = false;
    this.onHoverItem = '';
    this.isScrollHover = false;
    this.onClickWithPopup = false;
    this.autoCancel = false;
  }

  private sysUiRecentOnClick() {
    this.showPopup = false;
    this.popup = { show: false, showItem: '', popup: null };
  }

  @Builder popupBuilder() {
    Column() {
      ScrollerComponent({
        popupHide: () => {
          this.showPopup = false;
          this.popup = { show: false, showItem: '', popup: null };
        },
        updateData: (show: boolean, bundleName: string, callback: () => void) => {
          this.updateData = () => {
            callback();
            setTimeout(() => {
              this.onHoverEvent(true, bundleName);
            }, 100)
          }
          if (show) {
            this.updateData();
            this.getShowPopup();
            return;
          }
          this.showPopup = false;
          this.popup = { show: false, showItem: '', popup: null };
        }
      })
    }.onHover((isScrollHover: boolean) => {
      this.autoCancel = false;
      if (isScrollHover) {
        this.isScrollHover = true;
      } else {
        this.isScrollHover = false;
      }
      this.getShowPopup();
    })
    .onClick(() => {
      this.getShowPopup();
    })
  }

  async getShowPopup() {
    await this.delay(500);
    if (this.popup.show || this.isScrollHover) {
      this.showPopup = true;
    } else {
      this.showPopup = false;
    }
    return this.showPopup;
  }

  delay(ms: number) {
    return new Promise<PromiseConstructor>(resolve => setTimeout(resolve, ms));
  }

  build() {
    List({ space: (mSmartDockStyleConfig?.mListItemGap as number) }) {
      ForEach(this.appList, (item: DockItemInfo) => {
        ListItem() {
          AppItem({
            appInfo: item,
            buildMenu: this.buildMenu
          })
        }
        .bindPopup(this.showPopup && item.bundleName == this.onHoverItem && !AppStorage.get('smartDockShowMenu') as boolean, {
          builder: this.popupBuilder,
          placement: Placement.Top,
          enableArrow: true,
          autoCancel: this.autoCancel,
          maskColor: ('rgba(250,250,250,0)'),
          popupColor: ('rgba(250,250,250,0.6)'),
          onStateChange: (e) => {
            if (!e.isVisible && this.autoCancel) {
              this.popup = { show: false, showItem: '', popup: null };
              this.onHoverItem = '';
              this.onClickWithPopup = false;
              this.autoCancel = false;
              this.showPopup = false;
              AppStorage.setOrCreate('snapshotList', []);
              AppStorage.setOrCreate('recentShowPopup', false);
            }
            if (this.updateData) {
              this.updateData();
              this.updateData = () => {
              }
            }
          },
        })
        .onHover((isHover) => {
          this.autoCancel = false;
          if (this.onHoverEvent) {
            this.onHoverEvent(isHover, item.bundleName);
            this.onHoverItem = item.bundleName as string;
            this.getShowPopup();
          }
        })
        .onClick((event: ClickEvent) => {
          this.onItemClick(event, item);
          this.onClickWithPopup = AppStorage.get('recentShowPopup') as boolean;
          Log.showInfo(TAG, `onClick this.onClickWithPopup: ${this.onClickWithPopup}`);
          if (this.onClickWithPopup) {
            this.autoCancel = true;
            this.showPopup = true
            this.onHoverItem = item.bundleName as string;
          }
          AppStorage.setOrCreate('recentShowPopup', false);
        })
      }, (item: DockItemInfo) => JSON.stringify(item))
    }
    .enableScrollInteraction(false)
    .scrollBar(BarState.Off)
    .padding(this.dockPadding)
    .width(this.getListWidth())
    .height(this.mSmartDockStyleConfig?.mDockHeight as number)
    .backgroundColor(this.mSmartDockStyleConfig?.mBackgroundColor as string)
    .borderRadius(this.mSmartDockStyleConfig?.mDockRadius as number)
    .backdropBlur(this.mSmartDockStyleConfig?.mBackdropBlur as number)
    .visibility(this.getListWidth() === 0 ? Visibility.None : Visibility.Visible)
    .listDirection(Axis[(this.mSmartDockStyleConfig?.mListDirection as string)])
  }

  getListWidth(): number {
    let mRecentMaxNum = this.mSmartDockStyleConfig?.mMaxRecentNum as number;
    let width = 0;
    if (AppStorage.get('deviceType') == CommonConstants.DEFAULT_DEVICE_TYPE) {
      return width;
    }
    if (typeof this.appList === 'undefined' || this.appList == null || this.appList.length === 0) {
      return width;
    }
    let num = this.appList.length;
    if (num > mRecentMaxNum) {
      num = mRecentMaxNum;
    }
    width = (this.mSmartDockStyleConfig?.mDockPadding as number) * 2 +
      num * (this.mSmartDockStyleConfig?.mListItemWidth as number) +
      (num - 1) * (this.mSmartDockStyleConfig?.mListItemGap as number);
    return width;
  }

  private onDockListChange() {
    this.onDockListChangeFunc();
  }
}

@Component
struct AppItem {
  @State isShow: boolean = false;
  appInfo: DockItemInfo = new DockItemInfo();
  buildMenu: (item: DockItemInfo) => MenuInfo[] = (item: DockItemInfo): MenuInfo[] => [];
  private menuInfo: MenuInfo[] = [];

  aboutToAppear(): void {
    this.menuInfo = this.buildMenu(this.appInfo);
  }

  aboutToDisappear(): void {
    this.isShow = false;
  }

  private getLongPress(): boolean {
    return AppStorage.get('isLongPress') as boolean;
  }

  @Builder MenuBuilder() {
    Column() {
      AppMenu({
        menuInfoList: this.menuInfo,
        closeMenu: () => {
          this.isShow = false;
        }
      })
    }
    .alignItems(HorizontalAlign.Center)
    .justifyContent(FlexAlign.Center)
    .width(StyleConstants.CONTEXT_MENU_WIDTH)
    .height(StyleConstants.DEFAULT_40 * this.menuInfo.length + StyleConstants.DEFAULT_8)
  }

  build() {
    Column() {
      Row() {
        AppIcon({
          iconSize: mSmartDockStyleConfig?.mIconSize as number,
          iconId: this.appInfo.appIconId as number,
          bundleName: this.appInfo.bundleName as string,
          moduleName: this.appInfo.moduleName as string,
          icon: ResourceManager.getInstance().getCachedAppIcon(this.appInfo.appIconId as number,
            this.appInfo.bundleName as string, this.appInfo.moduleName as string),
          badgeNumber: this.appInfo.badgeNumber as number
        })
      }
      .width(mSmartDockStyleConfig?.mListItemWidth as number)
      .height(mSmartDockStyleConfig?.mListItemHeight as number)
      .backgroundColor(mSmartDockStyleConfig?.mItemBackgroundColor as string)
      .borderRadius(mSmartDockStyleConfig?.mItemBorderRadius as number)
    }
    .gesture(
    LongPressGesture({ repeat: false })
      .onAction((event: GestureEvent) => {
        this.isShow = true;
        AppStorage.setOrCreate('isLongPress', true);
      })
    )
    .bindPopup(this.isShow, {
      builder: this.MenuBuilder,
      placement: Placement.Top,
      popupColor: Color.White,
      arrowOffset: 3 * ((mSmartDockStyleConfig?.mIconSize as number) / 2) +
        (mSmartDockStyleConfig?.mListItemGap as number),
      onStateChange: (e) => {
        if (!e.isVisible) {
          this.isShow = false;
        }
        AppStorage.setOrCreate('smartDockShowMenu', e.isVisible)
      },
      autoCancel: true
    })
    .onTouch((event: TouchEvent) => {
      if (event.type == CommonConstants.TOUCH_TYPE_UP) {
        AppStorage.setOrCreate('isLongPress', false);
      }
      const dragItemInfo: LauncherDragItemInfo = AppStorage.get<LauncherDragItemInfo>('dragItemInfo') as LauncherDragItemInfo;
      if (dragItemInfo.isDragging) {
        this.isShow = false;
      }
    })
    .onMouse((event: MouseEvent) => {
      Log.showInfo(TAG, `onMouse MouseType: ${event.button}`);
      if (event.button == MouseButton.Right) {
        event.stopPropagation();
        AppStorage.setOrCreate('selectDesktopAppItem', '');
        this.isShow = true;
      }
    })
  }
}