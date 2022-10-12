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

import { Log } from '@ohos/common';
import { Trace } from '@ohos/common';
import { CheckEmptyUtils } from '@ohos/common';
import { MenuInfo } from '@ohos/common';
import { MissionInfo } from '@ohos/common';
import { DockItemInfo } from '@ohos/common';
import { windowManager } from '@ohos/common';
import { layoutConfigManager } from '@ohos/common';
import { amsMissionManager }from '@ohos/common';
import { launcherAbilityManager } from '@ohos/common';
import { CommonConstants } from '@ohos/common';
import { BaseViewModel } from '@ohos/common';
import SmartDockStartAppHandler from '../common/SmartDockStartAppHandler';
import SmartDockModel from '../model/SmartDockModel';
import SmartDockDragHandler from '../common/SmartDockDragHandler';
import { SmartDockStyleConfig } from '../config/SmartDockStyleConfig';
import SmartDockConstants from '../common/constants/SmartDockConstants';
import { SmartDockLayoutConfig } from '../config/SmartDockLayoutConfig';

const TAG = 'SmartDockViewModel';

/**
 * SmartDock Viewmodel
 */
export default class SmartDockViewModel extends BaseViewModel {
  private readonly mSmartDockLayoutConfig: SmartDockLayoutConfig;
  private readonly mSmartDockStyleConfig: SmartDockStyleConfig;
  private readonly mSmartDockDragHandler: SmartDockDragHandler;
  private readonly mSmartDockStartAppHandler: SmartDockStartAppHandler;
  private readonly mSmartDockModel: SmartDockModel;
  private mSelectedItem: DockItemInfo;
  private mSelectedDockType = 0;
  private mDevice = CommonConstants.DEFAULT_DEVICE_TYPE;

  constructor() {
    super();
    this.mSmartDockLayoutConfig = layoutConfigManager.getFunctionConfig(SmartDockLayoutConfig.SMART_DOCK_LAYOUT_INFO);
    this.mSmartDockStyleConfig = layoutConfigManager.getStyleConfig(SmartDockStyleConfig.APP_LIST_STYLE_CONFIG, SmartDockConstants.FEATURE_NAME);
    this.mSmartDockDragHandler = SmartDockDragHandler.getInstance();
    this.mSmartDockStartAppHandler = SmartDockStartAppHandler.getInstance();
    this.mSmartDockModel = SmartDockModel.getInstance();
  }

  static getInstance(): SmartDockViewModel{
    if (globalThis.SmartDockViewModel == null) {
      globalThis.SmartDockViewModel = new SmartDockViewModel();
    }
    return globalThis.SmartDockViewModel;
  }

  /**
   * get SmartDockStyleConfig
   */
  getStyleConfig(): SmartDockStyleConfig{
    return layoutConfigManager.getStyleConfig(SmartDockStyleConfig.APP_LIST_STYLE_CONFIG, SmartDockConstants.FEATURE_NAME);
  }

  /**
   * resident dock item onClick function
   * @param event
   * @param item
   * @param callback
   */
  residentOnClick(event, item, callback?) {
    // AppCenter entry
    AppStorage.SetOrCreate('startAppTypeFromPageDesktop', CommonConstants.OVERLAY_TYPE_APP_RESIDENTIAL);
    if (item.abilityName == CommonConstants.APPCENTER_ABILITY && callback != null) {
      callback();
      return;
    }
    if (item.abilityName == CommonConstants.RECENT_ABILITY) {
      globalThis.createWindowWithName(windowManager.RECENT_WINDOW_NAME, windowManager.RECENT_RANK);
      Trace.start(Trace.CORE_METHOD_START_RECENTS);
      return;
    }
    // app entry
    Trace.start(Trace.CORE_METHOD_START_APP_ANIMATION);
    this.setStartAppInfo(item);
    launcherAbilityManager.startLauncherAbility(item.abilityName, item.bundleName, item.moduleName);
  }

  /**
   * recent dock item onClick function
   * @param event
   * @param item
   */
  public recentOnClick(event, item, callback?) {
    AppStorage.SetOrCreate('startAppTypeFromPageDesktop', CommonConstants.OVERLAY_TYPE_APP_RECENT);
    let missionInfoList = [];
    missionInfoList = AppStorage.Get('missionInfoList');
    Log.showDebug(TAG, `recentOnClick missionInfoList.length: ${missionInfoList.length}`);
    if (!CheckEmptyUtils.isEmptyArr(missionInfoList)) {
      for (let i = 0; i < missionInfoList.length; i++) {
        if (missionInfoList[i].bundleName === item.bundleName) {
          let missionList = missionInfoList[i]?.missionInfoList;
          Log.showDebug(TAG, 'recentOnClick missionList.length:' + missionList.length);
          if (!CheckEmptyUtils.isEmptyArr(missionList) && missionList.length > 1) {
            Log.showDebug(TAG, 'recentOnClick callback');
            callback();
          } else if (!CheckEmptyUtils.isEmptyArr(missionList) && missionList.length === 1) {
            let missionId = missionInfoList[i]?.missionInfoList[0]?.missionId;
            amsMissionManager.moveMissionToFront(missionId).then(() => {}, () => {});
            // set start app info
            Trace.start(Trace.CORE_METHOD_START_APP_ANIMATION);
            this.setStartAppInfo(item);
          }
          break;
        }
      }
    }
  }

