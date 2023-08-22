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

import ArrayList from '@ohos.util.ArrayList';
import { CardItemInfo } from '@ohos/common';
import RecommendCardsDataPool from '../datapool/RecommendCardsDataPool';

const TAG = 'BaseDataSource';

/**
 * 推荐卡片资源池数据源：基础数据源
 */
export default abstract class BaseDataSource {
  public mRecommendCardsDataPool: RecommendCardsDataPool = RecommendCardsDataPool.getInstance();

  /**
   * 获取卡片资源池的数据列表
   *
   * @return 卡片资源池的数据列表
   */
  public getDataList(): ArrayList<CardItemInfo> {
    // 1、获取所有卡片map
    let allDataMap: Map<string, CardItemInfo> = this.getAllDataMap();

    // 2、获取数据源数据
    let sourceDataList: string[] = this.getSourceDataList();

    // 3、获取阈值内的数据
    return this.getThresholdDataList(sourceDataList, allDataMap);
  }

  /**
   * 获取卡片资源池阈值
   *
   * @return 卡片资源池阈值
   */
  public abstract getThreshold(): number;

  /**
   * 获取卡片资源池数据源名
   *
   * @return 卡片资源池数据源名
   */
  public abstract getName(): string;

  /**
   * 获取所有卡片map
   *
   * @return 所有卡片map
   */
  private getAllDataMap(): Map<string, CardItemInfo> {
    return this.mRecommendCardsDataPool.getAllDataMap();
  }

  /**
   * 获取阈值内的数据
   *
   * @param dataSourceList 数据源的数据
   * @param allDataMap 所有数据集合
   * @returns 阈值内的数据
   */
  protected getThresholdDataList(dataSourceList: string[],
    allDataMap: Map<string, CardItemInfo>): ArrayList<CardItemInfo> {
    let dataList: ArrayList<CardItemInfo> = new ArrayList();
    for (let i: number = 0; i < dataSourceList.length; i++) {
      if (dataSourceList.length === this.getThreshold()) {
        break;
      }
      let cardItemBundleName = dataSourceList[i];
      if (!allDataMap.has(cardItemBundleName)) {
        continue;
      }
      let cardItemInfo: CardItemInfo = allDataMap.get(cardItemBundleName);
      dataList.add(cardItemInfo);
    }
    return dataList;
  }

  /**
   * 获取数据源的数据
   *
   * @returns 数据源的数据
   */
  protected abstract getSourceDataList(): string[];
}
