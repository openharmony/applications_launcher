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
import { CheckEmptyUtils } from '../utils/CheckEmptyUtils';
import { EventConstants } from '../constants/EventConstants';
import { CommonConstants } from '../constants/CommonConstants';
import { FormModel } from './FormModel';
import { AppItemInfo } from '../bean/AppItemInfo';
import { localEventManager } from '../manager/LocalEventManager';
import { launcherAbilityManager } from '../manager/LauncherAbilityManager';
import SystemApplication from '../configs/SystemApplication';
import { AtomicServiceAppModel } from './AtomicServiceAppModel';
import launcherBundleManager from '@ohos.bundle.launcherBundleManager';

const TAG = 'AppModel';

/**
 * Desktop application information data model.
 */
export class AppModel {
  private mBundleInfoList: AppItemInfo[] = [];
  private readonly mSystemApplicationName = [];
  private readonly mAppStateChangeListener = [];
  private readonly mShortcutInfoMap = new Map<string, launcherBundleManager.ShortcutInfo[]>();
  private readonly mFormModel: FormModel;
  private readonly mInstallationListener;
  private readonly mAtomicServiceAppModel: AtomicServiceAppModel;

  private constructor() {
    Log.showInfo(TAG, 'constructor start');
    this.mSystemApplicationName = SystemApplication.SystemApplicationName.split(',');
    this.mFormModel = FormModel.getInstance();
    this.mAtomicServiceAppModel = AtomicServiceAppModel.getInstance();
    this.mInstallationListener = this.installationSubscriberCallBack.bind(this);
  }

  /**
   * Get the application data model object.
   *
   * @return {object} application data model singleton
   */
  static getInstance(): AppModel {
    if (globalThis.AppModel == null) {
      globalThis.AppModel = new AppModel();
    }
    return globalThis.AppModel;
  }

  /**
   * Get the list of apps displayed on the desktop.
   * (public function, reduce the frequency of method call)
   *
   * @return {array} bundleInfoList
   */
  async getAppList() {
    Log.showInfo(TAG, 'getAppList start');
    if (!CheckEmptyUtils.isEmptyArr(this.mBundleInfoList)) {
      Log.showInfo(TAG, `getAppList bundleInfoList length: ${this.mBundleInfoList.length}`);
      return this.mBundleInfoList;
    }
    const bundleInfoList: AppItemInfo[] = await this.getAppListAsync();
    return bundleInfoList;
  }

  /**
   * Get the list of apps displayed on the desktop (private function).
   *
   * @return {array} bundleInfoList, excluding system applications
   */
  async getAppListAsync(): Promise<AppItemInfo[]> {
    let allAbilityList: AppItemInfo[] = await launcherAbilityManager.getLauncherAbilityList();
    Log.showInfo(TAG, `getAppListAsync--->allAbilityList length: ${allAbilityList.length}`);
    let launcherAbilityList: AppItemInfo[] = [];
    for (const ability of allAbilityList) {
      if (this.mSystemApplicationName.indexOf(ability.bundleName) === CommonConstants.INVALID_VALUE) {
        launcherAbilityList.push(ability);
        this.updateShortcutInfo(ability.bundleName);
        this.mFormModel.updateAppItemFormInfo(ability.bundleName);
      }
    }
    this.mBundleInfoList = launcherAbilityList;
    Log.showInfo(TAG, `getAppListAsync--->allAbilityList length after filtration: ${launcherAbilityList.length}`);
    return launcherAbilityList;
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
    if (index != CommonConstants.INVALID_VALUE) {
      this.mAppStateChangeListener.splice(index, 1);
    }
  }

  getUserId(): number {
    return launcherAbilityManager.getUserId();
  }

  /**
   * Start listening to the system application status.
   */
  registerAppListEvent(): void {
    launcherAbilityManager.registerLauncherAbilityChangeListener(this.mInstallationListener);
  }

