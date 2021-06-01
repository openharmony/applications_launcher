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

import AppListPresenter from '../../presenter/app/AppListPresenter.js';
import prompt from '@system.prompt';

var mAppListPresenter;

const APP_INFO_REFRESH_DELAY = 500;

export default {
    data: {
        appList: [],
        uninstallAppId: null,
        uninstallAppName: null,
        ifSystem: true,
    },

    onInit() {
        mAppListPresenter = new AppListPresenter(this.$app.$def.data.appModel);
        mAppListPresenter.registerAppUninstallListener(this.onAppUninstallCallback);
        mAppListPresenter.registerAppInstallListener(this.onAppInstallCallback);
    },

    onShow() {
        mAppListPresenter.clearRouter();
        mAppListPresenter.getAppList(this.getListCallback.bind(this));
    },

    onDestory() {
        mAppListPresenter.unregisterAppInstallListener(this.onAppInstallCallback.bind(this));
    },

    getListCallback(list) {
        if (list == undefined || list == null) {
            this.appList = [];
            return;
        }
        this.appList = list;
    },

    openApplication(bundleName) {
        mAppListPresenter.jumpTo(bundleName);
    },

    longPress(appId, bundleName, System) {
        this.uninstallAppId = appId;
        this.uninstallAppName = bundleName;
        this.ifSystem = System;
        this.$element('chooseDialog').show();
    },

    toSetting() {
        mAppListPresenter.jumpToSetting();
    },

    chooseUninstall() {
        this.$element('simpleDialog').show();
    },

    chooseSettings() {
        this.$element('chooseDialog').close();
        mAppListPresenter.jumpToSetting();
    },

    cancelDialog(e) {
        this.$element('chooseDialog').close();
        prompt.showToast({
            message: 'Dialog cancelled'
        })
    },

    cancelSchedule(e) {
        this.$element('chooseDialog').close();
        this.$element('simpleDialog').close();
        prompt.showToast({
            message: this.$t('strings.cancelled')
        })
    },

    uninstallApplication(e) {
        this.$element('chooseDialog').close();
        this.$element('simpleDialog').close();
        if (this.uninstallAppName != null) {
            mAppListPresenter.uninstallApp(this.uninstallAppName,this.ifSystem,this.getUninstallApp.bind(this));
        }
    },

    getUninstallApp(callback) {
        var success = callback;
        if (!success) {
            prompt.showToast({
                message: this.$t('strings.prohibited')
            })
        } else if (success) {
            prompt.showToast({
                message: this.$t('strings.uninstall_succeeded')
            })
        }
    },

    onAppUninstallCallback(appId) {
    },

    onAppInstallCallback(appId) {
        console.info("Launcher AppListView onAppInstallCallback start");
        mAppListPresenter.getAppList(this.applicationInstallCallback.bind(this));
        console.info("Launcher AppListView onAppInstallCallback end");
    },

    updateAppInfos() {
        console.info("Launcher AppListView getListCallback setTimeout this.appList.length = " + this.appList.length);
        setTimeout(() => {
            for (let i = 0; i < this.appList.length; i++) {
                console.info("Launcher AppListView getListCallback setTimeout in i = " + i);
                this.$child('icon' + i).updateIcon();
                this.$child('name' + i).updateName();
            }
        }, APP_INFO_REFRESH_DELAY);
    },

    applicationInstallCallback(list) {
        console.info("Launcher AppListView applicationInstallCallback in ");
        if (list == undefined || list == null) {
            this.appList = [];
            return;
        }
        this.appList = list;
        this.initListFocus();
        this.updateAppInfos();
    }
}