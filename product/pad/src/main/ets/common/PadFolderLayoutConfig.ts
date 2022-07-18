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
import { FolderLayoutConfig } from '@ohos/common';
import padFolderLayoutInfo from './configs/PadFolderLayoutInfo';

/**
 * Pad Folder layout configuration
 */
export default class PadFolderLayoutConfig extends FolderLayoutConfig {
  protected constructor() {
    super();
    this.mFolderLayoutInfo = padFolderLayoutInfo;
  }

  /**
   * Get folder layout configuration instance
   */
  static getInstance(): PadFolderLayoutConfig {
    if (globalThis.PadFolderLayoutConfig == null) {
      globalThis.PadFolderLayoutConfig = new PadFolderLayoutConfig();
    }
    return globalThis.PadFolderLayoutConfig;
  }

  getConfigLevel(): string {
    return CommonConstants.LAYOUT_CONFIG_LEVEL_PRODUCT;
  }
}
