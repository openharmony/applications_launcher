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

import { AppMenu } from '@ohos/common';
import { AppIcon } from '@ohos/common';
import { DockItemInfo } from '@ohos/common';
import { ScrollerComponent } from '@ohos/common';
import { CommonConstants } from '@ohos/common';
import { StyleConstants } from '@ohos/common';
import { ResourceManager } from '@ohos/common';
import { Log } from '@ohos/common';
import { SmartDockStyleConfig } from '../config/SmartDockStyleConfig';

let mSmartDockStyleConfig: SmartDockStyleConfig = null;
const TAG = 'RecentLayout';

@Component
export default struct RecentLayout {
  @StorageLink('sysUiRecentOnClickEvent') @Watch('sysUiRecentOnClick') sysUiRecentOnClickEvent: number = 0;
  @StorageLink('dockPadding') dockPadding: {right: number, left: number, top: number, bottom: number} = {right: 0, left: 0, top: 0, bottom: 0};
  @State isHover: boolean = false;
  @State showPopup: boolean = false;
  @State onHoverItem: string = '';
  @Link @Watch('onDockListChange') appList: Array<DockItemInfo>;
  mRecentMaxNum: number;
  mSmartDockStyleConfig: SmartDockStyleConfig;
  onItemClick: Function = null;
  buildMenu: Function = null;
  onHoverEvent: Function = null;
  onDockListChangeFunc: Function = null;
  isScrollHover: boolean = false;
  popup: {
    show: boolean,
    showItem: string,
    popup
  } = { show: false, showItem: '', popup: null };
  onClickWithPopup: boolean = false;
  autoCancel: boolean = false;
  private updateData: Function = null;

  aboutToAppear(): void {
    mSmartDockStyleConfig = this.mSmartDockStyleConfig;
  }

  aboutToDisappear(): void {
    this.onItemClick = null;
    this.buildMenu = null;
    this.onHoverEvent = null;
    this.onDockListChangeFunc = null;
    this.updateData = null;
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
        updateData: (show, bundleName, callback) => {
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
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  build() {
    List({ space: mSmartDockStyleConfig.mListItemGap }) {
      ForEach(this.appList, (item) => {
        ListItem() {
          AppItem({
            appInfo: item,
            buildMenu: this.buildMenu
          })
        }
        .bindPopup(this.showPopup && item.bundleName == this.onHoverItem && !AppStorage.Get('smartDockShowMenu') as boolean, {
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
              AppStorage.SetOrCreate('snapshotList', []);
              AppStorage.SetOrCreate('recentShowPopup', false);
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
            this.onHoverItem = item.bundleName;
            this.getShowPopup();
          }
        })
        .onClick((event: ClickEvent) => {
          this.onItemClick(event, item);
          this.onClickWithPopup = AppStorage.Get('recentShowPopup');
          Log.showInfo(TAG, `onClick this.onClickWithPopup: ${this.onClickWithPopup}`);
          if (this.onClickWithPopup) {
            this.autoCancel = true;
            this.showPopup = true
            this.onHoverItem = item.bundleName;
          }
          AppStorage.SetOrCreate('recentShowPopup', false);
        })
      }, (item) => JSON.stringify(item))
    }
    .padding(this.dockPadding)
    .width(this.getListWidth())
    .height(this.mSmartDockStyleConfig.mDockHeight)
    .backgroundColor(this.mSmartDockStyleConfig.mBackgroundColor)
    .borderRadius(this.mSmartDockStyleConfig.mDockRadius)
    .backdropBlur(this.mSmartDockStyleConfig.mBackdropBlur)
    .visibility(this.getListWidth() === 0 ? Visibility.None : Visibility.Visible)
    .listDirection(this.mSmartDockStyleConfig.mListDirection)
  }

  getListWidth(): number {
    let mRecentMaxNum = this.mSmartDockStyleConfig.mMaxRecentNum;
    let width = 0;
    if (AppStorage.Get("deviceType") == CommonConstants.DEFAULT_DEVICE_TYPE) {
      return width;
    }
    if (typeof this.appList === 'undefined' || this.appList == null || this.appList.length === 0) {
      return width;
    }
    let num = this.appList.length;
    if (num > mRecentMaxNum) {
      num = mRecentMaxNum;
    }
    width = this.mSmartDockStyleConfig.mDockPadding * 2 + num * (this.mSmartDockStyleConfig.mListItemWidth) + (num - 1) * (this.mSmartDockStyleConfig.mListItemGap);
    return width;
  }

  private onDockListChange() {
    this.onDockListChangeFunc();
  }
}

@Component
struct AppItem {
  @State isShow: boolean = false;
  appInfo: DockItemInfo = null;
  buildMenu: Function = null;
  private menuInfo;

  aboutToAppear(): void {
    this.menuInfo = this.buildMenu(this.appInfo);
  }

  aboutToDisappear(): void {
    this.buildMenu = null;
  }

  private getLongPress(): boolean {
    return AppStorage.Get('isLongPress');
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
          iconSize: mSmartDockStyleConfig.mIconSize,
          iconId: this.appInfo.appIconId,
          bundleName: this.appInfo.bundleName,
          moduleName: this.appInfo.moduleName,
          icon: ResourceManager.getInstance().getCachedAppIcon(this.appInfo.appIconId,
            this.appInfo.bundleName, this.appInfo.moduleName),
          badgeNumber: this.appInfo.badgeNumber
        })
      }
      .width(mSmartDockStyleConfig.mListItemWidth)
      .height(mSmartDockStyleConfig.mListItemHeight)
      .backgroundColor(mSmartDockStyleConfig.mItemBackgroundColor)
      .borderRadius(mSmartDockStyleConfig.mItemBorderRadius)
    }
    .gesture(
    LongPressGesture({ repeat: false })
      .onAction((event: GestureEvent) => {
        this.isShow = true;
        AppStorage.SetOrCreate('isLongPress', true);
      })
    )
    .bindPopup(this.isShow, {
      builder: this.MenuBuilder,
      placement: Placement.Top,
      popupColor: Color.White,
      //@ts-ignore
      arrowOffset: 3 * (mSmartDockStyleConfig.mIconSize / 2) + mSmartDockStyleConfig.mListItemGap,
      onStateChange: (e) => {
        if (!e.isVisible) {
          this.isShow = false;
        }
        AppStorage.SetOrCreate('smartDockShowMenu', e.isVisible)
      },
      autoCancel: true
    })
    .onTouch((event: TouchEvent) => {
      if (event.type == CommonConstants.TOUCH_TYPE_UP) {
        AppStorage.SetOrCreate('isLongPress', false);
      }
      if (AppStorage.Get('isDrag')) {
        this.isShow = false;
      }
    })
    .onMouse((event: MouseEvent) => {
      Log.showInfo(TAG, `onMouse MouseType: ${event.button}`);
      if (event.button == MouseButton.Right) {
        event.stopPropagation();
        AppStorage.SetOrCreate('selectDesktopAppItem', '');
        this.isShow = true;
      }
    })
  }
}