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

import Prompt from '@ohos.prompt';
import CheckEmptyUtils from '../../../../../../../common/src/main/ets/default/utils/CheckEmptyUtils';
import Trace from '../../../../../../../common/src/main/ets/default/utils/Trace';
import Log from '../../../../../../../common/src/main/ets/default/utils/Log';
import DockItemInfo from '../../../../../../../common/src/main/ets/default/bean/DockItemInfo';
import MissionInfo from '../../../../../../../common/src/main/ets/default/bean/MissionInfo';
import MenuInfo from '../../../../../../../common/src/main/ets/default/bean/MenuInfo';
import BaseAppPresenter from '../../../../../../../common/src/main/ets/default/base/BaseAppPresenter';
import CommonConstants from '../../../../../../../common/src/main/ets/default/constants/CommonConstants';
import LayoutConfigManager from '../../../../../../../common/src/main/ets/default/layoutconfig/LayoutConfigManager';
import SmartDockLayoutConfig from '../../../../../../../common/src/main/ets/default/layoutconfig/SmartDockLayoutConfig';
import launcherAbilityManager from '../../../../../../../common/src/main/ets/default/manager/LauncherAbilityManager';
import amsMissionManager from '../../../../../../../common/src/main/ets/default/manager/AmsMissionManager';
import windowManager from '../../../../../../../common/src/main/ets/default/manager/WindowManager';
import SmartDockConstants from '../common/constants/SmartDockConstants';
import FeatureConstants from '../common/constants/FeatureConstants';
import SmartDockStyleConfig from '../common/SmartDockStyleConfig';
import SmartDockDragHandler from '../common/SmartDockDragHandler';
import SmartDockModel from '../model/SmartDockModel';

const TAG = 'SmartDockViewModel'

/**
 * SmartDock Viewmodel
 */
export default class SmartDockViewModel extends BaseAppPresenter {
  private readonly mSmartDockLayoutConfig: SmartDockLayoutConfig;
  private readonly mSmartDockStyleConfig: SmartDockStyleConfig;
  private readonly mSmartDockDragHandler: SmartDockDragHandler;
  private readonly mSmartDockModel: SmartDockModel;
  private mSelectedItem: DockItemInfo;
  private mSelectedDockType = 0;
  private mDevice = CommonConstants.DEFAULT_DEVICE_TYPE;

  constructor() {
    super();
    this.mSmartDockLayoutConfig = LayoutConfigManager.getFunctionConfig(SmartDockLayoutConfig.SMART_DOCK_LAYOUT_INFO);
    this.mSmartDockStyleConfig = LayoutConfigManager.getStyleConfig(SmartDockStyleConfig.APP_LIST_STYLE_CONFIG, FeatureConstants.FEATURE_NAME);
    this.mSmartDockDragHandler = SmartDockDragHandler.getInstance();
    this.mSmartDockModel = SmartDockModel.getInstance();
    Log.showInfo(TAG, 'constructor!');
  }

  static getInstance(): SmartDockViewModel{
    if (globalThis.SmartDockViewModel == null) {
      globalThis.SmartDockViewModel = new SmartDockViewModel();
    }
    Log.showInfo(TAG, 'getInstance!');
    return globalThis.SmartDockViewModel;
  }

  /**
   * get SmartDockStyleConfig
   */
  getStyleConfig(): SmartDockStyleConfig{
    return LayoutConfigManager.getStyleConfig(SmartDockStyleConfig.APP_LIST_STYLE_CONFIG, FeatureConstants.FEATURE_NAME);
  }

  /**
   * resident dock item onClick function
   * @param event
   * @param item
   * @param callback
   */
  residentOnClick(event, item, callback?) {
    // AppCenter entry
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
    launcherAbilityManager.startLauncherAbility(item.abilityName, item.bundleName);
  }

  /**
   * recent dock item onClick function
   * @param event
   * @param item
   */
  public recentOnClick(event, item, callback?) {
    let missionInfoList = [];
    missionInfoList = AppStorage.Get('missionInfoList');
    Log.showInfo(TAG, 'recentOnClick missionInfoList.length:' + missionInfoList.length);
    if (!CheckEmptyUtils.isEmptyArr(missionInfoList)) {
      for (let i = 0; i < missionInfoList.length; i++) {
        if (missionInfoList[i].bundleName === item.bundleName) {
          let missionList = missionInfoList[i]?.missionInfoList;
          Log.showInfo(TAG, 'recentOnClick missionList.length:' + missionList.length);
          if (!CheckEmptyUtils.isEmptyArr(missionList) && missionList.length > 1) {
            Log.showInfo(TAG, 'recentOnClick callback');
            callback();
          } else if (!CheckEmptyUtils.isEmptyArr(missionList) && missionList.length === 1) {
            let missionId = missionInfoList[i]?.missionInfoList[0]?.missionId;
            amsMissionManager.moveMissionToFront(missionId).then(() => {
            }, () => {
            });
          }
          break;
        }
      }
    }
  }

  /**
   * resident dock item onTouch function
   * @param event
   */
  residentOnTouch(event) {
    Log.showInfo(TAG, 'residentOnTouch event:' + event.type);
    this.mSmartDockDragHandler.notifyTouchEventUpdate(event);
  }

  /**
   * what SmartDockContent.dockItemList onChange
   */
  onDockListChange() {
    this.updateDockParams().then(() => {
    }, () => {
    });
  }

