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
import GridLayoutConfigs from '../configs/GridLayoutConfigs.ets';
import LayoutConfigManager from '../layoutconfig/LayoutConfigManager.ets';
import FileUtils from '../utils/FileUtils.ets';
import WorkSpaceModeConfig from '../layoutconfig/WorkSpaceModeConfig.ets';
import WorkSpaceLayoutConfig from '../layoutconfig/WorkSpaceLayoutConfig.ets';
import RecentModeConfig from '../layoutconfig/RecentModeConfig.ets';

const defaultLayoutInfoFilePath = "/data/accounts/account_0/applications/com.ohos.launcher/com.ohos.launcher/assets/launcher/resources/rawfile/layoutInfo.json";

/**
 * 桌面设置数据模型
 */
export default class SettingsModel {
  private mWorkSpaceModeConfig: WorkSpaceModeConfig;
  private mWorkSpaceLayoutConfig: WorkSpaceLayoutConfig;
  private mRecentModeConfig: RecentModeConfig;
  private mGridConfig = 1;
  private mGridLayoutTable = GridLayoutConfigs.GridLayoutTable;

  constructor() {
    this.mWorkSpaceModeConfig = LayoutConfigManager.getModeConfig(WorkSpaceModeConfig.WORKSPACE_MODE_CONFIG);
    let equipmentType = this.mWorkSpaceModeConfig.getEquipmentType();
    if (equipmentType == CommonConstants.DEFAULT_EQUIPMENT_TYPE) {
      this.mGridLayoutTable = GridLayoutConfigs.GridLayoutTable;
    } else {
      this.mGridLayoutTable = GridLayoutConfigs.GridLayoutTableHorizontal;
    }
    this.mWorkSpaceLayoutConfig = LayoutConfigManager.getFunctionConfig(WorkSpaceLayoutConfig.GRID_LAYOUT_INFO);
    this.mRecentModeConfig = LayoutConfigManager.getModeConfig(RecentModeConfig.RECENT_MODE_CONFIG);
  }

  /**
   * force reload all config from disk
   */
  public forceReloadConfig(): void {
    this.mWorkSpaceModeConfig.forceReloadConfig();
    this.mWorkSpaceLayoutConfig.forceReloadConfig();
    if (this.mRecentModeConfig != null) {
      this.mRecentModeConfig.forceReloadConfig();
    }
  }

  /**
   * Get the grid view presetting collection of layout config information table.
   *
   * @return {object} Grid view presetting collection object.
   */
  public getGridLayoutTable(): any {
    return this.mGridLayoutTable;
  }

  /**
   * Get default layout information of grid view.
   *
   * @return {object} Default layout information of grid view.
   */
  public getDefaultLayoutInfo(): any {
    return FileUtils.readJsonFile(defaultLayoutInfoFilePath);
  }

  /**
   * Get layout config of grid view.
   *
   * @return {object} Layout config of grid view.
   */
  public getGridConfig(): any {
    this.mGridConfig = this.mWorkSpaceModeConfig.getGridConfig();
    let gridLayout = this.mGridLayoutTable[0];
    for (let i = 0; i < this.mGridLayoutTable.length; i++) {
      if (this.mGridLayoutTable[i].id == this.mGridConfig) {
        gridLayout = this.mGridLayoutTable[i];
        break;
      }
    }
    return gridLayout;
  }

  /**
   * Set layout config id of grid view.
   *
   * @param gridConfig - Layout config id of grid view.
   */
  public setGridConfig(gridConfig) {
    this.mWorkSpaceModeConfig.updateGridConfig(gridConfig);
  }

  /**
   * Get the layout view type.
   *
   * @return {string} Layout view type, should one of 'Grid' or 'List' which is stored in LayoutConstants class.
   */
  public getAppPageStartConfig(): any {
    return this.mWorkSpaceModeConfig.getAppStartPageType();
  }

  /**
   * Set the layout view type.
   *
   * @param {string} type - Layout view type, should one of 'Grid' or 'List' which is stored in LayoutConstants class.
   */
  public setAppPageStartConfig(type) {
    this.mWorkSpaceModeConfig.updateAppStartPageType(type);
  }

  /**
   * Set the equipment type.
   *
   * @param {string} equipmentType - equipment type.
   */
  public setEquipment(equipmentType) {
    if (equipmentType == CommonConstants.DEFAULT_EQUIPMENT_TYPE) {
      this.mGridLayoutTable = GridLayoutConfigs.GridLayoutTable;
    } else {
      this.mGridLayoutTable = GridLayoutConfigs.GridLayoutTableHorizontal;
    }
    this.mWorkSpaceModeConfig.updateEquipmentType(equipmentType);
  }

  /**
   * Get layout information of grid view.
   *
   * @return {object} layout information.
   */
  public getLayoutInfo(): any {
    return this.mWorkSpaceLayoutConfig.getGridLayoutInfo();
  }

  /**
   * Set layout information of grid view.
   */
  public setLayoutInfo(layoutInfo) {
    this.mWorkSpaceLayoutConfig.updateGridLayoutInfo(layoutInfo);
  }

  /**
   * Remove layout information of grid view.
   */
  public deleteLayoutInfo() {
    this.mWorkSpaceLayoutConfig.deleteConfig();
  }

  /**
   * Get recent process max limit.
   *
   * @return {number} recent process max limit.
   */
  public getRecentProcessLimit(): any {
    return this.mRecentModeConfig.getRecentProcessLimit();
  }

  /**
   * Set recent process max limit.
   *
   * @param {number} num - Recent process max limit.
   */
  public setRecentProcessLimit(num) {
    this.mRecentModeConfig.updateRecentProcessLimit(num);
  }
}