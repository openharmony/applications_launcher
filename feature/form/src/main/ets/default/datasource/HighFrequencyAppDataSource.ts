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

import BaseDataSource from './BaseDataSource';
import FormConstants from '../common/constants/FormConstants';
import AppFormWeightManager from '../manager/AppFormWeightManager';

const TAG = 'HighFrequencyAppDataSource';

/**
 * 推荐卡片资源池数据源：高频应用对应的卡片
 */
export default class HighFrequencyAppDataSource extends BaseDataSource {
  private mAppFormWeightManager: AppFormWeightManager = AppFormWeightManager.getInstance();

  constructor() {
    super();
  }

  /**
  * getInstance
   *
   * @return Instance
   */
  static getInstance(): HighFrequencyAppDataSource {
    if (globalThis.HighFrequencyAppDataSource == null) {
      globalThis.HighFrequencyAppDataSource = new HighFrequencyAppDataSource();
    }
    return globalThis.HighFrequencyAppDataSource;
  }

  protected getSourceDataList(): string[] {
    return this.mAppFormWeightManager.getSortedAppUsageWeight()?.map((weight) => {
      return String(weight[0]);
    });
  }

  /**
   * 获取卡片资源池数据源名
   *
   * @return 卡片资源池数据源名
   */
  public getName(): string {
    return FormConstants.FORM_DATA_SOURCE_POOL_NAME_HIGH_FREQUENCY;
  }

  /**
   * 获取卡片资源池阈值
   *
   * @return 卡片资源池阈值
   */
  public getThreshold(): number {
    return FormConstants.SERVICE_FORM_POOL_HIGH_FREQUENCY_APP_THRESHOLD;
  }
}
