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

import NapiAbilityManager from '@ohos.app.abilityManager';
import Storage from '@ohos.data.storage';
import BundleMgr from '@ohos.bundle';
import FeatureAbility from '@ohos.ability.featureAbility';

const PREFERENCES_PATH: string = '/data/accounts/account_0/appdata/com.ohos.launcher/sharedPreference/LauncherPreference';
const MAX_NUM: number = 20;
const PERMISSION_NUM: number = 8;
const NON: number = 0;
const RECENT_PROCESS_LIMIT_KEY: string = 'RecentProcessLimit';
const DEFAULT_RECENT_PROCESS_LIMIT: number = 10;

let mRecentList = [];
let mIconResultCount: number = 0;
let mPreferences: any = Storage.getStorageSync(PREFERENCES_PATH);

/**
 * Class RecentsModel.
 */
export default class RecentsModel {
  private static mRecentsModel = new RecentsModel();

  constructor() {
  }

  /**
   * Return an instance of RecentsModel.
   */
  public static getInstance() {
    return this.mRecentsModel;
  }

  /**
   * Get recent process list.
   *
   * @param {object} callback - The callback from presenter.
   */
  getRecentProcessList(callback) {
    console.info("Launcher recents  RecentsModel getRecentProcessList start");
    console.info('Launcher recents getRecentProcessList mRecentList first= ' + JSON.stringify(mRecentList));
    mRecentList = [];
    mIconResultCount = 0;
    console.info("Launcher recents  RecentsModel NapiAbilityManager.queryRecentAbilityMissionInfos start");
    NapiAbilityManager.queryRunningAbilityMissionInfos(MAX_NUM)
      .then((data) => {
      console.info("Launcher recents  RecentsModel NapiAbilityManager.queryRecentAbilityMissionInfos() callback");
      console.info('Launcher recents  queryRecentAbilityMissionInfos data length [' + data.length + ']');
      console.info('Launcher recents  queryRecentAbilityMissionInfos data = ' + JSON.stringify(data));
      if (data.length === 0) {
        console.info('Launcher recents data empty');
        callback(mRecentList);
        return;
      }
      for (let i = 0; i < data.length; i++) {
        let recentTaskInfo =
          {
            AppName: data[i].missionDescription.label,
            AppId: data[i].topAbility.bundleName,
            bundleName: data[i].topAbility.bundleName,
            abilityName: data[i].topAbility.abilityName,
            iconId: data[i].missionDescription.iconPath,
            labelId: '',
            missionId: data[i].id
          }
        mRecentList.push(recentTaskInfo);
      }
      console.info('Launcher recents  RecentsModel queryRecentAbilityMissionInfos mRecentList = ' + JSON.stringify(mRecentList));

      AppStorage.SetOrCreate('recentProcessList', mRecentList);
      callback(mRecentList);
    })
      .catch(error =>
    console.error("Launcher recents RecentsModel getRecentProcessList promise::catch : " + JSON.stringify(error))
    );
    console.info("Launcher recents  RecentsModel getRecentProcessList end");
  }

  /**
   * Clear recent process list.
   */
  clearRecentProcess() {
    console.info("Launcher recents  RecentsModel clearRecentProcess start");
    while (mRecentList.length > 0) {
      mRecentList.pop();
    }
    console.info("Launcher recents  RecentsModel mRecentList: " + mRecentList.length + JSON.stringify(mRecentList));
    NapiAbilityManager.clearMissions((data) => {
    });
    AppStorage.SetOrCreate('recentProcessList', mRecentList);
    console.info("Launcher recents  RecentsModel clearRecentProcess end");
  }

  /**
   * Remove recent process list.
   *
   * @param {string} missionId - The missionId of recent process.
   */
  removeRecentProcess(missionId) {
    console.info("Launcher recents  RecentsModel removeRecentProcess start");
    console.info('Launcher recents removeRecentProcess missionId  ' + missionId);
    for (let idx = 0; idx < mRecentList.length; idx++) {
      if (mRecentList[idx].missionId === missionId) {
        mRecentList.splice(idx, 1);
        break;
      }
    }
    console.info("Launcher recents  RecentsModel removeRecentProcess mRecentList" + JSON.stringify(mRecentList));
    NapiAbilityManager.removeMission(missionId, (err, data) => {
      console.info('removeMission data [' + data + ']');
    });
    if (mRecentList.length === 0) {
      console.info("Launcher recents  RecentsModel feature_ability.terminateAbility start")
    }
    AppStorage.SetOrCreate('recentProcessList', mRecentList);
    console.info("Launcher recents  RecentsModel removeRecentProcess end");
  }

  /**
   * Get recent process list.
   *
   * @return {number} - The number of recent process.
   */
  public getRecentProcessLimit() {
    console.info("Launcher recents RecentsModel getRecentProcessLimit start");
    let limit: number = DEFAULT_RECENT_PROCESS_LIMIT;
    if (mPreferences != null && mPreferences != undefined) {
      limit = mPreferences.getSync(RECENT_PROCESS_LIMIT_KEY, DEFAULT_RECENT_PROCESS_LIMIT);
    }
    console.info("Launcher recents RecentsModel getRecentProcessLimit end limit = " + limit);
    return limit;
  }

  /**
   * Start ability.
   *
   * @param {object} appInfo - The app info.
   */
  startAbility(appInfo) {
    // promise
    console.info('Launcher startApplication abilityname');
    let result = FeatureAbility.startAbility({
      want: {
        bundleName: appInfo.AppId,
        abilityName: appInfo.abilityName
      }
    })
      .then(data =>
    console.info("Launcher promise::then : " + JSON.stringify(data))
    )
      .catch(error =>
    console.info("Launcher promise::catch : " + JSON.stringify(error))
    );
    console.info("Launcher AceApplication : startAbility : " + result);
  }
}