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

var mLayoutConfig = getLayoutConfig();
var mGridConfig = 0;
var gridLayoutTable = GridLayoutConfigs.GridLayoutTable;

export default class SettingsModel {
    getGridLayoutTable() {
        return gridLayoutTable;
    }

    getGridConfig() {
        mGridConfig = mLayoutConfig.getGridConfig();
        return gridLayoutTable[mGridConfig];
    }

    setGridConfig(id) {
        mLayoutConfig.setGridConfig(id);
    }

    getRecentProcessLimit() {
        return mLayoutConfig.getRecentProcessLimit();
    }

    setRecentProcessLimit(num) {
        mLayoutConfig.setRecentProcessLimit(num);
    }

    getAppPageStartConfig() {
        return mLayoutConfig.getAppPageStartConfig();
    }

    setAppPageStartConfig(type) {
        mLayoutConfig.setAppPageStartConfig(type);
    }
}