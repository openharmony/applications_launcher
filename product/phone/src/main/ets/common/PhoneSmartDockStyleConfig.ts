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

import { CommonConstants, LayoutViewModel } from '@ohos/common';
import { SmartDockStyleConfig } from '@ohos/smartdock';
import PhoneSmartCanvas from './PhoneSmartCanvas'

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
  mListItemGap = 20;

  /**
   * list icon size
   */
  mIconSize = 54;

  /**
   * max display item count in dock list
   */
  mMaxDockNum = 4;

  private pullMouseSize: number = 54;

  protected constructor() {
    super();
    this.calculateSizeRatio();
  }

  static getInstance(): PhoneSmartDockStyleConfig {
    if (globalThis.PhoneSmartDockStyleConfig == null) {
      globalThis.PhoneSmartDockStyleConfig = new PhoneSmartDockStyleConfig();
    }
    globalThis.PhoneSmartDockStyleConfig.initConfig();
    return globalThis.PhoneSmartDockStyleConfig;
  }

  initConfig(): void {
    const result = LayoutViewModel.getInstance().calculateDock();
    this.mDockPadding = result.mDockPadding;
    this.mMaxDockNum = result.mMaxDockNum;
    this.mListItemGap = result.mListItemGap;
    this.mIconSize = this.pullMouseSize;
    this.mListItemWidth = this.pullMouseSize;
    this.mListItemHeight = this.pullMouseSize;
    this.mDockHeight = this.pullMouseSize + 2 * this.mDockPadding;
  }

  getConfigLevel(): string {
    return CommonConstants.LAYOUT_CONFIG_LEVEL_PRODUCT;
  }

  private calculateSizeRatio(): void {
    let res: PhoneSmartCanvas = PhoneSmartCanvas.getInstance({
      width: 1280,
      height: 720,
      screenSize: 5.7
    });
    this.pullMouseSize = px2vp(res.normalIconSize);
  }
}
