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
let mDefaultAppIcon;

/**
 * A page element that display app icon.
 */
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
        this.$watch('itemBundleName','appIconWatcher');
        mDefaultAppIcon = globalThis.$globalR('image.icon_default');
        mResourceManager = this.$app.$def.data.resourceManager;
        mResourceManager.getAppIcon(this.itemAppIcon, this.itemBundleName, this.iconLoadCallback, mDefaultAppIcon);
    },

    /**
     * Watch the value of appIcon, called when the value changed.
     *
     * @param {object} newV - New value of appIcon
     * @param {object} oldV - Old value of appIcon
     */
    appIconWatcher(newV, oldV) {
        if (newV != null && newV != undefined) {
            mResourceManager.getAppIcon(this.itemAppIcon, this.itemBundleName, this.iconLoadCallback);
        }
    },

    /**
     * Callback function when appIcon loaded from the resource manager.
     *
     * @param {string} image - App icon base64.
     */
    iconLoadCallback(image) {
        this.appIcon = image;
    },

    /**
     * Reload the app icon base64 from resource manager.
     */
    updateIcon() {
        console.info("Launcher AppIcon updateIcon in bundleName = " + this.itemBundleName);
        mResourceManager.getAppIcon(this.itemAppIcon, this.itemBundleName, this.iconLoadCallback);
    }
}