  /**
   * what SmartDockContent.dockItemList onChange
   */
  onDockListChange() {
    this.updateDockParams().then(() => {}, () => {});
  }

  /**
   * update drag effective area when dockList changed
   */
  async updateDockParams() {
    const screenWidth: number = AppStorage.Get('screenWidth');
    const screenHeight: number = AppStorage.Get('screenHeight');
    const sysUIBottomHeight: number = AppStorage.Get('sysUIBottomHeight');
    const dockHeight: number = AppStorage.Get('dockHeight');
    let mResidentWidth: number = this.getListWidth(AppStorage.Get('residentList'));
    if (AppStorage.Get("deviceType") === CommonConstants.DEFAULT_DEVICE_TYPE) {
      const maxDockNum = this.getStyleConfig().mMaxDockNum;
      mResidentWidth = this.mSmartDockStyleConfig.mDockPadding * 2 + maxDockNum * (this.mSmartDockStyleConfig.mListItemWidth) + (maxDockNum - 1) * (this.mSmartDockStyleConfig.mListItemGap);
    }
    AppStorage.SetOrCreate('residentWidth', mResidentWidth);
    AppStorage.SetOrCreate("dockPadding", this.getDockPadding(mResidentWidth));
    const mRecentWidth: number = this.getListWidth(AppStorage.Get('recentList'));
    Log.showDebug(TAG, `updateDockParams screenWidth:${screenWidth}, screenHeight:${screenHeight}, sysUIBottomHeight:${sysUIBottomHeight}, dockHeight:${dockHeight}, mResidentWidth:${mResidentWidth}, mRecentWidth:${mRecentWidth}`);
    if (typeof (this.mSmartDockDragHandler) != 'undefined') {
      let left = mResidentWidth === 0 ? 0 : (screenWidth - mResidentWidth - (mRecentWidth === 0 ? 0 : (this.mSmartDockStyleConfig.mDockGap + mRecentWidth))) / 2;
      let right = mResidentWidth === 0 ? screenWidth : (screenWidth - mResidentWidth - (mRecentWidth === 0 ? 0 : (this.mSmartDockStyleConfig.mDockGap + mRecentWidth))) / 2 + mResidentWidth;
      if (AppStorage.Get('deviceType') == CommonConstants.DEFAULT_DEVICE_TYPE) {
        left = (screenWidth - mResidentWidth) / 2;
        right = screenWidth - left;
      }
      this.mSmartDockDragHandler.setDragEffectArea({
        left: left,
        right: right,
        top: screenHeight - sysUIBottomHeight - dockHeight,
        bottom: screenHeight - sysUIBottomHeight - this.mSmartDockStyleConfig.mMarginBottom
      });
    }
  }

  private getDockPadding(residentWidth: number): {right: number, left: number, top: number, bottom: number} {
    let paddingNum: number = this.mSmartDockStyleConfig.mDockPadding;
    const residentList: [] = AppStorage.Get('residentList');
    if (AppStorage.Get("deviceType") === CommonConstants.DEFAULT_DEVICE_TYPE) {
      paddingNum = (residentWidth - (residentList.length * this.mSmartDockStyleConfig.mListItemWidth + (residentList.length - 1) * (this.mSmartDockStyleConfig.mListItemGap))) / 2;
    }
    Log.showDebug(TAG, `getDockPadding paddingNum: ${paddingNum}`);
    return {right: paddingNum, left: paddingNum, top: this.mSmartDockStyleConfig.mDockPadding, bottom: this.mSmartDockStyleConfig.mDockPadding};
  }

