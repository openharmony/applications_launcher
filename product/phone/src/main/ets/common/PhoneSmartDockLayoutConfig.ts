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

import CommonConstants from '../../../../../../common/src/main/ets/default/constants/CommonConstants';
import SmartDockLayoutConfig from '../../../../../../common/src/main/ets/default/layoutconfig/SmartDockLayoutConfig';
import phonePresetDockItem from './PhonePresetDockItem';

/**
 * Desktop Dock function layout configuration.
 */
export default class PadSmartDockLayoutConfig extends SmartDockLayoutConfig {
  protected constructor() {
    super();
    this.mDockLayoutInfo = phonePresetDockItem;
  }

  static getInstance(): PadSmartDockLayoutConfig {
    if (globalThis.PadSmartDockLayoutConfig == null) {
      globalThis.PadSmartDockLayoutConfig = new PadSmartDockLayoutConfig();
      globalThis.PadSmartDockLayoutConfig.initConfig();
    }
    return globalThis.PadSmartDockLayoutConfig;
  }

  getConfigLevel(): string {
    return CommonConstants.LAYOUT_CONFIG_LEVEL_PRODUCT;
  }
}
