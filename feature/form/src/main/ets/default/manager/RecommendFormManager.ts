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

import {
  Log,
  CardItemInfo,
  EventConstants,
  FormModel,
  NumberConstants,
  CheckEmptyUtils,
  localEventManager
} from '@ohos/common';
import RecommendCardsDataPool from '../datapool/RecommendCardsDataPool';
import AppUpdateDataSource from '../datasource/AppUpdateDataSource';
import AppInstallDataSource from '../datasource/AppInstallDataSource';
import HighFrequencyAppDataSource from '../datasource/HighFrequencyAppDataSource';
import BigDataDataSource from '../datasource/BigDataDataSource';
import systemTime from '@ohos.systemDateTime';
import ArrayList from '@ohos.util.ArrayList';
import AppFormWeightManager from './AppFormWeightManager';

const TAG = 'RecommendManager';
const REFRESH_INTERVAL_TIME = 3;
const ENTER_RECOMMEND_INTERVAL_DAYS = 1;

/**
 * 推荐服务卡片管理接口
 */
export interface IRecommendManager {
  getRecommendFormArray(): Promise<CardItemInfo[]>;

  removeFormFromRecommendServiceFormList(bundleName: string): void;

  addFormToRecommendServiceFormList(bundleName: string, event: string): void;
}

/**
 *  推荐服务卡片管理类
 */
export default class RecommendManager implements IRecommendManager {
  private mCardsDataPool: RecommendCardsDataPool = RecommendCardsDataPool.getInstance();
  private mAppFormWeightManager: AppFormWeightManager = AppFormWeightManager.getInstance();
  private readonly mFormModel: FormModel = FormModel.getInstance();
  private readonly mAppUpdateDataSource: AppUpdateDataSource;
  private readonly mAppInstallDataSource: AppInstallDataSource;
  private mEnterNum: number = 0;
  private mRefreshTime: number;

  private constructor() {
    this.mCardsDataPool.addDataPool(BigDataDataSource.getInstance());
    this.mCardsDataPool.addDataPool(HighFrequencyAppDataSource.getInstance());
    this.mAppInstallDataSource = AppInstallDataSource.getInstance();
    this.mCardsDataPool.addDataPool(this.mAppInstallDataSource);
    this.mAppUpdateDataSource = AppUpdateDataSource.getInstance();
    this.mCardsDataPool.addDataPool(this.mAppUpdateDataSource);
    systemTime.getCurrentTime().then((res) => {
      this.mRefreshTime = res;
    }).catch((err) => {
      Log.showError(TAG, `getCurrentTime error: ${JSON.stringify(err)}`);
    });
    this.registerAppChangedListener();
  }

  private readonly mLocalEventListener = {
    onReceiveEvent: (event, params) => {
      Log.showInfo(TAG, `localEventListener receive event: ${event}, params: ${params}`);
      if (event === EventConstants.EVENT_REQUEST_RECOMMEND_FORM_DELETE) {
        this.removeFormFromRecommendServiceFormList(params);
      } else {
        this.addFormToRecommendServiceFormList(params, event);
      }
    }
  };

  registerAppChangedListener() {
    localEventManager.registerEventListener(this.mLocalEventListener, [
    EventConstants.EVENT_REQUEST_RECOMMEND_FORM_UPDATE,
    EventConstants.EVENT_REQUEST_RECOMMEND_FORM_DELETE,
    EventConstants.EVENT_REQUEST_RECOMMEND_FORM_ADD
    ]);
    Log.showInfo(TAG, 'registerAppChangedListener listener on create');
  }

  /**
   * getInstance
   *
   * @return Instance
   */
  static getInstance(): RecommendManager {
    if (globalThis.RecommendManager == null) {
      globalThis.RecommendManager = new RecommendManager();
    }
    return globalThis.RecommendManager;
  }

