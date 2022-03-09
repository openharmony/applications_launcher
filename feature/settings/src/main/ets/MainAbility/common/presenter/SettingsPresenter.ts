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

import featureAbility from '@ohos.ability.featureAbility';
import SettingItemOptionsChecker from '../../../../../../../../common/src/main/ets/default/settings/SettingItemOptionsChecker';
import SettingItemsManager from '../../../../../../../../common/src/main/ets/default/settings/SettingItemsManager';
import SettingItemInfo from '../../../../../../../../common/src/main/ets/default/bean/SettingItemInfo';
import SettingItemsConfig from '../../../../../../../../common/src/main/ets/default/configs/SettingItemsConfig';
import SettingsModel from '../../../../../../../../common/src/main/ets/default/model/SettingsModel';

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

  private static sSettingPresenter: SettingsPresenter = null;

  private readonly mSettingsModel: SettingsModel = null;

  private readonly mCallbackList = [];

  private readonly mSettingItemsManager: SettingItemsManager;

  private readonly mLayoutOptionsChecker: SettingItemOptionsChecker = ()=> {
    const layout = this.mSettingsModel.getAppPageStartConfig();
    console.info('Launcher SettingsPresenter mLayoutOptionsChecker layout is ' + layout);
    return layout;
  };

  private readonly mGridLayOutOptionsChecker: SettingItemOptionsChecker = ()=> {
    const gridLayout = this.mSettingsModel.getGridConfig().layout;
    console.info('Launcher SettingsPresenter mGridLayOutOptionsChecker layout is ' + gridLayout);
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
    if (SettingsPresenter.sSettingPresenter == null) {
      SettingsPresenter.sSettingPresenter = new SettingsPresenter();
    }
    return SettingsPresenter.sSettingPresenter;
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

    console.info('Launcher SettingsPresenter getSettingList, deviceType is '+ deviceType + ', condition is ' + condition);
    return this.mSettingItemsManager.get(deviceType, condition);
  }

  /**
   * Set system setting value.
   *
   * @param {string} settingsName - setting name.
   * @param {string} settingValue - setting value.
   */
  setSettingsValue(ida, settingValue) {
    console.info('Launcher SettingsPresenter setSettingsValue, ida is '+ ida + ', settingValue is ' + settingValue);

    if (ida == SettingsPresenter.SETTINGS_INDEX_STYLE) {
      this.setAppPageStartConfig(settingValue);
    } else if (ida == SettingsPresenter.SETTINGS_INDEX_GRID_LAYOUT) {
      const idx = this.mSettingItemsManager.gridLayoutValue2Idx(settingValue);
      console.info('Launcher SettingsPresenter setSettingsValue, idx is '+ idx);
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
    console.info('Launcher settings SettingsModel settingUpdate start');
    globalThis.settingsContext.terminateSelf()
      .then(data => console.info('Launcher settings terminateSelf promise::then : ' + data))
      .catch(error => console.info('Launcher settings terminateSelf promise::catch : ' + error));
    console.info('Launcher settings terminateSelf end ');
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
    console.info('Launcher settings backToTheDesktop!');
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
    console.info(`Launcher SettingsPresenter setValue setValue: ${value}`);
    if (value != '1' && value != '0') {
      console.info('Launcher SettingsPresenter setValue error');
      return;
    }
    try{
      this.mSettingsModel.setValue(value);
    } catch (e) {
      console.info(`Launcher SettingsPresenter setValue error:  ${e.toString()}`);
    }
    this.mSettingsModel.setValue(value);
  }

  initNavigationBarStatusValue() {
    try {
      const initValue = this.mSettingsModel.getValue();
      const navigationBarStatusValue = initValue == '0' ? true : false;
      console.info(`Launcher SettingsPresenter initNavigationBarStatusValue initValue:${initValue}, navigationBarStatusValue:${navigationBarStatusValue}`);
      AppStorage.SetOrCreate('NavigationBarStatusValue', navigationBarStatusValue);
      this.mSettingsModel.registerListenForDataChanges(this.dataChangesCallback.bind(this));
    } catch (e) {
      console.info(`Launcher SettingsPresenter initNavigationBarStatusValue error:  ${e.toString()}`);
    }
  }

  private dataChangesCallback(data: any) {
    if (data.code !== 0) {
      console.log(`Launcher SettingsPresenter dataChangesCallback failed, because ${data.message}`);
    } else {
      const getRetValue = this.mSettingsModel.getValue();
      console.log(`Launcher SettingsPresenter dataChangesCallback getRetValue ${getRetValue}`);
      AppStorage.SetOrCreate('NavigationBarStatusValue', getRetValue == '0' ? true : false);
    }
  }
}