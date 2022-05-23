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

import SettingItemOptionsChecker from '../../../../../../../common/src/main/ets/default/settings/SettingItemOptionsChecker';
import SettingItemsManager from '../../../../../../../common/src/main/ets/default/settings/SettingItemsManager';
import SettingItemInfo from '../../../../../../../common/src/main/ets/default/bean/SettingItemInfo';
import SettingItemsConfig from '../../../../../../../common/src/main/ets/default/configs/SettingItemsConfig';
import SettingsModel from '../../../../../../../common/src/main/ets/default/model/SettingsModel';
import LocalEventManager from '../../../../../../../common/src/main/ets/default/manager/LocalEventManager';
import EventConstants from '../../../../../../../common/src/main/ets/default/constants/EventConstants';
import Log from '../../../../../../../common/src/main/ets/default/utils/Log';

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
    Log.showInfo(TAG, `mLayoutOptionsChecker layout: ${layout}`);
    return layout;
  };

  private readonly mGridLayOutOptionsChecker: SettingItemOptionsChecker = ()=> {
    const gridLayout = this.mSettingsModel.getGridConfig().layout;
    Log.showInfo(TAG, `mGridLayOutOptionsChecker layout: ${gridLayout}`);
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

    Log.showInfo(TAG, 'getSettingList, deviceType is '+ deviceType + ', condition is ' + condition);
    return this.mSettingItemsManager.get(deviceType, condition);
  }

  /**
   * Set system setting value.
   *
   * @param {string} settingsName - setting name.
   * @param {string} settingValue - setting value.
   */
  setSettingsValue(ida, settingValue) {
    Log.showInfo(TAG, 'setSettingsValue, ida is '+ ida + ', settingValue is ' + settingValue);

    if (ida == SettingsPresenter.SETTINGS_INDEX_STYLE) {
      this.setAppPageStartConfig(settingValue);
    } else if (ida == SettingsPresenter.SETTINGS_INDEX_GRID_LAYOUT) {
      const idx = this.mSettingItemsManager.gridLayoutValue2Idx(settingValue);
      Log.showInfo(TAG, 'setSettingsValue, idx is '+ idx);
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
    Log.showInfo(TAG, 'settingUpdate start');
    globalThis.settingsContext.terminateSelf()
      .then(data => Log.showInfo(TAG, 'terminateSelf promise::then : ' + data))
      .catch(error => Log.showInfo(TAG, 'terminateSelf promise::catch : ' + error));
    Log.showInfo(TAG, 'terminateSelf end');
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
    Log.showInfo(TAG, 'backToTheDesktop!');
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

  setValue(value: string) {
    Log.showInfo(TAG, `setValue setValue: ${value}`);
    if (value != '1' && value != '0') {
      Log.showInfo(TAG, 'setValue error');
      return;
    }
    try{
      LocalEventManager.sendLocalEventSticky(EventConstants.EVENT_NAVIGATOR_BAR_STATUS_CHANGE, value);
      this.mSettingsModel.setValue(value);
    } catch (e) {
      Log.showInfo(TAG, `setValue error:  ${e.toString()}`);
    }
  }

  initNavigationBarStatusValue() {
    try {
      const initValue = this.mSettingsModel.getValue();
      const navigationBarStatusValue = initValue == '0' ? true : false;
      Log.showInfo(TAG, `initNavigationBarStatusValue initValue:${initValue}, navigationBarStatusValue:${navigationBarStatusValue}`);
      AppStorage.SetOrCreate('NavigationBarStatusValue', navigationBarStatusValue);
      this.mSettingsModel.registerListenForDataChanges(this.dataChangesCallback.bind(this));
    } catch (e) {
      Log.showInfo(TAG, `initNavigationBarStatusValue error:  ${e.toString()}`);
    }
  }

  private dataChangesCallback(data: any) {
    if (data.code !== 0) {
      Log.showInfo(TAG, `dataChangesCallback failed, because ${data.message}`);
    } else {
      const getRetValue = this.mSettingsModel.getValue();
      Log.showInfo(TAG, `dataChangesCallback getRetValue ${getRetValue}`);
      AppStorage.SetOrCreate('NavigationBarStatusValue', getRetValue == '0' ? true : false);
    }
  }
}