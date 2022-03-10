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

import CommonConstants from '../../../../../../../common/src/main/ets/default/constants/CommonConstants';
import FeatureConstants from './constants/FeatureConstants';
import AppGridStyleConfig from '../../../../../../../common/src/main/ets/default/layoutconfig/AppGridStyleConfig';
import PresetStyleConstants from '../../../../../../../common/src/main/ets/default/constants/PresetStyleConstants';

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
    return globalThis.AppCenterGridStyleConfigInstance;
  }

  initConfig(): void {
  }

  getConfigLevel(): string {
    return CommonConstants.LAYOUT_CONFIG_LEVEL_FEATURE;
  }

  getFeatureName(): string {
    return FeatureConstants.FEATURE_NAME;
  }
}