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

import formManagerAbility from '@ohos.ability.formManager';
import CardItemInfo from '../bean/CardItemInfo';
import CommonConstants from '../constants/CommonConstants';
import Log from '../utils/Log';

const TAG = 'FormManager';
/**
 * form manager
 */
export default class FormManager {
  private readonly CARD_SIZE_1x2: number[] = [2, 1];
  private readonly CARD_SIZE_2x2: number[] = [2, 2];
  private readonly CARD_SIZE_2x4: number[] = [4, 2];
  private readonly CARD_SIZE_4x4: number[] = [4, 4];

  private constructor() {
  }
  /**
   * form manager instance
   *
   * @return formManager instance
   */
  static getInstance(): FormManager {
    if (globalThis.FormManagerInstance == null) {
      globalThis.FormManagerInstance = new FormManager();
    }
    return globalThis.FormManagerInstance;
  }

  /**
   * get all form info
   *
   * @return Array<CardItemInfo> cardItemInfoList
   */
  async getAllFormsInfo(): Promise<CardItemInfo[]> {
    const formList = await formManagerAbility.getAllFormsInfo();
    const cardItemInfoList = new Array<CardItemInfo>();
    for (let i = 0; i < formList.length; i++) {
      const cardItemInfo = new CardItemInfo();
      cardItemInfo.bundleName = formList[i].bundleName;
      cardItemInfo.abilityName = formList[i].abilityName;
      cardItemInfo.moduleName = formList[i].moduleName;
      cardItemInfo.cardName = formList[i].name;
      cardItemInfo.cardDimension = formList[i].defaultDimension;
      cardItemInfo.area = this.getCardSize(cardItemInfo.cardDimension);
      cardItemInfo.description = formList[i].description;
      cardItemInfo.formConfigAbility = formList[i].formConfigAbility;
      cardItemInfo.supportDimensions = formList[i].supportDimensions;
      cardItemInfoList.push(cardItemInfo);
    }
    return cardItemInfoList;
  }

  getCardSize(dimension: number): number[] {
    if (dimension == CommonConstants.CARD_DIMENSION_1x2) {
      return this.CARD_SIZE_1x2;
    } else if (dimension == CommonConstants.CARD_DIMENSION_2x2) {
      return this.CARD_SIZE_2x2;
    } else if (dimension == CommonConstants.CARD_DIMENSION_2x4) {
      return this.CARD_SIZE_2x4;
    } else {
      return this.CARD_SIZE_4x4;
    }
  }

  /**
   * get form info by bundleName
   *
   * @param bundle
   */
  async getFormsInfoByApp(bundle: string): Promise<CardItemInfo[]> {
    Log.showInfo(TAG, 'getFormsInfoByApp bundle:' + bundle);
    const formList = await formManagerAbility.getFormsInfo(bundle);
    const cardItemInfoList = new Array<CardItemInfo>();
    for (let i = 0; i < formList.length; i++) {
      const cardItemInfo = new CardItemInfo();
      cardItemInfo.bundleName = formList[i].bundleName;
      cardItemInfo.abilityName = formList[i].abilityName;
      cardItemInfo.moduleName = formList[i].moduleName;
      cardItemInfo.cardName = formList[i].name;
      cardItemInfo.cardDimension = formList[i].defaultDimension;
      cardItemInfo.area = this.getCardSize(cardItemInfo.cardDimension);
      cardItemInfo.description = formList[i].description;
      cardItemInfo.formConfigAbility = formList[i].formConfigAbility;
      cardItemInfo.supportDimensions = formList[i].supportDimensions;
      cardItemInfoList.push(cardItemInfo);
    }
    return cardItemInfoList;
  }

  /**
   * get form info by bundleName and moduleName
   *
   * @param bundle
   * @param moduleName
   */
  async getFormsInfoByModule(bundle: string, moduleName: string): Promise<CardItemInfo[]> {
    const formList = await formManagerAbility.getFormsInfo(bundle, moduleName);
    const cardItemInfoList = new Array<CardItemInfo>();
    for (let i = 0; i < formList.length; i++) {
      const cardItemInfo = new CardItemInfo();
      cardItemInfo.bundleName = formList[i].bundleName;
      cardItemInfo.abilityName = formList[i].abilityName;
      cardItemInfo.moduleName = formList[i].moduleName;
      cardItemInfo.cardName = formList[i].name;
      cardItemInfo.cardDimension = formList[i].defaultDimension;
      cardItemInfo.area = this.getCardSize(cardItemInfo.cardDimension);
      cardItemInfo.description = formList[i].description;
      cardItemInfo.formConfigAbility = formList[i].formConfigAbility;
      cardItemInfo.supportDimensions = formList[i].supportDimensions;
      cardItemInfoList.push(cardItemInfo);
    }
    return cardItemInfoList;
  }

  /**
   * delete form info by formId
   *
   * @param formId
   */
  async deleteCard(formId: string): Promise<void> {
    return await formManagerAbility.deleteForm(formId);
  }

}

