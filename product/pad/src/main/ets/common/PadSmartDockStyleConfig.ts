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
import PadSmartCanvas from './PadSmartCanvas'

const TAG = 'PadSmartDockStyleConfig';

/**
 * Dock style configuration class
 */
export default class PadSmartDockStyleConfig extends SmartDockStyleConfig {
  /**
   * dock list height
   */
  mDockHeight = 78;

  /**
   * dock list padding
   */
  mDockPadding = 9;

  /**
   * dock list item width
   */
  mListItemWidth = 60;

  /**
   * dock list item height
   */
  mListItemHeight = 60;

  /**
   * dock list item gap
   */
  mListItemGap = 12;

  /**
   * dock list item icon size
   */
  mIconSize = 54;

  /**
   *  gap between resident dock and recent dock
   */
  mDockGap = 12;

  /**
   * resident dock max item number
   */
  mMaxDockNum = 15;

  /**
   * recent dock max item number
   */
  mMaxRecentNum = 3;

  /**
   * dock bottom margin
   */
  mMarginBottom = 24;

  private pullToInsertMouseRatio: number = 1;

  protected constructor() {
    super();
    this.calculateSizeRatio();
  }

  /**
   * get SmartDockStyleConfig getInstance
   */
  static getInstance(): PadSmartDockStyleConfig {
    if (globalThis.PadSmartDockStyleConfig == null) {
      globalThis.PadSmartDockStyleConfig = new PadSmartDockStyleConfig();
    }
    globalThis.PadSmartDockStyleConfig.initConfig();
    return globalThis.PadSmartDockStyleConfig;
  }

  initConfig(): void {
    const result = LayoutViewModel.getInstance().calculateDock();
    this.mDockGap = result.mDockGap;
    this.mMarginBottom = result.mMarginBottom;
    this.mDockPadding = result.mDockPadding;
    let mInputDeviceType: string = AppStorage.Get('inputDeviceType');
    if (mInputDeviceType == 'add') {
      this.mIconSize = 54 / this.pullToInsertMouseRatio;
      this.mListItemGap = 8;
    } else {
      this.mIconSize = 54;
      this.mListItemGap = 12;
    }
    this.mDockHeight = this.mIconSize + 2 * this.mDockPadding;
    this.mListItemWidth = this.mIconSize;
    this.mListItemHeight = this.mIconSize;
  }

  getConfigLevel(): string {
    return CommonConstants.LAYOUT_CONFIG_LEVEL_PRODUCT;
  }

  private calculateSizeRatio(): void {
    let res: PadSmartCanvas = PadSmartCanvas.getInstance({
      width: 2560,
      height: 1600,
      screenSize: 12.6
    });
    this.pullToInsertMouseRatio = res.normalRadioAccess;
  }
}
