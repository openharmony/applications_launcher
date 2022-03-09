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
  }
};

export default RdbStoreConfig;