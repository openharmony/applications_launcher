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

const TAG = 'AppInstallDataSource';

/**
 * 推荐卡片资源池数据源：最新安装的应用中包含的卡片
 */
export default class AppInstallDataSource extends IncrementDataSource {
  /**
   * getInstance
   *
   * @return Instance
   */
  static getInstance(): AppInstallDataSource {
    if (globalThis.AppInstallDataSource == null) {
      globalThis.AppInstallDataSource = new AppInstallDataSource();
    }
    return globalThis.AppInstallDataSource;
  }

  /**
   * 获取卡片资源池数据源名
   *
   * @return 卡片资源池数据源名
   */
  public getName(): string {
    return FormConstants.FORM_DATA_SOURCE_POOL_NAME_APP_INSTALL;
  }

  /**
   * 获取卡片资源池阈值
   *
   * @return 卡片资源池阈值
   */
  public getThreshold(): number {
    return FormConstants.SERVICE_FORM_POOL_NEW_INSTALL_APP_THRESHOLD;
  }

  /**
   * 获取卡片资源池缓存名
   *
   * @return 卡片资源池缓存名
   */
  public getCacheKey(): string {
    return 'cache_new_install_ability_form';
  }
}
