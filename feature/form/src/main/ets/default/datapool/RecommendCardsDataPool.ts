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

import CardsDataPool from './CardsDataPool';
import {
  CardItemInfo,
  Log
} from '@ohos/common';
import FormConstants from '../common/constants/FormConstants';

const TAG = 'RecommendCardsDataPool';

/**
 * Recommendation module card data pool
 */
export default class RecommendCardsDataPool extends CardsDataPool {
  private mAllDataMap: Map<string, CardItemInfo> = new Map();
  private mAllBundleFormCount: Map<string, number> = new Map();
  private mFormSet: Set<string> = new Set<string>();

  constructor() {
    super();
  }

  static getInstance(): RecommendCardsDataPool {
    if (globalThis.RecommendCardsDataPool == null) {
      globalThis.RecommendCardsDataPool = new RecommendCardsDataPool();
    }
    return globalThis.RecommendCardsDataPool;
  }

  /**
   * 获取卡片数据map
   */
  async initAllDataMap(): Promise<void> {
    Log.showInfo(TAG, 'initAllDataMap');
    this.mAllDataMap = new Map();

    // 取到全量的卡片数据
    let allFormMap: Map<string, CardItemInfo[]> = await this.getAllFormsInfo();
    Log.showInfo(TAG, `The number of all cards is ${allFormMap.size}`);

    // 遍历过滤出没有添加到桌面应用对应的卡片
    let abilityFormBundleNameSet: Set<string> = await this.getAbilityFormSet();
    for (let [cardItemBundleName, cardItemInfos] of allFormMap.entries()) {
      if (abilityFormBundleNameSet.has(cardItemBundleName)) {
        continue;
      }

      // 设置应用的卡片总数
      this.setFormCount(cardItemBundleName, cardItemInfos);

      // 从应用中选取一张卡片，优先选择默认卡片
      let cardItemInfo: CardItemInfo = this.getRecommendForm(cardItemInfos);
      if (cardItemInfo != null) {
        this.mAllDataMap.set(cardItemBundleName, cardItemInfo);
      }
    }
    Log.showInfo(TAG, `The number of remain show cards is ${this.mAllDataMap.size}`);
  }

  private async getAllFormsInfo(): Promise<Map<string, CardItemInfo[]>> {
    let allFormMap: Map<string, CardItemInfo[]> = new Map();
    let formInfoList: CardItemInfo[] = await this.mFormModel.getAllFormsInfo();
    formInfoList.forEach(item => {
      let forms: CardItemInfo[] = new Array();
      if (allFormMap.has(item.bundleName)) {
        forms = allFormMap.get(item.bundleName);
      }
      forms.push(item);
      allFormMap.set(item.bundleName, forms);
    });
    Log.showInfo(TAG, `The number of all cards is ${allFormMap.size}`);
    return allFormMap;
  }

  /**
   * 设置应用的卡片总数
   *
   * @param bundle名称
   * @param 卡片信息集
   */
  private setFormCount(cardItemBundleName: string, cardItemInfos: CardItemInfo[]): void {
    Log.showInfo(TAG, `enter setFormCount, cardItemInfo is ${JSON.stringify(cardItemInfos)}`);
    if (cardItemInfos.length === 0) {
      Log.showInfo(TAG, 'exit setFormCount, card item is empty');
      this.mAllBundleFormCount.set(cardItemBundleName, 0);
    }
    let dimensions: number[] = [];
    cardItemInfos.forEach(formInfo => {
      formInfo.supportDimensions.forEach(item => dimensions.push(item));
    });
    Log.showInfo(TAG, `exit setFormCount, totle count is ${dimensions.length}}`);
    this.mAllBundleFormCount.set(cardItemBundleName, dimensions.length);
  }

  /**
   * 获取应用的卡片总数
   *
   * @param 应用名称
   * @return 应用的卡片总数
   */
  getFormCount(bundleName: string): number {
    return this.mAllBundleFormCount.get(bundleName);
  }

  /**
   * 获取推荐卡片：SmallForm-->MediumForm
   *
   * @param 卡片信息集
   * @return 推荐卡片
   */
  getRecommendForm(cardItemInfos: CardItemInfo[]): CardItemInfo {
    if (cardItemInfos.length === 0) {
      return null;
    }
    let dimensions: number[] = [];
    cardItemInfos.forEach(formInfo => {
      formInfo.supportDimensions.forEach(item => dimensions.push(item));
    });
    dimensions = Array.from(new Set(dimensions));
    for (let i: number = 0; i < cardItemInfos.length; i++) {
      let recommendForm: CardItemInfo = cardItemInfos[i];
      let supportDimensions: number[] = recommendForm.supportDimensions;
      for (let j: number = 0; j < supportDimensions.length; j++) {
        recommendForm.supportDimensions = dimensions;
        if (supportDimensions[j] === FormConstants.SMALL_SIZE_SERVICE_FORM) {
          recommendForm.cardDimension = FormConstants.SMALL_SIZE_SERVICE_FORM;
          return recommendForm;
        }
        if (supportDimensions[j] === FormConstants.MEDIUM_SIZE_SERVICE_FORM) {
          recommendForm.cardDimension = FormConstants.MEDIUM_SIZE_SERVICE_FORM;
          return recommendForm;
        }
      }
    }
    return null;
  }

  private async getAbilityFormSet(): Promise<Set<string>> {
    let abilityFormBundleNameSet: Set<string> = new Set<string>();
    let abilityFormList: CardItemInfo[] = await this.mFormModel.getAllFormsInfoFromRdb();
    abilityFormList.forEach(item => {
      abilityFormBundleNameSet.add(item.bundleName);
    });
    this.mFormSet = abilityFormBundleNameSet;
    Log.showInfo(TAG, `The number of desktop cards is ${abilityFormBundleNameSet.size}`);
    return abilityFormBundleNameSet;
  }

  /**
   * 获取所有卡片map
   *
   * @return 所有卡片map
   */
  getAllDataMap(): Map<string, CardItemInfo> {
    return this.mAllDataMap;
  }

  /**
   * 获取所有添加到桌面的卡片set.
   *
   * @return 所有添加到桌面的卡片set.
   */
  getPageDeskAllFormSet(): Set<string> {
    return this.mFormSet;
  }
}
