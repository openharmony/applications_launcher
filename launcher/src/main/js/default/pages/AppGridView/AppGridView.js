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

import AppGridPresenter from '../../presenter/app/AppGridPresenter.js';
import prompt from '@system.prompt';

var mAppGridPresenter;
const APP_INFO_REFRESH_DELAY = 500;

export default {
    data: {
        index: 0,
        uninstallAppName: "",
        uninstallAppId: "",
        uninstallSystem: "",
        appArray: [[[]]],
        bottomBar: [],
    },

    onInit() {
        console.info("Launcher AppGridView onInit");
        mAppGridPresenter = new AppGridPresenter(this.$app.$def.data.appModel, this.$app.$def.data.settingsModel);
        mAppGridPresenter.registerAppUninstallListener(this.onAppUninstallCallback.bind(this));
        mAppGridPresenter.registerAppInstallListener(this.onAppInstallCallback.bind(this));
    },

    onShow() {
        console.info("Launcher AppGridView onShow");
        mAppGridPresenter.clearRouter();
        this.index = mAppGridPresenter.getGridIndex();
        mAppGridPresenter.getGridList(this.getGridListCallback.bind(this));
        this.bottomBar = mAppGridPresenter.getBootAppList();
    },

    onDestory() {
        mAppGridPresenter.unregisterAppInstallListener(this.onAppInstallCallback.bind(this));
    },

    openApplication(bundleName) {
        mAppGridPresenter.jumpTo(bundleName);
    },

    longPress(appId, appName, system) {
        this.uninstallAppName = appName;
        this.uninstallAppId = appId;
        this.uninstallSystem = system;
        if (system == 0) {
            this.$element('simpleDialog').show()
        } else{
            prompt.showToast({
                message: this.$t('strings.prohibited')
            })
        }
    },

    intoSetting() {
         mAppGridPresenter.jumpToSetting();
    },

    cancelDialog(e) {
        prompt.showToast({
            message: 'Dialog cancelled'
        })
    },

    cancelSchedule(e) {
        this.$element('simpleDialog').close();
        prompt.showToast({
            message: this.$t('strings.cancelled')
        })
    },

    uninstallApplication(e) {
        this.$element('simpleDialog').close()
        mAppGridPresenter.uninstallApp(this.uninstallAppId);
        prompt.showToast({
            message: this.$t('strings.uninstall_succeeded')
        })
    },

    pageChange(e) {
        this.index = e.index;
        mAppGridPresenter.setGridIndex(e.index);
    },

    getGridListCallback(callbackDate) {
        this.appArray = callbackDate;
        console.info("Launcher AppGridView getGridListCallback this.appList.length = " + this.appArray.length);
    },

    onAppUninstallCallback(appId) {
        mAppGridPresenter.getGridList(this.getGridListCallback.bind(this));
    },

    onAppInstallCallback(appId) {
        console.info("Launcher AppGridView onAppInstallCallback start");
        mAppGridPresenter.getGridList(this.applicationInstallCallback.bind(this));
    },

    updateAppInfos() {
        setTimeout(() => {
            console.info("Launcher AppGridView getGridListCallback setTimeout this.appList.length = " + this.appArray.length);
            for (let i = 0; i < this.appArray.length; i++) {
                let page = this.appArray[i];
                console.info("Launcher AppGridView getGridListCallback setTimeout page = " + i);
                for (let j = 0; j < page.length; j++) {
                    let row = page[j];
                    console.info("Launcher AppGridView getGridListCallback setTimeout row = " + j);
                    for (let k = 0; k < row.length; k++) {
                        let element = row[k];
                        console.info("Launcher AppGridView getGridListCallback setTimeout in page = " + i + " row = " + j + " column = " + k);
                        this.$child('icon-' + element.bundleName).updateIcon();
                        this.$child('name-' + element.bundleName).updateName();
                    }
                }
            }
        }, APP_INFO_REFRESH_DELAY);
    },

    applicationInstallCallback(callbackData) {
        this.appArray = callbackData;
        console.info("Launcher AppGridView applicationIntallCallback this.appList.length = " + this.appArray.length);
        this.updateAppInfos();
    }
}