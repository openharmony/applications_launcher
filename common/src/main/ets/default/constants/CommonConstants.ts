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
 * Common constants for all features.
 */
export default class CommonConstants {
  /**
   * Bundle name of launcher
   */
  static LAUNCHER_BUNDLE = 'com.ohos.launcher';

  /**
   * Ability name of AppCenter.
   */
  static APPCENTER_ABILITY = 'com.ohos.launcher.appcenter.MainAbility';

  /**
   * Ability name of launcher settings.
   */
  static SETTING_ABILITY = 'com.ohos.launcher.settings.MainAbility';

  /**
   * Ability name of launcher Recents.
   */
  static RECENT_ABILITY = 'com.ohos.launcher.recents.MainAbility';

  /**
   * Launcher Ability name.
   */
  static LAUNCHER_ABILITY = 'com.ohos.launcher.MainAbility';

  /**
   * Default invalid value.
   */
  static INVALID_VALUE = -1;

  /**
   * folder min app count
   */
  static FOLDER_APP_VALUE = 1;

  /**
   * Status code if uninstal successed.
   */
  static UNINSTALL_SUCCESS = 0;

  /**
   * Status code if uninstall is forbidden.
   */
  static UNINSTALL_FORBID = 1;

  /**
   * Grid item type for apps.
   */
  static TYPE_APP = 0;

  /**
   * Grid item type for cards.
   */
  static TYPE_CARD = 1;

  /**
   * Grid item type for functions.
   */
  static TYPE_FUNCTION = 2;

  /**
   * folder type in desktop
   */
  static TYPE_FOLDER = 3;

  /**
   * add icon type in opening folder
   */
  static TYPE_ADD = 4;

  /**
   * Card dimension constants for 1 row 2 columns.
   */
  static CARD_DIMENSION_1x2 = 1;

  /**
   * Card dimension constants for 2 rows 2 columns.
   */
  static CARD_DIMENSION_2x2 = 2;

  /**
   * Card dimension constants for 2 rows 4 columns.
   */
  static CARD_DIMENSION_2x4 = 3;

  /**
   * Card dimension constants for 4 rows 4 columns.
   */
  static CARD_DIMENSION_4x4 = 4;

  /**
   * 通用级布局配置
   */
  static LAYOUT_CONFIG_LEVEL_COMMON = 'common';

  /**
   * 特性级布局配置
   */
  static LAYOUT_CONFIG_LEVEL_FEATURE = 'feature';

  /**
   * 产品级布局配置
   */
  static LAYOUT_CONFIG_LEVEL_PRODUCT = 'product';

  /**
   * 布局模式配置
   */
  static LAYOUT_CONFIG_TYPE_MODE = 0;

  /**
   * 布局样式配置
   */
  static LAYOUT_CONFIG_TYPE_STYLE = 1;

  /**
   * 功能布局配置
   */
  static LAYOUT_CONFIG_TYPE_FUNCTION = 2;

  /**
   * 默认设备类型
   */
  static DEFAULT_DEVICE_TYPE = 'phone';

  /**
   * pad设备类型
   */
  static PAD_DEVICE_TYPE = 'pad';

  /**
   * 不显示状态
   */
  static OVERLAY_TYPE_HIDE = -1;

  /**
   * Overlay模糊半径
   */
  static OVERLAY_BLUR_RADIUS = 20;

  /**
   * 应用菜单类型Overlay
   */
  static OVERLAY_TYPE_APP_MENU = 0;

  /**
   * 应用图标类型Overlay
   */
  static OVERLAY_TYPE_APP_ICON = 1;

  /**
   * 文件夹类型Overlay
   */
  static OVERLAY_TYPE_FOLDER = 2;

  /**
   * form card Overlay
   */
  static OVERLAY_TYPE_CARD = 3;

  /**
   * 固定菜单类型
   */
  static MENU_TYPE_FIXED = 0;

  /**
   * 动态菜单类型
   */
  static MENU_TYPE_DYNAMIC = 1;

  /**
   * 浅色主题菜单
   */
  static MENU_UI_MODE_LIGHT = 0;

  /**
   * 深色主题菜单
   */
  static MENU_UI_MODE_DARK = 1;

  /**
   * 应用条目拖拽类型
   */
  static APP_TYPE_DRAG_ITEM = 0;

  /**
   * 按下操作事件
   */
  static TOUCH_TYPE_DOWN = 0;

  /**
   * 移动操作事件
   */
  static TOUCH_TYPE_MOVE = 2;

  /**
   * 抬起操作事件
   */
  static TOUCH_TYPE_UP = 1;

  /**
   * 系统面板整体高度
   */
  static SYSTEM_UI_HEIGHT = 88;

  /**
   * PAD系统面板整体高度
   */
  static PAD_SYSTEM_UI_HEIGHT = 200;

  /**
   * SystemUI_HEIGHT_3568
   */
  static PHONE_SYSTEM_UI_HEIGHT = 180;

  /**
   * pad smartdock height
   */
  static PAD_SMARTDOCK_HEIGHT = 88;

  /**
   * bottomBar height
   */
  static PHONE_BOTTOM_BAR_HEIGHT = 104;

  /**
   * FolderComponent max show length
   */
  static FOLDER_STATIC_SHOW_LENGTH = 11;

  /**
   * FolderComponent superpose app length
   */
  static FOLDER_STATIC_SUPERPOSEAPP_LENGTH = 3;

  /**
   * folder name max length
   */
  static FOLDER_NAME_MAX_LENGTH = 100;

  /**
   * hide badge
   */
  static BADGE_DISPLAY_HIDE = -1;

  /**
   * show badge
   */
  static BADGE_DISPLAY_SHOW = 1;

  /**
   * default user id
   */
  static DEFAULT_USER_ID = 0;

  /**
   * form config ability prefix
   */
  static FORM_CONFIG_ABILITY_PREFIX = 'ability://';

  /**
   * navigationbar status settingDataKey.
   */
  static NAVIGATION_BAR_STATUS_KEY = 'settings.display.navigationbar_status';

  /**
   * setting data ability uri
   */
  static SETTING_DATA_ABILITY_URI: string = 'dataability:///com.ohos.settingsdata.DataAbility';
}