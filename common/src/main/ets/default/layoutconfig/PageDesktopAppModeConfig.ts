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

import ILayoutConfig from './ILayoutConfig';
import CommonConstants from '../constants/CommonConstants';

/**
 * Desktop Workspace App Configuration
 */
export default class PageDesktopAppModeConfig extends ILayoutConfig {
  /**
   * Workspace Feature Layout Configuration Index
   */
  static DESKTOP_APPLICATION_INFO = 'DesktopApplicationInfo';

  private static readonly DEFAULT_LAYOUT_INFO: any = [];

  private mAppListInfo: any = PageDesktopAppModeConfig.DEFAULT_LAYOUT_INFO;

  protected constructor() {
    super();
  }

  /**
   * Get an instance of the workspace function layout configuration
   */
  static getInstance(): PageDesktopAppModeConfig {
    if (globalThis.PageDesktopAppModeConfig == null) {
      globalThis.PageDesktopAppModeConfig = new PageDesktopAppModeConfig();
      globalThis.PageDesktopAppModeConfig.initConfig();
    }
    return globalThis.PageDesktopAppModeConfig;
  }

  initConfig(): void {
    const config = this.loadPersistConfig();
    this.mAppListInfo = config;
  }

  getConfigLevel(): string {
    return CommonConstants.LAYOUT_CONFIG_LEVEL_COMMON;
  }

  getConfigType(): number {
    return CommonConstants.LAYOUT_CONFIG_TYPE_MODE;
  }

  getConfigName(): string {
    return PageDesktopAppModeConfig.DESKTOP_APPLICATION_INFO;
  }

  protected getPersistConfigJson(): string {
    return JSON.stringify(this.mAppListInfo);
  }

  /**
   * update appList in desktop
   *
   * @params appListInfo
   */
  updateAppListInfo(appListInfo: object): void {
    this.mAppListInfo = appListInfo;
    super.persistConfig();
  }

  /**
   * Get workspace shortcuts
   *
   * @return Workspace shortcuts
   */
  getAppListInfo(): any {
    return this.mAppListInfo;
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
