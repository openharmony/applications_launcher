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

/**
 * A page element that display app name in ListView.
 */
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
        this.$watch('itemBundleName','appNameWatcher');
        mResourceManager = this.$app.$def.data.resourceManager;
        mResourceManager.getAppName(this.itemLabelId, this.itemBundleName, this.itemAppName, this.appNameLoadCallback);
    },

    /**
     * Watch the value of appName, called when the value changed.
     *
     * @param {object} newV - New value of appName
     * @param {object} oldV - Old value of appName
     */
    appNameWatcher(newV, oldV) {
        if (newV != null && newV != undefined) {
            mResourceManager.getAppName(this.itemLabelId, this.itemBundleName, this.itemAppName, this.appNameLoadCallback);
        }
    },

    /**
     * Callback function when appName loaded from the resource manager.
     *
     * @param {string} name - App name.
     */
    appNameLoadCallback(name) {
        this.appName = name;
    },

    /**
     * Reload the app name from resource manager.
     */
    updateName() {
        console.info("Launcher AppName updateName in bundleName = " + this.itemBundleName);
        mResourceManager.getAppName(this.itemLabelId, this.itemBundleName, this.itemAppName, this.appNameLoadCallback);
    }
}