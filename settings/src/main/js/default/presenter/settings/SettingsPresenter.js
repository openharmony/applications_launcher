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

import LayoutConstants from '../../common/constants/LayoutConstants.js'
import PageData from '../../common/constants/PageData.js';
import DefaultLayoutConfig from '../../common/configs/DefaultLayoutConfig.js';

const GRID = LayoutConstants.Grid;
const GRID_APP_VIEW = PageData.GRID_APP_PAGE;
const LIST_APP_VIEW = PageData.LIST_APP_PAGE;

let mSettingsModel;

/**
 * Class SettingsPresenter.
 */
export default class SettingsPresenter {
    /**
     * Constructor.
     *
     * @param {object} settingsModel - model of setting.
     */
    constructor(settingsModel) {
        mSettingsModel = settingsModel;
    }

    /**
     * Get app config.
     *
     * @return {object} - app config.
     */
    getAppPageStartConfig() {
        return mSettingsModel.getAppPageStartConfig();
    }

    /**
     * Set app config.
     *
     * @param {string} type - the type of config.
     */
    setAppPageStartConfig(type) {
        mSettingsModel.setAppPageStartConfig(type);
    }

    /**
     * Update setting.
     *
     */
    settingUpdate() {
        mSettingsModel.closeSettings();
    }

    /**
     * Get grid config.
     *
     * @return {object} - grid config.
     */
    getGridConfig() {
        return mSettingsModel.getGridConfig();
    }

    /**
     * Set grid config.
     *
     * @param {string} id - the id of grid config.
     */
    setGridConfig(id) {
        mSettingsModel.setGridConfig(id);
    }

    /**
     * Get grid layout table.
     *
     * @return {object} - the grid table.
     */
    getGridLayoutTable() {
        return mSettingsModel.getGridLayoutTable();
    }

    /**
     * Get recent process.
     *
     * @return {object} - the recent process.
     */
    getRecentProcessLimit() {
        return mSettingsModel.getRecentProcessLimit();
    }

    /**
     * Set recent process.
     *
     * @param {number} num - the num of recent process.
     */
    setRecentProcessLimit(num) {
        mSettingsModel.setRecentProcessLimit(num)
    }

    /**
     * Back to the desktop interface.
     *
     */
    backToTheDesktop() {
        this.settingUpdate();
    }

    /**
     * Get default recent process.
     *
     * @return {Array}
     */
    getDefaultRecentProcessLimitArray(){
        return DefaultLayoutConfig.DefaultRecentProcessLimitArray;
    }
}