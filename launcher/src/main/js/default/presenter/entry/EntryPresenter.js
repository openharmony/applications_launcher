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

import RouterUtil from '../../common/utils/RouterUtil.js';
import LayoutConstants from '../../common/constants/LayoutConstants.js'
import PageData from '../../common/constants/PageData.js';

const GRID = LayoutConstants.Grid;
const GRID_APP_VIEW = PageData.GRID_APP_PAGE;
const LIST_APP_VIEW = PageData.LIST_APP_PAGE;
var mSettingsModel;

export default class EntryPresenter {
    constructor(settingsModel) {
        mSettingsModel = settingsModel;
    }

    startAppListView() {
        console.info("Launcher EntryPresenter startAppListView start");
        let data = mSettingsModel.getAppPageStartConfig();
        if (data == GRID) {
            RouterUtil.replace(GRID_APP_VIEW);
        } else {
            RouterUtil.replace(LIST_APP_VIEW);
        }
        console.info("Launcher EntryPresenter startAppListView end");
    }
}