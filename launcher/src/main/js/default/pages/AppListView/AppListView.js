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
import LayoutConstants from '../../common/constants/LayoutConstants.js';
import Prompt from '@system.prompt';

const NO_FOCUS_INDEX = -1;
const FOCUSED_ITEM_SCALE = 1.05;
const UNFOCUSED_ITEM_SCALE = 1;
const KEY_CODE_CONFIRM_ON_TV_REMOTE = 23;
const KEY_CODE_CONFIRM_ON_KEYBOARD_ENTER = 66;
const KEY_CODE_CONFIRM_ON_NUMERIC_KEYBOARD_ENTER = 160;
const UNINSTALL_SUCCESS = "UNINSTALL_SUCCESS";
const UNINSTALL_FAILED = "UNINSTALL_FAILED";
const UNINSTALL_PROHIBITED = "UNINSTALL_PROHIBITED";
const APP_INFO_REFRESH_DELAY = 500;

let mAppListPresenter;

export default {
    data: {
        appList: [],
        uninstallAppId: null,
        uninstallBundleName: null,
        ifSystem: true,
        listItemScales: [],
        focusItemIndex: NO_FOCUS_INDEX
    },

    onInit() {
        console.info("Launcher AppListView onInit");
        globalThis.$globalR = this.$r.bind(this);
        mAppListPresenter = new AppListPresenter(this.$app.$def.data.appModel, this.$app.$def.data.mmiModel,
            this.$app.$def.data.settingsModel, this.$app.$def.data.appListInfoCacheManager, this.$app.$def.data.resourceManager);
        mAppListPresenter.registerAppListChangeCallback(this.getListCallback.bind(this));
    },

    onShow() {
        console.info("Launcher AppListView onShow");
        let isLayoutMigrate = mAppListPresenter.layoutMigrate(LayoutConstants.List);
        if (isLayoutMigrate) {
            return;
        }
        mAppListPresenter.getAppList(this.getListCallback.bind(this));
    },

    onDestroy() {
        console.info("Launcher AppListView onDestroy");
        mAppListPresenter.unregisterAppListChangeCallback();
    },

    /**
     * Callback function of get application list.
     *
     * @param {object} list - list of applications.
     */
    getListCallback(list) {
        if (list == undefined || list == null) {
            this.appList = [];
            return;
        }
        this.appList = list;
        this.initListFocus();
        this.updateAppInfos();
    },

    /**
     * Open application function.
     *
     * @param {string} abilityName - ability name of the application to be jump to.
     * @param {string} bundleName - bundle name of the application to be jump to.
     */
    openApplication(abilityName, bundleName) {
        console.info("Launcher AppListView openApplication abilityName:" + abilityName);
        mAppListPresenter.jumpTo(abilityName, bundleName);
    },

    /**
     * Application list item long press function.
     *
     * @param {string} appId - appId of long pressed item.
     * @param {string} bundleName - bundle name of long pressed item.
     * @param {string} System - whether long pressed item is system app or not.
     */
    longPress(appId, bundleName, System) {
        console.info("Launcher AppListView longPress appId:" + appId);
        this.uninstallAppId = appId;
        this.uninstallBundleName = bundleName;
        this.ifSystem = System;
        this.$element('chooseDialog').show();
    },

    /**
     * Migrate to launcher settings.
     */
    toSetting() {
        mAppListPresenter.jumpToSetting();
    },

    /**
     * Choose uninstall button when long pressed dialog showed.
     */
    chooseUninstall() {
        this.$element('simpleDialog').show();
    },

    /**
     * Choose launcher settings button when long pressed dialog showed.
     */
    chooseSettings() {
        this.$element('chooseDialog').close();
        mAppListPresenter.jumpToSetting();
    },

    /**
     * Cancel dialog when long pressed dialog showed.
     *
     * @param {object} e
     */
    cancelDialog(e) {
        this.$element('chooseDialog').close();
        Prompt.showToast({
            message: 'Dialog cancelled'
        })
    },

    /**
     * Called when uninstall dialog canceled.
     *
     * @param {object} e
     */
    cancelSchedule(e) {
        this.$element('chooseDialog').close();
        this.$element('simpleDialog').close();
        Prompt.showToast({
            message: this.$t('strings.cancelled')
        })
    },

    /**
     * Called when uninstall dialog's uninstall dialog button clicked.
     *
     * @param {object} e
     */
    uninstallApplication(e) {
        this.$element('chooseDialog').close();
        this.$element('simpleDialog').close();
        if (this.uninstallBundleName != null) {
            mAppListPresenter.uninstallApp(this.uninstallBundleName, this.ifSystem, this.getUninstallApp.bind(this));
        }
    },

    /**
     * Callback function of uninstall application.
     *
     * @param {string} uninstallationResult - the result of uninstallation.
     */
    getUninstallApp(uninstallationResult) {
        console.info("Launcher AppListView getUninstallApp uninstallationResult:" + uninstallationResult);
        if (uninstallationResult == UNINSTALL_PROHIBITED) {
            Prompt.showToast({
                message: this.$t('strings.prohibited')
            })
        } else if (uninstallationResult == UNINSTALL_SUCCESS) {
            Prompt.showToast({
                message: this.$t('strings.uninstall_succeeded')
            });
            this.appList = [];
            mAppListPresenter.getAppList(this.getListCallback.bind(this));
        } else if (uninstallationResult == UNINSTALL_FAILED) {
            Prompt.showToast({
                message: this.$t('strings.uninstall_failed')
            });
        }
    },

    /**
     * Function called when list item focus changed.
     *
     * @param {string} idx - the index of list item to be focused.
     */
    focus(idx) {
        if (this.focusItemIndex != NO_FOCUS_INDEX) {
            this.listItemScales.splice(this.focusItemIndex, 1, UNFOCUSED_ITEM_SCALE);
        }
        this.focusItemIndex = idx;
        this.listItemScales.splice(idx, 1, FOCUSED_ITEM_SCALE);
    },

    /**
     * Function called when key event on list item changed.
     *
     * @param {object} KeyEvent - key event object.
     */
    onAppListKeyEvent(KeyEvent) {
        console.info("Launcher AppListView onAppListKeyEvent KeyEvent:" + KeyEvent);
        switch (KeyEvent.code) {
            case KEY_CODE_CONFIRM_ON_TV_REMOTE:
            case KEY_CODE_CONFIRM_ON_KEYBOARD_ENTER:
            case KEY_CODE_CONFIRM_ON_NUMERIC_KEYBOARD_ENTER:
                this.openApplication(this.appList[this.focusItemIndex].bundleName,
                    this.appList[this.focusItemIndex].abilityName);
                break;
            default:
                break;
        }
    },

    /**
     * Initial list focus status.
     */
    initListFocus() {
        for (let i = 0; i < this.appList.length; i++) {
            this.listItemScales.push(UNFOCUSED_ITEM_SCALE);
        }
        if (this.focusItemIndex != NO_FOCUS_INDEX) {
            this.listItemScales[this.focusItemIndex] = FOCUSED_ITEM_SCALE;
        }
    },

    /**
     * Update application icon and name when application data changed.
     */
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
}