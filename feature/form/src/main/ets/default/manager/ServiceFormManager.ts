/**
 * Copyright (c) 2023-2023 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  AppItemInfo,
  CheckEmptyUtils,
  FormModel,
  CardItemInfo,
  AppModel,
  Log,
  CommonConstants,
  AtomicServiceAppModel
} from '@ohos/common';
import RecommendManager from './RecommendFormManager';
import HashSet from '@ohos.util.HashSet';

const TAG = 'ServiceFormManager';
const CARD_2X2_ROW_NUM_3 = 3;
const CARD_2X2_ROW_NUM_2 = 2;
const CARD_2X2_PAIRS = 2;

/**
 * 服务卡片管理接口
 */
export interface IServiceFormManager {
  getServiceFormInfo(): Promise<Map<string, CardItemInfo[] | AppItemInfo[]>>;
}

/**
 * 服务卡片：获取卡片、FA属性APP管理类
 */
export default class ServiceFormManager {
  private readonly mRecommendManager: RecommendManager;
  private readonly mFormModel: FormModel;
  private readonly mAppModel: AppModel;
  private readonly mAtomicAppModel: AtomicServiceAppModel;

  private constructor() {
    this.mRecommendManager = RecommendManager.getInstance();
    this.mFormModel = FormModel.getInstance();
    this.mAppModel = AppModel.getInstance();
    this.mAtomicAppModel = AtomicServiceAppModel.getInstance();
  }

  /**
   * getInstance
   *
   * @return Instance
   */
  static getInstance(): ServiceFormManager {
    if (globalThis.ServiceFormManager == null) {
      globalThis.ServiceFormManager = new ServiceFormManager();
    }
    return globalThis.ServiceFormManager;
  }

  /**
   * 根据布局规则调整卡片顺序和数量
   *
   * @param recommendForms 推荐卡片
   * @returns 展示卡片
   */
  getShowFormInfos(recommendForms: CardItemInfo[]): CardItemInfo[] {
    if (CheckEmptyUtils.isEmptyArr(recommendForms)) {
      return [];
    }

    let formInfos: CardItemInfo[] = [];

    // 先找到一张2x4的卡片
    let first2x4CardIndex: number = CommonConstants.INVALID_VALUE;
    for (let index = 0; index < recommendForms.length; index++) {
      let first2x4Card: CardItemInfo = recommendForms[index];
      if (first2x4Card.cardDimension === CommonConstants.CARD_DIMENSION_2x4) {
        formInfos.push(first2x4Card);
        first2x4CardIndex = index;
        break;
      }
    }

    // 再找其他2x2卡片
    let card2x2RowNum: number = first2x4CardIndex === CommonConstants.INVALID_VALUE ?
      CARD_2X2_ROW_NUM_3 : CARD_2X2_ROW_NUM_2;
    let rowForms: CardItemInfo[] = [];
    for (let index = 0; index < recommendForms.length; index++) {
      if (index === first2x4CardIndex) {
        continue;
      }
      let card2x2: CardItemInfo = recommendForms[index];
      if (card2x2.cardDimension !== CommonConstants.CARD_DIMENSION_2x2) {
        continue;
      }
      rowForms.push(card2x2);
      if (rowForms.length === CARD_2X2_PAIRS) {
        formInfos.push(rowForms[0]);
        formInfos.push(rowForms[1]);
        rowForms = [];
        if (--card2x2RowNum === 0) {
          break;
        }
      }
    }
    return formInfos;
  }

  /**
   * 根据app信息补全卡信息
   *
   * @param recommendForms 卡片信息
   * @param serviceFormAppList app信息
   */
  formInfoComplete(recommendForms: CardItemInfo[], serviceFormAppList: AppItemInfo[]): void {
    if (CheckEmptyUtils.isEmptyArr(recommendForms) || CheckEmptyUtils.isEmptyArr(serviceFormAppList)) {
      return;
    }
    for (let index = 0; index < recommendForms.length; index++) {
      let recommendForm = recommendForms[index];
      let formAppInfos = serviceFormAppList.filter(info => info.bundleName === recommendForm.bundleName);
      if (CheckEmptyUtils.isEmptyArr(formAppInfos)) {
        Log.showError(TAG, `cannot find form from appList:${recommendForm.bundleName}`);
        continue;
      }
      let { appLabelId, appName } = formAppInfos[0];
      recommendForm.appLabelId = appLabelId;
      recommendForm.appName = appName;
      recommendForm.totalDimensionCount = this.mRecommendManager.getFormCount(recommendForm.bundleName);
    }
  }

