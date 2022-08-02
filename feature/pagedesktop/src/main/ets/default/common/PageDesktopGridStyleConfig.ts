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
import { PresetStyleConstants } from '@ohos/common';
import { AppGridStyleConfig } from '@ohos/common';
import PageDesktopConstants from './constants/PageDesktopConstants';

/**
 * Work control grid style configuration class
 */
export class PageDesktopGridStyleConfig extends AppGridStyleConfig {
  /**
   * margin
   */
  mMargin = PresetStyleConstants.DEFAULT_LAYOUT_MARGIN;

  mDesktopMarginTop = PresetStyleConstants.DEFAULT_ICON_PADDING_TOP;

  mPaddingTop = PresetStyleConstants.DEFAULT_APP_TOP_RATIO;

  protected constructor() {
    super();
  }

  /**
   * Get workspace style instance
   */
  static getInstance(): PageDesktopGridStyleConfig {
    if (globalThis.PageDesktopGridStyleConfig == null) {
      globalThis.PageDesktopGridStyleConfig = new PageDesktopGridStyleConfig();
      globalThis.PageDesktopGridStyleConfig.initConfig();
    }
    return globalThis.PageDesktopGridStyleConfig;
  }

  initConfig(): void {
  }

  getConfigLevel(): string {
    return CommonConstants.LAYOUT_CONFIG_LEVEL_FEATURE;
  }

  getFeatureName(): string {
    return PageDesktopConstants.FEATURE_NAME;
  }
}