  /**
   * 获取推荐卡片数组信息
   *
   * @return 推荐卡片数组信息
   */
  async getRecommendFormArray(): Promise<CardItemInfo[]> {
    await this.mCardsDataPool.initAllDataMap();
    await this.mAppFormWeightManager.refreshUsageWeight();
    this.mEnterNum++;
    if (await this.isNeedRefreshPool()) {
      Log.showInfo(TAG, 'refreshPool');
      this.mCardsDataPool.refreshPool();
    }
    let recommendFormList: ArrayList<CardItemInfo> = await this.mCardsDataPool.getShowDataList();
    return Array.from(recommendFormList);
  }

  /**
   * 获取应用的卡片总数
   *
   * @param 应用名称
   * @return 应用的卡片总数
   */
  getFormCount(bundleName: string): number {
    return this.mCardsDataPool.getFormCount(bundleName);
  }

  /**
   * 是否更新数据：时间超过一天，进来三次刷新一次
   */
  private async isNeedRefreshPool(): Promise<boolean> {
    let current: number = await systemTime.getCurrentTime();
    let isNeedRefresh: boolean = false;
    let isIntervalDaysExceedsThreshold: boolean =
      (current - this.mRefreshTime) > NumberConstants.CONSTANT_DAY_TIME_MILLIS * ENTER_RECOMMEND_INTERVAL_DAYS;
    Log.showInfo(TAG, `enter serviceCardSheet ${this.mEnterNum} times, ` +
      `Whether the last time is more than one day: ${isIntervalDaysExceedsThreshold}.`);
    if (this.mEnterNum >= REFRESH_INTERVAL_TIME && isIntervalDaysExceedsThreshold) {
      this.mEnterNum = 0;
      this.mRefreshTime = current;
      isNeedRefresh = true;
      Log.showInfo(TAG, 'need refreshPool');
    }
    return isNeedRefresh;
  }

  /**
   * 根据bundleName从推荐卡片资源池移除卡片
   *
   * @param bundleName bundleName
   */
  removeFormFromRecommendServiceFormList(bundleName: string): void {
    Log.showInfo(TAG, 'removeFormFromRecommendServiceFormList start');
    this.mAppUpdateDataSource.onDataRemove(bundleName);
    this.mAppInstallDataSource.onDataRemove(bundleName);
  }

  /**
   * 添加卡片到推荐卡片资源池
   *
   * @param bundleName bundleName
   * @param event EventConstants.EVENT_PACKAGE_ADDED | EventConstants.EVENT_PACKAGE_CHANGED
   */
  addFormToRecommendServiceFormList(bundleName: string, event: string): void {
    Log.showInfo(TAG, `addFormToRecommendServiceFormList:${bundleName}. ${event}`);
    let formInfos: CardItemInfo[] = this.mFormModel.getAppItemFormInfo(bundleName);
    if (CheckEmptyUtils.isEmptyArr(formInfos)) {
      formInfos = this.mFormModel.getAtomicServiceAppItemFormInfo(bundleName);
    }
    if (CheckEmptyUtils.isEmptyArr(formInfos)) {
      Log.showInfo(TAG, 'addFormToRecommendServiceFormList find no card by bundleName' + bundleName);
      return;
    }
    Log.showInfo(TAG, 'addFormToRecommendServiceFormList start');
    let cardItemInfo: CardItemInfo = this.mCardsDataPool.getRecommendForm(formInfos);
    if (cardItemInfo === null) {
      Log.showInfo(TAG, `${bundleName} has not recommended service card.`);
      return;
    }
    if (event === EventConstants.EVENT_REQUEST_RECOMMEND_FORM_ADD) {
      this.mAppInstallDataSource.onDataAdd(cardItemInfo);
    }
    if (event === EventConstants.EVENT_REQUEST_RECOMMEND_FORM_UPDATE) {
      this.mAppUpdateDataSource.onDataAdd(cardItemInfo);
    }
  }
}
