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

import { ShortcutInfo } from 'bundle/shortcutInfo';
import launcherAbilityManager from '../manager/LauncherAbilityManager';
import localEventManager from '../manager/LocalEventManager';
import SystemApplication from '../configs/SystemApplication';
import CheckEmptyUtils from '../utils/CheckEmptyUtils';
import CommonConstants from '../constants/CommonConstants';
import EventConstants from '../constants/EventConstants';
import AppItemInfo from '../bean/AppItemInfo';
import FormModel from './FormModel';
import Log from '../utils/Log';

const TAG = 'AppModel';

/**
 * Desktop application information data model.
 */
export default class AppModel {
  private readonly mBundleInfoList: AppItemInfo[] = [];
  private readonly mSystemApplicationName = [];
  private readonly mAppStateChangeListener = [];
  private readonly mShortcutInfoMap = new Map<string, ShortcutInfo[]>();
  private readonly mFormModel: FormModel;
  private mInstallationListener;

  private constructor() {
    Log.showInfo(TAG, 'constructor start');
    this.mSystemApplicationName = SystemApplication.SystemApplicationName.split(',');
    this.mFormModel = FormModel.getInstance();
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
      return this.mBundleInfoList;
    }
    const bundleInfoList: AppItemInfo[] = await this.getAppListAsync();
    Log.showInfo(TAG, `getAppList bundleInfoList length: ${this.mBundleInfoList.length}`);
    return bundleInfoList;
  }

  /**
   * Get the list of apps displayed on the desktop (private function).
   *
   * @return {array} bundleInfoList, excluding system applications
   */
  private async getAppListAsync() {
    const allAbilityList: AppItemInfo[] = await launcherAbilityManager.getLauncherAbilityList();
    if (!CheckEmptyUtils.isEmptyArr(this.mBundleInfoList)) {
      return this.mBundleInfoList;
    }
    for (let i = 0; i < allAbilityList.length; i++) {
      if (this.mSystemApplicationName.indexOf(allAbilityList[i].bundleName) === CommonConstants.INVALID_VALUE) {
        this.mBundleInfoList.push(allAbilityList[i]);
        this.updateShortcutInfo(allAbilityList[i].bundleName);
        this.mFormModel.updateAppItemFormInfo(allAbilityList[i].bundleName);
      }
    }
    return this.mBundleInfoList;
  }

  /**
   * Register application list change event listener.
   *
   * @param listener
   */
  registerStateChangeListener(listener) {
    if (this.mAppStateChangeListener.indexOf(listener) === CommonConstants.INVALID_VALUE) {
      this.mAppStateChangeListener.push(listener);
    }
  }

  /**
   * Unregister application list change event listener.
   *
   * @param listener
   */
  unregisterAppStateChangeListener(listener) {
    let index: number = this.mAppStateChangeListener.indexOf(listener);
    if (index != CommonConstants.INVALID_VALUE) {
      this.mAppStateChangeListener.splice(index, 1);
    }
  }

  /**
   * Start listening to the system application status.
   */
  registerAppListEvent() {
    launcherAbilityManager.registerLauncherAbilityChangeListener(this.mInstallationListener);
  }

  /**
   * Stop listening for system application status.
   */
  unregisterAppListEvent() {
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
    await this.updateShortcutInfo(bundleName, event);
    if (event === EventConstants.EVENT_PACKAGE_REMOVED) {
      this.removeItem(bundleName);
      this.mFormModel.deleteFormByBundleName(bundleName);

      // delete app from folder
      localEventManager.sendLocalEventSticky(EventConstants.EVENT_FOLDER_PACKAGE_REMOVED, bundleName);

      // delete app form dock
      localEventManager.sendLocalEventSticky(EventConstants.EVENT_REQUEST_RESIDENT_DOCK_ITEM_DELETE, bundleName);
      localEventManager.sendLocalEventSticky(EventConstants.EVENT_REQUEST_RECENT_DOCK_ITEM_DELETE, bundleName);

      // delete app from pageDesktop
      localEventManager.sendLocalEventSticky(EventConstants.EVENT_REQUEST_PAGEDESK_ITEM_DELETE, bundleName);
      this.notifyAppStateChangeEvent();
    } else {
      const abilityInfos = await launcherAbilityManager.getLauncherAbilityInfo(bundleName);
      this.replaceItem(bundleName, abilityInfos);
      this.notifyAppStateChangeEvent();
      this.mFormModel.updateAppItemFormInfo(bundleName);
    }
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
  private appendItem(abilityInfos) {
    for (let index = 0; index < abilityInfos.length; index++) {
      this.mBundleInfoList.push(abilityInfos[index]);
    }
  }

  /**
   * Remove app item from the bundleInfoList.
   *
   * @param {string} bundleName
   */
  private removeItem(bundleName: string) {
    Log.showInfo(TAG, `removeItem bundleName: ${bundleName}`);
    let originItemIndex = this.getItemIndex(bundleName);
    while (originItemIndex != CommonConstants.INVALID_VALUE) {
      this.mBundleInfoList.splice(originItemIndex, 1);
      originItemIndex = this.getItemIndex(bundleName);
    }
  }

  /**
   * Replace app items in the bundleInfoList.
   *
   * @param {string} bundleName
   * @param {array} abilityInfos
   */
  private replaceItem(bundleName: string, abilityInfos) {
    Log.showInfo(TAG, `replaceItem bundleName: ${bundleName}`);
    this.removeItem(bundleName);
    this.appendItem(abilityInfos);
  }

  /**
   * Put shortcut info into map.
   *
   * @param {string} bundleName
   * @param {array} shortcutInfo
   */
  setShortcutInfo(bundleName: string, shortcutInfo: ShortcutInfo[]) {
    this.mShortcutInfoMap.set(bundleName, shortcutInfo);
  }

  /**
   * Get shortcut info from map.
   *
   * @param {string} bundleName
   * @return {array | undefined} shortcutInfo
   */
  getShortcutInfo(bundleName: string): ShortcutInfo[] | undefined {
    Log.showInfo(TAG, `getShortcutInfo bundleName: ${bundleName},
      shortcutInfo: ${JSON.stringify(this.mShortcutInfoMap.get(bundleName))}`);
    return this.mShortcutInfoMap.get(bundleName);
  }

  /**
   * Update shortcut info of map.
   *
   * @param {string} bundleName
   * @param {string | undefined} eventType
   */
  private updateShortcutInfo(bundleName, eventType?) {
    if (eventType && eventType === EventConstants.EVENT_PACKAGE_REMOVED) {
      this.mShortcutInfoMap.delete(bundleName);
      return;
    }
    launcherAbilityManager.getShortcutInfo(bundleName, this.setShortcutInfo.bind(this));
  }
}
