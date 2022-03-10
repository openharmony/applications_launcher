/*
 * Copyright (c) 2021 Huawei Device Co., Ltd.
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

/**
 * 桌面应用信息数据模型
 */
export default class AppModel {
  private static readonly sAppModel = new AppModel();
  private readonly mBundleInfoList: AppItemInfo[] = [];
  private readonly mSystemApplicationName = [];
  private readonly mAppStateChangeListener = [];
  private readonly shortcutInfoMap = new Map<string, ShortcutInfo[]>();
  private readonly mFormModel: FormModel;

  private constructor() {
    this.mSystemApplicationName = SystemApplication.SystemApplicationName.split(',');
    this.mFormModel = FormModel.getInstance();
  }

  /**
   * 获取应用数据模型对象.
   *
   * @return 应用数据模型单例
   */
  static getInstance(): AppModel {
    return this.sAppModel;
  }

  /**
   * 获取桌面显示的应用列表.
   */
  async getAppList() {
    console.info('Launcher AppModel getAppIcon getAppList');
    if (!CheckEmptyUtils.isEmptyArr(this.mBundleInfoList)) {
      return this.mBundleInfoList;
    }
    const bundleInfoList: AppItemInfo[] = await this.getAppListAsync();
    console.info('Launcher AppModel bundleInfoList length ' + this.mBundleInfoList.length);
    return bundleInfoList;
  }

  private async getAppListAsync() {
    const allAbilityList: AppItemInfo[] = await launcherAbilityManager.getLauncherAbilityList();
    if (!CheckEmptyUtils.isEmptyArr(this.mBundleInfoList)) {
      return this.mBundleInfoList;
    }
    for (let i = 0; i < allAbilityList.length; i++) {
      if (this.mSystemApplicationName.indexOf(allAbilityList[i].bundleName) == CommonConstants.INVALID_VALUE) {
        this.mBundleInfoList.push(allAbilityList[i]);
        this.updateShortcutInfo(allAbilityList[i].bundleName);
        this.mFormModel.updateAppItemFormInfo(allAbilityList[i].bundleName);
      }
    }
    return this.mBundleInfoList;
  }

  /**
   * 注册应用列表改变监听.
   *
   * @param listener 监听对象
   */
  registerStateChangeListener(listener) {
    if (this.mAppStateChangeListener.indexOf(listener) == CommonConstants.INVALID_VALUE) {
      this.mAppStateChangeListener.push(listener);
    }
  }

  /**
   * 解注册应用列表改变监听.
   *
   * @param listener 监听对象
   */
  unregisterAppStateChangeListener(listener) {
    let index: number = this.mAppStateChangeListener.indexOf(listener);
    if (index != CommonConstants.INVALID_VALUE) {
      this.mAppStateChangeListener.splice(index, 1);
    }
  }

  /**
   * 开始监听系统应用状态.
   */
  registerAppListEvent() {
    launcherAbilityManager.registerLauncherAbilityChangeListener(this.installationSubscriberCallBack.bind(this));
  }

  /**
   * 停止监听系统应用状态.
   */
  unregisterAppListEvent() {
    launcherAbilityManager.unregisterLauncherAbilityChangeListener(this.installationSubscriberCallBack.bind(this));
  }

  private async installationSubscriberCallBack(event, bundleName, userId) {
    console.info('Launcher AppModel installationSubscriberCallBack event = ' + event);
    await this.updateShortcutInfo(bundleName, event);
    if (event == EventConstants.EVENT_PACKAGE_REMOVED) {
      this.removeItem(bundleName);
      this.mFormModel.deleteFormByBundleName(bundleName);

      //delete app from folder
      localEventManager.sendLocalEventSticky(EventConstants.EVENT_FOLDER_PACKAGE_REMOVED, bundleName);

      //delete dock
      localEventManager.sendLocalEventSticky(EventConstants.EVENT_REQUEST_RESIDENT_DOCK_ITEM_DELETE, bundleName);
      localEventManager.sendLocalEventSticky(EventConstants.EVENT_REQUEST_RECENT_DOCK_ITEM_DELETE, bundleName);
      this.notifyAppStateChangeEvent();
    } else {
      const abilityInfos = await launcherAbilityManager.getLauncherAbilityInfo(bundleName);
      this.replaceItem(bundleName, abilityInfos);
      this.notifyAppStateChangeEvent();
    }
  }

  private notifyAppStateChangeEvent() {
    for (let i = 0; i < this.mAppStateChangeListener.length; i++) {
      this.mAppStateChangeListener[i](this.mBundleInfoList);
    }
  }

  private getItemIndex(bundleName): number {
    for (const listItem of this.mBundleInfoList) {
      if (listItem.bundleName == bundleName) {
        const index = this.mBundleInfoList.indexOf(listItem);
        return index;
      }
    }
    return CommonConstants.INVALID_VALUE;
  }

  private appendItem(abilityInfos) {
    for (let index = 0; index < abilityInfos.length; index++) {
      this.mBundleInfoList.push(abilityInfos[index]);
    }
  }

  private removeItem(bundleName: string) {
    console.info('Launcher removeItem: ' + bundleName);
    let originItemIndex = this.getItemIndex(bundleName);
    while (originItemIndex != CommonConstants.INVALID_VALUE) {
      this.mBundleInfoList.splice(originItemIndex, 1);
      originItemIndex = this.getItemIndex(bundleName);
    }
  }

  private replaceItem(bundleName: string, abilityInfos) {
    console.info('Launcher replaceItem: ' + bundleName);
    this.removeItem(bundleName);
    this.appendItem(abilityInfos);
  }

  setShortcutInfo(bundleName: string, shortcutInfo: ShortcutInfo[]) {
    this.shortcutInfoMap.set(bundleName, shortcutInfo);
  }

  getShortcutInfo(bundleName: string): ShortcutInfo[] | undefined {
    console.info('Launcher AppModel getShortcutInfo bundleName: ' + bundleName + ',shortcutInfo: ' +
      JSON.stringify(this.shortcutInfoMap.get(bundleName)));
    return this.shortcutInfoMap.get(bundleName);
  }

  private updateShortcutInfo(bundleName, eventType?) {
    if (eventType && eventType == EventConstants.EVENT_PACKAGE_REMOVED) {
      this.shortcutInfoMap.delete(bundleName);
      return;
    }
    launcherAbilityManager.getShortcutInfo(bundleName, this.setShortcutInfo.bind(this));
  }
}
