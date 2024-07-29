/**
 * Copyright (c) 2023-2023 Huawei Device Co., Ltd.
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

import bundleManager from '@ohos.bundle.bundleManager';
import { AppItemInfo } from '../bean/AppItemInfo';
import { CheckEmptyUtils } from '../utils/CheckEmptyUtils';
import { ResourceManager } from './ResourceManager';
import commonBundleManager from './CommonBundleManager';
import { Log } from '../utils/Log';

const TAG = 'AtomicServiceAbilityManager';

/**
 * 原服务管理
 */
class AtomicServiceAbilityManager {
  private readonly mAtomicServiceAppMap = new Map<string, AppItemInfo>();
  private static mInstance: AtomicServiceAbilityManager;

  /**
   * 获取桌面应用信息管理对象
   *
   * @return 桌面应用信息管理对象单一实例
   */
  static getInstance(): AtomicServiceAbilityManager {
    if (AtomicServiceAbilityManager.mInstance == null) {
      AtomicServiceAbilityManager.mInstance = new AtomicServiceAbilityManager();
      globalThis.AtomicServiceAbilityManagerInstance = AtomicServiceAbilityManager.mInstance;
    }
    Log.showInfo(TAG, 'getInstance!');
    return AtomicServiceAbilityManager.mInstance;
  }

  private constructor() {
  }

  /**
   * 获取userId.
   */
  getUserId(): number {
    return commonBundleManager.getUserId();
  }

  /**
   * 从包管理获取所有的原服务应用信息
   *
   * @returns 所有的原服务应用信息
   */
  async getAtomicServiceAbilityList(): Promise<AppItemInfo[]> {
    let abilityList: Array<bundleManager.AbilityInfo> = await commonBundleManager.getAllAbilityList(bundleManager.BundleType.ATOMIC_SERVICE);
    let appItemInfoList: AppItemInfo[] = [];
    if (CheckEmptyUtils.isEmptyArr(abilityList)) {
      return appItemInfoList;
    }
    for (let i = 0; i < abilityList.length; i++) {
      let appItem: AppItemInfo = await this.convertAtomicServiceToAppItemInfo(abilityList[i]);
      if (!CheckEmptyUtils.isEmpty(appItem)) {
        appItemInfoList.push(appItem);
      }
    }
    return appItemInfoList;
  }

  /**
   * 从包管理获取应用信息
   *
   * @param bundleName 包名
   * @returns 应用信息
   */
  async getAtomicServiceAbilityInfoAsync(bundleName: string): Promise<AppItemInfo[]> {
    if (CheckEmptyUtils.checkStrIsEmpty(bundleName)) {
      Log.showError(TAG, 'getAtomicServiceAbilityInfoAsync reqParam bundleName is empty');
      return [];
    }
    let bundleInfo: bundleManager.BundleInfo = await commonBundleManager.getBundleInfoByBundleName(bundleName, bundleManager.BundleType.ATOMIC_SERVICE);
    if (CheckEmptyUtils.isEmpty(bundleInfo)) {
      Log.showInfo(TAG, `getAtomicServiceAbilityInfoAsync by bundleName:${bundleName} no result from MGR`);
      return [];
    }
    let appItemInfoList :AppItemInfo[] = [];
    if (CheckEmptyUtils.isEmptyArr(bundleInfo.hapModulesInfo)) {
      return appItemInfoList;
    }
    for (let i = 0; i < bundleInfo.hapModulesInfo.length; i++) {
      if (CheckEmptyUtils.isEmptyArr(bundleInfo.hapModulesInfo[i].abilitiesInfo)) {
        continue;
      }
      for (let j = 0; j < bundleInfo.hapModulesInfo[i].abilitiesInfo.length; j++) {
        let appItem: AppItemInfo = await this.convertAtomicServiceToAppItemInfo(bundleInfo.hapModulesInfo[i].abilitiesInfo[j], bundleInfo.appInfo);
        if (!CheckEmptyUtils.isEmpty(appItem)) {
          appItemInfoList.push(appItem);
        }
      }
    }
    return appItemInfoList;
  }

