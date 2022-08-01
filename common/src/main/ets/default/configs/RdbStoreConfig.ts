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

const RdbStoreConfig = {
  DB_NAME: 'Launcher.db',
  DB_VERSION: 1,
  Badge: {
    TABLE_NAME: 'BADGE',
    CREATE_TABLE: 'CREATE TABLE IF NOT EXISTS BADGE ' +
    '(id INTEGER PRIMARY KEY AUTOINCREMENT, ' +
    'bundle_name TEXT UNIQUE, ' +
    'badge_number INTEGER, ' +
    'display INTEGER, ' +
    'user_id INTEGER)'
  },

  Form: {
    TABLE_NAME: 'FORM',
    CREATE_TABLE: 'CREATE TABLE IF NOT EXISTS FORM ' +
    '(id INTEGER PRIMARY KEY AUTOINCREMENT, ' +
    'card_id INTEGER, ' +
    'card_name TEXT, ' +
    'bundle_name TEXT, ' +
    'ability_name TEXT, ' +
    'module_name TEXT, ' +
    'config_ability TEXT, ' +
    'app_label_id INTEGER, ' +
    'dimension INTEGER)'
  },

  Settings: {
    TABLE_NAME: 'SETTINGS',
    CREATE_TABLE: 'CREATE TABLE IF NOT EXISTS SETTINGS ' +
    '(id INTEGER PRIMARY KEY AUTOINCREMENT, ' +
    'app_start_page_type TEXT, ' +
    'grid_config INTEGER, ' +
    'device_type TEXT, ' +
    'page_count INTEGER, ' +
    'row INTEGER, ' +
    'column INTEGER)'
  },

  SmartDock: {
    TABLE_NAME: 'SMARTDOCK',
    CREATE_TABLE: 'CREATE TABLE IF NOT EXISTS SMARTDOCK ' +
    '(id INTEGER PRIMARY KEY AUTOINCREMENT, ' +
    'item_type INTEGER, ' +
    'editable INTEGER, ' +
    'bundle_name TEXT, ' +
    'ability_name TEXT, ' +
    'module_name TEXT, ' +
    'app_icon_id INTEGER, ' +
    'app_label_id INTEGER, ' +
    'app_name TEXT, ' +
    'is_system_app INTEGER, ' +
    'is_uninstallAble INTEGER, ' +
    'key_name TEXT, ' +
    'install_time TEXT)'
  },

  DesktopApplicationInfo: {
    TABLE_NAME: 'DESKTOPAPPLICATIONINFO',
    CREATE_TABLE: 'CREATE TABLE IF NOT EXISTS DESKTOPAPPLICATIONINFO ' +
    '(id INTEGER PRIMARY KEY AUTOINCREMENT, ' +
    'app_name TEXT, ' +
    'is_system_app INTEGER, ' +
    'badge_number INTEGER, ' +
    'is_uninstallAble INTEGER, ' +
    'appIcon_id INTEGER, ' +
    'appLabel_id INTEGER, ' +
    'bundle_name TEXT, ' +
    'module_name TEXT, ' +
    'ability_name TEXT, ' +
    'key_name TEXT UNIQUE, ' +
    'install_time TEXT, ' +
    'extend1 TEXT, ' +
    'extend2 TEXT, ' +
    'extend3 INTEGER)'
  },

  GridLayoutInfo: {
    TABLE_NAME: 'GRIDLAYOUTINFO',
    CREATE_TABLE: 'CREATE TABLE IF NOT EXISTS GRIDLAYOUTINFO ' +
    '(id INTEGER PRIMARY KEY AUTOINCREMENT, ' +
    'card_id INTEGER, ' +
    'folder_id TEXT UNIQUE, ' +
    'container INTEGER, ' +
    'folder_name TEXT, ' +
    'badge_number INTEGER, ' +
    'type_id INTEGER, ' +
    'area TEXT, ' +
    'page INTEGER, ' +
    'column INTEGER, ' +
    'row INTEGER, ' +
    'app_name TEXT, ' +
    'is_system_app INTEGER, ' +
    'is_uninstallAble INTEGER, ' +
    'appIcon_id INTEGER, ' +
    'appLabel_id INTEGER, ' +
    'bundle_name TEXT, ' +
    'module_name TEXT, ' +
    'ability_name TEXT, ' +
    'key_name TEXT UNIQUE, ' +
    'install_time TEXT, ' +
    'extend1 TEXT, ' +
    'extend2 TEXT, ' +
    'extend3 INTEGER)'
  }
};

export default RdbStoreConfig;