  /**
   * 获取推荐卡片数组信息
   *
   * @return 推荐卡片数组信息
   */
  async getServiceForm(): Promise<CardItemInfo[]> {
    return await this.mRecommendManager.getRecommendFormArray();
  }

  /**
   * 获取应用的卡片总数
   *
   * @param 应用名称
   * @return 应用的卡片总数
   */
  getFormCount(bundleName: string): number {
    return this.mRecommendManager.getFormCount(bundleName);
  }

  private sortServiceFormAppList(serviceFormAppList: AppItemInfo[]): void {
    if (serviceFormAppList.length === 0) {
      return;
    }
    serviceFormAppList.sort((item1, item2) => {
      return item1.appName.localeCompare(item2.appName, 'zh-Hans-CN', {
        sensitivity: 'accent'
      });
    });
  }

  /**
   * 获取带有FA属性的APP信息
   *
   * @return 带有FA属性的APP信息
   */
  async getServiceFormAppList(): Promise<AppItemInfo[]> {
    let allAppList: AppItemInfo[] = [];
    // 桌面app
    let desktopServiceFormAppList: AppItemInfo[] = await this.getDesktopServiceFormAppList();
    !CheckEmptyUtils.isEmptyArr(desktopServiceFormAppList) && allAppList.push(...desktopServiceFormAppList);
    // 原服务app
    let atomicSeriveFormAppList: AppItemInfo[] = await this.getAtomicServiceFormAppList();
    !CheckEmptyUtils.isEmptyArr(atomicSeriveFormAppList) && allAppList.push(...atomicSeriveFormAppList);
    // app排序
    this.sortServiceFormAppList(allAppList);
    return allAppList;
  }

  private async getDesktopServiceFormAppList(): Promise<AppItemInfo[]> {
    let serviceFormAppNames: HashSet<string> = new HashSet();
    let allAppItemFormInfoMap: Map<string, CardItemInfo[]> = this.mFormModel.getAllAppItemFormInfoMap();
    let appListInfo: AppItemInfo[] = await this.mAppModel.getAppList();
    let serviceFormAppList: AppItemInfo[] = [];
    for (let i: number = 0; i < appListInfo.length; i++) {
      let bundleName: string = appListInfo[i].bundleName;
      if (serviceFormAppNames.has(bundleName) || !allAppItemFormInfoMap.has(bundleName)) {
        continue;
      }
      const formAppInfoList = allAppItemFormInfoMap.get(appListInfo[i].bundleName);
      if (CheckEmptyUtils.isEmptyArr(formAppInfoList)) {
        continue;
      }
      serviceFormAppList.push(appListInfo[i]);
      serviceFormAppNames.add(appListInfo[i].bundleName);
    }
    return serviceFormAppList;
  }

  private async getAtomicServiceFormAppList(): Promise<AppItemInfo[]> {
    let serviceFormAppNames: HashSet<string> = new HashSet();
    let allAtomicServiceAppItemFormInfoMap: Map<string, CardItemInfo[]> = this.mFormModel.getAllAtomicServiceAppItemFormInfoMap();
    let atomicServiceAppListInfo: AppItemInfo[] = await this.mAtomicAppModel.getAtomicServiceAppList();
    let serviceFormAppList: AppItemInfo[] = [];
    for (let i: number = 0; i < atomicServiceAppListInfo.length; i++) {
      let bundleName: string = atomicServiceAppListInfo[i].bundleName;
      if (serviceFormAppNames.has(bundleName) || !allAtomicServiceAppItemFormInfoMap.has(bundleName)) {
        continue;
      }
      const formAppInfoList = allAtomicServiceAppItemFormInfoMap.get(atomicServiceAppListInfo[i].bundleName);
      if (CheckEmptyUtils.isEmptyArr(formAppInfoList)) {
        continue;
      }
      serviceFormAppList.push(atomicServiceAppListInfo[i]);
      serviceFormAppNames.add(atomicServiceAppListInfo[i].bundleName);
    }
    return serviceFormAppList;
  }
}