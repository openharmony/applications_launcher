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
import {
  CardItemInfo,
  FormListInfoCacheManager,
  CommonConstants,
  Log,
  ObjectCopyUtil
} from '@ohos/common';
import ArrayList from '@ohos.util.ArrayList';

const TAG = 'IncrementDataSource';

/**
 * 推荐卡片资源池数据源：最新安装的应用程序和最新更新的应用程序基类
 */
export default abstract class IncrementDataSource extends BaseDataSource {
  private readonly mFormListInfoCacheManager: FormListInfoCacheManager = FormListInfoCacheManager.getInstance();

  /**
   * 获取缓存key
   *
   * @return 缓存key
   */
  public abstract getCacheKey(): string;

  /**
   * 获取卡片资源池的初始值列表
   *
   * @return 卡片资源池的初始值列表
   */
  protected getThresholdDataList(dataSourceList: string[],
    allDataMap: Map<string, CardItemInfo>): ArrayList<CardItemInfo> {
    let resDataList: ArrayList<CardItemInfo> = new ArrayList<CardItemInfo>();
    let abilityFormBundleNameSet: Set<string> = this.mRecommendCardsDataPool.getPageDeskAllFormSet();
    let cardItemInfoList = this.getCardItemInfoList();
    for (let i: number = 0; i < cardItemInfoList.length; i++) {
      if (abilityFormBundleNameSet.has(cardItemInfoList[i].bundleName)) {
        continue;
      }
      resDataList.add(cardItemInfoList[i]);
    }
    return resDataList;
  }

  protected getSourceDataList(): string[] {
    return [];
  }

  private getCardItemInfoList(): CardItemInfo[] {
    let mDataList: CardItemInfo[] = [];
    let mDataListTemp: ArrayList<CardItemInfo> = this.mFormListInfoCacheManager.getCache(this.getCacheKey());
    for (let i: number = 0; i < mDataListTemp.length; i++) {
      mDataList.push(ObjectCopyUtil.DeepClone(mDataListTemp[i]));
    }
    return mDataList;
  }

  /**
   * 添加卡片信息到缓存
   *
   * @param 卡片信息
   */
  public onDataAdd(formInfo: CardItemInfo): void {
    let mDataList: any = this.mFormListInfoCacheManager.getCache(this.getCacheKey());
    if (mDataList === CommonConstants.INVALID_VALUE) {
      mDataList = new ArrayList<CardItemInfo>();
    }
    Log.showInfo(TAG, `add card: ${JSON.stringify(formInfo)}`);
    for (let i: number = 0; i < mDataList.length; i++) {
      let cardInfo = mDataList[i];
      if (cardInfo.bundleName === formInfo.bundleName) {
        Log.showInfo(TAG, 'onDataAdd same data, return');
        return;
      }
    }
    if (mDataList.length === this.getThreshold()) {
      mDataList.removeByIndex(0);
    }
    mDataList.add(formInfo);
    this.mFormListInfoCacheManager.setCache(this.getCacheKey(), mDataList);
  }

  /**
   * 根据bundleName从缓存中移除卡片信息
   *
   * @param bundleName bundleName
   */
  public onDataRemove(bundleName: string): void {
    Log.showInfo(TAG, `remove card: ${bundleName}`);
    let mDataList: ArrayList<CardItemInfo> = this.mFormListInfoCacheManager.getCache(this.getCacheKey());
    if (mDataList === null || mDataList.length === 0) {
      return;
    }
    let mUpateDataList: ArrayList<CardItemInfo> = new ArrayList();
    for (let i: number = 0; i < mDataList.length; i++) {
      if (bundleName === mDataList[i].bundleName) {
        continue;
      }
      mUpateDataList.add(mDataList[i]);
    }
    this.mFormListInfoCacheManager.setCache(this.getCacheKey(), mUpateDataList);
  }
}
