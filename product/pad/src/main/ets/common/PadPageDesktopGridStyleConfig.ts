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
import { LayoutViewModel } from '@ohos/common';
import { PageDesktopGridStyleConfig } from '@ohos/pagedesktop';
import StyleConstants from './constants/StyleConstants';

/**
 * Pad grid style config class
 */
export default class PadPageDesktopGridStyleConfig extends PageDesktopGridStyleConfig {
  /**
   * icon size
   */
  mIconSize = StyleConstants.DEFAULT_APP_ICON_SIZE_WIDTH;

  /**
   * name size
   */
  mNameSize = StyleConstants.DEFAULT_APP_NAME_SIZE;

  /**
   * margin
   */
  mMargin = StyleConstants.DEFAULT_MARGIN_SIZE;

  /**
   * name height
   */
  mNameHeight = StyleConstants.DEFAULT_APP_NAME_HEIGHT;

  /**
   * item padding
   */
  mPaddingTop = StyleConstants.DEFAULT_APP_TOP_RATIO;

  protected constructor() {
    super();
  }

  /**
   * get PadPageDesktopGridStyleConfig instance
   */
  static getInstance(): PadPageDesktopGridStyleConfig {
    if (globalThis.PadPageDesktopGridStyleConfig == undefined) {
      globalThis.PadPageDesktopGridStyleConfig = new PadPageDesktopGridStyleConfig();
    }
    globalThis.PadPageDesktopGridStyleConfig.initConfig();
    return globalThis.PadPageDesktopGridStyleConfig;
  }

  initConfig(): void {
    const result = LayoutViewModel.getInstance().calculateDesktop();
    this.mMargin = result.mMargin;
    this.mColumnsGap = result.mColumnsGap;
    this.mRowsGap = result.mRowsGap;
    this.mColumns = result.mColumns;
    this.mRows = result.mRows;
    this.mDesktopMarginTop = result.mDesktopMarginTop;
    this.mGridWidth = result.mGridWidth;
    this.mGridHeight = result.mGridHeight;
    this.mAppItemSize = result.mAppItemSize;
    this.mNameSize = result.mNameSize;
    this.mNameHeight = result.mNameHeight;
    this.mIconNameMargin = result.mIconNameMargin;
    this.mIconSize = result.mIconSize;
    this.mNameLines = result.mNameLines;
    this.mIconMarginHorizontal = result.mIconMarginHorizontal;
    this.mIconMarginVertical = result.mIconMarginVertical;
  }

  getConfigLevel(): string {
    return CommonConstants.LAYOUT_CONFIG_LEVEL_PRODUCT;
  }
}