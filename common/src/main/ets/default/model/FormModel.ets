/*
 * Copyright (c) 2021 Huawei Device Co., Ltd.
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

import FeatureAbility from '@ohos.ability.featureAbility';
import formManager from '@ohos.ability.formmanager';
import PresetFormCard from '../configs/PresetFormCard.ets';

/**
 * 桌面卡片信息数据模型
 */
export default class FormModel {
  private static sFormModel = new FormModel();
  private mFormInfoList = [];

  private constructor() {
  }

  /**
    *获取卡片管理类对象
    */
  public static getInstance(): FormModel{
    return this.sFormModel;
  }

  /**
   * 获取桌面显示的卡片列表
   */
  public async getFormList() {
    this.mFormInfoList = [];
    console.info('Launcher FormModel getFormList');
    let allFormList = await formManager.getAllFormsInfo();
    for (let i = 0; i < allFormList.length; i++) {
      for (let info of PresetFormCard) {
        if (info.moduleName == allFormList[i].moduleName
        && info.bundleName == allFormList[i].bundleName
        && info.abilityName == allFormList[i].abilityName
        && info.name == allFormList[i].cardName) {
          this.mFormInfoList.push(allFormList[i]);
        }
      }
    }
    return this.mFormInfoList;
  }
}