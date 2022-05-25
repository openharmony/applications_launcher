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
import { MissionSnapshot } from 'application/MissionSnapshot';
import launcherAbilityManager from './LauncherAbilityManager';
import RecentBundleMissionInfo from '../bean/RecentBundleMissionInfo';
import RecentMissionInfo from '../bean/RecentMissionInfo';
import SnapShotInfo from '../bean/SnapShotInfo';
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
    Log.showDebug(TAG, 'getInstance');
    if (globalThis.AmsMissionManagerInstance == null) {
      globalThis.AmsMissionManagerInstance = new AmsMissionManager();
    }
    return globalThis.AmsMissionManagerInstance;
  }


  /**
   * Get recent missions list
   *
   * @return {Array} missions list
   */
  async getRecentMissionsList(): Promise<RecentMissionInfo[]> {
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
      Log.showInfo(TAG, 'getRecentMissionsList Empty');
      return recentMissionsList;
    }
    for (const recentItem of listData) {
      const recentMissionInfo = new RecentMissionInfo();
      recentMissionInfo.missionId = recentItem.missionId;
      recentMissionInfo.bundleName = recentItem.want.bundleName;
      recentMissionInfo.abilityName = recentItem.want.abilityName;
      recentMissionInfo.lockedState = recentItem.lockedState;
      const appInfo = await launcherAbilityManager.getAppInfoByBundleAndAbility(recentMissionInfo.bundleName, recentMissionInfo.abilityName);
      if (appInfo == undefined) {
        continue;
      }
      recentMissionInfo.appLabelId = appInfo.appLabelId;
      recentMissionInfo.appIconId = appInfo.appIconId;
      recentMissionInfo.appName = appInfo.appName;
      recentMissionsList.push(recentMissionInfo);
    }
    Log.showInfo(TAG, `getRecentMissionsList recentMissionsList length: ${recentMissionsList.length}`);
    return recentMissionsList;
  }

  /**
   * Get recent missions list group by bundleName
   *
   * @return {Array} missions list
   */
  async getRecentBundleMissionsList(): Promise<RecentBundleMissionInfo[]> {
    const recentMissionsList = new Array<RecentBundleMissionInfo>();
    let missionInfos = new Array();
    try {
      missionInfos = await missionManager.getMissionInfos('', AmsMissionManager.RECENT_MISSIONS_LIMIT_NUM);
      Log.showInfo(TAG, `getRecentBundleMissionsList missionInfos length: ${missionInfos.length}`);
    } catch (err) {
      Log.showError(TAG, `getRecentBundleMissionsList error: ${JSON.stringify(err)}`);
    }
    if (CheckEmptyUtils.isEmptyArr(missionInfos)) {
      Log.showInfo(TAG, 'getRecentBundleMissionsList Empty');
      return recentMissionsList;
    }
    for (let i = 0; i < missionInfos.length; i++) {
      let missionInfo = missionInfos[i];
      let bundleName = missionInfo.want.bundleName!;
      let abilityName = missionInfo.want.abilityName!;
      let localMissionInfo = recentMissionsList.find((item) => item.bundleName === bundleName);
      if (localMissionInfo) {
        let missionInfoAdd = new MissionInfo();
        missionInfoAdd.missionId = missionInfo.missionId;
        localMissionInfo.missionInfoList!.push(missionInfoAdd);
      } else {
        let recentTaskInfo = new RecentBundleMissionInfo();
        recentTaskInfo.bundleName = bundleName;
        const appInfo = await launcherAbilityManager.getAppInfoByBundleAndAbility(bundleName, abilityName);
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
    Log.showInfo(TAG, `getRecentBundleMissionsList recentMissionsList length:${recentMissionsList.length}`);
    return recentMissionsList;
  }

  /**
   * Clear the given mission in the ability manager service.
   *
   * @param missionId
   */
  async clearMission(missionId: number): Promise<void> {
    Log.showInfo(TAG, `clearMission Id:${missionId}`);
    await missionManager.clearMission(missionId)
      .then((data) => {
        Log.showInfo(TAG, `clearMission data:${JSON.stringify(data)}`);
      })
      .catch((err) => {
        Log.showError(TAG, `clearMission err:${JSON.stringify(err)}`);
      });
  }

  /**
   * Clear all missions in the ability manager service.
   * locked mission will not clear
   *
   * @return nothing.
   */
  async clearAllMissions(): Promise<void> {
    await missionManager.clearAllMissions()
      .then((data) => {
        Log.showInfo(TAG, `clearAllMissions data: ${JSON.stringify(data)}`);
      })
      .catch((err) => {
        Log.showError(TAG, `clearAllMissions err: ${JSON.stringify(err)}`);
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
        Log.showError(TAG, `lockMission err: ${JSON.stringify(err)}`);
      });
  }

  /**
   * unlockMission
   *
   * @param missionId mission id to unlock.
   */
  async unlockMission(missionId: number): Promise<void> {
    Log.showInfo(TAG, `unlockMission start! missionId: ${missionId}`);
    await missionManager.unlockMission(missionId)
      .then((data) => {
        Log.showInfo(TAG, `unlockMission data: ${JSON.stringify(data)}`);
      })
      .catch((err) => {
        Log.showError(TAG, `unlockMission err: ${JSON.stringify(err)}`);
      });
  }

  /**
   * Get recent mission snapshot info
   *
   * @param missionId mission id to get snapshot.
   * @return snapshot info
   */
  async getMissionSnapShot(missionId: number): Promise<SnapShotInfo> {
    let snapShotInfo: SnapShotInfo = new SnapShotInfo();
    Log.showInfo(TAG, `getMissionSnapShot start! missionId: ${missionId}`);
    try {
      const missionSnapshot: MissionSnapshot = await missionManager.getMissionSnapShot('', missionId);
      const imageInfo = await missionSnapshot.snapshot.getImageInfo();
      snapShotInfo.missionId = missionId;
      snapShotInfo.snapShotImage = missionSnapshot.snapshot;
      snapShotInfo.snapShotImageWidth = imageInfo.size.width;
      snapShotInfo.snapShotImageHeight = imageInfo.size.height;
    } catch (err) {
      Log.showError(TAG, `missionManager.getMissionSnapShot err: ${err}`);
    }
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