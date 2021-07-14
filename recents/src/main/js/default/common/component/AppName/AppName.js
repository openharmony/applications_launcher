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

let mResourceManager;

export default {
    props: ['itemAppId', 'itemLabelId', 'itemBundleName', 'itemAppName'],
    data() {
        return {
            labelId: this.itemLabelId,
            bundleName: this.itemBundleName,
            appId: this.itemAppId,
            appName: ""
        };
    },
    onInit() {
        console.info("Launcher recents  AppName onInit start");
        mResourceManager = this.$app.$def.data.resourceManager;
        console.info("Launcher recents  AppName onInit end");
    },

    /**
     * Set app name.
     *
     * @param {string} name - the name of app.
     */
    iconLoadCallback(name) {
        this.appName = name;
    },

    /**
     * Update name.
     */
    updateName() {
        console.info("Launcher AppName updateName in bundleName = " + this.itemBundleName);
        mResourceManager.getAppName(this.itemLabelId,this.itemBundleName,this.itemAppName,this.iconLoadCallback);
    }
}