  /**
   * 从缓存中获取或包管理获取原服务ability信息
   *
   * @param bundleName 包名
   * @returns 一个ability信息
   */
  async getAnAtomicServiceAbilityInfoFromCache(bundleName: string): Promise<AppItemInfo | undefined> {
    let appItemInfo: AppItemInfo | undefined = undefined;
    if (CheckEmptyUtils.checkStrIsEmpty(bundleName)) {
      Log.showError(TAG, 'getAnAtomicServiceAbilityInfoFromCache reqParam bundleName is empty');
      return appItemInfo;
    }
    // get from cache
    if (this.mAtomicServiceAppMap != null && this.mAtomicServiceAppMap.has(bundleName)) {
      appItemInfo = this.mAtomicServiceAppMap.get(bundleName);
    }
    if (!CheckEmptyUtils.isEmpty(appItemInfo)) {
      Log.showInfo(TAG, `getAnAtomicServiceAbilityInfoFromCache cache result: ${JSON.stringify(appItemInfo)}`);
      return appItemInfo;
    }
    // get from mgr
    let abilityList: AppItemInfo[] = await this.getAtomicServiceAbilityInfoAsync(bundleName);
    if (CheckEmptyUtils.isEmptyArr(abilityList)) {
      Log.showInfo(TAG, `${bundleName} has no atomic ability`);
      return undefined;
    }
    Log.showInfo(TAG, `getAnAtomicServiceAbilityInfoFromCache from MGR: ${JSON.stringify(abilityList[0])}`);
    return abilityList[0];
  }

  private async convertAtomicServiceToAppItemInfo(info: bundleManager.AbilityInfo,
                                                  applicationInfo?: bundleManager.ApplicationInfo): Promise<AppItemInfo | undefined> {
    if (CheckEmptyUtils.isEmpty(info)) {
      Log.showError(TAG, 'convertAtomicServiceToAppItemInfo reqParam is empty');
      return undefined;
    }
    let appInfo: bundleManager.ApplicationInfo = info.applicationInfo;
    if (CheckEmptyUtils.isEmpty(appInfo)) {
      appInfo = applicationInfo;
    }
    if (CheckEmptyUtils.isEmpty(appInfo)) {
      Log.showError(TAG, 'convertAtomicServiceToAppItemInfo applicationInfo is empty');
      return undefined;
    }
    const appItemInfo = new AppItemInfo();
    appItemInfo.appName = await ResourceManager.getInstance().getAppNameSync(
      appInfo.labelId, info.bundleName, info.moduleName, appInfo.label
    );
    appItemInfo.isSystemApp = appInfo.systemApp;
    appItemInfo.isUninstallAble = appInfo.removable;
    appItemInfo.appIconId = appInfo.iconId;
    appItemInfo.appLabelId = appInfo.labelId;
    appItemInfo.bundleName = info.bundleName;
    appItemInfo.abilityName = info.name;
    appItemInfo.moduleName = info.moduleName;
    appItemInfo.keyName = info.bundleName + info.name + info.moduleName;
    appItemInfo.bundleType = bundleManager.BundleType.ATOMIC_SERVICE;
    await ResourceManager.getInstance().updateIconCache(appItemInfo.appIconId, appItemInfo.bundleName, appItemInfo.moduleName);
    this.mAtomicServiceAppMap.set(appItemInfo.bundleName, appItemInfo);
    Log.showInfo(TAG, `convertAtomicServiceToAppItemInfo appItemInfo: ${JSON.stringify(appItemInfo)}`);
    return appItemInfo;
  }

  cleanAppMapCache(): void {
    this.mAtomicServiceAppMap.clear();
  }
}

const atomicServiceAbilityManager = AtomicServiceAbilityManager.getInstance();
export default atomicServiceAbilityManager;
