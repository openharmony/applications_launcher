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
 * 桌面Dock功能布局配置
 */
export default class SmartDockLayoutConfig extends ILayoutConfig {
  /**
   * Dock功能布局配置索引
   */
  static SMART_DOCK_LAYOUT_INFO = 'SmartDockLayoutInfo';

  private static sInstance: SmartDockLayoutConfig = null;

  /**
   * Dock功能布局数据
   */
  protected mDockLayoutInfo: any = [];

  protected constructor() {
    super();
  }

  /**
   * 获取工作空间功能布局配置实例
   */
  static getInstance() {
    if (SmartDockLayoutConfig.sInstance == null) {
      SmartDockLayoutConfig.sInstance = new SmartDockLayoutConfig();
      SmartDockLayoutConfig.sInstance.initConfig();
    }
    console.info('Launcher SmartDockLayoutConfig getInstance!');
    return SmartDockLayoutConfig.sInstance;
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
   * 更新dock布局数据
   *
   * @params gridLayoutInfo dock布局数据
   */
  updateDockLayoutInfo(dockLayoutInfo): void {
    this.mDockLayoutInfo = dockLayoutInfo;
    super.persistConfig();
  }

  /**
   * 获取dock布局数据
   *
   * @return dock布局数据
   */
  getDockLayoutInfo(): any {
    return this.mDockLayoutInfo;
  }
}
