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

import { ILayoutConfig } from '@ohos/common';
import { CommonConstants } from '@ohos/common';

/**
 * Desktop Dock function layout configuration
 */
export class SmartDockLayoutConfig extends ILayoutConfig {
  /**
   * Dock Feature Layout Configuration Index
   */
  static SMART_DOCK_LAYOUT_INFO = 'SmartDockLayoutInfo';

  /**
   * Dock function layout data
   */
  protected mDockLayoutInfo: any = [];

  protected constructor() {
    super();
  }

  /**
   * Get an instance of the workspace function layout configuration
   */
  static getInstance(): SmartDockLayoutConfig {
    if (globalThis.SmartDockLayoutConfig == null) {
      globalThis.SmartDockLayoutConfig = new SmartDockLayoutConfig();
      globalThis.SmartDockLayoutConfig.initConfig();
    }
    return globalThis.SmartDockLayoutConfig;
  }

  initConfig(): void {
    const config = this.loadPersistConfig();
    this.mDockLayoutInfo = config;
  }

  getConfigLevel(): string {
    return CommonConstants.LAYOUT_CONFIG_LEVEL_COMMON;
  }

  getConfigType(): number {
    return CommonConstants.LAYOUT_CONFIG_TYPE_FUNCTION;
  }

  getConfigName(): string {
    return SmartDockLayoutConfig.SMART_DOCK_LAYOUT_INFO;
  }

  protected getPersistConfigJson(): string {
    return JSON.stringify(this.mDockLayoutInfo);
  }

  /**
   * Update dock layout data
   *
   * @params gridLayoutInfo:dock layout data
   */
  updateDockLayoutInfo(dockLayoutInfo: object): void {
    this.mDockLayoutInfo = dockLayoutInfo;
    super.persistConfig();
  }

  /**
   * Get dock layout data
   *
   * @return dock layout data
   */
  getDockLayoutInfo(): any {
    return this.mDockLayoutInfo;
  }

  /**
   * load configuration
   */
  loadPersistConfig(): any {
    let defaultConfig = super.loadPersistConfig();
    const configFromFile = this.loadPersistConfigFromFile();
    if (configFromFile) {
      defaultConfig = JSON.parse(configFromFile);
    }
    return defaultConfig;
  }
}
