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

import { Log } from '@ohos/common';
import { AppListStyleConfig } from '@ohos/common';
import { CommonConstants } from '@ohos/common';
import { LayoutViewModel } from '@ohos/common';
import SmartDockConstants from '../common/constants/SmartDockConstants';

const TAG = 'SmartDockStyleConfig';

/**
 * smartdock layout style config
 */
export class SmartDockStyleConfig extends AppListStyleConfig {
  /**
   * dock list height, high
   */
  mDockHeight = 78;

  /**
   * dock list background color
   */
  mBackgroundColor = '#85FAFAFA';

  /**
   * dock list border radius
   */
  mDockRadius = 22;

  /**
   * dock list background blur
   */
  mBackdropBlur = 0;

  /**
   * dock list padding
   */
  mDockPadding = 9;

  /**
   * dock list margin
   */
  mDockMargin = 10;

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
  mListItemGap = 2;

  /**
   * dock list direction
   */
  mListDirection: Axis = Axis.Horizontal;

  /**
   * dock list name display side
   */
  mNameDisplaySide = true;

  /**
   * dock is show with app name
   */
  mWithAppName = false;

  /**
   * dock list item icon size
   */
  mIconSize = 54;

  /**
   * dock list item padding
   */
  mItemPadding = 3;

  /**
   * dock list item background color
   */
  mItemBackgroundColor = '';

  /**
   * dock list item border radius
   */
  mItemBorderRadius = 0;

  /**
   *  gap between resident dock and recent dock
   */
  mDockGap = 12;

  /**
   * resident dock max item number
   */
  mMaxDockNum = 16;

  /**
   * recent dock max item number
   */
  mMaxRecentNum = 3;

  /**
   * dock bottom margin
   */
  mMarginBottom = 24;

  /**
  * list item offset
  */
  mItemOffset: {x: number, y: number} = {x: 12, y: 12};

  protected constructor() {
    super();
  }

  /**
   * get SmartDockStyleConfig getInstance
   */
  static getInstance(): SmartDockStyleConfig {
    if (globalThis.SmartDockStyleConfig == null) {
      globalThis.SmartDockStyleConfig = new SmartDockStyleConfig();
      Log.showInfo(TAG, 'getInstance!');
    }
    globalThis.SmartDockStyleConfig.initConfig();
    return globalThis.SmartDockStyleConfig;
  }

  initConfig(): void {
    const result = LayoutViewModel.getInstance().calculateDock();
    this.mDockGap = result.mDockGap;
    this.mIconSize = result.mIconSize;
    this.mListItemWidth = result.mListItemWidth;
    this.mListItemHeight = result.mListItemHeight;
    this.mListItemGap = result.mListItemGap;
    this.mDockPadding = result.mDockPadding;
    this.mMaxRecentNum = result.mMaxRecentNum;
    this.mMaxDockNum = result.mMaxDockNum;
    this.mDockHeight = result.mDockHeight;
    this.mMarginBottom = result.mMarginBottom;
    this.mItemOffset = {x: this.mDockPadding, y: this.mDockPadding};
  }

  getConfigLevel(): string {
    return CommonConstants.LAYOUT_CONFIG_LEVEL_FEATURE;
  }

  getFeatureName(): string {
    return SmartDockConstants.FEATURE_NAME;
  }
}
