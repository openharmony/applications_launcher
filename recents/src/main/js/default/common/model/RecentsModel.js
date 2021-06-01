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

import napiAbilityManager from '@ohos.napi_ability_manager';
import featureAbility from '@ohos.feature_ability';
import storage from '@ohos.data.storage';
import bundle_mgr from '@ohos.bundle_mgr';
import feature_ability from '@ohos.feature_ability';

var RECENT_PROCESS_LIMIT_KEY = 'RecentProcessLimit';
const PREFERENCES_PATH = '/data/accounts/account_0/appdata/com.ohos.launcher/sharedPreference/LauncherPreference';
var mRecentList = [];
var DEFAULT_RECENT_PROCESS_LIMIT = 10;
var INCLUDE_SYSTEM_APP = 0;
var EXCLUDE_SYSTEM_APP = 1;
var mIconResultCount = 0;
var mPreferences = storage.getStorageSync(PREFERENCES_PATH);

export default class RecentsModel {
    getRecentProcessList(callback) {
        console.info("Launcher recents RecentsModel getRecentProcessList start")
        mRecentList = [];
        mIconResultCount = 0;
        console.info("Launcher recents RecentsModel napiAbilityManager.queryRecentAbilityMissionInfos start")
        napiAbilityManager.queryRecentAbilityMissionInfos().then((data) => {
            console.info("Launcher recents RecentsModel napiAbilityManager.queryRecentAbilityMissionInfos() callback")
            console.info('Launcher recents queryRecentAbilityMissionInfos data length [' + data.length + ']');
            console.info('Launcher recents queryRecentAbilityMissionInfos data = ' + JSON.stringify(data));
            for (var i = 0; i < data.length; i++) {
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
            console.info('Launcher recents RecentsModel queryRecentAbilityMissionInfos mRecentList = ' + JSON.stringify(mRecentList));
            for (let element of mRecentList) {
                console.info('Launcher recents RecentsModel bundle_mgr.getApplicationInfo element of mRecentList = ' + JSON.stringify(element));
                bundle_mgr.getApplicationInfo(element.AppId).then(data => {
                    console.info('Launcher recents bundle_mgr.getApplicationInfo data = ' + JSON.stringify(data));
                    let recentTaskInfo = mRecentList.find((recentItem) => {
                        if (recentItem.AppId == data.bundleName) return recentItem;
                    });
                    recentTaskInfo.iconId = data.iconId;
                    recentTaskInfo.labelId = data.labelId;
                    mIconResultCount++;
                    console.info('Launcher recents getApplicationInfo mIconResultCount = ' + mIconResultCount);
                    console.info('Launcher recents getApplicationInfo mRecentList.length = ' + mRecentList.length);
                    if (mIconResultCount == mRecentList.length) {
                        callback(mRecentList);
                    }
                });
            }
        });
        console.info("Launcher recents RecentsModel getRecentProcessList end")
    }

    clearRecentProcess() {
        console.info("Launcher recents RecentsModel clearRecentProcess start")
        while (mRecentList.length > 0) {
            mRecentList.pop();
        }
        console.info("Launcher recents RecentsModel napiAbilityManager.removeStack start")
        napiAbilityManager.removeStack(EXCLUDE_SYSTEM_APP).then((data) => {
            console.info('Launcher recents removeStack data [' + data + ']');
        });

        setTimeout(() => {
            console.info("Launcher recents RecentsModel feature_ability.terminateAbility start")
            feature_ability.terminateAbility()
                .then(data => console.info("Launcher recents terminateAbility promise::then : " + data))
                .catch(error => console.info("Launcher recents terminateAbility promise::catch : " + error));
        }, 1000);

        console.info("Launcher recents RecentsModel clearRecentProcess end")
    }

    removeRecentProcess(missionId) {
        console.info("Launcher recents RecentsModel removeRecentProcess start")
        for (var idx = 0; idx < mRecentList.length; idx++) {
            if (mRecentList[idx].missionId == missionId) {
                mRecentList.splice(idx, 1);
                break;
            }
        }
        console.info("Launcher recents RecentsModel napiAbilityManager.removeMission start")
        napiAbilityManager.removeMission(missionId).then((data) => {
            console.info('removeMission data [' + data + ']');
        });

        if (mRecentList.length == 0) {
            setTimeout(() => {
                console.info("Launcher recents RecentsModel feature_ability.terminateAbility start")
                feature_ability.terminateAbility()
                    .then(data => console.info("Launcher recents terminateAbility promise::then : " + data))
                    .catch(error => console.info("Launcher recents terminateAbility promise::catch : " + error));
            }, 1000);
        }
        console.info("Launcher recents RecentsModel removeRecentProcess end")
    }

    getRecentProcessLimit() {
        console.info("Launcher recents RecentsModel getRecentProcessLimit start");
        let limit = DEFAULT_RECENT_PROCESS_LIMIT;
        if (mPreferences != null && mPreferences != undefined) {
            limit = mPreferences.getSync(RECENT_PROCESS_LIMIT_KEY, DEFAULT_RECENT_PROCESS_LIMIT);
        }
        console.info("Launcher recents RecentsModel getRecentProcessLimit end limit = " + limit);
        return limit;
    }

    hotStartUpApp(appInfo) {
        console.info('Launcher recents hotStartUpApp start');
        this.startAbility(appInfo);
        console.info('Launcher recents hotStartUpApp end');
    }

    startAbility(appInfo) {
        console.info("Launcher recents startAbility start");
        console.info("Launcher recents featureAbility.startAbility appId = " + JSON.stringify(appInfo));
        featureAbility.startAbility({
            bundleName: appInfo.AppId,
            abilityName: appInfo.abilityName,
            requestCode: 1,
            abilityType: "PageAbility",
            want: {
                action: "action1",
                entities: ["entity1"],
                type: "PageAbility",
                flags: 2,
                elementName: {
                    deviceId: "deviceId",
                    bundleName: appInfo.AppId,
                    abilityName: appInfo.abilityName,
                },
            },
            syncOption: 1
        }).then(data =>
        console.info("Launcher recents promise::then : " + data)).catch(error =>
        console.info("Launcher recents promise::catch : " + error));
        console.info("Launcher recents startAbility end");
    }
}