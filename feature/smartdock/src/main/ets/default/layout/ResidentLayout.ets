// @ts-nocheck
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
} from '@ohos/common/component'
import {
  DockItemInfo,
  LauncherDragItemInfo,
  CommonConstants,
  StyleConstants,
  ResourceManager,
  Log
} from '@ohos/common';
import { SmartDockStyleConfig } from '../config/SmartDockStyleConfig';

let mSmartDockStyleConfig: SmartDockStyleConfig = null;
const TAG = 'ResidentLayout';

@Component
export default struct ResidentLayout {
  @StorageLink('dockPadding') dockPadding: {
    right: number,
    left: number,
    top: number,
    bottom: number
  } = { right: 0, left: 0, top: 0, bottom: 0 };
  @StorageLink('residentList') @Watch('onDockListChange') appList: Array<DockItemInfo> = [];
  mSmartDockStyleConfig: SmartDockStyleConfig;
  onItemClick: Function = null;
  buildMenu: Function = null;
  onDockListChangeFunc: Function = null;

  aboutToAppear(): void {
    mSmartDockStyleConfig = this.mSmartDockStyleConfig;
    this.onDockListChange();
  }

  aboutToDisappear(): void {
    this.onItemClick = null;
    this.buildMenu = null;
    this.onDockListChangeFunc = null;
  }

  getListWidth(): number {
    let residentMaxNum = this.mSmartDockStyleConfig.mMaxDockNum;
    let width = 0.0;
    if (AppStorage.get("deviceType") == CommonConstants.DEFAULT_DEVICE_TYPE) {
      Log.showDebug(TAG, `getListWidth mDockPadding: ${this.mSmartDockStyleConfig.mDockPadding}, mMaxNum: ${residentMaxNum}`);
      width = this.mSmartDockStyleConfig.mDockPadding * 2 + residentMaxNum * (this.mSmartDockStyleConfig.mListItemWidth) + (residentMaxNum - 1) * (this.mSmartDockStyleConfig.mListItemGap);
      Log.showDebug(TAG, `getListWidth width: ${width}`);
    } else {
      if (this.appList == null || this.appList.length === 0) {
      } else {
        let num = this.appList.length;
        if (num > residentMaxNum) {
          num = residentMaxNum;
        }
        width = this.mSmartDockStyleConfig.mDockPadding * 2 + num * (this.mSmartDockStyleConfig.mListItemWidth) + (num - 1) * (this.mSmartDockStyleConfig.mListItemGap);
      }
    }
    return width;
  }

  private onDockListChange() {
    this.onDockListChangeFunc();
  }

  build() {
    if (this.getListWidth && this.getListWidth() !== 0) {
      Row() {
        List({ space: this.appList.length == 0 ? 0 : this.mSmartDockStyleConfig.mListItemGap }) {
          ForEach(this.appList, (item) => {
            ListItem() {
              AppItem({
                appInfo: item,
                buildMenu: this.buildMenu,
                onItemClick: this.onItemClick
              })
            }
          }, (item) => JSON.stringify(item))
        }
        .height('100%')
        .animation({
          curve: Curve.Friction
        })
        .listDirection(Axis[this.mSmartDockStyleConfig.mListDirection])
        .editMode(false)
      }
      .backgroundColor(this.mSmartDockStyleConfig.mBackgroundColor)
      .borderRadius(this.mSmartDockStyleConfig.mDockRadius)
      .backdropBlur(this.mSmartDockStyleConfig.mBackdropBlur)
      .padding(this.appList.length == 0 ? this.mSmartDockStyleConfig.mDockPadding : this.dockPadding)
      .width(this.getListWidth())
      .height(this.mSmartDockStyleConfig.mDockHeight)
      .justifyContent(FlexAlign.Center)
      .onDragEnter((event: DragEvent, extraParams: string) => {
        Log.showDebug(TAG, `onDragEnter extraParams: ${extraParams}, event: [${event.getWindowX()}, ${event.getWindowY()}]`);
      })
      .onDragMove((event: DragEvent, extraParams: string) => {
        Log.showDebug(TAG, `onDragMove event: [${event.getWindowX()}, ${event.getWindowY()}]`);
      })
      .onDragLeave((event: DragEvent, extraParams: string) => {
        Log.showDebug(TAG, `onDragLeave event: [${event.getWindowX()}, ${event.getWindowY()}]`);
      })
      .onDrop((event: DragEvent, extraParams: string) => {
        Log.showInfo(TAG, `onDrop event: [${event.getWindowX()}, ${event.getWindowY()}]`);
        const dragResult = globalThis.SmartDockDragHandler.onDragDrop(event.getWindowX(), event.getWindowY());
        AppStorage.setOrCreate('selectAppIndex', null);
        if (!dragResult) {
          AppStorage.setOrCreate<LauncherDragItemInfo>('dragItemInfo', new LauncherDragItemInfo());
        } else {
          // Wait for the UI rendering to end.
          setTimeout(() => {
            AppStorage.setOrCreate<LauncherDragItemInfo>('dragItemInfo', new LauncherDragItemInfo());
          }, 50);
        }
      })
    }
  }
}

