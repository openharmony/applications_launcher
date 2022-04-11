/**
 * Copyright (c) 2021-2022 Huawei Device Co., Ltd.
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

import missionManager from '@ohos.application.missionManager';
import launcherAbilityManager from './LauncherAbilityManager';
import RecentBundleMissionInfo from '../bean/RecentBundleMissionInfo';
import RecentMissionInfo from '../bean/RecentMissionInfo';
import MissionInfo from '../bean/MissionInfo';
import CheckEmptyUtils from '../utils/CheckEmptyUtils';
import image from '@ohos.multimedia.image';
import Log from '../utils/Log';

const TAG = 'AmsMissionManager';

/**
 * missionManager for Launcher
 */
class AmsMissionManager {
  private static readonly RECENT_MISSIONS_LIMIT_NUM = 20;

  static getInstance(): AmsMissionManager {
    if (globalThis.AmsMissionManagerInstance == null) {
      globalThis.AmsMissionManagerInstance = new AmsMissionManager();
    }
    Log.showInfo(TAG, 'getInstance!');
    return globalThis.AmsMissionManagerInstance;
  }


  /**
   * Get recent missions list
   *
   * @return {Array} missions list
   */
  async getRecentMissionsList(): Promise<RecentMissionInfo[]> {
    Log.showInfo(TAG, 'getRecentMissionsList start');
    const recentMissionsList = new Array<RecentMissionInfo>();
    let listData = new Array();
    await missionManager.getMissionInfos('', AmsMissionManager.RECENT_MISSIONS_LIMIT_NUM)
      .then((res) => {
        Log.showInfo(TAG, `getRecentMissionsList res.length: ${res.length}`);
        listData = res;
      })
      .catch((err) => {
        Log.showError(TAG, `getRecentMissionsList error: ${JSON.stringify(err)}`);
      });
    if (CheckEmptyUtils.isEmptyArr(listData)) {
      Log.showError(TAG, 'getRecentMissionsList Empty');
      return recentMissionsList;
    }
    for (let i = 0; i < listData.length; i++) {
      const recentMissionInfo = new RecentMissionInfo();
      recentMissionInfo.missionId = listData[i].missionId;
      recentMissionInfo.bundleName = listData[i].want.bundleName;
      recentMissionInfo.abilityName = listData[i].want.abilityName;
      recentMissionInfo.lockedState = listData[i].lockedState;
      const appInfo = await launcherAbilityManager.getAppInfoByBundleName(recentMissionInfo.bundleName);
      if (appInfo == undefined) {
        continue;
      }
      recentMissionInfo.appLabelId = appInfo.appLabelId;
      recentMissionInfo.appIconId = appInfo.appIconId;
      recentMissionInfo.appName = appInfo.appName;
      recentMissionsList.push(recentMissionInfo);
    }
    Log.showInfo(TAG, `getRecentMissionsList recentMissionsList.length: ${recentMissionsList.length}`);
    return recentMissionsList;
  }

  /**
   * Get recent missions list group by bundleName
   *
   * @return {Array} missions list
   */
  async getRecentBundleMissionsList(): Promise<RecentBundleMissionInfo[]> {
    Log.showInfo(TAG, 'getRecentBundleMissionsList start');
    const recentMissionsList = new Array<RecentBundleMissionInfo>();
    let missionInfos = new Array();
    try {
      missionInfos = await missionManager.getMissionInfos('', AmsMissionManager.RECENT_MISSIONS_LIMIT_NUM);
      Log.showInfo(TAG, `getRecentBundleMissionsList missionInfos length: ${missionInfos.length}`);
    } catch (err) {
      Log.showError(TAG, `getRecentBundleMissionsList error ${JSON.stringify(err)}`);
    }
    if (CheckEmptyUtils.isEmptyArr(missionInfos)) {
      Log.showError(TAG, 'getRecentBundleMissionsList Empty');
      return recentMissionsList;
    }
    for (let i = 0; i < missionInfos.length; i++) {
      let missionInfo = missionInfos[i];
      let bundleName = missionInfo.want.bundleName!;
      let localMissionInfo = recentMissionsList.find((item) => item.bundleName === bundleName);
      if (localMissionInfo) {
        let missionInfoAdd = new MissionInfo();
        missionInfoAdd.missionId = missionInfo.missionId;
        localMissionInfo.missionInfoList!.push(missionInfoAdd);
      } else {
        let recentTaskInfo = new RecentBundleMissionInfo();
        recentTaskInfo.bundleName = bundleName;
        const appInfo = await launcherAbilityManager.getAppInfoByBundleName(bundleName);
        if (appInfo == undefined) {
          continue;
        }
        recentTaskInfo.abilityName = appInfo.abilityName;
        recentTaskInfo.appLabelId = appInfo.appLabelId;
        recentTaskInfo.appIconId = appInfo.appIconId;
        recentTaskInfo.appName = appInfo.appName;
        recentTaskInfo.missionInfoList = new Array<MissionInfo>();
        let missionInfoAdd = new MissionInfo();
        missionInfoAdd.missionId = missionInfo.missionId;
        recentTaskInfo.missionInfoList.push(missionInfoAdd);
        recentMissionsList.push(recentTaskInfo);
      }
    }
    Log.showInfo(TAG, `getRecentBundleMissionsList recentMissionsList.length:${recentMissionsList.length}`);
    return recentMissionsList;
  }

