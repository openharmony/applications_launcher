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

import installer from '@ohos.bundle.installer';
import bundleMonitor from '@ohos.bundle.bundleMonitor';
import osAccount from '@ohos.account.osAccount';
import hiSysEvent from '@ohos.hiSysEvent';
import launcherBundleManager from '@ohos.bundle.launcherBundleManager';
import { Log } from '../utils/Log';
import { CheckEmptyUtils } from '../utils/CheckEmptyUtils';
import { AppItemInfo } from '../bean/AppItemInfo';
import { CommonConstants } from '../constants/CommonConstants';
import { ResourceManager } from './ResourceManager';
import { EventConstants } from '../constants/EventConstants';
import { BadgeManager } from '../manager/BadgeManager';
import PreferencesUtil from './PreferencesUtil';
import { BusinessError } from '@ohos.base';

const TAG = 'LauncherAbilityManager';

interface BundleStatusCallback {
  add: (bundleName: string, userId: number) => void;
  remove: (bundleName: string, userId: number) => void;
  update: (bundleName: string, userId: number) => void;
}

/**
 * Wrapper class for innerBundleManager and formManager interfaces.
 */
class LauncherAbilityManager {
  private static readonly CURRENT_USER_ID = -2;
  private readonly mAppMap = new Map<string, AppItemInfo>();
  private mUserId: number = 100;

  private readonly mBundleStatusCallback: BundleStatusCallback = {
    add: (bundleName, userId) => {
      Log.showDebug(TAG, `PACKAGE_ADDED bundleName: ${bundleName}, userId: ${userId}, mUserId ${this.mUserId}`);
      this.mUserId === userId && this.notifyLauncherAbilityChange(EventConstants.EVENT_PACKAGE_ADDED, bundleName, userId);
    },
    remove: (bundleName, userId) => {
      Log.showDebug(TAG, `PACKAGE_REMOVED bundleName: ${bundleName}, userId: ${userId}, mUserId ${this.mUserId}`);
      this.mUserId === userId && this.notifyLauncherAbilityChange(EventConstants.EVENT_PACKAGE_REMOVED, bundleName, userId);
    },
    update: (bundleName, userId) => {
      Log.showDebug(TAG, `PACKAGE_CHANGED bundleName: ${bundleName}, userId: ${userId}, mUserId ${this.mUserId}`);
      this.mUserId === userId && this.notifyLauncherAbilityChange(EventConstants.EVENT_PACKAGE_CHANGED, bundleName, userId);
    }
  };

  private readonly mLauncherAbilityChangeListeners: any[] = [];

  /**
   * Get desktop application information management object
   *
   * @return Desktop application information management object instance
   */
  static getInstance(): LauncherAbilityManager {
    if (globalThis.LauncherAbilityManagerInstance == null) {
      globalThis.LauncherAbilityManagerInstance = new LauncherAbilityManager();
    }
    return globalThis.LauncherAbilityManagerInstance;
  }

  private constructor() {
    const osAccountManager = osAccount.getAccountManager();
    osAccountManager.getOsAccountLocalId((err, localId) => {
      Log.showDebug(TAG, `getOsAccountLocalId localId ${localId}`);
      this.mUserId = localId;
    });
  }

  getUserId(): number {
    return this.mUserId;
  }

  bundleMonitorOn(){
    bundleMonitor.on('add', (bundleChangeInfo) => {
      Log.showInfo(TAG, `add bundleName: ${bundleChangeInfo.bundleName} userId: ${bundleChangeInfo.userId}`);
      this.mBundleStatusCallback.add(bundleChangeInfo.bundleName, bundleChangeInfo.userId);
    });
    bundleMonitor.on('update', (bundleChangeInfo) => {
      Log.showInfo(TAG, `update bundleName: ${bundleChangeInfo.bundleName} userId: ${bundleChangeInfo.userId}`);
      this.mBundleStatusCallback.update(bundleChangeInfo.bundleName, bundleChangeInfo.userId);
    });
    bundleMonitor.on('remove', (bundleChangeInfo) => {
      Log.showInfo(TAG, `remove bundleName: ${bundleChangeInfo.bundleName} userId: ${bundleChangeInfo.userId}`);
      this.mBundleStatusCallback.remove(bundleChangeInfo.bundleName, bundleChangeInfo.userId);
    });
  }

