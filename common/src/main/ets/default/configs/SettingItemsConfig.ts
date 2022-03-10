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

/**
 * 设置项配置类，只读
 */
export default class SettingItemsConfig {
  /**
   * 设置项名称：布局选项：grid or list
   */
  static readonly SETTING_ITEM_LAYOUT_OPTIONS = 'LayoutOptions';

  /**
   * 设置项名称：phone grid布局选项：例如4X4
   */
  static readonly SETTING_ITEM_PHONE_GRID_LAYOUT_OPTIONS = 'PhoneGridLayOutOptions';

  /**
   * 设置项名称：pad grid布局选项：例如5X11
   */
  static readonly SETTING_ITEM_PAD_GRID_LAYOUT_OPTIONS = 'PadGridLayOutOptions';

  /**
   * 设置项索引：布局设置
   */
  static readonly SETTINGS_INDEX_LAYOUT: number = 0;

  /**
   * 设置项索引：grid布局设置
   */
  static readonly SETTINGS_INDEX_GRID_LAYOUT: number = 1;

  /**
   * 适用设备：所有设备都不支持
   */
  static readonly DEVICE_TYPE_NULL: number = 0;

  /**
   * 适用设备：phone支持
   */
  static readonly DEVICE_TYPE_PHONE: number = 1;

  /**
   * 适用设备：pad支持
   */
  static readonly DEVICE_TYPE_PAD: number = 1 << 1;

  /**
   * 适用条件：无限制条件
   */
  static readonly CONDITION_ALL: number = 0xffffffff;

  /**
   * 适用条件：当前是list布局时有效
   */
  static readonly CONDITION_LIST_LAYOUT_ENABLE: number = 1;

  /**
   * 适用条件：当前是grid布局时有效
   */
  static readonly CONDITION_GRID_LAYOUT_ENABLE: number = 1 << 1;

  /**
   * 设置类型：单选框
   */
  static readonly SETTING_TYPE_RADIO = 1;

  /**
   * 设置类型：开关
   */
  static readonly SETTING_TYPE_SWITCH = 2;

  /**
   * hide options
   */
  static readonly HIDE_OPTIONS: boolean = false;

  /**
   * show options
   */
  static readonly SHOW_OPTIONS: boolean = true;

  /**
   * 设置项配置信息map
   */
  static readonly sSettingsMap = {
    // LayoutOptions
    'LayoutOptions': {
      index: SettingItemsConfig.SETTINGS_INDEX_LAYOUT,
      description: $r('app.string.layout_style'),
      settingType: SettingItemsConfig.SETTING_TYPE_RADIO,
      deviceType: SettingItemsConfig.DEVICE_TYPE_PHONE,
      condition: SettingItemsConfig.CONDITION_ALL,
      optionList: [
        { name: 'List'},
        { name: 'Grid'}
      ],
      isShowOptions: SettingItemsConfig.HIDE_OPTIONS
    },

    // PhoneGridLayOutOptions
    'PhoneGridLayOutOptions': {
      index: SettingItemsConfig.SETTINGS_INDEX_GRID_LAYOUT,
      description: $r('app.string.launcher_layout'),
      settingType: SettingItemsConfig.SETTING_TYPE_RADIO,
      deviceType: SettingItemsConfig.DEVICE_TYPE_PHONE,
      condition: SettingItemsConfig.CONDITION_GRID_LAYOUT_ENABLE,
      optionList: [
        { name: '4X4', params:{row:4, column:4}},
        { name: '5X4', params:{row:5, column:4}},
        { name: '6X4', params:{row:6, column:4}}
      ],
      isShowOptions: SettingItemsConfig.HIDE_OPTIONS
    },

    // PadGridLayOutOptions
    'PadGridLayOutOptions': {
      index: SettingItemsConfig.SETTINGS_INDEX_GRID_LAYOUT,
      description: $r('app.string.launcher_layout'),
      settingType: SettingItemsConfig.SETTING_TYPE_RADIO,
      deviceType: SettingItemsConfig.DEVICE_TYPE_PAD,
      condition: SettingItemsConfig.CONDITION_GRID_LAYOUT_ENABLE,
      optionList: [
        { name: '5X11', params:{row:5, column:11}},
        { name: '4X10', params:{row:4, column:10}},
        { name: '4X9', params:{row:4, column:9}}
      ],
      isShowOptions: SettingItemsConfig.HIDE_OPTIONS
    },

    // PhoneGestureNavigationOptions
    'PhoneGestureNavigationOptions': {
      index: 2,
      description: $r('app.string.gesture_navigation_options'),
      settingType: SettingItemsConfig.SETTING_TYPE_SWITCH,
      deviceType: SettingItemsConfig.DEVICE_TYPE_PHONE,
      condition: SettingItemsConfig.CONDITION_GRID_LAYOUT_ENABLE,
      isShowOptions: SettingItemsConfig.SHOW_OPTIONS
    },

    // PadGestureNavigationOptions
    'PadGestureNavigationOptions': {
      index: 2,
      description: $r('app.string.gesture_navigation_options'),
      settingType: SettingItemsConfig.SETTING_TYPE_SWITCH,
      deviceType: SettingItemsConfig.DEVICE_TYPE_PAD,
      condition: SettingItemsConfig.CONDITION_GRID_LAYOUT_ENABLE,
      isShowOptions: SettingItemsConfig.SHOW_OPTIONS
    },
  };
}