  /**
   * build menu for @Component CustomOverlay
   * @param appInfo
   * @param dockType
   * @param callback
   */
  buildMenuInfoList(appInfo, dockType, showAppcenter, callback?) {
    const menuInfoList = new Array<MenuInfo>();
    const shortcutInfo = this.mSmartDockModel.getShortcutInfo(appInfo.bundleName);
    if (shortcutInfo) {
      let menu = null;
      shortcutInfo.forEach((value) => {
        menu = new MenuInfo();
        menu.menuType = CommonConstants.MENU_TYPE_DYNAMIC;
        menu.menuImgSrc = value.icon;
        menu.menuText = value.label;
        menu.shortcutIconId = value.iconId;
        menu.shortcutLabelId = value.labelId;
        menu.bundleName = value.bundleName;
        menu.moduleName = value.moduleName;
        menu.onMenuClick = () => {
          Trace.start(Trace.CORE_METHOD_START_APP_ANIMATION);
          launcherAbilityManager.startLauncherAbility(value.wants[0].targetClass, value.wants[0].targetBundle, value.wants[0].targetModule);
        };
        value.bundleName == appInfo.bundleName && value.moduleName == appInfo.moduleName && menuInfoList.push(menu);
      });
    }

    let open = new MenuInfo();
    open.menuType = CommonConstants.MENU_TYPE_FIXED;
    open.menuImgSrc = '/common/pics/ic_public_add_norm.svg';
    open.menuText = $r('app.string.app_menu_open');
    open.onMenuClick = () => {
      this.residentOnClick(null, appInfo, showAppcenter);
    };
    menuInfoList.push(open);

    if (appInfo.itemType != CommonConstants.TYPE_FUNCTION) {
      this.mDevice = AppStorage.Get('deviceType');
      if (this.mDevice === CommonConstants.PAD_DEVICE_TYPE && dockType === SmartDockConstants.RESIDENT_DOCK_TYPE) {
        const addToWorkSpaceMenu = new MenuInfo();
        addToWorkSpaceMenu.menuType = CommonConstants.MENU_TYPE_FIXED;
        addToWorkSpaceMenu.menuImgSrc = '/common/pics/ic_public_copy.svg';
        addToWorkSpaceMenu.menuText = $r('app.string.app_center_menu_add_desktop');
        addToWorkSpaceMenu.onMenuClick = () => {
          Log.showDebug(TAG, 'onMenuClick item add to pageDesk:' + appInfo.bundleName);
          this.mSmartDockModel.addToPageDesk(appInfo);
        };
        menuInfoList.push(addToWorkSpaceMenu);
      }

      const removeMenu = new MenuInfo();
      removeMenu.menuType = CommonConstants.MENU_TYPE_FIXED;
      removeMenu.menuImgSrc = this.mDevice === CommonConstants.PAD_DEVICE_TYPE ? '/common/pics/ic_public_remove.svg' : '/common/pics/ic_public_delete.svg';
      removeMenu.menuText = this.mDevice === CommonConstants.PAD_DEVICE_TYPE ? $r('app.string.delete_app') : $r('app.string.uninstall');
      removeMenu.onMenuClick = () => {
        Log.showDebug(TAG, `onMenuClick item remove: ${JSON.stringify(appInfo)}`);
        const cacheKey = appInfo.appLabelId + appInfo.bundleName + appInfo.moduleName;
        appInfo.keyName = appInfo.bundleName + appInfo.abilityName + appInfo.moduleName;
        const appName = this.mSmartDockModel.getAppName(cacheKey);
        Log.showDebug(TAG, `onMenuClick item remove appName: ${appName}`);
        if (appName != null) {
          appInfo.appName = appName;
        }
        this.mSelectedItem = appInfo;
        this.mSelectedDockType = dockType;
        AppStorage.SetOrCreate('uninstallAppInfo', appInfo);
        callback();
      };
      removeMenu.menuEnabled = appInfo.isUninstallAble;
      menuInfoList.push(removeMenu);
    }
    return menuInfoList;
  }

  deleteDockItem(dockItem: {bundleName: string | undefined, keyName: string | undefined}, dockType: number) {
    this.mSmartDockModel.deleteDockItem(dockItem, dockType);
  }

  getSelectedItem(): any {
    Log.showDebug(TAG, `getSelectedItem: ${JSON.stringify(this.mSelectedItem)}`);
    return this.mSelectedItem;
  }

  getSelectedDockType(): any {
    Log.showDebug(TAG, `getSelectedDockType: ${JSON.stringify(this.mSelectedDockType)}`);
    return this.mSelectedDockType;
  }

  /**
   * calcaulate dock list width after list change
   * @param itemList
   */
  private getListWidth(itemList: []): number {
    let width = 0;
    if (typeof itemList === 'undefined' || itemList == null || itemList.length === 0) {
      return width;
    }
    const num =  itemList.length;
    width = this.mSmartDockStyleConfig.mDockPadding * 2 + num * (this.mSmartDockStyleConfig.mListItemWidth) + (num - 1) * (this.mSmartDockStyleConfig.mListItemGap);
    return width;
  }

  /**
   * get snapshot
   *
   * @param missionIds missionid list
   * @return snapshot list
   */
  async getSnapshot(missionIds: MissionInfo[], name: string) {
    const snapshotList: {
      name: string,
      image: any,
      missionId: number,
      boxSize: number,
      bundleName: string,
      left?: number,
      right?: number,
    }[] = await this.mSmartDockModel.getSnapshot(missionIds, name);
    return snapshotList;
  }

  /**
   * set start app info
   */
  private setStartAppInfo(item) {
    if (CheckEmptyUtils.isEmpty(item)) {
      Log.showError(TAG, `setStartAppInfo with item`)
      return;
    }
    item.icon = globalThis.ResourceManager.getCachedAppIcon(item.appIconId, item.bundleName, item.moduleName)
    AppStorage.SetOrCreate('startAppItemInfo', item);
    this.mSmartDockStartAppHandler.setAppIconSize(this.mSmartDockStyleConfig.mIconSize);
    this.mSmartDockStartAppHandler.setAppIconInfo();
  }
}