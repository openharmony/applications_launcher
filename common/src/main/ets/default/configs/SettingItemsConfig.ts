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

/**
 * Setting item configuration class, read-only
 */
export class SettingItemsConfig {
  /**
   * layout options: grid or list
   */
  static readonly SETTING_ITEM_LAYOUT_OPTIONS = 'LayoutOptions';

  /**
   * Setting options name
   */
  static readonly SETTING_ITEM_PHONE_GRID_LAYOUT_OPTIONS = 'PhoneGridLayOutOptions';

  /**
   * Setting options name
   */
  static readonly SETTING_ITEM_PAD_GRID_LAYOUT_OPTIONS = 'PadGridLayOutOptions';

  /**
   * Index: Layout settings
   */
  static readonly SETTINGS_INDEX_LAYOUT: number = 0;

  /**
   * Index: grid layout
   */
  static readonly SETTINGS_INDEX_GRID_LAYOUT: number = 1;

  /**
   * Applicable equipment: Not supported on all devices
   */
  static readonly DEVICE_TYPE_NULL: number = 0;

  /**
   * Applicable equipment: phone support
   */
  static readonly DEVICE_TYPE_PHONE: number = 1;

  /**
   * Applicable equipment: pad support
   */
  static readonly DEVICE_TYPE_PAD: number = 1 << 1;

  /**
   * Applicable conditions: no restrictions
   */
  static readonly CONDITION_ALL: number = 0xffffffff;

  /**
   * Applicable conditions: Valid for list layout
   */
  static readonly CONDITION_LIST_LAYOUT_ENABLE: number = 1;

  /**
   * Applicable conditions: Valid for grid layout
   */
  static readonly CONDITION_GRID_LAYOUT_ENABLE: number = 1 << 1;

  /**
   * setting type: Single box
   */
  static readonly SETTING_TYPE_RADIO = 1;

  /**
   * setting type: switch
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
   * setting options info
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