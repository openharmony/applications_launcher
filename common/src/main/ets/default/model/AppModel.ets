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

import Subscriber from '@ohos.commonevent';
import launcherAbilityManager from '../manager/LauncherAbilityManager.ets';
import SystemApplication from '../configs/SystemApplication.ets';
import CheckEmptyUtils from '../utils/CheckEmptyUtils.ets';
import CommonConstants from '../constants/CommonConstants.ets';
import EventConstants from '../constants/EventConstants.ets';

/**
 * 桌面应用信息数据模型
 */
export default class AppModel {
  private static sAppModel = new AppModel();
  private mBundleInfoList = [];
  private mSystemApplicationName = [];
  private mCommonEventSubscriber = null;
  private mAppStateChangeListener = [];
  private mCommonEventSubscribeInfo = {
    events: [
      EventConstants.EVENT_PACKAGE_ADDED,
      EventConstants.EVENT_PACKAGE_CHANGED,
      EventConstants.EVENT_PACKAGE_REMOVED
    ]
  };

  private constructor() {
    this.mSystemApplicationName = SystemApplication.SystemApplicationName.split(",");
  }

  /**
   * 获取应用数据模型对象
   *
   * @return 应用数据模型单例
   */
  public static getInstance(): AppModel{
    return this.sAppModel;
  }

  /**
   * 获取桌面显示的应用列表
   */
  public async getAppList() {
    console.info('Launcher AppModel getAppIcon getAppList');
    if (CheckEmptyUtils.isEmptyArr(this.mBundleInfoList)) {
      let allAbilityList= await launcherAbilityManager.getLauncherAbilityList();
      for (let i = 0; i < allAbilityList.length; i++) {
        if (this.mSystemApplicationName.indexOf(allAbilityList[i].bundleName) == CommonConstants.INVALID_VALUE) {
          this.mBundleInfoList.push(allAbilityList[i])
        }
      }
      console.info('Launcher AppModel bundleInfoList length ' + this.mBundleInfoList.length);
    }
    return this.mBundleInfoList;
  }

  /**
   * 注册应用列表改变监听
   *
   * @param listener 监听对象
   */
  public registerStateChangeListener(listener) {
    if (this.mAppStateChangeListener.indexOf(listener) == CommonConstants.INVALID_VALUE) {
      this.mAppStateChangeListener.push(listener);
    }
  }

  /**
   * 解注册应用列表改变监听
   *
   * @param  listener 监听对象
   */
  public unregisterAppStateChangeListener(listener) {
    if (this.mAppStateChangeListener.indexOf(listener) != CommonConstants.INVALID_VALUE) {
      this.mAppStateChangeListener.splice(index, 1);
    }
  }

  /**
   * 开始监听系统应用状态
   */
  public registerAppListEvent() {
    Subscriber.createSubscriber(
      this.mCommonEventSubscribeInfo,
      this.createInstallationSubscriberCallBack.bind(this)
    );
  }

  /**
   * 停止监听系统应用状态
   */
  public unregisterAppListEvent() {
    Subscriber.unsubscribe(this.mCommonEventSubscriber, () => {
      console.info("Launcher AppModel unregisterAppListEvent");
    });
  }

  private createInstallationSubscriberCallBack(err, subscriber) {
    console.info("Launcher AppModel createInstallationSubscriberCallBack");
    this.mCommonEventSubscriber = subscriber;
    Subscriber.subscribe(this.mCommonEventSubscriber, this.installationSubscriberCallBack.bind(this));
  }

  private async installationSubscriberCallBack(err, callbackData) {
    if (err.code == 0) {
      if (CheckEmptyUtils.isEmpty(callbackData)) {
        console.error("Launcher AppModel installationSubscriberCallBack ERROR! data is empty");
        return;
      }
      console.info("Launcher AppModel installationSubscriberCallBack data = " + JSON.stringify(callbackData));
      if (callbackData.event == EventConstants.EVENT_PACKAGE_REMOVED) {
        this.removeItem(callbackData.bundleName);
      } else {
        let abilityInfo = await launcherAbilityManager.getLauncherAbilityInfo(callbackData.bundleName);
        this.replaceItem(abilityInfo);
      }
    } else {
      console.error("Launcher AppModel app list change failed --- err = " + JSON.stringify(err));
    }
  }

  private notifyAppStateChangeEvent() {
    for (let i = 0; i < this.mAppStateChangeListener.length; i++) {
      this.mAppStateChangeListener[i](this.mBundleInfoList);
    }
  }

  private getItemIndex(bundleName): number {
    for (let listItem of this.mBundleInfoList) {
      if (listItem.bundleName == bundleName) {
        let index = this.mBundleInfoList.indexOf(listItem);
        return index;
      }
    }
    return CommonConstants.INVALID_VALUE;
  }

  private appendItem(item) {
    console.info("Launcher appendItem: " + item.bundleName);
    this.removeItem(item.bundleName);
    this.mBundleInfoList.push(item);
    this.notifyAppStateChangeEvent();
  }

  private removeItem(bundleName) {
    console.info("Launcher removeItem: " + bundleName);
    let originItemIndex = this.getItemIndex(bundleName);
    if (originItemIndex != CommonConstants.INVALID_VALUE) {
      this.mBundleInfoList.splice(originItemIndex, 1);
      this.notifyAppStateChangeEvent();
    }
  }

  private replaceItem(item) {
    console.info("Launcher replaceItem: " + item.bundleName);
    let originItemIndex = this.getItemIndex(item.bundleName);
    if (originItemIndex != CommonConstants.INVALID_VALUE) {
      this.mBundleInfoList.splice(originItemIndex, 1, item);
      this.notifyAppStateChangeEvent();
    } else {
      this.appendItem(item);
    }
  }
}