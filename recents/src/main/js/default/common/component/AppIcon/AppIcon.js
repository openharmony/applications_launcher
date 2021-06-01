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

import ResourceManager from '../../model/ResourceManager.js';

var mResourceManager;

export default {
    props: ['itemAppId', 'itemAppIcon', 'itemBundleName'],
    data() {
        return {
            bundleName: this.itemBundleName,
            appId: this.itemAppId,
            appIcon: ""
        };
    },
    onInit() {
        console.info("Launcher recents  AppIcon onInit start")
        this.$watch('itemAppIcon', 'appIconWatcher');
        mResourceManager = new ResourceManager();
        mResourceManager.getAppIcon(this.itemAppIcon, this.itemBundleName, this.iconLoadCallback);
        console.info("Launcher recents  AppIcon onInit end")
    },
    onShow() {

    },
    appIconWatcher(newV, oldV) {
        if (newV != null && newV != undefined) {
            mResourceManager.getAppIcon(this.itemAppIcon, this.itemBundleName, this.iconLoadCallback);
        }
    },
    iconLoadCallback(image) {
        this.appIcon = image;
    }
}