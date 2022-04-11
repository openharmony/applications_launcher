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
import SettingItemOptionsChecker from './SettingItemOptionsChecker';
import SettingItemsConfig from '../configs/SettingItemsConfig';
import SettingItemInfo from '../bean/SettingItemInfo';
import SettingItemOption from '../bean/SettingItemOption';

/**
 * 设置项管理类
 */
export default class SettingItemsManager {
  private static readonly INVALID_INDEX: number = -1;

  /**
   * 设置项对应的注册函数（用于获取当前哪个选项被选中）map
   */
  private settingName2CheckerFuncMap: Record<string, SettingItemOptionsChecker> = {};

  /**
   * constructor
   */
  constructor() {
  }

  /**
   * 注册设置项对应的注册函数（用于获取当前哪个选项被选中）
   */
  withChecker(SettingName: string, func: SettingItemOptionsChecker): SettingItemsManager {
    console.info('Launcher SettingItemsManager withChecker SettingName is ' + SettingName);
    this.settingName2CheckerFuncMap[SettingName] = func;
    return this;
  }

  /**
   * 获取所有设置项信息
   *
   * @params deviceType 设备类型
   * @params condition 当前的设置条件
   * @return 设置项列表
   */
  get(deviceType: number, condition: number): SettingItemInfo[] {
    const settingsList: SettingItemInfo[] = [];
    for (const key in SettingItemsConfig.sSettingsMap) {
      if (!SettingItemsConfig.sSettingsMap[key].isShowOptions) {
        continue;
      }
      if (((SettingItemsConfig.sSettingsMap[key].deviceType & deviceType) != 0 &&
      (SettingItemsConfig.sSettingsMap[key].condition & condition) != 0)) {
        const settingItem = new SettingItemInfo();
        settingItem.ida = SettingItemsConfig.sSettingsMap[key].index;
        settingItem.settingName = SettingItemsConfig.sSettingsMap[key].description;
        settingItem.settingType = SettingItemsConfig.sSettingsMap[key].settingType;
        const checker = this.settingName2CheckerFuncMap[key];
        const selectedOptionName = checker != undefined ? checker() : '';
        const optionList = SettingItemsConfig.sSettingsMap[key].optionList;
        if (optionList == undefined) {
          settingsList.push(settingItem);
          continue;
        }
        for (let i = 0; i < optionList.length; i++) {
          const option = new SettingItemOption();
          option.name = optionList[i].name;
          option.value = optionList[i].name;

          if (optionList[i].name == selectedOptionName) {
            settingItem.settingValue = optionList[i].name;
            option.checked = true;
          } else {
            option.checked = false;
          }
          settingItem.valueList.push(option);
        }
        settingsList.push(settingItem);
      }
    }

    return settingsList;
  }

  private getGridLayoutIdx(gridLayout: string, optionList: any): number {
    for (let i = 0; i < optionList.length; i++) {
      if (gridLayout == optionList[i].name) {
        return i;
      }
    }

    return SettingItemsManager.INVALID_INDEX;
  }

  /**
   * grid layout设置值转换为索引值，例如4X4返回0
   *
   * @params gridLayout 例如4X4
   * @return 设置选项在列表中的索引值
   */
  gridLayoutValue2Idx(gridLayout: string): number {
    const phoneOptionList = SettingItemsConfig.sSettingsMap[SettingItemsConfig.SETTING_ITEM_PHONE_GRID_LAYOUT_OPTIONS].optionList;
    const padOptionList = SettingItemsConfig.sSettingsMap[SettingItemsConfig.SETTING_ITEM_PAD_GRID_LAYOUT_OPTIONS].optionList;

    const idxPhone = this.getGridLayoutIdx(gridLayout, phoneOptionList);
    if (idxPhone != SettingItemsManager.INVALID_INDEX) {
      return idxPhone;
    }

    const idxPad = this.getGridLayoutIdx(gridLayout, padOptionList);
    if (idxPad != SettingItemsManager.INVALID_INDEX) {
      return idxPad;
    }

    return 0;
  }
}