  /**
   * Clear the given mission in the ability manager service.
   *
   * @param missionId
   */
  async clearMission(missionId: number): Promise<void> {
    Log.showInfo(TAG, `clearMission start! missionId:${missionId}`);
    await missionManager.clearMission(missionId)
      .then((data) => {
        Log.showInfo(TAG, `clearMission data:${JSON.stringify(data)}`);
      })
      .catch((err) => {
        Log.showInfo(TAG, `clearMission err:${JSON.stringify(err)}`);
      });
  }

  /**
   * Clear all missions in the ability manager service.
   * locked mission will not clear
   *
   * @return nothing.
   */
  async clearAllMissions(): Promise<void> {
    Log.showInfo(TAG, 'clearAllMissions start!');
    await missionManager.clearAllMissions()
      .then((data) => {
        Log.showInfo(TAG, `clearAllMissions data: ${JSON.stringify(data)}`);
      })
      .catch((err) => {
        Log.showInfo(TAG, `clearAllMissions err: ${JSON.stringify(err)}`);
      });
  }

  /**
   * lockMission
   *
   * @param missionId mission id to lock.
   */
  async lockMission(missionId: number): Promise<void> {
    Log.showInfo(TAG, `lockMission start! missionId: ${missionId}`);
    await missionManager.lockMission(missionId)
      .then((data) => {
        Log.showInfo(TAG, `lockMission data: ${JSON.stringify(data)}`);
      })
      .catch((err) => {
        Log.showInfo(TAG, `lockMission err: ${JSON.stringify(err)}`);
      });
  }

  /**
   * unlockMission
   *
   * @param missionId mission id to unlock.
   */
  async unlockMission(missionId: number): Promise<void> {
    console.info(`unlockMission start! missionId: ${missionId}`);
    await missionManager.unlockMission(missionId)
      .then((data) => {
        Log.showInfo(TAG, `unlockMission data: ${JSON.stringify(data)}`);
      })
      .catch((err) => {
        Log.showInfo(TAG, `unlockMission err: ${JSON.stringify(err)}`);
      });
  }

  /**
   * Get recent mission snapshot info
   *
   * @param missionId mission id to get snapshot.
   * @return snapshot info
   */
  async getMissionSnapShot(missionId: number): Promise<object> {
    Log.showInfo(TAG, `getMissionSnapShot start! missionId: ${missionId}`);
    let snapShotInfo: any;
    const pixelMap: {
      image: any,
      missionId: number,
      width: number,
      height: number
    } = {
      missionId: -1,
      image: '/common/pics/img_app_default.png',
      width:0,
      height:0
    };
    const snapshotMap = await missionManager.getMissionSnapShot('', missionId);
    pixelMap.image = snapshotMap.snapshot;
    pixelMap.missionId = missionId;
    const imageInfo = await snapshotMap.snapshot.getImageInfo();
    pixelMap.width = imageInfo.size.width;
    pixelMap.height = imageInfo.size.height;
    snapShotInfo = pixelMap;
    Log.showInfo(TAG, `getMissionSnapShot return ${JSON.stringify(snapShotInfo)}`);
    return snapShotInfo;
  }

  /**
   * Move mission to front
   *
   * @param missionId
   */
  async moveMissionToFront(missionId: number) {
    Log.showInfo(TAG, `moveMissionToFront missionId:  ${missionId}`);
    const res = await missionManager.moveMissionToFront(missionId).catch(err => {
      Log.showError(TAG, `moveMissionToFront err: ${JSON.stringify(err)}`);
    });
    Log.showInfo(TAG, `moveMissionToFront missionId end: ${JSON.stringify(res)}`);
    return res;
  }
}

const amsMissionManager = AmsMissionManager.getInstance();

export default amsMissionManager;