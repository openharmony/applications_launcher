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

import { FormLayoutConfig } from '@ohos/common';
import { BaseModulePreLoader } from '@ohos/common';
import { layoutConfigManager } from '@ohos/common';
import { FormStyleConfig } from './FormStyleConfig';

/**
 * Form layer initialization loader
 */
class FormPreLoader extends BaseModulePreLoader {

  /**
   * Add configuration objects to layout configuration management class.
   */
  protected loadConfig(): void {
    layoutConfigManager.addConfigToManager(FormLayoutConfig.getInstance());
    layoutConfigManager.addConfigToManager(FormStyleConfig.getInstance());
  }

  /**
   * Initialize load data.
   */
  protected loadData(): void {
  }

  /**
   * Release module config and data.
   */
  releaseConfigAndData(): void {
    layoutConfigManager.removeConfigFromManager();
  }
}

export const formPreLoader = new FormPreLoader();