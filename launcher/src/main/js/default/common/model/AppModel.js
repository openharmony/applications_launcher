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

import BundleMgr from '@ohos.bundle';
import FeatureAbility from '@ohos.ability.featureability';
import Subscriber from '@ohos.commonevent';
import SystemApplication from '../../common/configs/SystemApplication.js';
import EventConstants from '../../common/constants/EventConstants.js';
import CheckEmptyUtils from '../../common/utils/CheckEmptyUtils.js';

const UNINSTALL_SUCCESS = "UNINSTALL_SUCCESS";
const UNINSTALL_FAILED = "UNINSTALL_FAILED";
const IF_GET_ABILITY = 1;

let mBundleInfoList = [];
let mAppListInstallListener = [];
let mAppListUninstallListener = [];
let mAppListChangeListener = [];
let mUninstallCallback;
let systemApplicationName = SystemApplication.SystemApplicationName;
let mCommonEventSubscriber = null;
let mCommonEventSubscribeInfo = {
    events: [EventConstants.EVENT_PACKAGE_ADDED,
        EventConstants.EVENT_PACKAGE_CHANGED,
        EventConstants.EVENT_PACKAGE_REMOVED]
};

/**
 * Model class, get data from system API.
 */
export default class AppModel {

    /**
     * Get app information list from system by @ohos.bundle
     *
     * @param {object} callback - callback from presenter
     */
    getAppList(callback) {
        mBundleInfoList = [];
        console.info('Launcher AppModel getAppIcon getAppList');
        BundleMgr.getBundleInfos(IF_GET_ABILITY).then((data) => {
            if (CheckEmptyUtils.isEmpty(data)) {
               console.error("Launcher AppModel getAppList getBundleInfos ERROR");
            }
            console.info('Launcher AppModel getBundleInfos >' + JSON.stringify(data));
            for (let i = 0; i < data.length; i++) {
                if (systemApplicationName.indexOf(data[i].name) > -1) {
                } else {
                    mBundleInfoList.push(
                        {
                            System:data[i].appInfo.systemApp,
                            AppName: data[i].appInfo.label,
                            AppId: data[i].appId,
                            AppIcon: data[i].appInfo.iconId,
                            bundleName:data[i].name,
                            labelId :data[i].appInfo.labelId,
                            abilityName: data[i].abilityInfos[0].name,
                        }
                    )
                }
            };
            let appArrayLength = mBundleInfoList.length;
            console.info('Launcher AppModel mBundleInfoList' + JSON.stringify(mBundleInfoList));
            callback(mBundleInfoList);
        });
    }

    installApp() {

    }

    /**
     * Uninstall app by @ohos.bundle.
     *
     * @param {string} uninstallBundleName - bundleName of the bundle that will be uninstall
     * @param {object} callback - callback from presenter
     */
    uninstallApp(uninstallBundleName, callback) {
        console.info('Launcher AppModel uninstallApp appId' + uninstallBundleName);
        mUninstallCallback = callback;
        let result = BundleMgr.getBundleInstaller().then((data) => {
            if (CheckEmptyUtils.isEmpty(data)) {
                console.error("Launcher AppModel uninstallApp getBundleInstaller ERROR");
            }
            data.uninstall(uninstallBundleName, {
                param: {
                    userId: 0,
                    isKeepData: false
                }
            }, this.#uninstallCallback);
        }).catch(error =>
        console.info("Launcher AppModel uninstall err " + error));
    }

    /**
     * Callback method after uninstall.
     *
     * @param {object} data - uninstall result data
     */
    #uninstallCallback = (err, data) => {
        console.info('Launcher AppModel uninstallCallback ' + JSON.stringify(data));
        if (data.statusMessage == "SUCCESS") {
            mUninstallCallback(UNINSTALL_SUCCESS);
        } else {
            mUninstallCallback(UNINSTALL_FAILED);
        }
        console.info('Launcher AppModel uninstallCallback ');
    }

    /**
     * Start app by bundle name and ability name.
     *
     * @param {string} abilityName - ability name of target app
     * @param {string} bundleName - bundle name of target app
     */
    startApplication(abilityName, bundleName) {
        let paramBundleName = bundleName;
        let paramAbilityName = abilityName;
        // promise
        console.info('Launcher AppModel startApplication abilityName ==> ' + abilityName + " bundleName ==> " + bundleName);
        let result = FeatureAbility.startAbility({
            want: {
                bundleName: paramBundleName,
                abilityName: paramAbilityName
            }
        }).then(data =>
            console.info("Launcher AppModel startApplication promise::then : " + JSON.stringify(data))
        ).catch(error =>
            console.info("Launcher AppModel startApplication promise::catch : " + JSON.stringify(error))
        );
        console.info("Launcher AppModel startApplication  AceApplication : startAbility : " + result);
    }

    /**
     * Start app by bundle name and ability name with result.
     *
     * @param {string} abilityName - ability name of target app
     * @param {string} bundleName - bundle name of target app
     * @param {number} requestCode - result after start app
     */
    startApplicationForResult(abilityName, bundleName, requestCode) {
        let paramBundleName = bundleName;
        let paramAbilityName = abilityName;
        // promise
        console.info('Launcher AppModel startApplicationForResult abilityName' + abilityName);
        let result = FeatureAbility.startAbilityForResult({
            want: {
                bundleName: paramBundleName,
                abilityName: paramAbilityName
            },
            requestCode: requestCode,
        },
            (err, data) => {
                console.log("Launcher AppModel startAbilityForResult asyncCallback StartAbilityResult: "
                + err.code + " data: " + data)
            }).then(data =>
        console.info("Launcher AppModel startApplicationForResult promise::then : " + JSON.stringify(data))
        ).catch(error =>
        console.info("Launcher AppModel startApplicationForResult  promise::catch : " + JSON.stringify(error))
        );
        console.info("Launcher AppModel startApplicationForResult  AceApplication : startAbility : " + result);
    }

