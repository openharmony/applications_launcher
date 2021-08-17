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

import BaseAppPresenter from './base/BaseAppPresenter.js';
import PinyinSort from '../../common/utils/PinyinSort.js';

const KEY_NAME = "name";
const KEY_APP_LIST = "appListInfo";

let mPinyinSort;

/**
 * Presenter of launcher list view.
 *
 * @extends BaseAppPresenter.
 */
export default class AppListPresenter extends BaseAppPresenter {
    constructor(AppModel, MMIModel, SettingsModel, AppListInfoCacheManager, ResourceManager) {
        super(AppModel, MMIModel, SettingsModel, AppListInfoCacheManager, ResourceManager);
        this.resourceManager = ResourceManager;
        mPinyinSort = new PinyinSort();
    }

    /**
     * Adapt bundleInfo data to in list view.
     *
     * @param {object} callbackList - BundleInfo list get from cache.
     * @return {object} The regrouped list.
     */
    regroupDataAfterInstall(callbackList) {
        for (let item of callbackList) {
            let appName = this.resourceManager.getAppResourceCache(item.bundleName, KEY_NAME);
            console.info("Launcher AppListPresenter regroupDataAfterInstall + appName = " + appName);
            item.AppName = appName;
        }
        callbackList.sort(mPinyinSort.sortByAppName.bind(mPinyinSort));
        this.appListInfoCacheManager.setCache(KEY_APP_LIST, callbackList);
        return callbackList;
    }
}