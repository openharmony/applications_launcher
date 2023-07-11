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

import { Log } from '../utils/Log';
import { MenuInfo } from '../bean/MenuInfo';
import { StyleConstants } from '../constants/StyleConstants';
import { CommonConstants } from '../constants/CommonConstants';
import { ResourceManager } from '../manager/ResourceManager';

const TAG = 'AppMenu';

@Component
export struct AppMenu {
  menuInfoList: Array<MenuInfo> = new Array<MenuInfo>();
  getMenuInfoList: Function;
  menuMode: number = CommonConstants.MENU_UI_MODE_LIGHT;
  fixedMenuList: Array<MenuInfo> = null;
  dynamicMenuList: Array<MenuInfo> = null;
  isBothTypeMenuExist: boolean = true;
  closeMenu: Function = () => {};

  aboutToAppear(): void {
    Log.showInfo(TAG, 'aboutToAppear start');
    if (this.getMenuInfoList) {
      this.menuInfoList = this.getMenuInfoList();
    }
    this.fixedMenuList = new Array<MenuInfo>();
    this.dynamicMenuList = new Array<MenuInfo>();
    for (let menuInfo of this.menuInfoList) {
      if (menuInfo.menuType == CommonConstants.MENU_TYPE_FIXED) {
        this.fixedMenuList.push(menuInfo);
      } else {
        this.dynamicMenuList.push(menuInfo);
      }
    }
    this.isBothTypeMenuExist = this.fixedMenuList.length > 0 && this.dynamicMenuList.length > 0;
    AppStorage.SetOrCreate('contextMenuState', true);
  }

  aboutToDisappear(): void  {
    Log.showInfo(TAG, 'aboutToDisappear start');
    this.fixedMenuList = null;
    this.dynamicMenuList = null;
    this.getMenuInfoList = null;
    this.closeMenu = null;
  }

  build() {
    Column() {
      Column() {
        ForEach(this.dynamicMenuList, (item) => {
          Column() {
            HorizontalMenuItem({
              menuInfo: item,
              menuMode: this.menuMode,
              closeMenu: this.closeMenu
            })
          }
        }, item => JSON.stringify(item))
      }
      .visibility(this.dynamicMenuList.length > 0 ? Visibility.Visible : Visibility.None)

      if (this.isBothTypeMenuExist) {
        Divider()
          .vertical(false)
          .color((this.menuMode == CommonConstants.MENU_UI_MODE_LIGHT) ? "#33000000" : "#33ffffff")
          .strokeWidth(1)
      }

      Column() {
        ForEach(this.fixedMenuList, (item) => {
          Column() {
            HorizontalMenuItem({
              menuInfo: item,
              menuMode: this.menuMode,
              closeMenu: this.closeMenu
            })
          }
        }, item => JSON.stringify(item))
      }
      .visibility(this.fixedMenuList.length > 0 ? Visibility.Visible : Visibility.None)
    }
    .padding({
      top: 4,
      bottom: 4,
      left: 4,
      right: 4
    })
    .borderRadius(StyleConstants.DEFAULT_12)
  }
}

@Component
struct HorizontalMenuItem {
  @State shortcutIcon: string = StyleConstants.DEFAULT_ICON;
  @State shortcutName: string = "";
  private mResourceManager;
  menuInfo: MenuInfo;
  menuMode: number = CommonConstants.MENU_UI_MODE_LIGHT;
  closeMenu: Function = () => {};

  aboutToAppear(): void  {
    this.mResourceManager = ResourceManager.getInstance();
    this.updateIcon();
    this.updateName();
  }

  aboutToDisappear(): void {
    this.closeMenu = null;
  }

  public shortcutIconLoadCallback(image) {
    this.shortcutIcon = image;
  }

  public shortcutNameLoadCallback(name) {
    this.shortcutName = name;
  }

  public updateIcon() {
    if (this.menuInfo.shortcutIconId != -1 && this.menuInfo.menuImgSrc != "" && this.menuInfo.menuImgSrc != null) {
      this.mResourceManager.getAppIconWithCache(this.menuInfo.shortcutIconId, this.menuInfo.bundleName,
        this.menuInfo.moduleName, this.shortcutIconLoadCallback.bind(this), StyleConstants.DEFAULT_ICON);
    } else {
      this.shortcutIconLoadCallback(this.menuInfo.menuImgSrc);
    }
  }

  public updateName() {
    if (this.menuInfo.shortcutLabelId != -1 && this.menuInfo.menuText != "" && this.menuInfo.menuText != null && this.mResourceManager) {
      this.mResourceManager.getAppNameWithCache(this.menuInfo.shortcutLabelId, this.menuInfo.bundleName,
        this.menuInfo.moduleName, this.shortcutName, this.shortcutNameLoadCallback.bind(this));
    } else {
      this.shortcutNameLoadCallback(this.menuInfo.menuText);
    }
  }

  build() {
    Row() {
      if (this.shortcutIcon != null && this.shortcutIcon != "") {
        Image(this.shortcutIcon)
          .objectFit(ImageFit.Contain)
          .height(StyleConstants.DEFAULT_20)
          .width(StyleConstants.DEFAULT_20)
          .margin({
            left: 12
          })
      } else {
        Image("")
          .objectFit(ImageFit.Contain)
          .height(StyleConstants.DEFAULT_20)
          .width(StyleConstants.DEFAULT_20)
          .backgroundColor('#33ffffFF')
          .margin({
            left: 12
          })
      }
      Text(this.shortcutName)
        .fontColor((this.menuMode == CommonConstants.MENU_UI_MODE_LIGHT) ? "#e5000000" : "#e5ffffff")
        .fontSize(14)
        .height(StyleConstants.DEFAULT_20)
        .margin({
          left: StyleConstants.DEFAULT_8
        })
        .textOverflow({overflow: TextOverflow.Ellipsis})
    }
    .alignItems(VerticalAlign.Center)
    .borderRadius(StyleConstants.DEFAULT_ITEM_RADIUS)
    .height(StyleConstants.DEFAULT_40)
    .width(235)
    .onClick(() => {
      this.menuInfo.onMenuClick();
      this.closeMenu();
    })
  }
}