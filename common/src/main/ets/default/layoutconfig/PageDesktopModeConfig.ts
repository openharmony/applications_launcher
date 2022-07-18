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

import { ILayoutConfig } from './ILayoutConfig';
import { CommonConstants } from '../constants/CommonConstants';
import defaultLayoutConfig from '../configs/DefaultLayoutConfig';

/**
 * Desktop Workspace Layout Mode Configuration
 */
export class PageDesktopModeConfig extends ILayoutConfig {
  /**
   * Workspace layout mode configuration index
   */
  static DESKTOP_MODE_CONFIG = 'DesktopModeConfig';

  private static readonly APP_PAGE_START_CONFIG = 'AppStartPageType';

  private static readonly GRID_CONFIG = 'GridConfig';

  private mAppStartPageType: string = defaultLayoutConfig.defaultAppPageStartConfig;

  private mGridConfig: number = defaultLayoutConfig.defaultGridConfig;

  private mDeviceType: string = defaultLayoutConfig.defaultDeviceType;

  protected constructor() {
    super();
  }

  /**
   * Get an instance of the workspace layout mode configuration
   */
  static getInstance(): PageDesktopModeConfig {
    if (globalThis.PageDesktopModeConfigInstance == null) {
      globalThis.PageDesktopModeConfigInstance = new PageDesktopModeConfig();
      globalThis.PageDesktopModeConfigInstance.initConfig();
    }
    return globalThis.PageDesktopModeConfigInstance;
  }

  initConfig(): void {
    const config = this.loadPersistConfig();
    this.mAppStartPageType = config.appStartPageType;
    this.mGridConfig = config.gridConfig;
    this.mDeviceType = config.deviceType;
  }

  getConfigLevel(): string {
    return CommonConstants.LAYOUT_CONFIG_LEVEL_COMMON;
  }

  getConfigType(): number {
    return CommonConstants.LAYOUT_CONFIG_TYPE_MODE;
  }

  getConfigName(): string {
    return PageDesktopModeConfig.DESKTOP_MODE_CONFIG;
  }

  protected getPersistConfigJson(): string {
    const persistConfig = {
      appStartPageType: this.mAppStartPageType,
      gridConfig: this.mGridConfig,
      deviceType: this.mDeviceType
    };
    return JSON.stringify(persistConfig);
  }

  /**
   * Update default desktop mode
   *
   * @param startPageType:Default desktop mode
   */
  updateAppStartPageType(startPageType: string): void {
    this.mAppStartPageType = startPageType;
    globalThis.RdbStoreManagerInstance.updateSettings('app_start_page_type', startPageType);
  }

  /**
   * Get default desktop mode
   *
   * @return startPageType:Default desktop mode
   */
  getAppStartPageType(): string {
    return this.mAppStartPageType;
  }

  /**
   * Update grid layout mode
   *
   * @param gridConfig
   */
  updateGridConfig(gridConfig: number): void {
    this.mGridConfig = gridConfig;
    globalThis.RdbStoreManagerInstance.updateSettings('grid_config', gridConfig);
  }

  /**
   * Get grid layout mode
   *
   * @return gridConfig:grid layout mode
   */
  getGridConfig(): number {
    return this.mGridConfig;
  }

  /**
   * Update layout device type
   *
   * @param deviceType
   */
  updateDeviceType(deviceType: string): void {
    this.mDeviceType = deviceType;
    globalThis.RdbStoreManagerInstance.updateSettings('device_type', deviceType);
  }

  /**
   * Get layout device type
   *
   * @return deviceType
   */
  getDeviceType(): string {
    return this.mDeviceType;
  }
}