  /**
   * Stop listening for system application status.
   */
  unregisterAppListEvent(): void {
    launcherAbilityManager.unregisterLauncherAbilityChangeListener(this.mInstallationListener);
  }

  /**
   * The callback function of the application installation event.
   *
   * @param {Object} event
   * @param {string} bundleName
   * @param {number} userId
   */
  private async installationSubscriberCallBack(event, bundleName, userId) {
    Log.showInfo(TAG, `installationSubscriberCallBack event: ${event}`);
    this.closePopup();
    this.updateShortcutInfo(bundleName, event);
    this.mFormModel.updateAppItemFormInfo(bundleName, event);
    // initial mBundleInfoList
    if (CheckEmptyUtils.isEmptyArr(this.mBundleInfoList)) {
      await this.getAppListAsync();
    }
    if (event === EventConstants.EVENT_PACKAGE_REMOVED) {
      this.removeItem(bundleName);
      this.mAtomicServiceAppModel.removeAtomicServiceItem(bundleName);
      this.mFormModel.deleteFormByBundleName(bundleName);

      // delete app from folder
      localEventManager.sendLocalEventSticky(EventConstants.EVENT_FOLDER_PACKAGE_REMOVED, bundleName);

      // delete app form dock
      localEventManager.sendLocalEventSticky(EventConstants.EVENT_REQUEST_RESIDENT_DOCK_ITEM_DELETE, {
        bundleName: bundleName,
        keyName: undefined
      });
      localEventManager.sendLocalEventSticky(EventConstants.EVENT_REQUEST_RECENT_DOCK_ITEM_DELETE, {
        bundleName: bundleName,
        keyName: undefined
      });

      // delete app from pageDesktop
      localEventManager.sendLocalEventSticky(EventConstants.EVENT_REQUEST_PAGEDESK_ITEM_DELETE, {
        bundleName: bundleName,
        keyName: undefined
      });

      localEventManager.sendLocalEventSticky(EventConstants.EVENT_REQUEST_RECOMMEND_FORM_DELETE, bundleName);
    } else {
      let appItemInfo: AppItemInfo = await this.getAndReplaceLauncherAbility(bundleName);

      if (CheckEmptyUtils.isEmpty(appItemInfo)) {
        appItemInfo = await this.mAtomicServiceAppModel.getAndReplaceAtomicAbility(bundleName);
      }

      if (CheckEmptyUtils.isEmpty(appItemInfo)) {
        Log.showError(TAG, `installationSubscriberCallBack neither launcher nor atomic app, bundleName:${bundleName} `);
        return;
      }
      if (event === EventConstants.EVENT_PACKAGE_CHANGED) {
        Log.showInfo(TAG, `installationSubscriber, PACKAGE_CHANGED, bundleName is ${bundleName}`);
        AppStorage.setOrCreate('formRefresh', String(new Date()));

        localEventManager.sendLocalEventSticky(EventConstants.EVENT_REQUEST_RECOMMEND_FORM_UPDATE, bundleName);
        Log.showError(TAG, `installationSubscriberCallBack unKnow bundleType:${appItemInfo.bundleType}`);
      } else {
        await this.mFormModel.updateAppItemFormInfo(bundleName);
        await this.mFormModel.updateAtomicServiceAppItemFormInfo(bundleName);
        localEventManager.sendLocalEventSticky(EventConstants.EVENT_REQUEST_RECOMMEND_FORM_ADD, bundleName);
      }
    }
    this.notifyAppStateChangeEvent();
  }

  private async getAndReplaceLauncherAbility(bundleName: string): Promise<AppItemInfo> {
    const abilityInfos: AppItemInfo[] = await launcherAbilityManager.getLauncherAbilityInfo(bundleName);
    if (CheckEmptyUtils.isEmptyArr(abilityInfos)) {
      return undefined;
    }
    Log.showDebug(TAG, `launcher abilityInfos: ${JSON.stringify(abilityInfos)}`);
    this.replaceItem(bundleName, abilityInfos);
    return abilityInfos[0];
  }

