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

import formManagerAbility from '@ohos.app.form.formHost';
import { FormConstants } from '../constants/FormConstants';
import { Log } from '../utils/Log';
import { CardItemInfo } from '../bean/CardItemInfo';
import { CommonConstants } from '../constants/CommonConstants';
import { launcherAbilityManager } from './LauncherAbilityManager';

const TAG = 'FormManager';

/**
 * Wrapper class for formManager interfaces.
 */
export class FormManager {
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
    for (const formItem of formList) {
      const cardItemInfo = new CardItemInfo();
      cardItemInfo.bundleName = formItem.bundleName;
      cardItemInfo.abilityName = formItem.abilityName;
      cardItemInfo.moduleName = formItem.moduleName;
      cardItemInfo.cardName = formItem.name;
      cardItemInfo.cardDimension = formItem.defaultDimension;
      cardItemInfo.area = this.getCardSize(cardItemInfo.cardDimension);
      cardItemInfo.description = formItem.description;
      cardItemInfo.formConfigAbility = formItem.formConfigAbility;
      cardItemInfo.supportDimensions = formItem.supportDimensions;
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
    Log.showDebug(TAG, `getFormsInfoByApp bundle: ${bundle}`);
    const formList = await formManagerAbility.getFormsInfo(bundle);
    const cardItemInfoList = new Array<CardItemInfo>();
    for (const formItem of formList) {
      const cardItemInfo = new CardItemInfo();
      cardItemInfo.bundleName = formItem.bundleName;
      cardItemInfo.abilityName = formItem.abilityName;
      cardItemInfo.moduleName = formItem.moduleName;
      cardItemInfo.cardName = formItem.name;
      cardItemInfo.cardDimension = formItem.defaultDimension;
      cardItemInfo.area = this.getCardSize(cardItemInfo.cardDimension);
      cardItemInfo.description = formItem.description;
      cardItemInfo.formConfigAbility = formItem.formConfigAbility;
      cardItemInfo.supportDimensions = formItem.supportDimensions;
      cardItemInfoList.push(cardItemInfo);
    }
    return cardItemInfoList;
  }

  /**
   * get formCardItem by want parameters
   *
   * @param parameters
   * @return formCardItem
   */
  async getFormCardItemByWant(params) {
    Log.showDebug(TAG, 'getFormCardItemByWant');
    let formCardItem: any = {};
    formCardItem.id = params[FormConstants.ID_PARAM];
    formCardItem.name = params[FormConstants.NAME_PARAM];
    formCardItem.bundleName = params[FormConstants.BUNDLE_PARAM];
    formCardItem.abilityName = params[FormConstants.ABILITY_PARAM];
    formCardItem.moduleName = params[FormConstants.MODULE_PARAM];
    formCardItem.dimension = params[FormConstants.DIMENSION_PARAM];
    formCardItem.formConfigAbility = await this.getFormConfigAbility(params[FormConstants.BUNDLE_PARAM],
      params[FormConstants.MODULE_PARAM], params[FormConstants.ABILITY_PARAM], params[FormConstants.NAME_PARAM]);
    const appInfo = await launcherAbilityManager.getAppInfoByBundleName(params[FormConstants.BUNDLE_PARAM] ,
      params[FormConstants.ABILITY_PARAM]);
    formCardItem.appLabelId = appInfo.appLabelId;
    return formCardItem;
  }

  /**
   * get formConfigAbility by bundleName moduleName abilityName and cardName
   *
   * @param bundle
   * @param moduleName
   * @param abilityName
   * @param cardName
   * @return formConfigAbility
   */
  async getFormConfigAbility(bundle:string, moduleName:string, abilityName:string, cardName:string) : Promise<string> {
    const formList = await formManagerAbility.getFormsInfo(bundle);
    let formConfigAbility = "";
    for (const formItem of formList) {
      if(formItem.moduleName == moduleName && formItem.abilityName == abilityName && formItem.name == cardName ) {
        formConfigAbility = formItem.formConfigAbility;
        break;
      }
    }
    return formConfigAbility;
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
    for (const formItem of formList) {
      const cardItemInfo = new CardItemInfo();
      cardItemInfo.bundleName = formItem.bundleName;
      cardItemInfo.abilityName = formItem.abilityName;
      cardItemInfo.moduleName = formItem.moduleName;
      cardItemInfo.cardName = formItem.name;
      cardItemInfo.cardDimension = formItem.defaultDimension;
      cardItemInfo.area = this.getCardSize(cardItemInfo.cardDimension);
      cardItemInfo.description = formItem.description;
      cardItemInfo.formConfigAbility = formItem.formConfigAbility;
      cardItemInfo.supportDimensions = formItem.supportDimensions;
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

