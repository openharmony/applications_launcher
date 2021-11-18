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

import CommonConstants from '../constants/CommonConstants.ets';
import DefaultLayoutConfig from '../configs/DefaultLayoutConfig.ets';
import ILayoutConfig from './ILayoutConfig.ets';

/**
 * 桌面工作空间功能布局配置
 */
export default class WorkSpaceModeConfig extends ILayoutConfig {
  /**
   * 工作空间功能布局配置索引
   */
  public static WORKSPACE_MODE_CONFIG: string = "WorkSpaceModeConfig";

  private static APP_PAGE_START_CONFIG: string = 'AppStartPageType';

  private static GRID_CONFIG: string = 'GridConfig';

  private static sInstance: WorkSpaceModeConfig = null;

  private mAppStartPageType: string = DefaultLayoutConfig.DefaultAppPageStartConfig;

  private mGridConfig: number = DefaultLayoutConfig.DefaultGridConfig;

  private mEquipmentType: string = DefaultLayoutConfig.DefaultEquipmentType;

  protected constructor() {
    super()
  }

  /**
   * 获取工作空间功能布局模式配置实例
   */
  public static getInstance() {
    if (WorkSpaceModeConfig.sInstance == null) {
      WorkSpaceModeConfig.sInstance = new WorkSpaceModeConfig();
      WorkSpaceModeConfig.sInstance.initConfig();
    }
    return WorkSpaceModeConfig.sInstance;
  }

  public initConfig(): void {
    let config = this.loadPresistConfig();
    this.mAppStartPageType = config.appStartPageType
    this.mGridConfig = config.gridConfig;
  }

  public getConfigLevel(): string {
    return CommonConstants.LAYOUT_CONFIG_LEVEL_COMMON;
  }

  public getConfigType(): number {
    return CommonConstants.LAYOUT_CONFIG_TYPE_MODE;
  }

  public getConfigName(): string {
    return WorkSpaceModeConfig.WORKSPACE_MODE_CONFIG;
  }

  protected getPersistConfigJson(): string {
    let persistConfig = {
      appStartPageType: this.mAppStartPageType,
      gridConfig: this.mGridConfig,
      equipmentType: this.mEquipmentType
    };
    return JSON.stringify(persistConfig);
  }

  /**
   * 更新默认桌面模式
   *
   * @params startPageType 默认桌面模式
   */
  public updateAppStartPageType(startPageType: string) {
    this.mAppStartPageType = startPageType;
    super.persistConfig();
  }

  /**
   * 获取默认桌面模式
   *
   * @return 默认桌面模式
   */
  public getAppStartPageType() {
    return this.mAppStartPageType;
  }

  /**
   * 更新网格布局模式
   *
   * @param gridConfig 网格布局模式
   */
  public updateGridConfig(gridConfig: number) {
    this.mGridConfig = gridConfig;
    super.persistConfig();
  }

  /**
   * 获取网格布局模式
   *
   * @return 网格布局模式
   */
  public getGridConfig() {
    return this.mGridConfig;
  }

  /**
   * 更新布局设备类型
   *
   * @param equipmentType 设备类型
   */
  public updateEquipmentType(equipmentType: string) {
    this.mEquipmentType = equipmentType;
  }

  /**
   * 获取布局设备类型
   *
   * @return 设备类型
   */
  public getEquipmentType() {
    return this.mEquipmentType;
  }
}