  /**
   * update drag effective area when dockList changed
   */
  async updateDockParams() {
    const screenWidth: number = AppStorage.Get('screenWidth');
    const screenHeight: number = AppStorage.Get('screenHeight');
    const systemUiHeight: number = AppStorage.Get('systemUiHeight');
    const mResidentWidth: number = this.getListWidth(AppStorage.Get('residentList'));
    const mRecentWidth: number = this.getListWidth(AppStorage.Get('recentList'));

    if (typeof (this.mSmartDockDragHandler) != 'undefined') {
      this.mSmartDockDragHandler.setDragEffectArea({
        left: mResidentWidth === 0 ? 0 : (screenWidth - mResidentWidth - this.mSmartDockStyleConfig.mDockGap - mRecentWidth) / 2,
        right: mResidentWidth === 0 ? screenWidth : (screenWidth - mResidentWidth - this.mSmartDockStyleConfig.mDockGap - mRecentWidth) / 2 + mResidentWidth,
        top: screenHeight - systemUiHeight - this.mSmartDockStyleConfig.mDockHeight - this.mSmartDockStyleConfig.mDockMargin,
        bottom: screenHeight - systemUiHeight
      });
    }
  }

  /**
   * what SmartDockContent.dragLocation onChange
   */
  onTouchEventUpdate() {
    this.mSmartDockDragHandler.onTouchEventUpdate(AppStorage.Get('dragEvent'));
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
        menu.onMenuClick = () => {
          launcherAbilityManager.startLauncherAbility(value.wants[0].targetClass, value.wants[0].targetBundle);
        };
        menuInfoList.push(menu);
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
      this.mDevice = AppStorage.Get('dockDevice');
      if (this.mDevice === CommonConstants.PAD_DEVICE_TYPE && dockType === SmartDockConstants.RESIDENT_DOCK_TYPE) {
        const addToWorkSpaceMenu = new MenuInfo();
        addToWorkSpaceMenu.menuType = CommonConstants.MENU_TYPE_FIXED;
        addToWorkSpaceMenu.menuImgSrc = '/common/pics/ic_public_copy.svg';
        addToWorkSpaceMenu.menuText = $r('app.string.app_center_menu_add_desktop');
        addToWorkSpaceMenu.onMenuClick = () => {
          Log.showInfo(TAG, 'onMenuClick item add to pageDesk:' + appInfo.bundleName);
          this.mSmartDockModel.addToPageDesk(appInfo);
        };
        menuInfoList.push(addToWorkSpaceMenu);
      }

      const removeMenu = new MenuInfo();
      removeMenu.menuType = CommonConstants.MENU_TYPE_FIXED;
      removeMenu.menuImgSrc = this.mDevice === CommonConstants.PAD_DEVICE_TYPE ? '/common/pics/ic_public_remove.svg' : '/common/pics/ic_public_delete.svg';
      removeMenu.menuText = this.mDevice === CommonConstants.PAD_DEVICE_TYPE ? $r('app.string.delete_app') : $r('app.string.uninstall');
      removeMenu.onMenuClick = () => {
        Log.showInfo(TAG, 'onMenuClick item remove:' + JSON.stringify(appInfo) + ',dockType:' + dockType);
        const cacheKey = appInfo.appLabelId + appInfo.bundleName;
        const appName = this.mSmartDockModel.getAppName(cacheKey);
        Log.showInfo(TAG, 'onMenuClick item remove appName:' + appName);
        if (appName != null) {
          appInfo.appName = appName;
        }
        this.mSelectedItem = appInfo;
        this.mSelectedDockType = dockType;
        callback();
      };
      removeMenu.menuEnabled = appInfo.isUninstallAble;
      menuInfoList.push(removeMenu);
    }
    return menuInfoList;
  }

  deleteDockItem(bundleName: string, dockType: number) {
    this.mSmartDockModel.deleteDockItem(bundleName, dockType);
  }

  getSelectedItem(): any {
    Log.showInfo(TAG, 'getSelectedItem:' + JSON.stringify(this.mSelectedItem));
    return this.mSelectedItem;
  }

  getSelectedDockType(): any {
    Log.showInfo(TAG, 'getSelectedDockType:' + JSON.stringify(this.mSelectedDockType));
    return this.mSelectedDockType;
  }

  /**
   * calcaulate dock list width after list change
   * @param itemList
   */
  private getListWidth(itemList): number {
    let width = 0;
    if (typeof itemList === 'undefined' || itemList == null || itemList.length === 0) {
      return width;
    } else {
      const num = itemList.length;
      width = this.mSmartDockStyleConfig.mDockPadding * 2 + num * (this.mSmartDockStyleConfig.mListItemWidth) + (num - 1) * (this.mSmartDockStyleConfig.mListItemGap);
    }
    return width;
  }

  /**
   * The application uninstallation result is displayed.
   *
   * @param resultCode: Application uninstallation result
   */
  informUninstallResult(resultCode) {
    Log.showInfo(TAG, 'informUninstallResult resultCode:' + resultCode);
    if (resultCode === CommonConstants.UNINSTALL_FORBID) {
      Prompt.showToast({
        message: $r('app.string.disable_uninstall')
      });
    } else if (resultCode === CommonConstants.UNINSTALL_SUCCESS) {
      Prompt.showToast({
        message: $r('app.string.uninstall_success')
      });
    } else {
      Prompt.showToast({
        message: $r('app.string.uninstall_failed')
      });
    }
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
}