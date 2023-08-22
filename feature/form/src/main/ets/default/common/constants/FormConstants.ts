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

export default class FormConstants {
  /**
   * 卡片数据源池名称：高频
   */
  static readonly FORM_DATA_SOURCE_POOL_NAME_HIGH_FREQUENCY = 'HighFrequencyAppDataSource';

  /**
   * 卡片数据源池名称：大数据
   */
  static readonly FORM_DATA_SOURCE_POOL_NAME_BIG_DATA = 'BigDataDataSource';

  /**
   * 卡片数据源池名称：新装
   */
  static readonly FORM_DATA_SOURCE_POOL_NAME_APP_INSTALL = 'AppInstallDataSource';

  /**
   * 卡片数据源池名称：更新
   */
  static readonly FORM_DATA_SOURCE_POOL_NAME_APP_UPDATE = 'AppUpdateDataSource';

  /**
   * Threshold of newly installed apps in the service form pool
   */
  static readonly SERVICE_FORM_POOL_NEW_INSTALL_APP_THRESHOLD = 5;

  /**
   * Threshold of newly updated apps in the service form pool
   */
  static readonly SERVICE_FORM_POOL_UPDATE_APP_THRESHOLD = 5;

  /**
   * Threshold of big data apps in the service form pool
   */
  static readonly SERVICE_FORM_POOL_BIG_DATA_THRESHOLD = 6;

  /**
   * Threshold of high frequency apps in the service form pool
   */
  static readonly SERVICE_FORM_POOL_HIGH_FREQUENCY_APP_THRESHOLD = 8;

  /**
   * Service form view : Number of fences - 4 for mobile phones
   */
  static readonly SERVICE_FORM_VIEW_FENCE_COUNT_PHONE = 4;

  /**
   * Service form view : Number of small cards displayed in each row - 2 for mobile phones
   */
  static readonly SERVICE_FORM_VIEW_SMALL_FORM_COUNT_EACH_ROW_PHONE = 2;

  /**
   * Service form view : Number of medium cards allowed in mobile phones
   */
  static readonly SERVICE_FORM_VIEW_ALLOW_MEDIUM_FORM_COUNT_PHONE = 1;

  /**
   * Service form view : row of the RecommendCard in mobile phones
   */
  static readonly SERVICE_FORM_VIEW_FORM_ROW_PHONE = 6;

  /**
   * Service form view : size of the small cards in mobile phones
   */
  static readonly SMALL_SIZE_SERVICE_FORM = 2;

  /**
   * Service form view : size of the medium cards in mobile phones
   */
  static readonly MEDIUM_SIZE_SERVICE_FORM = 3;
}