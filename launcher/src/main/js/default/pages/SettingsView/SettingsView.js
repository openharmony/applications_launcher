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
import Colors from '../../common/colors/Colors.js'
import LayoutConstants from '../../common/constants/LayoutConstants.js'

var mSettingsPresenter;
var mGridConfig;

export default {
    data: {
        layout: "",
        checked: false,
        layoutButtonStyle: [],
        gridLayoutTable: [],
        recentProcessLimit: ''
    },

    onInit() {
        mSettingsPresenter = new SettingsPresenter(this.$app.$def.data.settingsModel);
        mGridConfig = mSettingsPresenter.getGridConfig();
        this.gridLayoutTable = mSettingsPresenter.getGridLayoutTable()
        this.recentProcessLimit = mSettingsPresenter.getRecentProcessLimit();
        for (let i = 0; i < this.gridLayoutTable.length; i++) {
            this.layoutButtonStyle.push({
                color: "",
                fontColor: ""
            });
        }
    },

    onShow() {
        this.layout = mSettingsPresenter.getAppPageStartConfig();
        if (this.layout == LayoutConstants.Grid) {
            this.checked = false;
            this.layout = LayoutConstants.Grid;
        } else {
            this.checked = true;
            this.layout = LayoutConstants.List;
        }
        for (let i = 0; i < this.gridLayoutTable.length; i++) {
            if (i == mGridConfig.id) {
                this.layoutButtonStyle[i].color = Colors.bgSelectedColor;
                this.layoutButtonStyle[i].fontColor = Colors.fontSelectedColor;
            } else {
                this.layoutButtonStyle[i].color = Colors.bgUnselectedColor;
                this.layoutButtonStyle[i].fontColor = Colors.fontUnselectedColor;
            }
        }
    },

    changeSwitch() {
        if (this.checked) {
            this.checked = false;
            this.layout = LayoutConstants.Grid;
        } else {
            this.checked = true;
            this.layout = LayoutConstants.List;
        }
    },

    changeSelect(selected) {
        this.recentProcessLimit = Number(selected.newValue)
        mSettingsPresenter.setRecentProcessLimit(this.recentProcessLimit);
    },

    submit() {
        mSettingsPresenter.setAppPageStartConfig(this.layout);
        mSettingsPresenter.settingUpdate();
        mSettingsPresenter.setRecentProcessLimit(this.recentProcessLimit);
    },

    changeLayout(id) {
        for (let i = 0; i < this.gridLayoutTable.length; i++) {
            if (i == id) {
                this.layoutButtonStyle[i].color = Colors.bgSelectedColor;
                this.layoutButtonStyle[i].fontColor = Colors.fontSelectedColor;
            } else {
                this.layoutButtonStyle[i].color = Colors.bgUnselectedColor;
                this.layoutButtonStyle[i].fontColor = Colors.fontUnselectedColor;
            }
        }
        mSettingsPresenter.setGridConfig(id);
    }
}
