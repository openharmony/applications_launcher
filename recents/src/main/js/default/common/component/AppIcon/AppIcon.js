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
        console.info("Launcher recents  AppIcon onInit start");
        mDefaultAppIcon = globalThis.$globalR('image.icon_default');
        mResourceManager = this.$app.$def.data.resourceManager;
        console.info("Launcher recents  AppIcon onInit end")
    },

    /**
     * Set image.
     *
     * @param {object} image - the image.
     */
    iconLoadCallback(image) {
        this.appIcon = image;
    },

    /**
     * Update icon.
     */
    updateIcon() {
        console.info("Launcher AppIcon updateIcon in bundleName = " + this.itemBundleName);
        mResourceManager.getAppIcon(this.itemAppIcon,this.itemBundleName,this.iconLoadCallback, mDefaultAppIcon);
    }
}