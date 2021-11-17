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
 * 多任务布局模式配置
 */
export default class RecentModeConfig extends ILayoutConfig {
  /**
   * 多任务模式配置索引
   */
  public static RECENT_MODE_CONFIG: string = "RecentModeConfig";

  private static RECENT_PROCESS_LIMIT: string = "RecentProcessLimit";

  private static sInstance: RecentModeConfig = null;

  private mRecentProcessLimit: number = DefaultLayoutConfig.DefaultRecentProcessLimit;

  protected constructor() {
    super()
  }

  /**
   * 获取多任务布局模式配置实例
   */
  public static getInstance() {
    if (RecentModeConfig.sInstance == null) {
      RecentModeConfig.sInstance = new RecentModeConfig();
      RecentModeConfig.sInstance.initConfig();
    }
    return RecentModeConfig.sInstance;
  }

  public initConfig(): void {
    let config = this.loadPresistConfig();
    this.mRecentProcessLimit = config.recentProcessLimit;
  }

  public getConfigLevel(): string {
    return CommonConstants.LAYOUT_CONFIG_LEVEL_COMMON;
  }

  public getConfigType(): number {
    return CommonConstants.LAYOUT_CONFIG_TYPE_MODE;
  }

  public getConfigName(): string {
    return RecentModeConfig.RECENT_MODE_CONFIG;
  }

  protected getPersistConfigJson(): string {
    let persistConfig = {
      recentProcessLimit: this.mRecentProcessLimit
    };
    return JSON.stringify(persistConfig);
  }

  /**
   * 修改最近任务上限
   *
   * @param limit 上限值
   */
  public updateRecentProcessLimit(limit: number) {
    this.mRecentProcessLimit = limit;
    super.persistConfig();
  }

  /**
   * 获取最近任务上限
   *
   * @return 上限值
   */
  public getRecentProcessLimit() {
    return this.mRecentProcessLimit;
  }
}