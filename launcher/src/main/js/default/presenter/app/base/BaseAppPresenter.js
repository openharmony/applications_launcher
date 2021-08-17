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
import LayoutConstants from '../../../common/constants/LayoutConstants.js';
import PageData from '../../../common/constants/PageData.js';
import PinyinSort from '../../../common/utils/PinyinSort.js';

const UNINSTALL_SUCCESS = true;
const UNINSTALL_PROHIBITED = "UNINSTALL_PROHIBITED";
const SETTING_BUNDLE = 'com.ohos.launcher';
const SETTING_ABILITY = 'com.ohos.launcher.settings.MainAbility';
const KEY_APP_LIST = "appListInfo";
const KEY_NAME = "name";

let mViewCallback;
let mUninstallCallback;
let mAppListChangeCallback;
let mAppListInstallListener;
let mAppListUninstallListener;
let mAppListChangeListener;
let mPinyinSort;

/**
 * Base class of list view presenter and grid view presenter.
 */
export default class BaseAppPresenter {
    constructor(AppModel, MMIModel, SettingsModel, AppListInfoCacheManager, ResourceManager) {
        this.appModel = AppModel;
        this.mmiModel = MMIModel;
        this.settingModel = SettingsModel;
        this.appListInfoCacheManager = AppListInfoCacheManager;
        this.resourceManager = ResourceManager;
        mAppListInstallListener = this.appListInstallListener.bind(this);
        mAppListUninstallListener = this.appListUninstallListener.bind(this);
        mAppListChangeListener = this.appListChangeListener.bind(this);
        mPinyinSort = new PinyinSort();
    }

    /**
     * Get app data function.
     *
     * @param {object} callback - callback function.
     */
    getAppList(callback) {
        mViewCallback = callback;
        this.appModel.getAppList(this.getListCallback.bind(this));
    }

    /**
     * Get app data callback function in BaseAppPresenter.
     *
     * @param {object} list - app data.
     */
    getListCallback(list) {
        let hasNameCache = true;
        let callbackList;
        for (let item of list) {
            let appName = this.resourceManager.getAppResourceCache(item.bundleName, KEY_NAME);
            console.info("Launcher baseAppPresenter getListCallback + appName = " + appName);
            if (appName == undefined || appName == null || appName == '' || appName === -1) {
                hasNameCache = false;
                break;
            }
            item.AppName = appName;
        }
        if (!hasNameCache) {
            callbackList = this.appListInfoCacheManager.getCache(KEY_APP_LIST);
            if (callbackList == null || callbackList == undefined || callbackList == '' || callbackList == -1) {
                callbackList = list;
                this.appListInfoCacheManager.setCache(KEY_APP_LIST, list);
            }
        } else {
            callbackList = list.sort(mPinyinSort.sortByAppName.bind(mPinyinSort));
            this.appListInfoCacheManager.setCache(KEY_APP_LIST, list);
        }
        mViewCallback(callbackList);
    }

    /**
     * Uninstall app.
     *
     * @param {string} uninstallBundleName - bundleName of the app to be uninstall.
     * @param {boolean} ifSystem - whether the app is a system app or not.
     * @param {object} callback - callback function of uninstall app.
     */
    uninstallApp(uninstallBundleName, ifSystem, callback) {
        mUninstallCallback = callback;
        if (ifSystem == UNINSTALL_SUCCESS) {
            callback(UNINSTALL_PROHIBITED);
        } else {
            this.appModel.uninstallApp(uninstallBundleName, this.uninstallAppCallback.bind(this));
        }
    }

    /**
     * Uninstall app callback function in BaseAppPresenter.
     *
     * @param {object} callback - callback function of uninstall app.
     */
    uninstallAppCallback(callback) {
        mUninstallCallback(callback);
    }

    /**
     * Jump to another application.
     *
     * @param {string} abilityName - ability name of the application to be jump to.
     * @param {string} bundleName - bundle name of the application to be jump to.
     */
    jumpTo(abilityName, bundleName) {
        this.appModel.startApplication(abilityName, bundleName);
    }

    /**
     * Jump to launcher settings module.
     */
    jumpToSetting() {
        this.appModel.startApplication(SETTING_ABILITY, SETTING_BUNDLE);
    }

    /**
     * Back to front page.
     */
    back() {
        RouterUtil.back();
    }

    /**
     * Register multi mode input event listener.
     *
     * @param {object} listener - the listener to be registered to handle the multi mode input event.
     */
    registerMMIEventListener(listener) {
        this.mmiModel.registerEventCallback(listener);
    }

    /**
     * Unregister multi mode input event listener.
     *
     * @param {object} listener - The listener to be unregistered.
     */
    unregisterMMIEventListener(listener) {
        this.mmiModel.unregisterEventCallback(listener);
    }

    /**
     * Get the layout view type.
     *
     * @return {string} Layout view type, should one of 'Grid' or 'List' which is stored in LayoutConstants class.
     */
    getAppPageStartConfig() {
        return this.settingModel.getAppPageStartConfig();
    }

