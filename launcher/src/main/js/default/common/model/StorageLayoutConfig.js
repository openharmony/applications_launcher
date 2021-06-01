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

import ILayoutConfig from './ILayoutConfig.js';
import DefaultLayoutConfig from '../../common/configs/DefaultLayoutConfig.js';
import storage from '@ohos.data.storage';

const APP_PAGE_START_CONFIG = 'AppStartPageType';
const GRID_CONFIG = "GridConfig";
const RECENT_PROCESS_LIMIT = "RecentProcessLimit";
const PREFERENCES_PATH = '/data/accounts/account_0/appdata/com.ohos.launcher/sharedPreference/LauncherPreference';
var mPreferences = storage.getStorageSync(PREFERENCES_PATH);

export default class StorageLayoutConfig extends ILayoutConfig {
    constructor() {
        super();
    }

    loadAppPageStartConfig() {
        console.info('Launcher mPreferences get APP_PAGE_START_CONFIG');
        var data = mPreferences.getSync(APP_PAGE_START_CONFIG, DefaultLayoutConfig.DefaultAppPageStartConfig);
        console.info('Launcher mPreferences get' + data);
        return data;
    }

    saveAppPageStartConfig(type) {
        console.info('Launcher mPreferences put type' + type);
        mPreferences.putSync(APP_PAGE_START_CONFIG, type);
        mPreferences.flushSync();
        console.info('Launcher mPreferences put type flush');
    }

    loadGridConfig() {
        console.info('Launcher mPreferences get GRID_CONFIG');
        var data = mPreferences.getSync(GRID_CONFIG, DefaultLayoutConfig.DefaultGridConfig);
        console.info('Launcher mPreferences get' + data);
        return data;
    }

    saveGridConfig(id) {
        console.info('Launcher mPreferences put id' + id);
        mPreferences.putSync(GRID_CONFIG, id);
        mPreferences.flushSync();
        console.info('Launcher mPreferences put id flush');
    }

    loadRecentProcessLimit() {
        console.info('Launcher mPreferences get');
        var data = mPreferences.getSync(RECENT_PROCESS_LIMIT, DefaultLayoutConfig.DefaultRecentProcessLimit);
        console.info('Launcher mPreferences get' + data);
        return data;
    }

    saveRecentProcessLimit(num) {
        console.info('Launcher mPreferences put num' + num);
        mPreferences.putSync(RECENT_PROCESS_LIMIT, num);
        mPreferences.flushSync();
        console.info('Launcher mPreferences put num flush');
    }
}