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
 * Desktop workspace function layout configuration.
 */
export default class PageDesktopLayoutConfig extends ILayoutConfig {
  /**
   * Workspace Feature Layout Configuration Index.
   */
  static GRID_LAYOUT_INFO = 'GridLayoutInfo';

  private static readonly DEFAULT_PAGE_COUNT = 1;

  private static readonly DEFAULT_ROW_COUNT = 5;

  private static readonly DEFAULT_COLUMN_COUNT = 4;

  private static readonly DEFAULT_LAYOUT_INFO: any = {
    layoutDescription: {
      pageCount: PageDesktopLayoutConfig.DEFAULT_PAGE_COUNT,
      row: PageDesktopLayoutConfig.DEFAULT_ROW_COUNT,
      column: PageDesktopLayoutConfig.DEFAULT_COLUMN_COUNT
    },
    layoutInfo: []
  };

  private mGridLayoutInfo: any = PageDesktopLayoutConfig.DEFAULT_LAYOUT_INFO;

  protected constructor() {
    super();
  }

  /**
   * Get an instance of the workspace function layout configuration
   */
  static getInstance(): PageDesktopLayoutConfig {
    if (globalThis.PageDesktopLayoutConfigInstance == null) {
      globalThis.PageDesktopLayoutConfigInstance = new PageDesktopLayoutConfig();
      globalThis.PageDesktopLayoutConfigInstance.initConfig();
    }
    return globalThis.PageDesktopLayoutConfigInstance;
  }

  initConfig(): void {
    const config = this.loadPersistConfig();
    this.mGridLayoutInfo = config;
  }

  getConfigLevel(): string {
    return CommonConstants.LAYOUT_CONFIG_LEVEL_COMMON;
  }

  getConfigType(): number {
    return CommonConstants.LAYOUT_CONFIG_TYPE_FUNCTION;
  }

  getConfigName(): string {
    return PageDesktopLayoutConfig.GRID_LAYOUT_INFO;
  }

  protected getPersistConfigJson(): string {
    return JSON.stringify(this.mGridLayoutInfo);
  }

  /**
   * Update workspace layout data.
   *
   * @params gridLayoutInfo
   */
  updateGridLayoutInfo(gridLayoutInfo: object): void {
    this.mGridLayoutInfo = gridLayoutInfo;
    super.persistConfig();
  }

  /**
   * Get workspace layout data
   *
   * @return Workspace layout data
   */
  getGridLayoutInfo(): any {
    return this.mGridLayoutInfo;
  }
}