  /**
   * Monitor system application status.
   *
   * @params listener: listening object
   */
 async registerLauncherAbilityChangeListener(listener: any):Promise<void> {
    if (listener != null) {
      if (this.mLauncherAbilityChangeListeners.length == 0) {
        try {
          let isFirstPowerOn = await PreferencesUtil.get('isFirstPowerOn','');
          if (isFirstPowerOn){
           setTimeout(()=>{
              this.bundleMonitorOn();
            }, 20000);
            Log.showInfo(TAG, `registerCallback success, isFirstPowerOn:${isFirstPowerOn}`);
          }else {
            this.bundleMonitorOn();
            Log.showInfo(TAG, `registerCallback fail, isFirstPowerOff:${isFirstPowerOn}`);
          }
        } catch (errData) {
          let message = (errData as BusinessError).message;
          let errCode = (errData as BusinessError).code;
          Log.showError(TAG, `registerCallback fail errCode:${errCode}, message:${message}`);
        }
      }
      const index = this.mLauncherAbilityChangeListeners.indexOf(listener);
      if (index == CommonConstants.INVALID_VALUE) {
        this.mLauncherAbilityChangeListeners.push(listener);
      }
    }
  }

  /**
   * Cancel monitoring system application status.
   *
   * @params listener: listening object
   */
  unregisterLauncherAbilityChangeListener(listener: any): void {
    if (listener != null) {
      const index = this.mLauncherAbilityChangeListeners.indexOf(listener);
      if (index != CommonConstants.INVALID_VALUE) {
        this.mLauncherAbilityChangeListeners.splice(index, 1);
      }
      if (this.mLauncherAbilityChangeListeners.length == 0) {
        try {
          bundleMonitor.off('add');
          bundleMonitor.off('update');
          bundleMonitor.off('remove');
          Log.showInfo(TAG, 'unregisterCallback success');
        } catch (errData) {
          let message = (errData as BusinessError).message;
          let errCode = (errData as BusinessError).code;
          Log.showError(TAG, `unregisterCallback fail errCode:${errCode}, message:${message}`);
        }
      }
    }
  }

  private notifyLauncherAbilityChange(event, bundleName: string, userId): void {
    for (let index = 0; index < this.mLauncherAbilityChangeListeners.length; index++) {
      this.mLauncherAbilityChangeListeners[index](event, bundleName, userId);
    }
  }

  /**
   * get all app List info from BMS
   */
  async getLauncherAbilityList(): Promise<AppItemInfo[]> {
    let abilityList = null;
    await launcherBundleManager.getAllLauncherAbilityInfo(LauncherAbilityManager.CURRENT_USER_ID)
      .then((res) => {
        abilityList = res;
      })
      .catch((err) => {
        Log.showError(TAG, `getLauncherAbilityList error: ${JSON.stringify(err)}`);
      });
    const appItemInfoList = new Array<AppItemInfo>();
    if (CheckEmptyUtils.isEmpty(abilityList)) {
      Log.showDebug(TAG, 'getLauncherAbilityList Empty');
      return appItemInfoList;
    }
    for (let i = 0; i < abilityList.length; i++) {
      let appItem = await this.convertToAppItemInfo(abilityList[i]);
      appItemInfoList.push(appItem);
    }
    return appItemInfoList;
  }

  /**
   * get AbilityInfos by bundleName from BMS
   *
   * @params bundleName Application package name
   * @return List of entry capabilities information of the target application
   */
  async getLauncherAbilityInfo(bundleName: string): Promise<AppItemInfo[]> {
    let abilityInfos: launcherBundleManager.LauncherAbilityInfo[];
    await launcherBundleManager.getLauncherAbilityInfo(bundleName, this.mUserId)
      .then((res) => {
        abilityInfos = res;
      })
      .catch((err) => {
        Log.showError(TAG, `getLauncherAbilityInfo error: ${JSON.stringify(err)}`);
      });
    const appItemInfoList = new Array<AppItemInfo>();
    if (CheckEmptyUtils.isEmpty(abilityInfos) || abilityInfos.length === 0) {
      Log.showDebug(TAG, 'getLauncherAbilityInfo Empty');
      return appItemInfoList;
    }
    for (let i = 0; i < abilityInfos.length; i++) {
      let appItem = await this.convertToAppItemInfo(abilityInfos[i]);
      appItemInfoList.push(appItem);
    }
    return appItemInfoList;
  }

