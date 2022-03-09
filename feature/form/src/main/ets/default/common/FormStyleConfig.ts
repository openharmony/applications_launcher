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

import AppListStyleConfig from '../../../../../../../common/src/main/ets/default/layoutconfig/AppListStyleConfig';
import CommonConstants from '../../../../../../../common/src/main/ets/default/constants/CommonConstants';
import FeatureConstants from './constants/FeatureConstants';

/**
 * Form style config
 */
export default class FormStyleConfig extends AppListStyleConfig {

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
   * get form style config instance
   */
  static getInstance() {
    if (globalThis.FormStyleConfigInstance == null) {
      globalThis.FormStyleConfigInstance = new FormStyleConfig();
    }
    return globalThis.FormStyleConfigInstance;
  }

  initConfig(): void {
  }

  getConfigLevel(): string {
    return CommonConstants.LAYOUT_CONFIG_LEVEL_FEATURE;
  }

  getFeatureName() {
    return FeatureConstants.FEATURE_NAME;
  }
}
