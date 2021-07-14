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

import NapiAbilityManager from '@ohos.app.abilitymanager';
import Storage from '@ohos.data.storage';
import BundleMgr from '@ohos.bundle';
import FeatureAbility from '@ohos.ability.featureability';

const PREFERENCES_PATH = '/data/accounts/account_0/appdata/com.ohos.launcher/sharedPreference/LauncherPreference';
const MAX_NUM = 20;
const PERMISSION_NUM = 8;
const NON = 0;
const RECENT_PROCESS_LIMIT_KEY = 'RecentProcessLimit';
const DEFAULT_RECENT_PROCESS_LIMIT = 10;

let mRecentList = [];
let mIconResultCount = 0;
let mPreferences = Storage.getStorageSync(PREFERENCES_PATH);

/**
 * Class RecentsModel.
 */
export default class RecentsModel {

    /**
     * Get recent process list.
     *
     * @param {object} callback - the callback from presenter.
     */
    getRecentProcessList(callback) {
        console.info("Launcher recents  RecentsModel getRecentProcessList start");
        mRecentList = [];
        mIconResultCount = 0;
        console.info("Launcher recents  RecentsModel NapiAbilityManager.queryRecentAbilityMissionInfos start")
        NapiAbilityManager.queryRunningAbilityMissionInfos(MAX_NUM).then((data) => {
            console.info("Launcher recents  RecentsModel NapiAbilityManager.queryRecentAbilityMissionInfos() callback")
            console.info('Launcher recents  queryRecentAbilityMissionInfos data length [' + data.length + ']');
            console.info('Launcher recents  queryRecentAbilityMissionInfos data = ' + JSON.stringify(data));
            if(data.length == 0) {
                console.info('Launcher recents data empty');
                callback(mRecentList);
                return;
            }
            for (let i = 0; i < data.length; i++) {
                let recentTaskInfo = {
                    AppName: data[i].missionDescription.label,
                    AppId: data[i].topAbility.bundleName,
                    bundleName: data[i].topAbility.bundleName,
                    abilityName: data[i].topAbility.abilityName,
                    iconId: '',
                    labelId: '',
                    missionId: data[i].id
                }
                mRecentList.push(recentTaskInfo);
            }
            console.info('Launcher recents  RecentsModel queryRecentAbilityMissionInfos mRecentList = ' + JSON.stringify(mRecentList));
            for (let element of mRecentList) {
                console.info('Launcher recents  RecentsModel  bundle_mgr.getApplicationInfo element of mRecentList = ' + JSON.stringify(element));
                BundleMgr.getApplicationInfo(element.AppId, PERMISSION_NUM, NON).then(data => {
                    console.info('Launcher recents  bundle_mgr.getApplicationInfo data = ' + JSON.stringify(data));
                    let recentTaskInfo = mRecentList.find((recentItem) => {
                        if (recentItem.AppId == data.name) return recentItem;
                    });
                    recentTaskInfo.iconId = data.iconId;
                    recentTaskInfo.labelId = data.labelId;
                    mIconResultCount++;
                    console.info('Launcher recents  getApplicationInfo mIconResultCount = ' + mIconResultCount);
                    console.info('Launcher recents  getApplicationInfo mRecentList.length = ' + mRecentList.length);
                    if (mIconResultCount == mRecentList.length) {
                        callback(mRecentList);
                    }
                }).catch(error =>
                    console.error("Launcher recents RecentsModel getRecentProcessList promise::catch : " + JSON.stringify(error))
                );
            }
        }).catch(error =>
            console.error("Launcher recents RecentsModel getRecentProcessList promise::catch : " + JSON.stringify(error))
        );
        console.info("Launcher recents  RecentsModel getRecentProcessList end")
    }

    /**
     * Clear recent process list.
     *
     */
    clearRecentProcess() {
        console.info("Launcher recents  RecentsModel clearRecentProcess start")
        while (mRecentList.length > 0) {
            mRecentList.pop();
        }
        console.info("Launcher recents  RecentsModel NapiAbilityManager.removeStack start")
        NapiAbilityManager.clearMissions().then((data) => {
        });

        setTimeout(() => {
            console.info("Launcher recents  RecentsModel feature_ability.terminateAbility start")
            FeatureAbility.terminateAbility()
                .then(data => console.info("Launcher recents  terminateAbility promise::then : " + data))
                .catch(error => console.info("Launcher recents  terminateAbility promise::catch : " + error));
        }, 1000);

        console.info("Launcher recents  RecentsModel clearRecentProcess end")
    }

    /**
     * Remove recent process list.
     *
     * @param {string} missionId - the missionId of recent process.
     */
    removeRecentProcess(missionId) {
        console.info("Launcher recents  RecentsModel removeRecentProcess start")
        for (let idx = 0; idx < mRecentList.length; idx++) {
            if (mRecentList[idx].missionId == missionId) {
                mRecentList.splice(idx, 1);
                break;
            }
        }
        console.info("Launcher recents  RecentsModel NapiAbilityManager.removeMission start")
        NapiAbilityManager.removeMission(missionId).then((data) => {
            console.info('removeMission data [' + data + ']');
        });

        if (mRecentList.length == 0) {
            setTimeout(() => {
                console.info("Launcher recents  RecentsModel feature_ability.terminateAbility start")
                FeatureAbility.terminateAbility()
                    .then(data => console.info("Launcher recents  terminateAbility promise::then : " + data))
                    .catch(error => console.info("Launcher recents  terminateAbility promise::catch : " + error));
            }, 1000);
        }
        console.info("Launcher recents  RecentsModel removeRecentProcess end")
    }

    /**
     * Get recent process list.
     *
     * @return {number} - the number of recent process.
     */
    getRecentProcessLimit() {
        console.info("Launcher recents RecentsModel getRecentProcessLimit start");
        let limit = DEFAULT_RECENT_PROCESS_LIMIT;
        if (mPreferences != null && mPreferences != undefined) {
            limit = mPreferences.getSync(RECENT_PROCESS_LIMIT_KEY, DEFAULT_RECENT_PROCESS_LIMIT);
        }
        console.info("Launcher recents RecentsModel getRecentProcessLimit end limit = " + limit);
        return limit;
    }

    /**
     * Hot start app.
     *
     * @param {object} appInfo - the app info.
     */
    hotStartUpApp(appInfo) {
        console.info('Launcher recents  hotStartUpApp start');
        this.startAbility(appInfo);
        console.info('Launcher recents  hotStartUpApp end');
    }

    /**
     * Start ability.
     *
     * @param {object} appInfo - the app info.
     */
    startAbility(appInfo) {
        // promise
        console.info('Launcher startApplication abilityname');
        let result = FeatureAbility.startAbility({
            want: {
                bundleName: appInfo.AppId,
                abilityName: appInfo.abilityName
            }
        }).then(data =>
        console.info("Launcher promise::then : " + JSON.stringify(data))
        ).catch(error =>
        console.info("Launcher promise::catch : " + JSON.stringify(error))
        );
        console.info("Launcher AceApplication : startAbility : " + result);
    }
}