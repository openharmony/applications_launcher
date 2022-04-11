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
import FormLayoutConfig from '../../../../../../../common/src/main/ets/default/layoutconfig/FormLayoutConfig';
import Log from '../../../../../../../common/src/main/ets/default/utils/Log';
import CommonConstants from '../../../../../../../common/src/main/ets/default/constants/CommonConstants';
import FeatureConstants from './constants/FeatureConstants';

const TAG = 'FormDetailLayoutConfig';

/**
 * Form information data model.
 */
export default class FormDetailLayoutConfig extends FormLayoutConfig{

  private constructor() {
    super();
  }

  /**
   * Get form detail layout info object.
   *
   * @return Single instance of form data model
   */
  static getInstance(): FormDetailLayoutConfig {
    if (globalThis.FormDetailLayoutConfigInstance == null) {
      globalThis.FormDetailLayoutConfigInstance = new FormDetailLayoutConfig();
      globalThis.FormDetailLayoutConfigInstance.initConfig();
    }
    return globalThis.FormDetailLayoutConfigInstance;
  }

  /**
   * Init recent mode configuration.
   */
  initConfig(): void {
  }

  /**
   * Get form detail layout configuration level.
   *
   * @return {string} feature-level layout configuration
   */
  getConfigLevel(): string {
    return CommonConstants.LAYOUT_CONFIG_LEVEL_FEATURE;
  }

  /**
   * Get form detail layout configuration feature name.
   *
   * @return {string} feature name
   */
  getFeatureName(): string {
    return FeatureConstants.FEATURE_NAME;
  }
}