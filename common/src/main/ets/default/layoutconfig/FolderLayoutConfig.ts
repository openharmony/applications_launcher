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
import folderLayoutInfo from '../configs/FolderLayoutInfo';

/**
 * Folder layout configuration
 */
export class FolderLayoutConfig extends ILayoutConfig {

  /**
   *  The index of Folder layout configuration
   */
  static FOLDER_GRID_LAYOUT_INFO = 'FolderGridLayoutInfo';
  protected mFolderLayoutInfo: any = folderLayoutInfo;

  constructor() {
    super();
  }

  /**
   * Get folder layout configuration instance
   */
  static getInstance(): FolderLayoutConfig {
    if (globalThis.FolderLayoutConfigInstance == null) {
      globalThis.FolderLayoutConfigInstance = new FolderLayoutConfig();
      globalThis.FolderLayoutConfigInstance.initConfig();
    }
    return globalThis.FolderLayoutConfigInstance;
  }

  initConfig(): void {
    const config = this.loadPersistConfig();
    this.mFolderLayoutInfo = config;
  }

  getConfigLevel(): string {
    return CommonConstants.LAYOUT_CONFIG_LEVEL_COMMON;
  }

  getConfigType(): number {
    return CommonConstants.LAYOUT_CONFIG_TYPE_FUNCTION;
  }

  getConfigName(): string {
    return FolderLayoutConfig.FOLDER_GRID_LAYOUT_INFO;
  }

  getPersistConfigJson(): string {
    return JSON.stringify(this.mFolderLayoutInfo);
  }

  /**
   * Update folder layout data
   *
   * @params {gridLayoutInfo} folder layout data
   */
  updateFolderLayoutInfo(folderLayoutInfo: object): void {
    this.mFolderLayoutInfo = folderLayoutInfo;
    super.persistConfig();
  }

  /**
   * Get folder layout data
   *
   * @return folder layout data
   */
  getFolderLayoutInfo(): any {
    return this.mFolderLayoutInfo;
  }
}
