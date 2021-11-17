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

import fromManager from '@ohos.ability.fromManager';
import CardItemInfo from '../bean/CardItemInfo.ets';
import CommonConstants from '../constants/CommonConstants.ets';

/**
 * 卡片管理类
 */
export default class FromManager {
  private static CARD_SIZE_1x2: Array<number> = [2, 1];
  private static CARD_SIZE_2x2: Array<number> = [2, 2];
  private static CARD_SIZE_2x4: Array<number> = [4, 2];
  private static CARD_SIZE_4x4: Array<number> = [4, 4];

  private static sInstance = null;

  /**
   * 获取卡片管理类对象
   *
   * @return 卡片管理类对象单一实例
   */
  public static getInstance(): FromManager {
    if (FromManager.sInstance == null) {
      FromManager.sInstance = new FromManager();
    }
    return FromManager.sInstance;
  }

  /**
   * 获取所有卡片信息
   *
   * @return 获取系统里支持的所有卡片信息
   */
  private async getAllFromInfo() {
    let cardList = await fromManager.getAllFromInfo();
    let cardItemInfoList = new Array<CardItemInfo>();
    for (var i = 0; i < fromList.length; i++) {
      let cardItemInfo = new CardItemInfo();
      cardItemInfo.bundleName = fromList[i].bundleName;
      cardItemInfo.abilityName = fromList[i].abilityName;
      cardItemInfo.moduleName = fromList[i].moduleName;
      cardItemInfo.cardName = fromList[i].name;
      cardItemInfo.cardDimension = fromList[i].defaultDimension;
      cardItemInfo.cardSize = this.getCardSize(cardItemInfo.cardDimension);
      cardItemInfoList.push(cardItemInfo);
    }
    return cardItemInfoList;
  }

  private getCardSize(dimension: number): Array<number> {
    if (dimension == CommonConstants.CARD_DIMENSION_1x2) {
      return CARD_SIZE_1x2;
    } else if (dimension == CommonConstants.CARD_DIMENSION_2x2) {
      return CARD_SIZE_2x2;
    } else if (dimension == CommonConstants.CARD_DIMENSION_2x4) {
      return CARD_SIZE_2x4;
    } else {
      return CARD_SIZE_4x4;
    }
  }
}

let fromManager = FromManager.getInstance();
export default fromManager;
