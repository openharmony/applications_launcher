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

import { Log } from '@ohos/common';
import { EventConstants } from '@ohos/common';
import { localEventManager } from '@ohos/common';
import { SettingsModel } from '@ohos/common';
import { SettingItemInfo } from '@ohos/common';
import { SettingItemsConfig } from '@ohos/common';
import { SettingItemsManager } from '@ohos/common';
import { SettingItemOptionsChecker } from '@ohos/common';

const TAG = 'SettingsPresenter';

/**
 * Class SettingsPresenter.
 */
export default class SettingsPresenter {
  /**
   * style: list or grid
   */
  static SETTINGS_INDEX_STYLE = 0;

  /**
   * grid layout: row x column
   */
  static SETTINGS_INDEX_GRID_LAYOUT = 1;

  private readonly mSettingsModel: SettingsModel = null;

  private readonly mCallbackList = [];

  private readonly mSettingItemsManager: SettingItemsManager;

  private readonly mLayoutOptionsChecker: SettingItemOptionsChecker = ()=> {
    const layout = this.mSettingsModel.getAppPageStartConfig();
    Log.showDebug(TAG, `mLayoutOptionsChecker layout: ${layout}`);
    return layout;
  };

  private readonly mGridLayOutOptionsChecker: SettingItemOptionsChecker = ()=> {
    const gridLayout = this.mSettingsModel.getGridConfig().layout;
    Log.showDebug(TAG, `mGridLayOutOptionsChecker layout: ${gridLayout}`);
    return gridLayout;
  };

  /**
   * Constructor.
   *
   * @param {object} settingsModel - model of setting.
   */
  constructor() {
    this.mSettingsModel = SettingsModel.getInstance();
    this.mSettingItemsManager = (new SettingItemsManager()).
      withChecker(SettingItemsConfig.SETTING_ITEM_LAYOUT_OPTIONS, this.mLayoutOptionsChecker).
      withChecker(SettingItemsConfig.SETTING_ITEM_PHONE_GRID_LAYOUT_OPTIONS, this.mGridLayOutOptionsChecker).
      withChecker(SettingItemsConfig.SETTING_ITEM_PAD_GRID_LAYOUT_OPTIONS, this.mGridLayOutOptionsChecker);
  }

  /**
   * Get settingsPresenter instance.
   *
   * @return {settingPresenter} - settingPresenter.
   */
  static getInstance(): SettingsPresenter{
    if (globalThis.SettingsPresenter == null) {
      globalThis.SettingsPresenter = new SettingsPresenter();
    }
    return globalThis.SettingsPresenter;
  }

  /**
   * Get setting list.
   *
   * @return [settingList] - setting list.
   */
  getSettingList(): SettingItemInfo[] {
    const deviceType = this.mSettingsModel.getDevice() == 'phone' ?
      SettingItemsConfig.DEVICE_TYPE_PHONE : SettingItemsConfig.DEVICE_TYPE_PAD;

    const condition = this.mSettingsModel.getAppPageStartConfig() == 'Grid' ?
      SettingItemsConfig.CONDITION_GRID_LAYOUT_ENABLE : SettingItemsConfig.CONDITION_LIST_LAYOUT_ENABLE;

    Log.showDebug(TAG, 'getSettingList, deviceType is '+ deviceType + ', condition is ' + condition);
    return this.mSettingItemsManager.get(deviceType, condition);
  }

  /**
   * Set system setting value.
   *
   * @param {string} settingsName - setting name.
   * @param {string} settingValue - setting value.
   */
  setSettingsValue(ida, settingValue) {
    Log.showDebug(TAG, 'setSettingsValue, ida is '+ ida + ', settingValue is ' + settingValue);

    if (ida == SettingsPresenter.SETTINGS_INDEX_STYLE) {
      this.setAppPageStartConfig(settingValue);
    } else if (ida == SettingsPresenter.SETTINGS_INDEX_GRID_LAYOUT) {
      const idx = this.mSettingItemsManager.gridLayoutValue2Idx(settingValue);
      Log.showDebug(TAG, 'setSettingsValue, idx is '+ idx);
      this.setGridConfig(idx);
    } else {
      this.setRecentMissionsLimit(settingValue);
    }
    this.settingUpdate();
  }

  /**
   * Set app start config.
   *
   * @param {string} type - the type of config.
   */
  setAppPageStartConfig(type) {
    this.mSettingsModel.setAppPageStartConfig(type);
  }

  /**
   * Update setting.
   *
   */
  settingUpdate() {
    Log.showDebug(TAG, 'settingUpdate start');
    globalThis.settingsContext.terminateSelf()
      .then(data => Log.showDebug(TAG, 'terminateSelf promise::then : ' + data))
      .catch(error => Log.showError(TAG, 'terminateSelf promise::catch : ' + error));
    Log.showDebug(TAG, 'terminateSelf end');
  }

  /**
   * Set grid config.
   *
   * @param {string} id - the id of grid config.
   */
  setGridConfig(id) {
    this.mSettingsModel.setGridConfig(id);
  }

  /**
   * Set recent missions limit.
   *
   * @param {number} num - the num of recent missions.
   */
  setRecentMissionsLimit(num) {
    this.mSettingsModel.setRecentMissionsLimit(num);
  }

  /**
   * Back to the desktop interface.
   *
   */
  backToTheDesktop() {
    Log.showDebug(TAG, 'backToTheDesktop!');
    this.settingUpdate();
  }

  /**
   * Register value callback.
   *
   * @param {string} settingsName - setting name.
   * @param {function()} settingValue - setting value.
   */
  registerValueCallback(ida, settingValue) {
    this.mCallbackList.push({
      id: ida,
      fun: settingValue
    });
  }

  /**
   * Change page setting value.
   *
   * @param {string} settingsName - setting name.
   * @param {string} settingValue - setting value.
   */
  changeSettingValue(ida, settingValue) {
    for (let i = 0;i < this.mCallbackList.length; i++) {
      if (this.mCallbackList[i].id == ida) {
        this.mCallbackList[i].fun(settingValue);
        break;
      }
    }
  }

  /**
   * get the device type.
   *
   * @return {string} device type
   */
  getDevice(): string {
    return this.mSettingsModel.getDevice();
  }

  sendLocalEvent(value: string) {
    Log.showDebug(TAG, `setValue value: ${value}`);
    if (value != '1' && value != '0') {
      Log.showDebug(TAG, 'setValue error');
      return;
    }
    if (value == '0') {
      this.mSettingsModel.setValue(value);
    } else {
      localEventManager.sendLocalEventSticky(EventConstants.EVENT_NAVIGATOR_BAR_STATUS_CHANGE, value);
    }
  }

  initNavigationBarStatusValue() {
    try {
      const initValue = this.mSettingsModel.getValue();
      const navigationBarStatusValue = initValue == '0' ? true : false;
      Log.showDebug(TAG, `initNavigationBarStatusValue initValue:${initValue}, navigationBarStatusValue:${navigationBarStatusValue}`);
      AppStorage.SetOrCreate('NavigationBarStatusValue', navigationBarStatusValue);
    } catch (e) {
      Log.showError(TAG, `initNavigationBarStatusValue error:  ${e.toString()}`);
    }
  }
}