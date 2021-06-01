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
        if (path == null || path == undefined || path == "" || path <= 0) {
            console.info('Launcher getAppIcon iconid > ' + DEFAULT_ICON_URL);
            callback(DEFAULT_ICON_URL);
        } else {
            resmgr.getResourceManager(bundleName).then(item => {
                console.info('Launcher getResourceManager data>' + item);
                item.getMediaBase64(path, (error, value) => {
                    console.info('Launcher getMediaBase64 value>' + value);
                    if (value != null) {
                        callback(value);
                    }
                });
            });
        }
    }

    getAppName(labelId, bundleName, appName, callback) {
        if (labelId == null || labelId == undefined || labelId == "" || labelId <= 0) {
            console.info('Launcher getAppName callback ' + appName);
            callback(appName);
        } else {
            resmgr.getResourceManager(bundleName).then(item => {
                console.info('Launcher getResourceManager labelId' + labelId);
                item.getString(labelId, (error, value) => {
                    console.info('Launcher getString value>' + value);
                    if (value != null) {
                        callback(value);
                    }
                });
            });
        }
    }
}