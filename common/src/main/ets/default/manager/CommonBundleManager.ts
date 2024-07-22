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
import { CheckEmptyUtils } from '../utils/CheckEmptyUtils';
import osAccount from '@ohos.account.osAccount';
import type Want from '@ohos.app.ability.Want';
import { Log } from '../utils/Log';

const TAG = 'CommonBundleManager';
const DEFAULT_USER_ID = 100;

/**
 * 通用包管理（可以查询桌面包、原子化服务包）
 */
class CommonBundleManager {
  private static mInstance: CommonBundleManager;
  private mUserId: number = DEFAULT_USER_ID;

  /**
   * 获取通用包管理对象
   *
   * @return 通用包管理对象单一实例
   */
  static getInstance(): CommonBundleManager {
    if (CommonBundleManager.mInstance == null) {
      CommonBundleManager.mInstance = new CommonBundleManager();
      globalThis.CommonBundleManagerInstance = CommonBundleManager.mInstance;
    }
    return CommonBundleManager.mInstance;
  }

  private constructor() {
    const osAccountManager = osAccount.getAccountManager();
    osAccountManager.getOsAccountLocalId((err, localId) => {
      Log.showDebug(TAG, `getOsAccountLocalIdFromProcess localId ${localId}`);
      this.mUserId = localId;
    });
  }

  /**
   * 获取userId.
   *
   * @returns
   */
  getUserId(): number {
    return this.mUserId;
  }

  /**
   * 获取所有ability信息
   *
   * @param bundleType 包类型：bundleManager.BundleType.APP:桌面app,  bundleManager.BundleType.ATOMIC_SERVICE:原子化服务
   * @returns 所有ability信息
   */
  async getAllAbilityList(bundleType?: bundleManager.BundleType): Promise<bundleManager.AbilityInfo[]> {
    let abilityList: Array<bundleManager.AbilityInfo> = [];
    let want: Want = {
      action : 'action.system.home',
      entities : ['entity.system.home']
    };
    try {
      await bundleManager.queryAbilityInfo(want, bundleManager.AbilityFlag.GET_ABILITY_INFO_WITH_APPLICATION, this.mUserId)
        .then((res: Array<bundleManager.AbilityInfo>) => {
          Log.showInfo(TAG, `getAllAbilityList res length: ${res.length}`);
          abilityList = res;
        })
        .catch((err) => {
          Log.showError(TAG, `getAllAbilityList error: ${JSON.stringify(err)}`);
        });
    } catch (err) {
      Log.showError(TAG, `getAllAbilityList bundleManager.queryAbilityInfo error: ${JSON.stringify(err)}`);
    }
    if (CheckEmptyUtils.isEmptyArr(abilityList)) {
      Log.showInfo(TAG, 'getAllAbilityList Empty');
      return [];
    }
    if (CheckEmptyUtils.isEmpty(bundleType)) {
      return abilityList;
    }
    return abilityList.filter(ability => ability.applicationInfo.bundleType === bundleType);
  }

  /**
   * 根据bundleName获取包信息
   *
   * @param bundleName 包名
   * @param bundleType 包类型：bundleManager.BundleType.APP:桌面app,  bundleManager.BundleType.ATOMIC_SERVICE:原子化服务
   * @returns 包信息
   */
  async getBundleInfoByBundleName(bundleName: string, bundleType?: bundleManager.BundleType): Promise<bundleManager.BundleInfo | undefined> {
    if (CheckEmptyUtils.checkStrIsEmpty(bundleName)) {
      Log.showError(TAG, 'getBundleInfoByBundleName reqParam bundleName is empty');
      return undefined;
    }
    let bundleInfo: bundleManager.BundleInfo = undefined;
    try {
      await bundleManager.getBundleInfo(bundleName,
        bundleManager.BundleFlag.GET_BUNDLE_INFO_WITH_APPLICATION |
        bundleManager.BundleFlag.GET_BUNDLE_INFO_WITH_HAP_MODULE |
        bundleManager.BundleFlag.GET_BUNDLE_INFO_WITH_ABILITY,
        this.mUserId)
        .then((res: bundleManager.BundleInfo) => {
          Log.showInfo(TAG, `getBundleInfoByBundleName res:${JSON.stringify(res.hapModulesInfo.length)}`);
          bundleInfo = res;
        })
        .catch((err) => {
          Log.showError(TAG, `getBundleInfoByBundleName error: ${JSON.stringify(err)}, bundleName:${bundleName}`);
        });
    } catch (err) {
      Log.showError(TAG, `getBundleInfoByBundleName bundleManager.getBundleInfo error: ${JSON.stringify(err)}, bundleName:${bundleName}`);
    }
    if (CheckEmptyUtils.isEmpty(bundleInfo)) {
      return undefined;
    }
    if (CheckEmptyUtils.isEmpty(bundleType)) {
      return bundleInfo;
    }
    return bundleInfo.appInfo.bundleType === bundleType ? bundleInfo : undefined;
  }

  /**
   * 根据abilityName获取ability信息
   *
   * @param bundleName 包名
   * @param abilityName ability名
   * @param bundleType 包类型：bundleManager.BundleType.APP:桌面app,  bundleManager.BundleType.ATOMIC_SERVICE:原子化服务
   * @returns ability信息
   */
  async getAbilityInfoByAbilityName(bundleName: string, abilityName: string,
                                    bundleType?: bundleManager.BundleType): Promise<bundleManager.AbilityInfo | undefined> {
    if (CheckEmptyUtils.checkStrIsEmpty(bundleName) || CheckEmptyUtils.checkStrIsEmpty(abilityName)) {
      Log.showError(TAG, 'getAbilityInfoByAbilityName reqParam bundleName or abilityName is empty');
      return undefined;
    }
    // get from system
    let abilityList = new Array<bundleManager.AbilityInfo>();
    let want: Want = {
      bundleName: bundleName,
      abilityName: abilityName
    };
    try {
      await bundleManager.queryAbilityInfo(want, bundleManager.AbilityFlag.GET_ABILITY_INFO_WITH_APPLICATION, this.mUserId)
        .then((res: Array<bundleManager.AbilityInfo>)=>{
          if (res !== undefined) {
            Log.showInfo(TAG, `getAbilityInfoByAbilityName res length: ${res.length}`);
            abilityList = res;
          }
        })
        .catch((err)=>{
          Log.showError(TAG, `getAbilityInfoByAbilityName error: ${JSON.stringify(err)}`);
        });
    } catch (err) {
      Log.showError(TAG, `getAbilityInfoByAbilityName bundleManager.queryAbilityInfo error: ${JSON.stringify(err)}`);
    }
    if (CheckEmptyUtils.isEmptyArr(abilityList)) {
      return undefined;
    }
    if (CheckEmptyUtils.isEmpty(bundleType)) {
      return abilityList[0];
    }
    return abilityList[0].applicationInfo.bundleType === bundleType ? abilityList[0] : undefined;
  }
}

const commonBundleManager = CommonBundleManager.getInstance();
export default commonBundleManager;