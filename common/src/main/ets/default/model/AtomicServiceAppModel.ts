/**
 * Copyright (c) 2023-2023 Huawei Device Co., Ltd.
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

import atomicServiceAbilityManager from '../manager/AtomicServiceAbilityManager';
import SystemApplication from '../configs/SystemApplication';
import { CheckEmptyUtils } from '../utils/CheckEmptyUtils';
import { CommonConstants } from '../constants/CommonConstants';
import type { AppItemInfo } from '../bean/AppItemInfo';
import { FormModel } from './FormModel';
import { Log } from '../utils/Log';

const TAG = 'AtomicServiceAppModel';

/**
 * Desktop application information data model.
 */
export class AtomicServiceAppModel {
  private mAtomicServiceBundleInfoList: AppItemInfo[] = [];
  private readonly mSystemApplicationName: string[] = [];
  private readonly mAppStateChangeListener = [];
  private readonly mFormModel: FormModel;
  private static mInstance: AtomicServiceAppModel;

  private constructor() {
    Log.showInfo(TAG, 'constructor start');
    this.mSystemApplicationName = SystemApplication.SystemApplicationName.split(',');
    this.mFormModel = FormModel.getInstance();
  }

  /**
   * Get the application data model object.
   *
   * @return {object} application data model singleton
   */
  static getInstance(): AtomicServiceAppModel {
    if (AtomicServiceAppModel.mInstance == null) {
      AtomicServiceAppModel.mInstance = new AtomicServiceAppModel();
      globalThis.AtomicServiceAppModel = AtomicServiceAppModel.mInstance;
    }
    return AtomicServiceAppModel.mInstance;
  }

  /**
   * Get the list of apps displayed on the desktop.
   * (public function, reduce the frequency of method call)
   *
   * @return {array} bundleInfoList
   */
  async getAtomicServiceAppList(): Promise<AppItemInfo[]> {
    Log.showInfo(TAG, 'getAtomicServiceAppList start');
    if (!CheckEmptyUtils.isEmptyArr(this.mAtomicServiceBundleInfoList)) {
      Log.showInfo(TAG, `getAtomicServiceAppList bundleInfoList length: ${this.mAtomicServiceBundleInfoList.length}`);
      return this.mAtomicServiceBundleInfoList;
    }
    const bundleInfoList: AppItemInfo[] = await this.getAtomicServiceAppListAsync();
    Log.showInfo(TAG, `getAtomicServiceAppList bundleInfoList length: ${this.mAtomicServiceBundleInfoList.length}`);
    return bundleInfoList;
  }

  /**
   * Get the list of apps displayed on the desktop (private function).
   *
   * @return {array} bundleInfoList, excluding system applications
   */
  async getAtomicServiceAppListAsync(): Promise<AppItemInfo[]> {
    let allAbilityList: AppItemInfo[] = await atomicServiceAbilityManager.getAtomicServiceAbilityList();
    let atomicServiceAbilityList: AppItemInfo[] = [];
    if (CheckEmptyUtils.isEmptyArr(allAbilityList)) {
      return atomicServiceAbilityList;
    }
    Log.showInfo(TAG, `getAtomicServiceAppListAsync allAbilityList length: ${allAbilityList.length}`);
    for (let ability of allAbilityList) {
      if (this.mSystemApplicationName.indexOf(ability.bundleName) === CommonConstants.INVALID_VALUE) {
        atomicServiceAbilityList.push(ability);
        await this.mFormModel.updateAtomicServiceAppItemFormInfo(ability.bundleName);
      }
    }
    this.mAtomicServiceBundleInfoList = atomicServiceAbilityList;
    Log.showInfo(TAG, `getAtomicServiceAppListAsync length: ${atomicServiceAbilityList.length}`);
    return atomicServiceAbilityList;
  }

