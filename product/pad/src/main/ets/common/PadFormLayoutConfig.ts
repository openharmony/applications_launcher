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
import { FormLayoutConfig } from '@ohos/common';
import padFormLayoutInfo from './configs/PadFormLayoutInfo';

/**
 * Pad form layout configuration
 */
export default class PadFormLayoutConfig extends FormLayoutConfig {
  protected constructor() {
    super();
    this.mFormLayoutInfo = padFormLayoutInfo;
  }

  /**
   * Get form layout configuration instance
   */
  static getInstance(): PadFormLayoutConfig {
    if (globalThis.PadFormLayoutConfig == null) {
      globalThis.PadFormLayoutConfig = new PadFormLayoutConfig();
      globalThis.PadFormLayoutConfig.initConfig();
    }
    return globalThis.PadFormLayoutConfig;
  }

  getConfigLevel(): string {
    return CommonConstants.LAYOUT_CONFIG_LEVEL_PRODUCT;
  }
}
