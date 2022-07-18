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

import { CommonConstants } from '@ohos/common';
import { SmartDockStyleConfig } from '@ohos/smartdock';

/**
 * Dock style configuration class
 */
export default class PhoneSmartDockStyleConfig extends SmartDockStyleConfig {

  /**
   * dock list height
   */
  mDockHeight = 78;

  /**
   * dock list backgroundcolor
   */
  mBackgroundColor = '#85FAFAFA';

  /**
   * dock list radius
   */
  mDockRadius = 22;

  /**
   * dock list back drop blur
   */
  mBackdropBlur = 0;

  /**
   * dock list padding
   */
  mDockPadding = 12;

  /**
   * dock list margin
   */
  mDockMargin = 10;

  /**
   * list item width
   */
  mListItemWidth = 54;

  /**
   * list item height
   */
  mListItemHeight = 54;

  /**
   * list item gap
   */
  mListItemGap = 33;

  /**
   * list icon size
   */
  mIconSize = 54;

  /**
   * max display item count in dock list
   */
  mMaxDockNum = 4;

  protected constructor() {
    super();
  }

  static getInstance(): PhoneSmartDockStyleConfig {
    if (globalThis.PhoneSmartDockStyleConfig == null) {
      globalThis.PhoneSmartDockStyleConfig = new PhoneSmartDockStyleConfig();
      globalThis.PhoneSmartDockStyleConfig.initConfig();
    }
    return globalThis.PhoneSmartDockStyleConfig;
  }

  getConfigLevel(): string {
    return CommonConstants.LAYOUT_CONFIG_LEVEL_PRODUCT;
  }
}
