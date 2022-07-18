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
import { AppListStyleConfig } from '@ohos/common';
import FormConstants from './constants/FormConstants';

/**
 * Form style config
 */
export class FormStyleConfig extends AppListStyleConfig {

  mFormWidth: Map<string,number> = new Map<string,number>();

  mFormHeight: Map<string,number> = new Map<string,number>();

  /**
   * Form name size
   */
  mFormNameSize = 20;

  /**
   * Form name height
   */
  mFolderNameHeight = 25;

  /**
   * Form dimension width 1 * 2
   */
  mDimensionWidth_1_2 = 54;

  /**
   * Form dimension height 1 * 2
   */
  mDimensionHeight_1_2 = 128;

  /**
   * Form dimension width 2 * 2
   */
  mDimensionWidth_2_2 = 128;

  /**
   * Form dimension height 2 * 2
   */
  mDimensionHeight_2_2 = 128;

  /**
   * Form dimension width 2 * 4
   */
  mDimensionWidth_2_4 = 128;

  /**
   * Form dimension height 2 * 4
   */
  mDimensionHeight_2_4 = 202;

  /**
   * Form dimension width 4 * 4
   */
  mDimensionWidth_4_4 = 202;

  /**
   * Form dimension height 4 * 4
   */
  mDimensionHeight_4_4 = 202;

  /**
   * Form list blur
   */
  mBackdropBlur = 20;

  protected constructor() {
    super();
  }

  /**
   * Get form style configuration instance.
   *
   * @return {object} FormStyleConfig singleton
   */
  static getInstance(): FormStyleConfig {
    if (globalThis.FormStyleConfigInstance == null) {
      globalThis.FormStyleConfigInstance = new FormStyleConfig();
    }
    globalThis.FormStyleConfigInstance.initConfig();
    return globalThis.FormStyleConfigInstance;
  }

  /**
   * Init form style configuration.
   */
  initConfig(): void {
    const result = LayoutViewModel.getInstance().calculateForm();
    this.mFormWidth.set(CommonConstants.CARD_DIMENSION_1x2.toString(), result.widthDimension1);
    this.mFormHeight.set(CommonConstants.CARD_DIMENSION_1x2.toString(), result.heightDimension1);
    this.mFormWidth.set(CommonConstants.CARD_DIMENSION_2x2.toString(), result.widthDimension2);
    this.mFormHeight.set(CommonConstants.CARD_DIMENSION_2x2.toString(), result.heightDimension2);
    this.mFormWidth.set(CommonConstants.CARD_DIMENSION_2x4.toString(), result.widthDimension3);
    this.mFormHeight.set(CommonConstants.CARD_DIMENSION_2x4.toString(), result.heightDimension3);
    this.mFormWidth.set(CommonConstants.CARD_DIMENSION_4x4.toString(), result.widthDimension4);
    this.mFormHeight.set(CommonConstants.CARD_DIMENSION_4x4.toString(), result.heightDimension4);
    this.mIconNameMargin = result.mIconNameMargin;
  }

  /**
   * Get form style configuration level.
   *
   * @return {string} feature-level layout configuration
   */
  getConfigLevel(): string {
    return CommonConstants.LAYOUT_CONFIG_LEVEL_FEATURE;
  }

  /**
   * Get form style feature name.
   *
   * @return {string} feature name
   */
  getFeatureName(): string {
    return FormConstants.FEATURE_NAME;
  }
}
