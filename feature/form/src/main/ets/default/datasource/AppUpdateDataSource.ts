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

import IncrementDataSource from './IncrementDataSource';
import FormConstants from '../common/constants/FormConstants';

const TAG = 'AppUpdateDataSource';

/**
 * 推荐卡片资源池数据源：最新应用更新中包含的卡片
 */
export default class AppUpdateDataSource extends IncrementDataSource {
  /**
   * getInstance
   *
   * @return Instance
   */
  static getInstance(): AppUpdateDataSource {
    if (globalThis.AppUpdateDataSource == null) {
      globalThis.AppUpdateDataSource = new AppUpdateDataSource();
    }
    return globalThis.AppUpdateDataSource;
  }

  /**
   * 获取卡片资源池数据源名
   *
   * @return 卡片资源池数据源名
   */
  public getName(): string {
    return FormConstants.FORM_DATA_SOURCE_POOL_NAME_APP_UPDATE;
  }

  /**
   * 获取卡片资源池阈值
   *
   * @return 卡片资源池阈值
   */
  public getThreshold(): number {
    return FormConstants.SERVICE_FORM_POOL_UPDATE_APP_THRESHOLD;
  }

  /**
   * 获取卡片资源池缓存名
   *
   * @return 卡片资源池缓存名
   */
  public getCacheKey(): string {
    return 'cache_update_ability_form';
  }
}