@Component
struct AppItem {
  @StorageLink('dragItemInfo') smartDragItemInfo: LauncherDragItemInfo = new LauncherDragItemInfo();
  @StorageLink('dragItemType') dragItemType: number = CommonConstants.DRAG_FROM_DOCK;
  @State isShow: boolean = false;
  onItemClick: Function = null;
  appInfo: DockItemInfo = null;
  buildMenu: Function = null;
  private menuInfo;

  aboutToAppear(): void {
    this.menuInfo = this.buildMenu(this.appInfo);
  }

  aboutToDisappear(): void {
    this.buildMenu = null;
    this.onItemClick = null;
    this.isShow = false;
    this.appInfo = null;
    this.menuInfo = null;
  }

  private getLongPress(): boolean {
    return AppStorage.get('isLongPress');
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
    .visibility(this.dragItemType === CommonConstants.DRAG_FROM_DOCK && this.smartDragItemInfo.keyName === this.appInfo.keyName ?
    Visibility.Hidden : Visibility.Visible)
    .width(mSmartDockStyleConfig.mListItemWidth)
    .height(mSmartDockStyleConfig.mListItemHeight)
    .backgroundColor(mSmartDockStyleConfig.mItemBackgroundColor)
    .borderRadius(mSmartDockStyleConfig.mItemBorderRadius)
    .parallelGesture(
    LongPressGesture({ repeat: false })
      .onAction((event: GestureEvent) => {
        Log.showInfo(TAG, 'onAction start');
        this.isShow = true;
        AppStorage.setOrCreate('isLongPress', true);
      })
    )
    .bindPopup(this.isShow, {
      builder: this.MenuBuilder,
      placement: Placement.Top,
      popupColor: Color.White,
      arrowOffset: AppStorage.get('deviceType') == CommonConstants.DEFAULT_DEVICE_TYPE ? null : 3 * (mSmartDockStyleConfig.mIconSize / 2) + mSmartDockStyleConfig.mListItemGap, // Avoid the popup offset problem in phone form
      onStateChange: (e) => {
        if (!e.isVisible) {
          this.isShow = false;
        }
        AppStorage.setOrCreate('smartDockShowMenu', e.isVisible)
      },
      autoCancel: true
    })
    .onTouch((event: TouchEvent) => {
      Log.showInfo(TAG, `onTouch event type: ${event.type}`);
      if (event.type === CommonConstants.TOUCH_TYPE_UP && this.smartDragItemInfo.isDragging) {
        let mIsDragEffectArea = globalThis.SmartDockDragHandler.isDragEffectArea(event.touches[0].windowX, event.touches[0].windowY);
        if (!mIsDragEffectArea) {
          AppStorage.setOrCreate<LauncherDragItemInfo>('dragItemInfo', new LauncherDragItemInfo());
          AppStorage.setOrCreate('selectAppIndex', null);
        }
        AppStorage.setOrCreate('isLongPress', false);
      }
      if (this.smartDragItemInfo.isDragging) {
        this.isShow = false;
      }
    })
    .onClick((event) => {
      this.onItemClick(event, this.appInfo);
    })
    .onMouse((event: MouseEvent) => {
      Log.showInfo(TAG, `onMouse MouseType: ${event.button}`);
      if (event.button == MouseButton.Right) {
        event.stopPropagation();
        AppStorage.setOrCreate('selectDesktopAppItem', '');
        this.isShow = true;
      }
    })
    .onDragStart((event: DragEvent, extraParams: string) => {
      Log.showInfo(TAG, `DragStart`);
      this.dragItemType = CommonConstants.DRAG_FROM_DOCK;
      this.smartDragItemInfo = Object.assign(new LauncherDragItemInfo(true), this.appInfo);
      Log.showInfo(TAG, `smartDragItemInfo: ${JSON.stringify(this.smartDragItemInfo)}`);
      const selectAppIndex = globalThis.SmartDockDragHandler.getDragItemIndexByCoordinates(event.getWindowX(), event.getWindowY());
      AppStorage.setOrCreate('selectAppIndex', selectAppIndex);
    })
    .onDragEnd((event: DragEvent, extraParams: string) => {
      Log.showInfo(TAG, `onDragEnd event: [${event.getWindowX()}, ${event.getWindowY()}]` + event.getResult());
      AppStorage.setOrCreate<LauncherDragItemInfo>('dragItemInfo', new LauncherDragItemInfo());
    })
  }
}