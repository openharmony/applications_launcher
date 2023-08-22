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

import BaseDataSource from '../datasource/BaseDataSource';
import {
  Log,
  CardItemInfo,
  FormModel,
  NumberConstants
} from '@ohos/common';
import ArrayList from '@ohos.util.ArrayList';
import List from '@ohos.util.List';
import FormConstants from '../common/constants/FormConstants';

const TAG = 'CardsDataPool';
const SEPARATOR = '&';

/**
 * card resource pool
 */
export default abstract class CardsDataPool {
  private mDatasourceMap: Map<string, BaseDataSource> = new Map();
  private mLastStartIndex: number = 0;
  private mLastEndIndex: number = 0;
  private mDataSize: number = 0;
  private mPoolDataMap: Map<string, ArrayList<CardItemInfo>> = new Map();
  mFormModel: FormModel = FormModel.getInstance();

  constructor() {
  }

  /**
   * 添加数据到轮播卡片资源池
   *
   * @param dataSource 数据源
   */
  addDataPool(dataSource: BaseDataSource): void {
    if (dataSource !== null) {
      this.mDatasourceMap.set(<string> dataSource.getName(), dataSource);
    }
  }

  /**
   * 更新卡轮播池的显示起始位置.
   * 只需要刷新起始位置，在获取列表时动态计算结束位置.
   */
  refreshPool(): void {
    Log.showInfo(TAG, `There are ${this.mDataSize} cards in the card pool.`);
    if (this.mLastEndIndex + NumberConstants.CONSTANT_NUMBER_ONE === this.mDataSize) {
      this.mLastStartIndex = NumberConstants.CONSTANT_NUMBER_ZERO;
    } else {
      this.mLastStartIndex = this.mLastEndIndex + NumberConstants.CONSTANT_NUMBER_ONE;
    }
  }

  /**
   * 获取实际显示的卡片列表.
   *
   * @return 实际显示的卡片列表
   */
  getShowDataList(): Promise<ArrayList<CardItemInfo>> {
    Log.showInfo(TAG, 'getShowDataList');
    this.initData();
    return this.getDataList();
  }

  private initData(): void {
    this.mPoolDataMap = this.getOriginalDataList();
  }

  /**
   * 获取数据源map.
   *
   * @return 数据源map.
   */
  protected getDataSourceMap(): Map<string, BaseDataSource> {
    return this.mDatasourceMap;
  }

  private async filterData(): Promise<List<CardItemInfo>> {
    let resultList: List<CardItemInfo> = new List();
    let dataList: List<CardItemInfo> = this.transMapToList();
    if (dataList.length === 0) {
      return resultList;
    }
    let formSet: Set<string> = new Set();
    for (let i: number = 0; i < dataList.length; i++) {
      let formUniqueKey: string = this.getFormUniqueKey(dataList.get(i));
      if (!formSet.has(formUniqueKey)) {
        resultList.add(dataList.get(i));
        formSet.add(formUniqueKey);
      }
    }
    return resultList;
  }

  private getOriginalDataList(): Map<string, ArrayList<CardItemInfo>> {
    let resultMap: Map<string, ArrayList<CardItemInfo>> = new Map();
    let dataSourceMap: Map<string, BaseDataSource> = this.getDataSourceMap();
    if (dataSourceMap.size === 0) {
      return resultMap;
    }
    for (let [dataSourceName, dataSource] of dataSourceMap.entries()) {
      Log.showInfo(TAG, `get ${dataSourceName} cards`);
      let dataList: ArrayList<CardItemInfo> = dataSource.getDataList();
      Log.showInfo(TAG, `FormDataSource: ${dataSourceName} has ${dataList?.length} cards`);
      if (dataList !== null && dataList.length > 0) {
        resultMap.set(dataSourceName, dataList);
      }
    }
    return resultMap;
  }

  private async getDataList(): Promise<ArrayList<CardItemInfo>> {
    let resultList: ArrayList<CardItemInfo> = new ArrayList();
    let dataList: List<CardItemInfo> = await this.filterData();
    if (dataList.length === 0) {
      Log.showInfo(TAG, 'The card pool data is empty');
      return resultList;
    }
    this.mDataSize = dataList.length;
    if (this.mLastStartIndex >= dataList.length) {
      this.mLastStartIndex = NumberConstants.CONSTANT_NUMBER_ZERO;
    }
    let smallList: ArrayList<CardItemInfo> = new ArrayList();
    let mediumList: ArrayList<CardItemInfo> = new ArrayList();
    Log.showInfo(TAG, 'getDataList mLastStartIndex:' + this.mLastStartIndex + ' mLastEndIndex:' + this.mLastEndIndex);
    let startIndex: number = this.getRecommendCardIndexEverytime(smallList, mediumList, dataList);
    this.mLastEndIndex = startIndex;
    if (mediumList.length === 0) {
      this.mLastEndIndex = await this.getTransMediumFormIndex(startIndex, smallList, mediumList, dataList);
    }

    for (let i: number = 0; i < mediumList.length; i++) {
      resultList.add(mediumList[i]);
    }
    for (let i: number = 0; i < smallList.length; i++) {
      resultList.add(smallList[i]);
    }
    return resultList;
  }

