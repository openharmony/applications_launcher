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

import RouterUtil from '../../../common/utils/RouterUtil.js';

const JUMPSETTING='pages/SettingsView/SettingsView';
var viewCallback;
var uninstallCallback;

export default class BaseAppPresenter {
    constructor(AppModel) {
        this.appModel = AppModel;
    }

    getAppList(callback) {
        viewCallback = callback;
        this.appModel.getAppList(this.getListCallback.bind(this));
    }

    getListCallback(list) {
        let callbacklist = list.sort(
            function compareFunction(param1, param2) {
                return param1.AppName.localeCompare(param2.AppName, "zh");
            }
        );

        viewCallback(callbacklist);
    }

    uninstallApp(uninstallAppName, ifSystem, callback) {
        uninstallCallback = callback;
        if (ifSystem == true) {
            callback(false);
        } else {
            this.appModel.uninstallApp(uninstallAppName, this.uninstallAppCallback.bind(this));
        }
    }

    uninstallAppCallback(callback) {
        uninstallCallback(callback);
    }

    jumpTo(bundleName) {
        this.appModel.openApplication(bundleName);
    }

    jumpToSetting() {
        RouterUtil.push(JUMPSETTING);
    }

    back() {
        RouterUtil.back();
    }

    clearRouter() {
        RouterUtil.clear();
    }

    registerAppUninstallListener(listener) {
        this.appModel.registerAppUninstallListener(listener);
    }

    registerAppInstallListener(listener) {
        console.info("Launcher BaseAppPresenter registerAppInstallListener start");
        this.appModel.registerAppInstallListener(listener);
    }

    unregisterAppInstallListener(listener) {
        this.appModel.unregisterAppInstallListener(listener);
    }
}