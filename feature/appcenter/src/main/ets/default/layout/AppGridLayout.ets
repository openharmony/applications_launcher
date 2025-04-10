/**
 * Copyright (c) 2021-2022 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import launcherBundleManager from '@ohos.bundle.launcherBundleManager';
import { AppItemInfo, CheckEmptyUtils } from '@ohos/common';
import { Log } from '@ohos/common'
import { Trace } from '@ohos/common';
import { StyleConstants } from '@ohos/common';
import { CommonConstants } from '@ohos/common';
import { EventConstants } from '@ohos/common';
import { AppGrid } from '@ohos/common/component';
import { UninstallDialog } from '@ohos/common/component';
import { MenuInfo } from '@ohos/common';
import { ResourceManager } from '@ohos/common';
import { localEventManager } from '@ohos/common';
import { AppGridViewModel } from '../viewmodel/AppGridViewModel';
import AppCenterGridStyleConfig from '../common/AppCenterGridStyleConfig';
import AppCenterStartAppHandler from '../common/AppCenterStartAppHandler';
import { windowManager } from '@ohos/common';

const TAG = 'AppGridLayout';

class StartAppInfo extends AppItemInfo {
  public icon?: ResourceStr;
}

@Component
export struct AppGridLayout {
  @StorageLink('workSpaceHeight')@Watch('updateAppCenterScreen') workSpaceHeight: number = 0;
  @State mColumns: number = StyleConstants.DEFAULT_APP_GRID_COLUMN;
  @State mRows: number = StyleConstants.DEFAULT_APP_GRID_ROW;
  @StorageLink('listInfo') appGridList: AppItemInfo[] = [];
  mAppGridViewModel: AppGridViewModel = AppGridViewModel.getInstance();
  @StorageLink('appGridStyleConfig') mAppCenterGridStyleConfig: AppCenterGridStyleConfig =
  this.mAppGridViewModel.getAppGridStyleConfig();
  mSelectItem: AppItemInfo = new AppItemInfo();
  private mAppCenterStartAppHandler: AppCenterStartAppHandler = AppCenterStartAppHandler.getInstance();
  private dialogName: string = '';
  mDialogController: CustomDialogController | null = new CustomDialogController({
    builder: UninstallDialog({
      cancel: () => {
      },
      confirm: () => {
        this.onAccept()
      },
      dialogName: this.dialogName,
      dialogContent: this.mSelectItem.appName + ' ?',
    }),
    cancel: () => {
    },
    autoCancel: false,
    customStyle: true
  });

  onAccept() {
    if (typeof this.mSelectItem.bundleName === 'undefined') {
      return;
    }
    this.mAppGridViewModel.uninstallApp(this.mSelectItem.bundleName, this.mSelectItem.isUninstallAble as boolean);
    this.mDialogController?.close();
  }

  aboutToDisappear(): void {
    Log.showInfo(TAG, 'aboutToDisappear');
    this.mDialogController = null;
  }

  aboutToAppear(): void {
    this.updateAppCenterScreen();
  }
  updateAppCenterScreen(): void {
    Log.showInfo(TAG, 'aboutToAppear')
    this.mAppGridViewModel = AppGridViewModel.getInstance();
    this.mAppGridViewModel.getAppList();
    this.mAppCenterGridStyleConfig = this.mAppGridViewModel.getAppGridStyleConfig();
    this.mAppCenterStartAppHandler = AppCenterStartAppHandler.getInstance();
    ResourceManager.getInstance().getStringByResource($r('app.string.isUninstall')).then((resName) => {
      this.dialogName = resName;
    });
  }

  public buildMenuInfoList(appInfo: AppItemInfo) {
    let menuInfoList: MenuInfo[] = [];
    let shortcutInfo = this.mAppGridViewModel.getShortcutInfo(appInfo.bundleName);
    if (shortcutInfo) {
      let menu: MenuInfo | null = null;
      shortcutInfo.forEach((value: launcherBundleManager.ShortcutInfo) => {
        menu = new MenuInfo();
        menu.menuType = CommonConstants.MENU_TYPE_DYNAMIC;
        menu.menuImgSrc = value.icon;
        menu.menuText = value.label;
        menu.shortcutIconId = value.iconId;
        menu.shortcutLabelId = value.labelId;
        menu.bundleName = value.bundleName;
        menu.moduleName = value.moduleName;
        menu.onMenuClick = () => {
          if (value.wants) {
            this.mAppGridViewModel.jumpTo(
              value.wants[0].targetAbility, value.wants[0].targetBundle, value.wants[0].targetModule
            );
          } else {
            Log.showError(TAG, 'value.wants is undefined or empty');
          }
        };
        value.bundleName == appInfo.bundleName && value.moduleName == appInfo.moduleName && menuInfoList.push(menu);
      });
    }

    let open = new MenuInfo();
    open.menuType = CommonConstants.MENU_TYPE_FIXED;
    open.menuImgSrc = '/common/pics/ic_public_add_norm.svg';
    open.menuText = $r('app.string.app_menu_open');
    open.onMenuClick = () => {
      Log.showInfo(TAG,`open.OnMenuClick--:${JSON.stringify(appInfo)}`);
      Trace.start(Trace.CORE_METHOD_START_APP_ANIMATION);
      this.setStartAppInfo(appInfo as StartAppInfo);
      this.mAppGridViewModel.jumpTo(appInfo.abilityName, appInfo.bundleName, appInfo.moduleName);
      windowManager.hideWindow(windowManager.APP_CENTER_WINDOW_NAME);
    };
    menuInfoList.push(open);

    let addToDockMenu = new MenuInfo();
    addToDockMenu.menuType = CommonConstants.MENU_TYPE_FIXED;
    addToDockMenu.menuImgSrc = '/common/pics/ic_public_copy.svg';
    addToDockMenu.menuText = $r('app.string.app_center_menu_add_dock');
    addToDockMenu.onMenuClick = () => {
      Log.showDebug(TAG, 'Launcher click menu item add to smartDock entry');
      localEventManager.sendLocalEventSticky(EventConstants.EVENT_REQUEST_DOCK_ITEM_ADD, appInfo);
    };
    menuInfoList.push(addToDockMenu);

    let addToDeskMenu = new MenuInfo();
    addToDeskMenu.menuType = CommonConstants.MENU_TYPE_FIXED;
    addToDeskMenu.menuImgSrc = '/common/pics/ic_public_copy.svg';
    addToDeskMenu.menuText = $r('app.string.app_center_menu_add_desktop');
    addToDeskMenu.onMenuClick = () => {
      Log.showDebug(TAG, 'click menu item add to pageDesk entry');
      localEventManager.sendLocalEventSticky(EventConstants.EVENT_REQUEST_PAGEDESK_ITEM_ADD, appInfo);
    };
    menuInfoList.push(addToDeskMenu);

    let uninstallMenu = new MenuInfo();
    uninstallMenu.menuType = CommonConstants.MENU_TYPE_FIXED;
    uninstallMenu.menuImgSrc = '/common/pics/ic_public_delete.svg';
    uninstallMenu.menuText = $r('app.string.uninstall');
    uninstallMenu.onMenuClick = () => {
      Log.showDebug(TAG, `click menu item uninstall: ${JSON.stringify(appInfo)}`);
      let cacheKey = '';
      if (appInfo.appLabelId && appInfo.bundleName && appInfo.moduleName) {
        cacheKey = appInfo.appLabelId + appInfo.bundleName + appInfo.moduleName;
      }
      let appName = this.mAppGridViewModel.getAppName(cacheKey);
      Log.showDebug(TAG, `buildMenuInfoList appName: ${appName}`);
      if (appName != null) {
        appInfo.appName = appName;
      }
      this.mSelectItem = appInfo;
      this.mDialogController?.open();
      AppStorage.setOrCreate('uninstallAppInfo', appInfo);
    };
    uninstallMenu.menuEnabled = appInfo.isUninstallAble as boolean;
    menuInfoList.push(uninstallMenu);
    return menuInfoList;
  }

  build() {
    Column() {
      Row() {
        AppGrid({
          appGridList: $appGridList,
          isScroll: true,
          appGridStyleConfig: $mAppCenterGridStyleConfig,
          onItemClick: (event: ClickEvent, item: AppItemInfo) => {
            Log.showDebug(TAG,`open.onAppGridClick--:${JSON.stringify(item)}`);
            Trace.start(Trace.CORE_METHOD_START_APP_ANIMATION);
            this.setStartAppInfo(item as StartAppInfo);
            this.mAppGridViewModel.jumpTo(item.abilityName, item.bundleName, item.moduleName);
            windowManager.hideWindow(windowManager.APP_CENTER_WINDOW_NAME);
          },
          buildMenu: (item: AppItemInfo): MenuInfo[] => this.buildMenuInfoList(item)
        })
      }
      .width(this.mAppCenterGridStyleConfig.mGridWidth)
      .height(this.mAppCenterGridStyleConfig.mGridHeight)

      Row() {

      }.width(216)
      if (this.traceBuildEnd()) {}
    }
    .padding({
      top: this.mAppCenterGridStyleConfig.mPadding
    })
    .backgroundImageSize(ImageSize.Cover)
    .width(StyleConstants.PERCENTAGE_100)
    .height(this.workSpaceHeight - StyleConstants.DEFAULT_28)
  }

  private traceBuildEnd() {
    Trace.end(Trace.CORE_METHOD_START_APP_CENTER);
    return true;
  }

  /**
   * set start app info
   */
  private setStartAppInfo(item: StartAppInfo) {
    Log.showInfo(TAG, `appcenter StartAppInfo:${JSON.stringify(item)}`);
    if (CheckEmptyUtils.isEmpty(item)) {
      Log.showError(TAG, 'setStartAppInfo with item')
      return;
    }
    AppStorage.setOrCreate('startAppTypeFromPageDesktop', CommonConstants.OVERLAY_TYPE_APP_ICON);
    item.icon = ResourceManager.getInstance().getCachedAppIcon(item.appIconId, item.bundleName, item.moduleName);
    AppStorage.setOrCreate('startAppItemInfo', item);
    this.mAppCenterStartAppHandler.setAppIconSize(this.mAppCenterGridStyleConfig.mIconSize);
    this.mAppCenterStartAppHandler.setAppIconInfo();
  }
}
