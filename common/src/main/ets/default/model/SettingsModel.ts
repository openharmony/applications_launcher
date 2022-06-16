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

import CommonConstants from '../constants/CommonConstants';
import GridLayoutConfigs from '../configs/GridLayoutConfigs';
import LayoutConfigManager from '../layoutconfig/LayoutConfigManager';
import FileUtils from '../utils/FileUtils';
import GridLayoutUtil from '../utils/GridLayoutUtil';
import PageDesktopModeConfig from '../layoutconfig/PageDesktopModeConfig';
import PageDesktopLayoutConfig from '../layoutconfig/PageDesktopLayoutConfig';
import PageDesktopAppModeConfig from '../layoutconfig/PageDesktopAppModeConfig';
import RecentsModeConfig from '../layoutconfig/RecentsModeConfig';
import settingsDataManager from '../manager/SettingsDataManager';
import SettingsModelObserver from './SettingsModelObserver';
import Log from '../utils/Log';

const TAG = 'SettingsModel';

const defaultLayoutInfoFilePath = globalThis.desktopContext.filesDir + '/layoutInfo.json';

/**
 * Data model for launcher settings ability.
 */
export default class SettingsModel {
  static readonly EVENT_FORCE_RELOAD: number = 1;
  private static readonly DEFAULT_VALUE: string = '1';
  private readonly mPageDesktopModeConfig: PageDesktopModeConfig;
  private readonly mPageDesktopLayoutConfig: PageDesktopLayoutConfig;
  private readonly mRecentsModeConfig: RecentsModeConfig;
  private readonly mPageDesktopAppModeConfig: PageDesktopAppModeConfig;
  private mGridConfig = 1;
  private mGridLayoutTable = GridLayoutConfigs.GridLayoutTable;
  private readonly uri: string = null;
  private readonly helper: any = null;
  private readonly mObserverList: SettingsModelObserver[] = [];

  private constructor() {
    this.mPageDesktopModeConfig = LayoutConfigManager.getModeConfig(PageDesktopModeConfig.DESKTOP_MODE_CONFIG);
    const deviceType = this.mPageDesktopModeConfig.getDeviceType();
    if (deviceType == CommonConstants.DEFAULT_DEVICE_TYPE) {
      this.mGridLayoutTable = GridLayoutConfigs.GridLayoutTable;
    } else if (deviceType == CommonConstants.PAD_DEVICE_TYPE) {
      this.mGridLayoutTable = GridLayoutConfigs.PadGridLayoutTableHorizontal;
    } else {
      this.mGridLayoutTable = GridLayoutConfigs.GridLayoutTableHorizontal;
    }
    this.mPageDesktopLayoutConfig = LayoutConfigManager.getFunctionConfig<PageDesktopLayoutConfig>(PageDesktopLayoutConfig.GRID_LAYOUT_INFO);
    this.mRecentsModeConfig = LayoutConfigManager.getModeConfig(RecentsModeConfig.RECENT_MISSIONS_MODE_CONFIG);
    this.mPageDesktopAppModeConfig = LayoutConfigManager.getModeConfig(PageDesktopAppModeConfig.DESKTOP_APPLICATION_INFO);
    this.uri = settingsDataManager.getUri(CommonConstants.NAVIGATION_BAR_STATUS_KEY);
    this.helper = settingsDataManager.getHelper(globalThis.desktopContext, this.uri);
  }

  static getInstance(): SettingsModel {
    if (globalThis.SettingsModelInstance == null) {
      globalThis.SettingsModelInstance = new SettingsModel();
    }
    return globalThis.SettingsModelInstance;
  }

  addObserver(observer: SettingsModelObserver): void {
    Log.showDebug(TAG, 'addObserver');
    this.mObserverList.push(observer);
  }

  private notifyObservers(event: number): void {
    Log.showDebug(TAG, 'notifyObservers');
    for (let i = 0; i < this.mObserverList.length; i++) {
      this.mObserverList[i](event);
    }
  }

  /**
   * force reload all config from disk.
   */
  forceReloadConfig(): void {
    this.mPageDesktopModeConfig.forceReloadConfig();
    this.mPageDesktopLayoutConfig.forceReloadConfig();
    this.mPageDesktopAppModeConfig.forceReloadConfig();
    if (this.mRecentsModeConfig != null) {
      this.mRecentsModeConfig.forceReloadConfig();
    }
    this.notifyObservers(1);
  }

  /**
   * Get the grid view presetting collection of layout config information table.
   *
   * @return {object} Grid view presetting collection object.
   */
  getGridLayoutTable(): any {
    return this.mGridLayoutTable;
  }

