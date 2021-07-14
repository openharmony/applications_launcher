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

import SettingsPresenter from '../../presenter/settings/SettingsPresenter.js';
import LayoutConstants from '../../common/constants/LayoutConstants.js'

let mSettingsPresenter;
let mGridConfig;

export default {
    data: {
        layout: "",
        layoutStyle: "",
        layoutStyleTable: [],
        checked: false,
        launcherLayout: "",
        layoutButtonStyle: [],
        gridLayoutTable: [],
        recentProcessLimit: '',
        recentProcessLimitArray: [],
    },

    onInit() {
        console.info("Launcher settings onInit start");
        mSettingsPresenter = new SettingsPresenter(this.$app.$def.data.settingsModel);
        mGridConfig = mSettingsPresenter.getGridConfig();
        console.info("Launcher settings onInit end"+mGridConfig);
    },

    onShow() {
        console.info("Launcher settings onShow start");
        mGridConfig = mSettingsPresenter.getGridConfig();
        this.gridLayoutTable = mSettingsPresenter.getGridLayoutTable();
        this.recentProcessLimit = mSettingsPresenter.getRecentProcessLimit();
        for (let i = 0; i < this.gridLayoutTable.length; i++) {
            this.layoutButtonStyle.push({
                color: "",
                fontColor: "",
                checked: false,
            });
        }
        this.layout = mSettingsPresenter.getAppPageStartConfig();
        if (this.layout == LayoutConstants.Grid) {
            this.checked = false;
            this.layoutStyle = this.$t('strings.layout_grid');
        } else {
            this.checked = true;
            this.layout = LayoutConstants.List;
            this.layoutStyle = this.$t('strings.layout_list');
        }
        this.setLayoutStyleSettings();
        this.setLauncherLayoutSettings();
        this.setRecentTasksSettings();
        console.info("Launcher settings onShow end");
    },
    /**
     * Set layout style.
     *
     */
    setLayoutStyleSettings() {
        console.info("Launcher settings setLayoutStyleSettings start");
        this.layoutStyleTable = [];
        if (this.layout == LayoutConstants.Grid) {
            this.layoutStyleTable.push(
                {'layout': LayoutConstants.Grid, 'layoutChinese': this.$t('strings.layout_grid'), 'checked':true},
                {'layout': LayoutConstants.List, 'layoutChinese': this.$t('strings.layout_list'), 'checked':false}
            );
        } else {
            this.layoutStyleTable.push(
                {'layout': LayoutConstants.Grid, 'layoutChinese': this.$t('strings.layout_grid'), 'checked':false},
                {'layout': LayoutConstants.List, 'layoutChinese': this.$t('strings.layout_list'), 'checked':true}
            );
        }
        console.info("Launcher settings setLayoutStyleSettings end");
    },

    /**
     * Set layout setting.
     *
     */
    setLauncherLayoutSettings() {
        console.info("Launcher settings setLauncherLayoutSettings start");
        for (let i = 0; i < this.gridLayoutTable.length; i++) {
            if (i == mGridConfig.id) {
                this.layoutButtonStyle[i].checked = true;
                this.launcherLayout = mGridConfig.layout;
            } else {
                this.layoutButtonStyle[i].checked = false;
            }
        }
        console.info("Launcher settings setLauncherLayoutSettings end");
    },

    /**
     * Set recent task settings.
     *
     */
    setRecentTasksSettings() {
        console.info("Launcher settings setRecentTasksSettings start");
        let defaultRecentProcessArray = mSettingsPresenter.getDefaultRecentProcessLimitArray();
        this.recentProcessLimitArray = [];
        for (let i = 0; i < defaultRecentProcessArray.length; i++){
            if (defaultRecentProcessArray[i] == this.recentProcessLimit) {
                this.recentProcessLimitArray.push({'limit' : defaultRecentProcessArray[i] , 'checked' : true});
            } else {
                this.recentProcessLimitArray.push({'limit' : defaultRecentProcessArray[i] , 'checked' : false});
            }
        }
        console.info("Launcher settings setRecentTasksSettings end");
    },

    /**
     * Show dialog.
     *
     * @param {object} e - the event from front page.
     */
    showLayoutStyleDialog(e) {
        this.$element('dialog-layout-style-setting').show();
    },

    /**
     * Hide dialog.
     *
     * @param {object} e - the event from front page.
     */
    hideLayoutStyleDialog(e) {
        this.$element('dialog-layout-style-setting').close();
    },

    /**
     * Show dialog.
     *
     * @param {object} e - the event from front page.
     */
    showLauncherLayoutDialog(e) {
        this.$element('dialog-launcher-layout-setting').show();
    },

    /**
     * Hide dialog.
     *
     * @param {object} e - the event from front page.
     */
    hideLauncherLayoutDialog(e) {
        this.$element('dialog-launcher-layout-setting').close();
    },

    /**
     * Show recent task dialog.
     *
     * @param {object} e - the event from front page.
     */
    showRecentTasksDialog(e) {
        this.$element('dialog-recent-tasks-setting').show();
    },

    /**
     * Hide recent task dialog.
     *
     * @param {object} e - the event from front page.
     */
    hideRecentTasksDialog(e) {
        this.$element('dialog-recent-tasks-setting').close();
    },

    /**
     * Change style.
     *
     * @param {string} layout - the layout of app page.
     */
    changeLayoutStyle(layout) {
        mSettingsPresenter.setAppPageStartConfig(layout);
        this.hideLayoutStyleDialog();
        mSettingsPresenter.settingUpdate();
    },

    /**
     * Show dialog.
     *
     * @param {string} launcherLayoutId - the id of launcher.
     */
    changeLauncherLayout(launcherLayoutId) {
        mSettingsPresenter.setGridConfig(launcherLayoutId);
        this.hideLauncherLayoutDialog();
        mSettingsPresenter.settingUpdate();
    },

    /**
     * Change recent process.
     *
     * @param {object} recentProcessLimit - the recent process.
     */
    changeRecentProcessLimit(recentProcessLimit) {
        console.info("Launcher settings changeRecentProcessLimit start");
        mSettingsPresenter.setRecentProcessLimit(recentProcessLimit);
        this.recentProcessLimit = mSettingsPresenter.getRecentProcessLimit();
        for (let i = 0; i < this.recentProcessLimitArray.length; i++){
            if (this.recentProcessLimitArray[i].limit == this.recentProcessLimit) {
                this.recentProcessLimitArray[i].checked = true;
            } else {
                this.recentProcessLimitArray[i].checked = false;
            }
        }
        this.hideRecentTasksDialog();
        console.info("Launcher settings changeRecentProcessLimit end");
    },

    /**
     * Return to desktop.
     *
     */
    returnToDesktop() {
        mSettingsPresenter.backToTheDesktop();
    }
}
