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
import { Log } from '@ohos/common';
// @ts-ignore
import dataSourceListCfg from '../../../resources/rawfile/service_form_config.json';

const TAG = 'BigDataDataSource';
const CONFIG_NAME = 'big_data_source_list';

/**
 * 推荐卡片资源池数据源：大数据预置卡片列表
 */
export default class BigDataDataSource extends BaseDataSource {
  constructor() {
    super();
  }

  /**
   * getInstance
   *
   * @return Instance
   */
  static getInstance(): BigDataDataSource {
    if (globalThis.BigDataDataSource == null) {
      globalThis.BigDataDataSource = new BigDataDataSource();
    }
    return globalThis.BigDataDataSource;
  }

  public getSourceDataList(): string[] {
    let obj = JSON.parse(JSON.stringify(dataSourceListCfg));
    for (let key in obj) {
      if (key === CONFIG_NAME) {
        let bigDataSourceList: string[] = obj[key];
        Log.showInfo(TAG, 'get bigDataSourceList len: ' + bigDataSourceList.length);
        Log.showInfo(TAG, 'get bigDataSourceList: ' + JSON.stringify(bigDataSourceList));
        return bigDataSourceList;
      }
    }
    return [];
  }

  /**
   * 获取卡片资源池数据源名
   *
   * @return 卡片资源池数据源名
   */
  public getName(): string {
    return FormConstants.FORM_DATA_SOURCE_POOL_NAME_BIG_DATA;
  }

  /**
   * 获取卡片资源池阈值
   *
   * @return 卡片资源池阈值
   */
  public getThreshold(): number {
    return FormConstants.SERVICE_FORM_POOL_BIG_DATA_THRESHOLD;
  }
}
