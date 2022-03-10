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

import SmartDockStyleConfig from '../../../../../../../feature/smartdock/src/main/ets/default/common/SmartDockStyleConfig';
import CommonConstants from '../../../../../../../common/src/main/ets/default/constants/CommonConstants';

/**
 * Dock style configuration class
 */
export default class PhoneSmartDockStyleConfig extends SmartDockStyleConfig {

  /**
   * dock列表高度
   */
  mDockHeight = 94;

  /**
   * dock列表背景色
   */
  mBackgroundColor = '#85FAFAFA';

  /**
   * dock列表圆角值
   */
  mDockRadius = 22;

  /**
   * dock列表背景模糊度
   */
  mBackdropBlur = 0;

  /**
   * dock列表padding
   */
  mDockPadding = 12;

  /**
   * dock列表margin
   */
  mDockMargin = 10;

  /**
   * 列表条目宽度
   */
  mListItemWidth = 70;

  /**
   * 列表条目高度
   */
  mListItemHeight = 70;

  /**
   * 列表条目间距
   */
  mListItemGap = 60;

  /**
   * 列表图标大小
   */
  mIconSize = 70;

  /**
   * 常驻区最大显示数量
   */
  mMaxDockNum = 5;

  private static sProductInstance: PhoneSmartDockStyleConfig | undefined;

  protected constructor() {
    super();
  }

  static getInstance(): PhoneSmartDockStyleConfig {
    if (PhoneSmartDockStyleConfig.sProductInstance == undefined) {
      PhoneSmartDockStyleConfig.sProductInstance = new PhoneSmartDockStyleConfig();
      PhoneSmartDockStyleConfig.sProductInstance.initConfig();
    }
    return PhoneSmartDockStyleConfig.sProductInstance;
  }

  getConfigLevel(): string {
    return CommonConstants.LAYOUT_CONFIG_LEVEL_PRODUCT;
  }
}
