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

import systemTime from '@ohos.systemTime';
import usageStatistics from '@ohos.resourceschedule.usageStatistics';
import {
  NumberConstants,
  Log
} from '@ohos/common';

const TAG = 'AppFormWeightManager';


/**
 * FA卡片属性的APP权重管理接口
 */
export interface IAppFormWeightManager {
  refreshUsageWeight(): Promise<void>;
  getSortedAppUsageWeight(): ((string | number)[]) [];
}

/**
 * Card APP Weight Manager Class
 */
export default class AppFormWeightManager implements IAppFormWeightManager {
  private mAppUsageWeight: Map<string, number> = new Map();
  private mRefreshTime: number = 0;
  private ENTER_RECOMMEND_INTERVAL_DAYS: number = 1;

  private constructor() {
  }

  /**
   * getInstance
   *
   * @return Instance 单例
   */
  static getInstance(): AppFormWeightManager {
    if (globalThis.AppFormWeightManager == null) {
      globalThis.AppFormWeightManager = new AppFormWeightManager();
    }
    return globalThis.AppFormWeightManager;
  }

  /**
   * 刷新权重
   */
  async refreshUsageWeight(): Promise<void> {
    Log.showInfo(TAG, 'refreshUsageWeight start');
    if (await this.isNeedRefresh()) {
      this.mAppUsageWeight = new Map();
      try {
        let moduleInfoArr = await usageStatistics.queryModuleUsageRecords();
        Log.showInfo(TAG, `queryModuleUsageRecords length ${moduleInfoArr.length}`);
        for (let i: number = 0; i < moduleInfoArr.length; i++) {
          this.mAppUsageWeight.set(moduleInfoArr[i].bundleName, moduleInfoArr[i].launchedCount);
        }
      } catch (error) {
        Log.showError(TAG, `BUNDLE_ACTIVE queryModuleUsageRecords throw error, code is: ${error.code}, message is:
          ${error.message}`);
      }
    }
  }

  /**
   * 是否更新数据：时间超过一天，刷新一次
   */
  private async isNeedRefresh(): Promise<boolean> {
    let current: number = await systemTime.getCurrentTime();
    let isNeedRefresh: boolean = false;
    let isIntervalDaysExceedsThreshold: boolean = (current - this.mRefreshTime) >
      NumberConstants.CONSTANT_DAY_TIME_MILLIS * this.ENTER_RECOMMEND_INTERVAL_DAYS;
    if (isIntervalDaysExceedsThreshold) {
      this.mRefreshTime = current;
      isNeedRefresh = true;
    }
    return isNeedRefresh;
  }

  /**
   * 获取app的使用权重.
   *
   * @return app的使用权重.
   */
  getSortedAppUsageWeight(): ((string | number)[]) [] {
    if (this.mAppUsageWeight.size === 0) {
      return new Array();
    }
    let mAppUsageWeightArr = Array.from(this.mAppUsageWeight);
    mAppUsageWeightArr.sort((item1, item2) => {
      return item2[1] - item1[1];
    });
    return mAppUsageWeightArr;
  }
}
