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
import { LayoutViewModel } from '@ohos/common';
import { AppGridStyleConfig } from '@ohos/common';
import AppcenterConstants from './constants/AppcenterConstants';

/**
 * style config of AppCenter
 */
export default class AppCenterGridStyleConfig extends AppGridStyleConfig {

  mPadding = PresetStyleConstants.DEFAULT_APP_CENTER_PADDING;

  protected constructor() {
    super();
  }

  /**
    * Obtains the AppCenterGridStyleConfig instance.
    *
    * @return AppCenterGridStyleConfig
   */
  static getInstance(): AppCenterGridStyleConfig {
    if (globalThis.AppCenterGridStyleConfigInstance == null) {
      globalThis.AppCenterGridStyleConfigInstance = new AppCenterGridStyleConfig();
    }
    globalThis.AppCenterGridStyleConfigInstance.initConfig();
    return globalThis.AppCenterGridStyleConfigInstance;
  }

  initConfig(): void {
    const result = LayoutViewModel.getInstance().calculateAppCenter();
    this.mColumnsGap = result.mColumnsGap;
    this.mRowsGap = result.mRowsGap;
    this.mColumns = result.mColumns;
    this.mRows = result.mRows;
    this.mGridWidth = result.mGridWidth;
    this.mGridHeight = result.mGridHeight;
    this.mPadding = result.mPadding;
    this.mNameSize = result.mNameSize;
    this.mNameHeight = result.mNameHeight;
    this.mIconSize = result.mIconSize;
    this.mNameLines = result.mNameLines;
    this.mIconMarginVertical = result.mIconMarginVertical;
    this.mAppItemSize = result.mAppItemSize;
    this.mAppCenterMarginLeft=result.mAppCenterMarginLeft
  }

  getConfigLevel(): string {
    return CommonConstants.LAYOUT_CONFIG_LEVEL_FEATURE;
  }

  getFeatureName(): string {
    return AppcenterConstants.FEATURE_NAME;
  }
}