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

import Resmgr from '@ohos.resmgr';
import AppResourceCacheManager from '../cache/AppResourceCacheManager.js'
import CheckEmptyUtils from '../../common/utils/CheckEmptyUtils.js';

const KEY_ICON = "icon";
const KEY_NAME = "name";

/**
 * A manager class provide app icon and name from cache or system API.
 */
export default class ResourceManager {
    #appResourceCacheManager;
    constructor() {
        this.#appResourceCacheManager = new AppResourceCacheManager();
    }

    /**
     * Get icon image of specific app.
     *
     * @param {string} path - path of target file
     * @param {string} bundleName - bundle name of the app
     * @param {object} callback - callback method
     */
    getAppIcon(path, bundleName, callback, defaultAppIcon) {
        if (path == null || path == undefined || path == "" || path <= 0) {
            console.info('Launcher ResourceManager getAppIcon iconId > ' + defaultAppIcon);
            callback(defaultAppIcon);
        } else {
            let iconBase64 = this.#appResourceCacheManager.getCache(bundleName, KEY_ICON);
            if (iconBase64 == undefined || iconBase64 == null || iconBase64 == '') {
                Resmgr.getResourceManager(bundleName).then(item => {
                    if (CheckEmptyUtils.isEmpty(item)) {
                        console.error("Launcher ResourceManager getAppIcon getResourceManager ERROR! item is empty");
                    }
                    console.info('Launcher ResourceManager getAppIcon  data>' + item);
                    item.getMediaBase64(path, (error, value) => {
                        console.info('Launcher ResourceManager getAppIcon getMediaBase64 value>' + value);
                        if (value != null) {
                            this.#appResourceCacheManager.setCache(bundleName, KEY_ICON, value);
                            callback(value);
                        }
                    });
                }).catch(e => {
                    console.error("Launcher ResourceManager getAppIcon error ")
                    callback(defaultAppIcon);
                });
            } else {
                callback(iconBase64);
            }
        }
    }

    /**
     * Get app name of specific app.
     *
     * @param {string} labelId - label id of target app
     * @param {string} bundleName - bundle name of the app
     * @param {string} appName - app name
     * @param {object} callback - callback method
     */
    getAppName(labelId, bundleName, appName, callback) {
        if (labelId == null || labelId == undefined || labelId == "" || labelId <= 0) {
            console.info('Launcher ResourceManager getAppName callback ' + appName);
            this.#appResourceCacheManager.setCache(bundleName, KEY_NAME, appName);
            callback(appName);
        } else {
            let name = this.#appResourceCacheManager.getCache(bundleName, KEY_NAME);
            if (name == undefined || name == null || name == '') {
                Resmgr.getResourceManager(bundleName).then(item => {
                    console.info('Launcher ResourceManager getAppName getResourceManager labelId' + labelId);
                    item.getString(labelId, (error, value) => {
                        if (CheckEmptyUtils.checkStrIsEmpty(value)) {
                            console.error("Launcher AppModel getAppName getString ERROR! value is empty");
                        }
                        console.info('Launcher ResourceManager getAppName  getString value>' + value);
                        if (value != null) {
                            this.#appResourceCacheManager.setCache(bundleName, KEY_NAME, value);
                            callback(value);
                        }
                    });
                }).catch(e => {
                    console.error("Launcher ResourceManager getAppName error ")
                    callback(appName);
                });
            } else {
                callback(name);
            }
        }
    }

    /**
     * Get app resource cache.
     *
     * @param {string} bundleName - bundleName of target file
     * @param {string} key - key of the cache
     */
    getAppResourceCache(bundleName, key) {
        return this.#appResourceCacheManager.getCache(bundleName, key);
    }

    /**
     * Clear resource cache
     */
    clearCache() {
        this.#appResourceCacheManager.clearCache();
    }
}