  /**
   * get AppItemInfo from BMS with bundleName
   * @params bundleName
   * @return AppItemInfo
   */
  async getAppInfoByBundleName(bundleName: string, abilityName?: string): Promise<AppItemInfo | undefined> {
    let appItemInfo: AppItemInfo | undefined = undefined;
    // get from cache
    if (this.mAppMap && this.mAppMap.has(bundleName)) {
      appItemInfo = this.mAppMap.get(bundleName);
    }
    if (appItemInfo && abilityName && appItemInfo.abilityName === abilityName) {
      return appItemInfo;
    }
    // get from system
    let abilityInfos = new Array<launcherBundleManager.LauncherAbilityInfo>();
    await launcherBundleManager.getLauncherAbilityInfo(bundleName, LauncherAbilityManager.CURRENT_USER_ID)
      .then((res)=>{
        if (res && res.length) {
          abilityInfos = res;
        }
      })
      .catch((err)=>{
        Log.showError(TAG, `getAppInfoByBundleName getLauncherAbilityInfo error: ${JSON.stringify(err)}`);
      });
    if (!abilityInfos || abilityInfos.length === 0) {
      Log.showDebug(TAG, `${bundleName} has no launcher ability`);
      return undefined;
    }
    let appInfo = abilityInfos[0];
    if (abilityName) {
      appInfo = abilityInfos.find(item => {
        return item.elementName.abilityName === abilityName;
      });
    }
    if (!appInfo) {
      appInfo = abilityInfos[0];
    }
    const data = await this.convertToAppItemInfo(appInfo);
    return data;
  }

  private async convertToAppItemInfo(info): Promise<AppItemInfo> {
    const appItemInfo = new AppItemInfo();
    appItemInfo.appName = await ResourceManager.getInstance().getAppNameSync(
      info.labelId, info.elementName.bundleName, info.elementName.moduleName, info.applicationInfo.label
    );
    appItemInfo.isSystemApp = info.applicationInfo.systemApp;
    appItemInfo.isUninstallAble = info.applicationInfo.removable;
    appItemInfo.appIconId = info.iconId;
    appItemInfo.appLabelId = info.labelId;
    appItemInfo.bundleName = info.elementName.bundleName;
    appItemInfo.abilityName = info.elementName.abilityName;
    appItemInfo.moduleName = info.elementName.moduleName;
    appItemInfo.keyName = info.elementName.bundleName + info.elementName.abilityName + info.elementName.moduleName;
    appItemInfo.typeId = CommonConstants.TYPE_APP;
    appItemInfo.installTime = String(new Date());
    appItemInfo.badgeNumber = await BadgeManager.getInstance().getBadgeByBundleSync(info.elementName.bundleName);
    await ResourceManager.getInstance().updateIconCache(appItemInfo.appIconId, appItemInfo.bundleName, appItemInfo.moduleName);
    this.mAppMap.set(appItemInfo.bundleName, appItemInfo);
    return appItemInfo;
  }

  /**
   * uninstall application, notice the userId need to be the login user
   *
   * @params bundleName application bundleName
   * @params callback to get result
   */
  async uninstallLauncherAbility(bundleName: string, callback: (resultCode: number) => void): Promise<void> {
    Log.showInfo(TAG, `uninstallLauncherAbility bundleName: ${bundleName}`);
    try {
      const bundlerInstaller = await installer.getBundleInstaller();
      bundlerInstaller.uninstall(bundleName, {
        userId: this.mUserId,
        installFlag: 0,
        isKeepData: false
      }, (err: BusinessError) => {
        if (err) {
          callback(CommonConstants.INVALID_VALUE);
          Log.showError(TAG, `uninstallLauncherAbility failed: ${JSON.stringify(err)}`);
        } else {
          callback(CommonConstants.UNINSTALL_SUCCESS);
          Log.showDebug(TAG, `uninstallLauncherAbility successfully: ${JSON.stringify(err)}`);
        }
      });
    } catch (err) {
      let errCode = (err as BusinessError).code;
      let errMsg = (err as BusinessError).message;
      Log.showError(TAG, `uninstallLauncherAbility errCode: ${errCode}, errMsg: ${errMsg}`);
    }
  }