    /**
     * Layout migrate function.
     *
     * @param {string} currentLayout - Current layout type.
     * @return {string} Whether the layout should be migrate or not.
     */
    layoutMigrate(currentLayout) {

        console.info("Launcher layoutMigrate in currentLayout = " + currentLayout);

        let isNeedLayoutMigrate = false;
        let destinationLayout = this.getAppPageStartConfig();
        if (currentLayout === destinationLayout) {
            return isNeedLayoutMigrate;
        }

        if (destinationLayout === LayoutConstants.Grid) {
            RouterUtil.replace(PageData.GRID_APP_PAGE);
            isNeedLayoutMigrate = true;
        } else if (destinationLayout === LayoutConstants.List) {
            RouterUtil.replace(PageData.LIST_APP_PAGE);
            isNeedLayoutMigrate = true;
        } else {
            console.error("Launcher layoutMigrate error");
        }

        console.info("Launcher layoutMigrate in isNeedLayoutMigrate = " + isNeedLayoutMigrate);
        return isNeedLayoutMigrate;
    }

    /**
     * Called in onInit method from view to register listeners.
     *
     * @param {object} listener - View update listener.
     */
    registerAppListChangeCallback(listener) {
        mAppListChangeCallback = listener;
        this.appModel.registerAppListInstallListener(mAppListInstallListener);
        this.appModel.registerAppListUninstallListener(mAppListUninstallListener);
        this.appModel.registerAppListChangeListener(mAppListChangeListener);
    }

    /**
     * Called in onDestroy method from view to unregister listeners.
     */
    unregisterAppListChangeCallback() {
        console.info("Launcher appPresenter unregisterAppListChangeCallback");
        this.appModel.unregisterAppListInstallListener(mAppListInstallListener);
        this.appModel.unregisterAppListUninstallListener(mAppListUninstallListener);
        this.appModel.unregisterAppListChangeListener(mAppListChangeListener);
    }

    /**
     * Call back function of app installation.
     *
     * @param {object} bundleInfo - BundleInfo of installed application.
     */
    appListInstallListener(bundleInfo) {
        let nameCallback = (appName) => {
            bundleInfo.AppName = appName;
            this.modifyItemList(this.appendItem, bundleInfo);
        }
        this.resourceManager.getAppName(bundleInfo.labelId, bundleInfo.bundleName, bundleInfo.AppName, nameCallback);
    }

    /**
     * Append item to list.
     *
     * @param {object} list - List to be operated.
     * @param {object} item - Item to be appended.
     * @return {object} The list with appended item.
     */
    appendItem(list, item) {
        list.push(item);
        return list;
    }

    /**
     * Call back function of app uninstallation.
     *
     * @param {object} bundleInfo - BundleInfo of uninstalled application.
     */
    appListUninstallListener(bundleInfo) {
        this.modifyItemList(this.removeItem, bundleInfo);
    }

    /**
     * Remove item from list.
     *
     * @param {object} list - List to be operated.
     * @param {object} item - Item to be removed.
     * @return {object} The list with removed item.
     */
    removeItem(list, item) {
        for (let listItem of list) {
            if (listItem.bundleName == item.bundleName) {
                let index = list.indexOf(listItem);
                list.splice(index, 1);
            }
        }
        return list;
    }

    /**
     * Call back function of app package change event.
     *
     * @param {object} bundleInfo - BundleInfo of changed application.
     */
    appListChangeListener(bundleInfo) {
        this.modifyItemList(this.replaceItem, bundleInfo);
    }

    /**
     * Replace item from list.
     *
     * @param {object} list - List to be operated.
     * @param {object} item - Item to be replaced.
     * @return {object} The list with replaced item.
     */
    replaceItem(list, item) {
        for (let listItem of list) {
            console.info("Launcher replaceCache + " + listItem.bundleName + " + " + item.bundleName);
            if (listItem.bundleName == item.bundleName) {
                let index = list.indexOf(listItem);
                list.splice(index, 1, item);
            }
        }
        return list;
    }

    /**
     * To operate cache and call callback method from view.
     *
     * @param {object} method - Method that add/modify/remove item in cache.
     * @param {object} item - The item that will be operated.
     */
    modifyItemList(method, item) {
        console.info("Launcher AppListPresenter appListChangeListener + " + JSON.stringify(item));
        let currentCacheList = this.appListInfoCacheManager.getCache(KEY_APP_LIST);
        method(currentCacheList, item);
        let callbackList = this.regroupDataAfterInstall(currentCacheList);
        mAppListChangeCallback(callbackList);
    }

    /**
     * To adapt bundleInfo data to different views.
     * Will be overridden by sub-classes.
     *
     * @param {object} callbackList - BundleInfo list get from cache.
     */
    regroupDataAfterInstall(callbackList) {
    }
}