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

import ILayoutConfig from './ILayoutConfig.ets';
import CommonConstants from '../constants/CommonConstants.ets';

/**
 * 桌面工作空间功能布局配置
 */
export default class WorkSpaceLayoutConfig extends ILayoutConfig {
  /**
   * 工作空间功能布局配置索引
   */
  public static GRID_LAYOUT_INFO: string = "GridLayoutInfo";

  private static DEFAULT_PAGE_COUNT: number = 1;

  private static DEFAULT_ROW_COUNT: number = 5;

  private static DEFAULT_COLUMN_COUNT: number = 4;

  private static DEFAULT_LAYOUT_INFO: any = {
    layoutDescription: {
      pageCount: WorkSpaceLayoutConfig.DEFAULT_PAGE_COUNT,
      row: WorkSpaceLayoutConfig.DEFAULT_ROW_COUNT,
      column: WorkSpaceLayoutConfig.DEFAULT_COLUMN_COUNT
    },
    layoutInfo: [],
    bottomBarInfo: []
  };

  private static sInstance: WorkSpaceLayoutConfig = null;

  private mGridLayoutInfo: any = WorkSpaceLayoutConfig.DEFAULT_LAYOUT_INFO;

  protected constructor() {
    super()
  }

  /**
   * 获取工作空间功能布局配置实例
   */
  public static getInstance() {
    if (WorkSpaceLayoutConfig.sInstance == null) {
      WorkSpaceLayoutConfig.sInstance = new WorkSpaceLayoutConfig();
      WorkSpaceLayoutConfig.sInstance.initConfig();
    }
    return WorkSpaceLayoutConfig.sInstance;
  }

  public initConfig(): void {
    let config = this.loadPresistConfig();
    this.mGridLayoutInfo = config;
  }

  public getConfigLevel(): string {
    return CommonConstants.LAYOUT_CONFIG_LEVEL_COMMON;
  }

  public getConfigType(): number {
    return CommonConstants.LAYOUT_CONFIG_TYPE_FUNCTION;
  }

  public getConfigName(): string {
    return WorkSpaceLayoutConfig.GRID_LAYOUT_INFO;
  }

  protected getPersistConfigJson(): string {
    return JSON.stringify(this.mGridLayoutInfo);
  }

  /**
   * 更新工作空间布局数据
   *
   * @params gridLayoutInfo 工作空间布局数据
   */
  public updateGridLayoutInfo(gridLayoutInfo): void {
    this.mGridLayoutInfo = gridLayoutInfo;
    super.persistConfig();
  }

  /**
   * 获取工作空间布局数据
   *
   * @return 工作空间布局数据
   */
  public getGridLayoutInfo(): any {
    return this.mGridLayoutInfo;
  }
}
