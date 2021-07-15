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

import GridLayoutConfigs from '../../common/configs/GridLayoutConfigs.js';
import {getLayoutConfig} from './LayoutConfigManager.js';
import FileUtils from "../../common/utils/FileUtils.js"

const defaultLayoutInfoFilePath = "/data/accounts/account_0/applications/com.ohos.launcher/com.ohos.launcher/assets/launcher/resources/rawfile/layoutInfo.json";

let mLayoutConfig = getLayoutConfig();
let mGridConfig = 0;
let mGridLayoutTable = GridLayoutConfigs.GridLayoutTable;

/**
 * A class that manage configuration data of layout and recent task.
 */
export default class SettingsModel {

    /**
     * Get the grid view presetting collection of layout config information table.
     *
     * @return {object} Grid view presetting collection object.
     */
    getGridLayoutTable() {
        return mGridLayoutTable;
    }

    /**
     * Get default layout information of grid view.
     *
     * @return {object} Default layout information of grid view.
     */
    getDefaultLayoutInfo() {
        return FileUtils.readJsonFile(defaultLayoutInfoFilePath);
    }

    /**
     * Get layout config of grid view.
     *
     * @return {object} Layout config of grid view.
     */
    getGridConfig() {
        mGridConfig = mLayoutConfig.getGridConfig();
        return mGridLayoutTable[mGridConfig];
    }

    /**
     * Set layout config id of grid view.
     *
     * @param {string} id - Layout config id of grid view.
     */
    setGridConfig(id) {
        mLayoutConfig.setGridConfig(id);
    }

    /**
     * Get recent process max limit.
     *
     * @return {number} recent process max limit.
     */
    getRecentProcessLimit() {
        return mLayoutConfig.getRecentProcessLimit();
    }

    /**
     * Set recent process max limit.
     *
     * @param {number} num - Recent process max limit.
     */
    setRecentProcessLimit(num) {
        mLayoutConfig.setRecentProcessLimit(num);
    }

    /**
     * Get the layout view type.
     *
     * @return {string} Layout view type, should one of 'Grid' or 'List' which is stored in LayoutConstants class.
     */
    getAppPageStartConfig() {
        return mLayoutConfig.getAppPageStartConfig();
    }

    /**
     * Set the layout view type.
     *
     * @param {string} type - Layout view type, should one of 'Grid' or 'List' which is stored in LayoutConstants class.
     */
    setAppPageStartConfig(type) {
        mLayoutConfig.setAppPageStartConfig(type);
    }

    /**
     * Get layout information of grid view.
     *
     * @return {object} layout information.
     */
    getLayoutInfo() {
        return mLayoutConfig.getGridLayoutInfo();
    }

    /**
     * Set layout information of grid view.
     */
    setLayoutInfo(layoutInfo) {
        mLayoutConfig.setGridLayoutInfo(layoutInfo);
    }

    /**
     * Remove layout information of grid view.
     */
    deleteLayoutInfo() {
        mLayoutConfig.deleteGridLayoutInfo();
    }
}