  /**
   * Get default layout information of grid view.
   *
   * @return {object} Default layout information of grid view.
   */
  getDefaultLayoutInfo(): any {
    return FileUtils.readJsonFile(defaultLayoutInfoFilePath);
  }

  /**
   * Get layout config of grid view.
   *
   * @return {object} Layout config of grid view.
   */
  getGridConfig(): any {
    this.mGridConfig = this.mPageDesktopModeConfig.getGridConfig();
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
  setGridConfig(gridConfig) {
    this.mPageDesktopModeConfig.updateGridConfig(gridConfig);

    const config = this.getGridConfig();
    const gridLayoutInfo = this.mPageDesktopLayoutConfig.getGridLayoutInfo();
    this.mPageDesktopLayoutConfig.updateGridLayoutInfo(GridLayoutUtil.updateGridLayoutInfo(
      gridLayoutInfo, config.row, config.column
    ));
    this.forceReloadConfig();
  }

  /**
   * Get appList config of workspace view.
   *
   * @return {object} appList config of workspace view.
   */
  getAppListInfo(): any {
    return this.mPageDesktopAppModeConfig.getAppListInfo();
  }

  /**
   * Determine if there is an application in the workspace.
   *
   * @return {boolean} true(exist).
   */
  isAppListInfoExist(): boolean {
    return this.mPageDesktopAppModeConfig.isConfigExist();
  }

  /**
   * Set layout config id of grid view.
   *
   * @param gridConfig - Layout config id of grid view.
   */
  setAppListInfo(appList): void {
    this.mPageDesktopAppModeConfig.updateAppListInfo(appList);
  }

  /**
   * Get the layout view type.
   *
   * @return {string} Layout view type, should one of 'Grid' or 'List' which is stored in LayoutConstants class.
   */
  getAppPageStartConfig(): any {
    return this.mPageDesktopModeConfig.getAppStartPageType();
  }

  /**
   * Set the layout view type.
   *
   * @param {string} type - Layout view type, should one of 'Grid' or 'List' which is stored in LayoutConstants class.
   */
  setAppPageStartConfig(type): void {
    this.mPageDesktopModeConfig.updateAppStartPageType(type);
  }

  /**
   * Set the device type.
   *
   * @param {string} deviceType - device type.
   */
  setDevice(deviceType): void {
    Log.showInfo(TAG, `setDevice ${deviceType}`);
    if (deviceType == CommonConstants.DEFAULT_DEVICE_TYPE) {
      this.mGridLayoutTable = GridLayoutConfigs.GridLayoutTable;
    } else if (deviceType == CommonConstants.PAD_DEVICE_TYPE) {
      this.mGridLayoutTable = GridLayoutConfigs.PadGridLayoutTableHorizontal;
    } else {
      this.mGridLayoutTable = GridLayoutConfigs.GridLayoutTableHorizontal;
    }
    this.mPageDesktopModeConfig.updateDeviceType(deviceType);
  }

  /**
   * get the device type.
   *
   * @return {string} device type
   */
  getDevice(): string {
    return this.mPageDesktopModeConfig.getDeviceType();
  }

  /**
   * Get layout information of grid view.
   *
   * @return {object} layout information.
   */
  getLayoutInfo(): any {
    return this.mPageDesktopLayoutConfig.getGridLayoutInfo();
  }

  /**
   * Set layout information of grid view.
   */
  setLayoutInfo(layoutInfo): void {
    this.mPageDesktopLayoutConfig.updateGridLayoutInfo(layoutInfo);
  }

  /**
   * Remove layout information of grid view.
   */
  deleteLayoutInfo(): void {
    this.mPageDesktopLayoutConfig.deleteConfig();
  }

  /**
   * Get recent missions max limit.
   *
   * @return {number} recent missions max limit.
   */
  getRecentMissionsLimit(): any {
    return this.mRecentsModeConfig.getRecentMissionsLimit();
  }

  /**
   * Set recent missions max limit.
   *
   * @param {number} num - Recent missions max limit.
   */
  setRecentMissionsLimit(num): void {
    this.mRecentsModeConfig.updateRecentMissionsLimit(num);
  }

  /**
   * Update settingData by settingDataKey.
   */
  setValue(value: string): void {
    settingsDataManager.setValue(this.helper, CommonConstants.NAVIGATION_BAR_STATUS_KEY, value);
  }

  /**
   * get settingDataValue by settingDataKey.
   *
   * @return settingsDataValue by settingDataKey.
   */
  getValue() {
    return settingsDataManager.getValue(this.helper, CommonConstants.NAVIGATION_BAR_STATUS_KEY, SettingsModel.DEFAULT_VALUE);
  }

  /**
   * Monitor data changes.
   * @param callback
   */
  registerListenForDataChanges(callback): void {
    this.helper.on('dataChange', this.uri, callback);
  }
}