  private getFormUniqueKey(formInfo: CardItemInfo): string {
    if (formInfo === null) {
      return '';
    }
    return formInfo.moduleName + SEPARATOR + formInfo.bundleName + SEPARATOR +
    formInfo.abilityName + SEPARATOR + formInfo.cardName + SEPARATOR + formInfo.cardDimension;
  }

  private async getTransMediumFormIndex(startIndex: number, smallList: ArrayList<CardItemInfo>,
    mediumList: ArrayList<CardItemInfo>, dataList: List<CardItemInfo>): Promise<number> {
    let allFormInfoList: CardItemInfo[] = await this.mFormModel.getAllFormsInfo();
    let mediumCardCount: number = this.getAddMediumCardCount();
    let mediumListTmp: ArrayList<CardItemInfo> = new ArrayList();
    for (let i: number = 0; i < smallList.length; i++) {
      if (mediumList.length >= mediumCardCount) {
        break;
      }
      let mediumForm: CardItemInfo = await this.getMediumForm(allFormInfoList, smallList[i]);
      if (mediumForm !== null) {
        Log.showInfo(TAG, `getMediumForm mediumForm: ${mediumForm.bundleName}`);
        mediumList.add(mediumForm);
        mediumListTmp.add(smallList[i]);
      }
    }
    for (let i: number = 0; i < mediumListTmp.length; i++) {
      smallList.remove(mediumListTmp[i]);
    }
    // 转换为大卡片后，恢复index
    if (startIndex >= mediumListTmp.length) {
      return startIndex - mediumListTmp.length;
    } else {
      return dataList.length - (mediumListTmp.length - startIndex);
    }
  }

  private async getMediumForm(allFormInfoList: CardItemInfo[], abilityFormInfo: CardItemInfo): Promise<CardItemInfo> {
    for (let i: number = 0; i < allFormInfoList.length; i++) {
      if (abilityFormInfo.bundleName === allFormInfoList[i].bundleName &&
      allFormInfoList[i].cardDimension === FormConstants.MEDIUM_SIZE_SERVICE_FORM) {
        return allFormInfoList[i];
      }
    }
    return null;
  }

  private getRecommendCardIndexEverytime(smallList: ArrayList<CardItemInfo>, mediumList: ArrayList<CardItemInfo>,
    dataList: List<CardItemInfo>): number {
    let columnCount: number = this.getRecommendCardColumnCount();
    let row: number = this.getRecommendCardRow();
    let perLineCount: number = this.getRecommendCardCountPerLine();
    let maxSmallCardCount: number = row / perLineCount * columnCount / perLineCount;
    let size: number = 0;
    let isBackOrigin: boolean = false;
    let startIndex: number = this.mLastStartIndex;
    while (!isBackOrigin && size < maxSmallCardCount) {
      let cardItemInfo: CardItemInfo = dataList.get(startIndex);
      if (cardItemInfo.cardDimension === FormConstants.SMALL_SIZE_SERVICE_FORM) {
        smallList.add(cardItemInfo);
        size++;
      }
      if (cardItemInfo.cardDimension === FormConstants.MEDIUM_SIZE_SERVICE_FORM) {
        mediumList.add(cardItemInfo);
        // 中卡片相当于两张小卡片.
        size = size + perLineCount;
      }
      if (startIndex !== dataList.length - NumberConstants.CONSTANT_NUMBER_ONE) {
        startIndex++;
      } else {
        startIndex = NumberConstants.CONSTANT_NUMBER_ZERO;
      }
      // 回到原点，需要结束循环
      if (startIndex === this.mLastStartIndex) {
        isBackOrigin = true;
      }
    }
    return startIndex;
  }

  private getRecommendCardColumnCount(): number {
    return <number> FormConstants.SERVICE_FORM_VIEW_FENCE_COUNT_PHONE;
  }

  private getRecommendCardCountPerLine(): number {
    return <number> FormConstants.SERVICE_FORM_VIEW_SMALL_FORM_COUNT_EACH_ROW_PHONE;
  }

  private getRecommendCardRow(): number {
    return <number> FormConstants.SERVICE_FORM_VIEW_FORM_ROW_PHONE;
  }

  private getAddMediumCardCount(): number {
    return <number> FormConstants.SERVICE_FORM_VIEW_ALLOW_MEDIUM_FORM_COUNT_PHONE;
  }

  private transMapToList(): List<CardItemInfo> {
    let resultList: List<CardItemInfo> = new List();
    if (this.mPoolDataMap.size === 0) {
      return resultList;
    }
    for (let cardItemInfos of this.mPoolDataMap.values()) {
      for (let i: number = 0; i < cardItemInfos.length; i++) {
        resultList.add(cardItemInfos[i]);
      }
    }
    return resultList;
  }
}
