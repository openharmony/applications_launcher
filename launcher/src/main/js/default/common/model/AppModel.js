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

import bundle_mgr from '@ohos.bundle_mgr';
import feature_ability from '@ohos.feature_ability';
import Subscriber from '@ohos.commonevent';
import SystemApplication from '../../common/configs/SystemApplication.js';

var mBundleInfoList = [];
var mGridBootAppList = [];
const DEFAULT_ICON_URL = 'common/pics/icon_default.png';
var mAppUninstallListener = null;
var mAppInstallListeners = [];
var gridListCallback;
var systemApplicationName = SystemApplication.SystemApplicationName;
var mCommonEventSubscriber = null;
var mCommonEventSubscribeInfo = {
    events: ["usual.event.PACKAGE_ADDED", "usual.event.PACKAGE_CHANGED", "usual.event.PACKAGE_REMOVED"]
};

export default class AppModel {
    getAppList(callback) {
        mBundleInfoList = [];
        console.info('Launcher getAppIcon getAppList');
        bundle_mgr.getApplicationInfos().then((data) => {
            console.info('Launcher getApplicationInfos >' + JSON.stringify(data));
            for (var i = 0; i < data.length; i++) {
                if (systemApplicationName.indexOf(data[i].bundleName) > -1) {
                } else {
                    mBundleInfoList.push(
                        {
                            System: data[i].isSystemApp,
                            AppName: data[i].label,
                            AppId: data[i].name,
                            AppIcon: data[i].iconId,
                            bundleName: data[i].bundleName,
                            labelId: data[i].labelId,
                        }
                    )
                }
            }
            let appArrayLength = mBundleInfoList.length;
            for (let i = 0; i < appArrayLength; i++) {
                var iconUrl = mBundleInfoList[i].AppIcon;
                if (iconUrl == null || iconUrl == "" || iconUrl == "undefined") {
                    mBundleInfoList[i].AppIcon = DEFAULT_ICON_URL;
                }
            }
            console.info('Launcher mBundleInfoList' + JSON.stringify(mBundleInfoList));
            callback(mBundleInfoList);
        });
    }

    installApp() {
    }

    uninstallApp(appId, callback) {
        console.info('Launcher uninstallApp appId' + appId);
        var result = bundle_mgr.uninstall(appId).then((data) => {
            console.info("Launcher uninstall data [" + data + "]");
            callback(true);
        }).catch(error =>
        console.info("Launcher uninstall err " + error));
    }

    getGridBootAppList() {
        return mGridBootAppList;
    }

    getGridPagesAppList(callback) {
        gridListCallback = callback;
        this.getAppList(this.getGridlist.bind(this));
    }

    getGridlist(list) {
        gridListCallback(this.dealList(list));
    }

    dealList(appList) {
        var gridPagesList = [];
        var bootListLength = mGridBootAppList.length;
        var appArrayLength = appList.length;
        for (var i = 0; i < appArrayLength; i++) {
            gridPagesList.push(appList[i]);
            for (var j = 0; j < bootListLength; j++) {
                if (appList[i].AppName === mGridBootAppList[j].AppName) {
                    gridPagesList.pop();
                }
            }
        }
        return gridPagesList;
    }

    openApplication(bundleName) {
        this.getAbilityName(bundleName, this.startApplication)
    }

    getAbilityName(bundleName, callback) {
        console.info('Launcher getAbilityName bundleName' + bundleName);
        bundle_mgr.getBundleInfo(bundleName).then(data => {
            console.info('Launcher getBundleInfo ' + data);
            callback(data.abilityInfos[0].name, bundleName);
        });
    }

    startApplication(abilityname, bundleName) {
        let paramBundleName = bundleName;
        let paramAbilityname = abilityname;
        // promise
        console.info('Launcher startApplication abilityname' + abilityname);
        var result = feature_ability.startAbility({
            bundleName: paramBundleName,
            abilityName: paramAbilityname,
            requestCode: 1,
            abilityType: "PageAbility",
            want: {
                action: "action1",
                entities: ["entity1"],
                type: "PageAbility",
                flags: 2,
                elementName: {
                    deviceId: "deviceId",
                    bundleName: paramBundleName,
                    abilityName: paramAbilityname,
                },
            },
            syncOption: 1,
        }).then(data =>
        console.info("Launcher promise::then : " + JSON.stringify(data))
        ).catch(error =>
        console.info("Launcher promise::catch : " + JSON.stringify(error))
        );
        console.info("Launcher AceApplication : startAbility : " + result);
    }

    reportAppInstallEvent() {
        console.info("Launcher AppModel reportAppInstallEvent");
        for (let i = 0; i < mAppInstallListeners.length; i++) {
            let listener = mAppInstallListeners[i];
            if (listener != undefined && listener != null) {
                listener();
            }
        }
    }

    reportAppUninstallEvent(appId) {
        if (mAppUninstallListener != null) {
            mAppUninstallListener(appId);
        }
    }

    registerAppUninstallListener(listener) {
        mAppUninstallListener = listener;
    }

    registerAppInstallListener(listener) {
        console.info("Launcher AppModel registerAppInstallListener");
        if (mAppInstallListeners.indexOf(listener) == -1) {
            mAppInstallListeners.push(listener);
        }
        Subscriber.createSubscriber(
            mCommonEventSubscribeInfo,
            this.createInstallationSubscriberCallBack.bind(this)
        );
    }

    unregisterAppInstallListener(listener) {
        Subscriber.unsubscribe(mCommonEventSubscriber, () => {
            console.info("Launcher AppModel unsubscribe app install listener");
            let index = mAppInstallListeners.indexOf(listener);
            if (index != -1) {
                mAppInstallListeners.splice(index, 1);
            }
        });
    }

    createInstallationSubscriberCallBack(err, data) {
        console.info("Launcher AppModel createInstallationSubscriberCallBack");
        mCommonEventSubscriber = data;
        Subscriber.subscribe(mCommonEventSubscriber, this.installationSubscriberCallBack.bind(this));
    }

    installationSubscriberCallBack(err, data) {
        console.info("Launcher AppModel installationSubscriberCallBack");
        this.reportAppInstallEvent();
    }
}