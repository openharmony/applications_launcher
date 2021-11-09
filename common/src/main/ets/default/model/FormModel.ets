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

export default class FormModel {
  private static formModel = new FormModel();
  private mFormInfoList = [];

  private constructor() {
  }

  /**
    *获取卡片管理类对象
    */
  public static getInstance(): FormModel{
    return this.formModel;
  }

  getFormList(callback) {
    this.mFormInfoList = [];
    console.info('Launcher FormModel getFormList');
    formManager.getAllFormsInfo()
      .then((data) => {
      console.info('Launcher FormModel ' + JSON.stringify(data));
      for (let i = 0; i < data.length; i++) {
        for (let info of PresetFormCard) {
          if (info.moduleName == data[i].moduleName
          && info.bundleName == data[i].bundleName
          && info.abilityName == data[i].abilityName
          && info.name == data[i].name) {
            let cardInfo = {
              type: 1,
              moduleName: data[i].moduleName,
              bundleName: data[i].bundleName,
              abilityName: data[i].abilityName,
              name: data[i].name,
              dimension: info.dimension,
              area: info.area
            };
            this.mFormInfoList.push(cardInfo);
          }
        }
      }
      if (callback) {
        console.info('Launcher FormModel formInfoList:' + JSON.stringify(this.mFormInfoList));
        callback(this.mFormInfoList);
      }
    });
  }
}