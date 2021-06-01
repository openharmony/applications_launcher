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

import resmgr from '@ohos.resmgr';

const DEFAULT_ICON_URL = 'common/pics/icon_default.png';

export default class ResourceManager {
    ResourceManager() {
    }

    getAppIcon(path, bundleName, callback) {
        console.info("Launcher recents  ResourceManager getAppIcon start path = " + path + " bundleName = " + bundleName);
        if (path == null || path == undefined || path == "") {
            console.info("Launcher recents  ResourceManager defaultIcon callback ");
            callback(DEFAULT_ICON_URL)
        } else {
            console.info("Launcher recents  ResourceManager resmgr.getResourceManager called");
            resmgr.getResourceManager(bundleName).then(item => {
                console.info("Launcher recents  ResourceManager item.getMediaBase64 called");
                item.getMediaBase64(path, (error, value) => {
                    console.info("Launcher recents  ResourceManager item.getMediaBase64 callback value = " + value);
                    if (value != null) {
                        callback(value);
                    }
                });
            });
        }
        console.info("Launcher recents  ResourceManager getAppIcon end");
    }

    getAppName(labelId, bundleName, appName, callback) {
        console.info("Launcher recents  ResourceManager getAppName start labelId = " + labelId
        + " bundleName = " + bundleName + " appName = " + appName);
        if (labelId <= 0) {
            callback(appName);
        } else {
            console.info("Launcher recents  ResourceManager resmgr.getResourceManager ");
            resmgr.getResourceManager(bundleName).then(item => {
                console.info("Launcher recents  ResourceManager item.getString " + JSON.stringify(item));
                item.getString(labelId, (error, value) => {
                    if (value != null) {
                        console.info("Launcher recents  ResourceManager item.getString callback value = " + value);
                        callback(value);
                    }
                });
            });
        }
    }
}