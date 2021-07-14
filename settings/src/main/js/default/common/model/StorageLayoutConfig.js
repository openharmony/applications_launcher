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
import Storage from '@ohos.data.storage';

const APP_PAGE_START_CONFIG = 'AppStartPageType';
const GRID_CONFIG = "GridConfig";
const RECENT_PROCESS_LIMIT = "RecentProcessLimit";
const PREFERENCES_PATH = '/data/accounts/account_0/appdata/com.ohos.launcher/sharedPreference/LauncherPreference';

let mPreferences = Storage.getStorageSync(PREFERENCES_PATH);

/**
 * A class that stores layout information.
 * @extends ILayoutConfig
 */
export default class StorageLayoutConfig extends ILayoutConfig {
    
    constructor() {
        super();
    }

    /**
     * Load the launcher layout view type.
     *
     * @return {string} Layout view type , should one of 'Grid' or 'List' which is stored in LayoutConstants class.
     */
    loadAppPageStartConfig() {
        console.info('Launcher setttings StorageLayoutConfig loadAppPageStartConfig start');
        let data = mPreferences.getSync(APP_PAGE_START_CONFIG, DefaultLayoutConfig.DefaultAppPageStartConfig);
        console.info('Launcher setttings StorageLayoutConfig loadAppPageStartConfig mPreferences end' + data);
        return data;
    }

    /**
     * Save the launcher layout view type.
     *
     * @param {string} type - View type , should one of 'Grid' or 'List' which is stored in LayoutConstants class.
     */
    saveAppPageStartConfig(type) {
        console.info('Launcher settings StorageLayoutConfig saveAppPageStartConfig mPreferences put type ' + type);
        mPreferences.putSync(APP_PAGE_START_CONFIG, type);
        mPreferences.flushSync();
        console.info('Launcher settings StorageLayoutConfig saveAppPageStartConfig mPreferences put type flush');
    }

    /**
     * Load the launcher grid view layout config id.
     *
     * @return {number} id - Config id.
     */
    loadGridConfig() {
        console.info('Launcher settings StorageLayoutConfig loadGridConfig mPreferences get GRID_CONFIG');
        let data = mPreferences.getSync(GRID_CONFIG, DefaultLayoutConfig.DefaultGridConfig);
        console.info('Launcher settings StorageLayoutConfig loadGridConfig mPreferences get' + data);
        return data;
    }

    /**
     * Save the launcher grid view layout config id.
     *
     * @param {string} id - View type , should one of 'Grid' or 'List' which is stored in LayoutConstants class.
     */
    saveGridConfig(id) {
        console.info('Launcher settings StorageLayoutConfig saveGridConfig  mPreferences put id' + id);
        mPreferences.putSync(GRID_CONFIG, id);
        mPreferences.flushSync();
        console.info('Launcher settings StorageLayoutConfig saveGridConfig  mPreferences put id flush');
    }

    /**
     * Load the recent process max limit.
     *
     * @return {number} Recent process max limit.
     */
    loadRecentProcessLimit() {
        console.info('Launcher settings StorageLayoutConfig loadRecentProcessLimit  mPreferences get');
        let data = mPreferences.getSync(RECENT_PROCESS_LIMIT, DefaultLayoutConfig.DefaultRecentProcessLimit);
        console.info('Launcher settings StorageLayoutConfig loadRecentProcessLimit mPreferences get' + data);
        return data;
    }

    /**
     * Save the recent process max limit.
     *
     * @param {number} num - Recent process max limit.
     */
    saveRecentProcessLimit(num) {
        console.info('Launcher settings StorageLayoutConfig saveRecentProcessLimit mPreferences put num' + num);
        mPreferences.putSync(RECENT_PROCESS_LIMIT, num);
        mPreferences.flushSync();
        console.info('Launcher settings StorageLayoutConfig saveRecentProcessLimit mPreferences put num flush');
    }
}