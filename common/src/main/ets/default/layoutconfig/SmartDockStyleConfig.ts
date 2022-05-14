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

import AppListStyleConfig from './AppListStyleConfig';
import CommonConstants from '../constants/CommonConstants';

/**
 * Dock style configuration class
 */
export default class SmartDockStyleConfig extends AppListStyleConfig {
  /**
   * dock list height
   */
  mDockHeight = 78;

  /**
   * dock list background color
   */
  mBackgroundColor = '#85FAFAFA';

  /**
   * dock list rounded corner value
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
   * List item width
   */
  mListItemWidth: any = 60;

  /**
   * List item height
   */
  mListItemHeight: any = 60;

  /**
   * List item spacing
   */
  mListItemGap = 2;

  /**
   * list direction
   */
  mListDirection: Axis = Axis.Horizontal;

  /**
   * Whether the list name is displayed next to
   */
  mNameDisplaySide = true;

  /**
   * Whether to display the application name
   */
  mWithAppName = false;

  /**
   * list icon size
   */
  mIconSize = 54;

  /**
   * the inner margin of the entry
   */
  mItemPadding = 3;

  /**
   * the background color of the entry
   */
  mItemBackgroundColor = '';

  /**
   * the rounded corner value of the entry
   */
  mItemBorderRadius = 0;

  /**
   * Residential area and non-residential area gap
   */
  mDockGap = 12;

  /**
   * The maximum number of displays in the resident area
   */
  mMaxDockNum = 16;

  /**
   * The maximum number of non-resident areas displayed
   */
  mMaxRecentNum = 3;

  protected constructor() {
    super();
  }

  /**
   * Get the dock style instance
   */
  static getInstance(): SmartDockStyleConfig {
    if (globalThis.SmartDockStyleConfigInstance == null) {
      globalThis.SmartDockStyleConfigInstance = new SmartDockStyleConfig();
      globalThis.SmartDockStyleConfigInstance.initConfig();
    }
    return globalThis.SmartDockStyleConfigInstance;
  }

  getConfigLevel(): string {
    return CommonConstants.LAYOUT_CONFIG_LEVEL_COMMON;
  }
}
