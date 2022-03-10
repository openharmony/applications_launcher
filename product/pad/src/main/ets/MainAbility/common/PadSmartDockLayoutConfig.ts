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
import SmartDockLayoutConfig from '../../../../../../../common/src/main/ets/default/layoutconfig/SmartDockLayoutConfig';
import presetDockItem from './PresetDockItem';

/**
 * 桌面Dock功能布局配置
 */
export default class PadSmartDockLayoutConfig extends SmartDockLayoutConfig {
  private static sProductInstance: PadSmartDockLayoutConfig | undefined;

  protected constructor() {
    super();
    this.mDockLayoutInfo = presetDockItem;
  }

  static getInstance(): PadSmartDockLayoutConfig {
    if (PadSmartDockLayoutConfig.sProductInstance == undefined) {
      PadSmartDockLayoutConfig.sProductInstance = new PadSmartDockLayoutConfig();
      PadSmartDockLayoutConfig.sProductInstance.initConfig();
    }
    return PadSmartDockLayoutConfig.sProductInstance;
  }

  getConfigLevel(): string {
    return CommonConstants.LAYOUT_CONFIG_LEVEL_PRODUCT;
  }
}
