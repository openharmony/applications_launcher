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

import ILayoutConfig from './ILayoutConfig';
import CommonConstants from '../constants/CommonConstants';

/**
 * Dock列表模式配置
 */
export default class SmartDockModeConfig extends ILayoutConfig {
  /**
   * Dock列表模式配置索引
   */
  static SMART_DOCK_MODE_CONFIG = 'SmartDockModeConfig';

  private static sInstance: SmartDockModeConfig = null;

  protected constructor() {
    super();
  }

  /**
   * 获取Dock列表模式配置实例
   */
  static getInstance(): SmartDockModeConfig {
    if (SmartDockModeConfig.sInstance == null) {
      SmartDockModeConfig.sInstance = new SmartDockModeConfig();
      SmartDockModeConfig.sInstance.initConfig();
    }
    return SmartDockModeConfig.sInstance;
  }

  initConfig(): void {
    const config = this.loadPersistConfig();
  }

  getConfigLevel(): string {
    return CommonConstants.LAYOUT_CONFIG_LEVEL_COMMON;
  }

  getConfigType(): number {
    return CommonConstants.LAYOUT_CONFIG_TYPE_MODE;
  }

  getConfigName(): string {
    return SmartDockModeConfig.SMART_DOCK_MODE_CONFIG;
  }

  protected getPersistConfigJson(): string {
    const persistConfig = {
    };
    return JSON.stringify(persistConfig);
  }
}
