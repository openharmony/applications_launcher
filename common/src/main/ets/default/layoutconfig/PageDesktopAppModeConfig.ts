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
 * 桌面工作空间应用配置
 */
export default class PageDesktopAppModeConfig extends ILayoutConfig {
  /**
   * 工作空间功能布局配置索引
   */
  static DESKTOP_APPLICATION_INFO = 'DesktopApplicationInfo';

  private static readonly DEFAULT_LAYOUT_INFO: any = [];

  private static sInstance: PageDesktopAppModeConfig = null;

  private mAppListInfo: any = PageDesktopAppModeConfig.DEFAULT_LAYOUT_INFO;

  protected constructor() {
    super();
  }

  /**
   * 获取工作空间功能布局配置实例
   */
  static getInstance() {
    if (PageDesktopAppModeConfig.sInstance == null) {
      PageDesktopAppModeConfig.sInstance = new PageDesktopAppModeConfig();
      PageDesktopAppModeConfig.sInstance.initConfig();
    }
    return PageDesktopAppModeConfig.sInstance;
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
  updateAppListInfo(appListInfo): void {
    this.mAppListInfo = appListInfo;
    super.persistConfig();
  }

  /**
   * 获取工作空间快捷方式
   *
   * @return 工作空间快捷方式
   */
  getAppListInfo(): any {
    return this.mAppListInfo;
  }
}