  /**
   * Send event about application state change.
   */
  private notifyAppStateChangeEvent() {
    for (let i = 0; i < this.mAppStateChangeListener.length; i++) {
      this.mAppStateChangeListener[i](this.mBundleInfoList);
    }
  }

  /**
   * Get the app index in bundleInfoList.
   *
   * @param {string} bundleName
   * @return {number} index
   */
  private getItemIndex(bundleName): number {
    for (const listItem of this.mBundleInfoList) {
      if (listItem.bundleName === bundleName) {
        const index = this.mBundleInfoList.indexOf(listItem);
        return index;
      }
    }
    return CommonConstants.INVALID_VALUE;
  }

  /**
   * Append app items into the bundleInfoList.
   *
   * @param {array} abilityInfos
   */
  private appendItem(abilityInfos): void {
    for (let index = 0; index < abilityInfos.length; index++) {
      this.mBundleInfoList.push(abilityInfos[index]);
    }
  }

  /**
   * Remove app item from the bundleInfoList.
   *
   * @param {string} bundleName
   */
  private removeItem(bundleName: string): void {
    Log.showDebug(TAG, `removeItem bundleName: ${bundleName}`);
    let originItemIndex = this.getItemIndex(bundleName);
    while (originItemIndex != CommonConstants.INVALID_VALUE) {
      this.removeItemCache(this.mBundleInfoList[originItemIndex]);
      this.mBundleInfoList.splice(originItemIndex, 1);
      originItemIndex = this.getItemIndex(bundleName);
    }
  }

  /**
 * Remove app item from the cache.
 *
 * @param {string} bundleName
 */
  private removeItemCache(appItemInfo: AppItemInfo): void {
    Log.showDebug(TAG, `removeItemCache bundleName: ${(appItemInfo.bundleName)}`);
    let cacheKey = appItemInfo.appLabelId + appItemInfo.bundleName + appItemInfo.moduleName;
    globalThis.ResourceManager.deleteAppResourceCache(cacheKey, 'name');
    cacheKey = appItemInfo.appIconId + appItemInfo.bundleName + appItemInfo.moduleName;
    globalThis.ResourceManager.deleteAppResourceCache(cacheKey, 'icon');
  }

  /**
   * Replace app items in the bundleInfoList.
   *
   * @param {string} bundleName
   * @param {array} abilityInfos
   */
  private replaceItem(bundleName: string, abilityInfos): void {
    Log.showDebug(TAG, `replaceItem bundleName: ${bundleName}`);
    this.removeItem(bundleName);
    this.appendItem(abilityInfos);
  }

  /**
   * Put shortcut info into map.
   *
   * @param {string} bundleName
   * @param {array} shortcutInfo
   */
  setShortcutInfo(bundleName: string, shortcutInfo: launcherBundleManager.ShortcutInfo[]): void {
    this.mShortcutInfoMap.set(bundleName, shortcutInfo);
  }

  /**
   * Get shortcut info from map.
   *
   * @param {string} bundleName
   * @return {array | undefined} shortcutInfo
   */
  getShortcutInfo(bundleName: string): launcherBundleManager.ShortcutInfo[] | undefined {
    return this.mShortcutInfoMap.get(bundleName);
  }

  /**
   * Update shortcut info of map.
   *
   * @param {string} bundleName
   * @param {string | undefined} eventType
   */
  private updateShortcutInfo(bundleName, eventType?): void {
    if (eventType && eventType === EventConstants.EVENT_PACKAGE_REMOVED) {
      this.mShortcutInfoMap.delete(bundleName);
      return;
    }
    launcherAbilityManager.getShortcutInfo(bundleName, this.setShortcutInfo.bind(this));
  }

  /**
   * Close popup.
   */
  private closePopup(): void {
    ContextMenu.close();
  }
}