  /**
   * start the app
   *
   * @params paramAbilityName: Ability name
   * @params paramBundleName: Application package name
   */
  startLauncherAbility(paramAbilityName: string, paramBundleName: string, paramModuleName: string) {
    Log.showDebug(TAG, `startApplication abilityName: ${paramAbilityName}, bundleName: ${paramBundleName}, moduleName ${paramModuleName}`);
    globalThis.desktopContext.startAbility({
      bundleName: paramBundleName,
      abilityName: paramAbilityName,
      moduleName: paramModuleName
    }).then(() => {
      Log.showDebug(TAG, 'startApplication promise success');
    }, (err) => {
      Log.showError(TAG, `startApplication promise error: ${JSON.stringify(err)}`);
    });

    const sysEventInfo = {
      domain: 'LAUNCHER_APP',
      name: 'START_ABILITY',
      eventType: hiSysEvent.EventType.BEHAVIOR,
      params: {
        'BUNDLE_NAME': paramBundleName,
        'ABILITY_NAME': paramAbilityName,
        'MODULE_NAME': paramModuleName
      }
    };
    hiSysEvent.write(sysEventInfo,
      (err, value) => {
        if (err) {
          Log.showError(TAG, `startApplication hiSysEvent write error: ${err.code}`);
        } else {
          Log.showDebug(TAG, `startApplication hiSysEvent write success: ${value}`);
        }
    })
  }

  /**
   * start form config ability
   *
   * @params paramAbilityName
   * @params paramBundleName
   */
  startAbilityFormEdit(paramAbilityName: string, paramBundleName: string, paramModuleName: string, paramCardId: number) {
    Log.showDebug(TAG, `startAbility abilityName: ${paramAbilityName},bundleName: ${paramBundleName}, moduleName: ${paramModuleName} ,paramCardId: ${paramCardId}`);
    globalThis.desktopContext.startAbility({
      bundleName: paramBundleName,
      abilityName: paramAbilityName,
      moduleName: paramModuleName,
      parameters:
        {
          formId: paramCardId.toString()
        }
    }).then((ret) => {
      Log.showDebug(TAG, `startAbility ret: ${JSON.stringify(ret)}`);
    }, (err) => {
      Log.showError(TAG, `startAbility catch error: ${JSON.stringify(err)}`);
    });
  }

  async getShortcutInfo(paramBundleName: string, callback) {
    Log.showDebug(TAG, `getShortcutInfo bundleName: ${paramBundleName}`);
    await launcherBundleManager.getShortcutInfo(paramBundleName)
      .then(shortcutInfo => {
        callback(paramBundleName, shortcutInfo);
      })
      .catch(err => {
      });
  }

  /**
   * start application by uri
   *
   * @params paramBundleName application bundle name
   * @params paramAbilityName application abilit uri
   */
  startLauncherAbilityByUri(paramBundleName: string, abilityUri) {
    Log.showInfo(TAG, `startLauncherAbilityByUri bundleName:${paramBundleName} abilityUri:${abilityUri}`);
    const result = globalThis.desktopContext.startAbility({
      bundleName: paramBundleName,
      uri: abilityUri
    }).then(() => {
      Log.showDebug(TAG, 'startLauncherAbilityByUri promise success');
    }, (err) => {
      Log.showError(TAG, `startLauncherAbilityByUri promise error: ${JSON.stringify(err)}`);
    });
    Log.showDebug(TAG, `startLauncherAbilityByUri AceApplication : startAbility : ${result}`);
  }

  cleanAppMapCache() {
    this.mAppMap.clear();
  }
}

export const launcherAbilityManager = LauncherAbilityManager.getInstance();
