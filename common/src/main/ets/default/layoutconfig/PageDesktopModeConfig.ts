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

import CommonConstants from '../constants/CommonConstants';
import defaultLayoutConfig from '../configs/DefaultLayoutConfig';
import ILayoutConfig from './ILayoutConfig';

/**
 * 桌面工作空间布局模式配置
 */
export default class PageDesktopModeConfig extends ILayoutConfig {
  /**
   * 工作空间布局模式配置索引
   */
  static DESKTOP_MODE_CONFIG = 'DesktopModeConfig';

  private static readonly APP_PAGE_START_CONFIG = 'AppStartPageType';

  private static readonly GRID_CONFIG = 'GridConfig';

  private static readonly sInstance: PageDesktopModeConfig = null;

  private mAppStartPageType: string = defaultLayoutConfig.defaultAppPageStartConfig;

  private mGridConfig: number = defaultLayoutConfig.defaultGridConfig;

  private mDeviceType: string = defaultLayoutConfig.defaultDeviceType;

  protected constructor() {
    super();
  }

  /**
   * 获取工作空间布局模式配置实例
   */
  static getInstance() {
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
   * 更新默认桌面模式
   *
   * @param startPageType 默认桌面模式
   */
  updateAppStartPageType(startPageType: string) {
    this.mAppStartPageType = startPageType;
    super.persistConfig();
  }

  /**
   * 获取默认桌面模式
   *
   * @return 默认桌面模式
   */
  getAppStartPageType() {
    return this.mAppStartPageType;
  }

  /**
   * 更新网格布局模式
   *
   * @param gridConfig 网格布局模式
   */
  updateGridConfig(gridConfig: number) {
    this.mGridConfig = gridConfig;
    super.persistConfig();
  }

  /**
   * 获取网格布局模式
   *
   * @return 网格布局模式
   */
  getGridConfig() {
    return this.mGridConfig;
  }

  /**
   * 更新布局设备类型
   *
   * @param deviceType 设备类型
   */
  updateDeviceType(deviceType: string) {
    this.mDeviceType = deviceType;
    super.persistConfig();
  }

  /**
   * 获取布局设备类型
   *
   * @return 设备类型
   */
  getDeviceType() {
    return this.mDeviceType;
  }
}
