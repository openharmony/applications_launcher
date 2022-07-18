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
 * Recent missions layout mode configuration
 */
export class RecentsModeConfig extends ILayoutConfig {
  
  /**
   * The index of recent missions layout mode configuration
   */
  static RECENT_MISSIONS_MODE_CONFIG = 'RecentsModeConfig';
  protected mLoadConfig: any;
  private static readonly RECENT_MISSIONS_LIMIT = 'RecentMissionsLimit';
  protected mRecentMissionsLimit: number = defaultLayoutConfig.defaultRecentMissionsLimit;
  protected mRecentMissionsRowType: string = defaultLayoutConfig.defaultRecentMissionsRowConfig;

  protected constructor() {
    super();
  }

  protected getPersistConfigJson(): string {
    const persistConfig = {
      recentMissionsLimit: this.mRecentMissionsLimit,
      recentMissionsRowType: this.mRecentMissionsRowType
    };
    return JSON.stringify(persistConfig);
  }

  /**
   * Get recent missions instance
   *
   * @return {RecentsModeConfig} RecentsModeConfig instance
   */
  static getInstance(): RecentsModeConfig {
    if (globalThis.RecentsModeConfigInstance == null) {
      globalThis.RecentsModeConfigInstance = new RecentsModeConfig();
      globalThis.RecentsModeConfigInstance.initConfig();
    }
    return globalThis.RecentsModeConfigInstance;
  }

  initConfig(): void {
    this.mLoadConfig = this.loadPersistConfig();
    this.mRecentMissionsLimit = this.mLoadConfig.recentMissionsLimit;
    this.mRecentMissionsRowType = this.mLoadConfig.recentMissionsRowType;
  }

  getConfigLevel(): string {
    return CommonConstants.LAYOUT_CONFIG_LEVEL_COMMON;
  }

  getConfigType(): number {
    return CommonConstants.LAYOUT_CONFIG_TYPE_MODE;
  }

  getConfigName(): string {
    return RecentsModeConfig.RECENT_MISSIONS_MODE_CONFIG;
  }

  /**
   * Update recent missions limit
   *
   * @param {number} limit value
   */
  updateRecentMissionsLimit(limit: number): void {
    this.mRecentMissionsLimit = limit;
    super.persistConfig();
  }

  /**
   * Get recent missions limit
   *
   * @return {number} limit value
   */
  getRecentMissionsLimit(): number {
    return this.mRecentMissionsLimit;
  }

  /**
   * Get Recent row type
   *
   * @return {string} single / double
   */
  getRecentMissionsRowType(): string {
    return this.mRecentMissionsRowType;
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