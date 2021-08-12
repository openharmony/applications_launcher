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

import Resmgr from '@ohos.resourceManager';

/**
 * A manager class provide app icon and name from cache or system API.
 */
export default class ResourceManager {
    constructor() {
    }

    /**
     * Get icon image of specific app.
     *
     * @param {string} path - path of target file
     * @param {string} bundleName - bundle name of the app
     * @param {object} callback - callback method
     */
    getAppIcon(path, bundleName, callback, defaultIconUrl) {
        console.info("Launcher recents  ResourceManager getAppIcon start path = " + path + " bundleName = " + bundleName);
        if (path == null || path == undefined || path == "") {
            console.info("Launcher recents  ResourceManager defaultIcon callback ");
            callback(defaultIconUrl)
        } else {
            console.info("Launcher recents  ResourceManager Resmgr.getResourceManager called");
            Resmgr.getResourceManager(bundleName).then(item => {
                console.info("Launcher recents  ResourceManager item.getMediaBase64 called");
                item.getMediaBase64(path, (error, value) => {
                    console.info("Launcher recents  ResourceManager item.getMediaBase64 callback value = " + value);
                    if (value != null) {
                        callback(value);
                    }
                });
            }).catch(error =>
                console.error("Launcher recents ResourceManager getAppIcon promise::catch : " + JSON.stringify(error))
            );
        }
        console.info("Launcher recents  ResourceManager getAppIcon end");
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
        console.info("Launcher recents ResourceManager getAppName start labelId = " + labelId
        + " bundleName = " + bundleName + " appName = " + appName);
        if (labelId <= 0) {
            callback(appName);
        } else {
            console.info("Launcher recents  ResourceManager Resmgr.getResourceManager ");
            Resmgr.getResourceManager(bundleName).then(item => {
                console.info("Launcher recents  ResourceManager item.getString " + JSON.stringify(item));
                item.getString(labelId, (error, value) => {
                    if (value != null) {
                        console.info("Launcher recents ResourceManager item.getString callback value = " + value);
                        callback(value);
                    }
                });
            }).catch(error =>
                console.error("Launcher recents ResourceManager getAppName promise::catch : " + JSON.stringify(error))
            );
        }
    }
}