  /**
   * Register application list change event listener.
   *
   * @param listener
   */
  registerStateChangeListener(listener): void {
    if (this.mAppStateChangeListener.indexOf(listener) === CommonConstants.INVALID_VALUE) {
      this.mAppStateChangeListener.push(listener);
    }
  }

  /**
   * Unregister application list change event listener.
   *
   * @param listener
   */
  unregisterAppStateChangeListener(listener): void {
    let index: number = this.mAppStateChangeListener.indexOf(listener);
    if (index !== CommonConstants.INVALID_VALUE) {
      this.mAppStateChangeListener.splice(index, 1);
    }
  }

  /**
   * 获取userId.
   */
  getUserId(): number {
    return atomicServiceAbilityManager.getUserId();
  }

  /**
   * 获取并替换原子服务App
   *
   * @param bundleName 包名
   */
  async getAndReplaceAtomicAbility(bundleName: string): Promise<AppItemInfo> {
    const abilityInfos: AppItemInfo[] = await atomicServiceAbilityManager.getAtomicServiceAbilityInfoAsync(bundleName);
    if (CheckEmptyUtils.isEmptyArr(abilityInfos)) {
      Log.showInfo(TAG, 'cannot get abilityInfo by bundleName:' + bundleName);
      return undefined;
    }
    Log.showInfo(TAG, `atomic abilityInfos: ${JSON.stringify(abilityInfos)}`);
    this.replaceAtomicServiceItem(bundleName, abilityInfos);
    return abilityInfos[0];
  }

  notifyAppStateChangeEvent(): void {
    for (let i = 0; i < this.mAppStateChangeListener.length; i++) {
      this.mAppStateChangeListener[i](this.mAtomicServiceBundleInfoList);
    }
  }

  private getAtomicServiceItemIndex(bundleName: string): number {
    for (const listItem of this.mAtomicServiceBundleInfoList) {
      if (listItem.bundleName === bundleName) {
        return this.mAtomicServiceBundleInfoList.indexOf(listItem);
      }
    }
    return CommonConstants.INVALID_VALUE;
  }

  private appendAtomicServiceItem(abilityInfos: AppItemInfo[]): void {
    for (let index = 0; index < abilityInfos.length; index++) {
      this.mAtomicServiceBundleInfoList.push(abilityInfos[index]);
    }
  }

  /**
   * 移除原子服务App
   *
   * @param bundleName 包名
   */
  removeAtomicServiceItem(bundleName: string): void {
    Log.showDebug(TAG, `removeAtomicServiceItem bundleName: ${bundleName}`);
    this.mFormModel.deleteAtomicServiceAppItemFormInfo(bundleName);
    let originItemIndex: number = this.getAtomicServiceItemIndex(bundleName);
    while (originItemIndex !== CommonConstants.INVALID_VALUE) {
      this.removeItemCache(this.mAtomicServiceBundleInfoList[originItemIndex]);
      this.mAtomicServiceBundleInfoList.splice(originItemIndex, 1);
      originItemIndex = this.getAtomicServiceItemIndex(bundleName);
    }
  }

  private removeItemCache(appItemInfo: AppItemInfo): void {
    Log.showInfo(TAG, `removeItemCache bundleName: ${(appItemInfo.bundleName)}`);
    let cacheKey: string = appItemInfo.appLabelId + appItemInfo.bundleName + appItemInfo.moduleName;
    globalThis.ResourceManager.deleteAppResourceCache(cacheKey, 'name');
    cacheKey = appItemInfo.appIconId + appItemInfo.bundleName + appItemInfo.moduleName;
    globalThis.ResourceManager.deleteAppResourceCache(cacheKey, 'icon');
  }

  private replaceAtomicServiceItem(bundleName: string, abilityInfos: AppItemInfo[]): void {
    Log.showDebug(TAG, `replaceAtomicServiceItem bundleName: ${bundleName}`);
    this.removeAtomicServiceItem(bundleName);
    this.appendAtomicServiceItem(abilityInfos);
  }
}