    /**
     * Dispatch event to corresponding listeners.
     *
     * @param {string} event: callback event
     * @param {object} bundleInfo: data from callback
     */
    #reportAppInstallEvent = (event, bundleInfo) => {
        console.info("Launcher AppModel reportAppInstallEvent + " + event);
        switch (event) {
            case EventConstants.EVENT_PACKAGE_ADDED:
                this.#notifyEventListener(mAppListInstallListener, bundleInfo);
                break;
            case EventConstants.EVENT_PACKAGE_CHANGED:
                this.#notifyEventListener(mAppListChangeListener, bundleInfo);
                break;
            case EventConstants.EVENT_PACKAGE_REMOVED:
                this.#notifyEventListener(mAppListUninstallListener, bundleInfo);
                break;
            default:
                break;
        }
    }

    /**
     * Call the callback method which comes from presenter.
     *
     * @param {object} eventListener - different listeners for different event
     * @param {object} bundleInfo - callback data
     */
    #notifyEventListener = (eventListener, bundleInfo) => {
        for (let i = 0; i < eventListener.length; i++) {
            let listener = eventListener[i];
            if (listener != undefined && listener != null) {
                console.info("Launcher AppModel notifyEventListener " + JSON.stringify(bundleInfo));
                listener(bundleInfo);
            }
        }
    }

    /**
     * Register install listener.
     *
     * @param {object} listener - install listener
     */
    registerAppListInstallListener(listener) {
        if (mAppListInstallListener.indexOf(listener) == -1) {
            mAppListInstallListener.push(listener);
        }
    }

    /**
     * Unregister install listener.
     *
     * @param {object} listener - install listener
     */
    unregisterAppListInstallListener(listener) {
        let index = mAppListInstallListener.indexOf(listener);
        if (index != -1) {
            mAppListInstallListener.splice(index, 1);
        }
    }

    /**
     * Register uninstall listener.
     *
     * @param {object} listener - uninstall listener
     */
    registerAppListUninstallListener(listener) {
        if (mAppListUninstallListener.indexOf(listener) == -1) {
            mAppListUninstallListener.push(listener);
        }
    }

    /**
     * Unregister uninstall listener.
     *
     * @param {object} listener - uninstall listener
     */
    unregisterAppListUninstallListener(listener) {
        let index = mAppListUninstallListener.indexOf(listener);
        if (index != -1) {
            mAppListUninstallListener.splice(index, 1);
        }
    }

    /**
     * Register change listener.
     *
     * @param {object} listener - uninstall listener
     */
    registerAppListChangeListener(listener) {
        if (mAppListChangeListener.indexOf(listener) == -1) {
            mAppListChangeListener.push(listener);
        }
    }

    /**
     * Unregister change listener.
     *
     * @param {object} listener - change listener
     */
    unregisterAppListChangeListener(listener) {
        let index = mAppListChangeListener.indexOf(listener);
        if (index != -1) {
            mAppListChangeListener.splice(index, 1);
        }
    }

    /**
     * Called in app.js, create subscriber for app install/uninstall/update events.
     */
    registerAppListEvent() {
        Subscriber.createSubscriber(
            mCommonEventSubscribeInfo,
            this.#createInstallationSubscriberCallBack.bind(this)
        );
    }

    /**
     * Called in app.js, unregister app install/uninstall/update events.
     */
    unregisterAppListEvent() {
        Subscriber.unsubscribe(mCommonEventSubscriber, () => {
            console.info("Launcher AppModel unregisterAppListEvent");
        });
    }

    /**
     * Create subscriber for install/uninstall/update event
     *
     * @param {object} err - error message of callback
     * @param {object} data - callback data
     */
    #createInstallationSubscriberCallBack = (err, data) => {
        console.info("Launcher AppModel createInstallationSubscriberCallBack");
        mCommonEventSubscriber = data;
        Subscriber.subscribe(mCommonEventSubscriber, this.#installationSubscriberCallBack.bind(this));
    }

    /**
     * callback after install/uninstall/update events, reorganize callback data.
     *
     * @param {object} err - error returns from the caller
     * @param {object} data - data returns from the caller
     */
    #installationSubscriberCallBack = (err, data) => {
        if (err.code == 0) {
            if (CheckEmptyUtils.isEmpty(data)) {
                console.error("Launcher AppModel installationSubscriberCallBack ERROR! data is empty");
            }
            console.info("Launcher AppModel installationSubscriberCallBack data = " + JSON.stringify(data));
            let callbackData = data;
            if (callbackData.event == EventConstants.EVENT_PACKAGE_REMOVED) {
                this.#reportAppInstallEvent(callbackData.event, callbackData);
                return;
            }
            BundleMgr.getBundleInfo(callbackData.bundleName, IF_GET_ABILITY).then(data => {
                console.info('Launcher AppModel installation subscriber getBundleInfo ' + JSON.stringify(data));
                let bundleInfo =  {
                        System:data.appInfo.systemApp,
                        AppName: data.appInfo.label,
                        AppId: data.appId,
                        AppIcon: data.appInfo.iconId,
                        bundleName:data.name,
                        labelId :data.appInfo.labelId,
                        abilityName: data.abilityInfos[0].name,
                    };
                this.#reportAppInstallEvent(callbackData.event, bundleInfo);
            });
        } else {
            console.error("Launcher AppModel app list change failed --- err = " + JSON.stringify(err));
        }
    }
}