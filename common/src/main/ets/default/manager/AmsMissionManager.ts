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

import image from '@ohos.multimedia.image';
import missionManager from '@ohos.app.ability.missionManager';
import { Log } from '../utils/Log';
import { CheckEmptyUtils } from '../utils/CheckEmptyUtils';
import { launcherAbilityManager } from './LauncherAbilityManager';
import { SnapShotInfo } from '../bean/SnapShotInfo';
import { MissionInfo } from '../bean/MissionInfo';
import { RecentMissionInfo } from '../bean/RecentMissionInfo';
import { RecentBundleMissionInfo } from '../bean/RecentBundleMissionInfo';
import { windowManager } from './WindowManager';

const TAG = 'AmsMissionManager';

/**
 * missionManager for Launcher
 */
class AmsMissionManager {
  private static readonly RECENT_MISSIONS_LIMIT_NUM = 20;
  private mMissionId: number;
  private mLockState: boolean;

  static getInstance(): AmsMissionManager {
    if (globalThis.AmsMissionManagerInstance == null) {
      globalThis.AmsMissionManagerInstance = new AmsMissionManager();
      // remove this if toolchain fix requireNApi bug
      image.toString();
    }
    return globalThis.AmsMissionManagerInstance;
  }


  /**
   * Get origin recent missions
   *
   * @return {Array} missions
   */
  async getOriginRecentMissionsList(): Promise<Array<missionManager.MissionInfo>> {
    let missionInfos = new Array<missionManager.MissionInfo>();
    await missionManager.getMissionInfos('', AmsMissionManager.RECENT_MISSIONS_LIMIT_NUM)
      .then((res) => {
        if (!CheckEmptyUtils.isEmptyArr(res)) {
          Log.showDebug(TAG, `getOriginRecentMissionsList res.length: ${res.length}`);
          missionInfos = res;
        }
      })
      .catch((err) => {
        Log.showError(TAG, `getOriginRecentMissionsList error: ${JSON.stringify(err)}`);
      });
    return missionInfos;
  }

  /**
   * Get recent missions list
   *
   * @return {Array} missions list
   */
  async getRecentMissionsList(): Promise<Array<RecentMissionInfo>> {
    const recentMissionsList = new Array<RecentMissionInfo>();
    let missionInfos: Array<missionManager.MissionInfo> = await this.getOriginRecentMissionsList();
    if (CheckEmptyUtils.isEmptyArr(missionInfos)) {
      Log.showDebug(TAG, 'getRecentMissionsList Empty');
      return recentMissionsList;
    }
    for (const recentItem of missionInfos) {
      const recentMissionInfo = new RecentMissionInfo();
      recentMissionInfo.missionId = recentItem.missionId;
      recentMissionInfo.bundleName = recentItem.want.bundleName;
      recentMissionInfo.abilityName = recentItem.want.abilityName;
      recentMissionInfo.moduleName = recentItem.want.parameters?.moduleName ? String(recentItem.want.parameters?.moduleName) : '';
      recentMissionInfo.lockedState = recentItem.lockedState;
      const appInfo = await launcherAbilityManager.getAppInfoByBundleName(recentMissionInfo.bundleName, recentMissionInfo.abilityName);
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
  async getRecentBundleMissionsList(): Promise<Array<RecentBundleMissionInfo>> {
    const recentMissionsList = new Array<RecentBundleMissionInfo>();
    let missionInfos: Array<missionManager.MissionInfo> = await this.getOriginRecentMissionsList();
    if (CheckEmptyUtils.isEmptyArr(missionInfos)) {
      Log.showDebug(TAG, 'getRecentBundleMissionsList Empty');
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
        const appInfo = await launcherAbilityManager.getAppInfoByBundleName(bundleName, abilityName);
        if (appInfo == undefined) {
          continue;
        }
        recentTaskInfo.abilityName = appInfo.abilityName;
        recentTaskInfo.moduleName = appInfo.moduleName;
        recentTaskInfo.keyName = bundleName + appInfo.abilityName + appInfo.moduleName;
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
        Log.showDebug(TAG, `clearMission data:${JSON.stringify(data)}`);
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
        Log.showDebug(TAG, `clearAllMissions data: ${JSON.stringify(data)}`);
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
  lockMission(missionId: number): void {
    Log.showInfo(TAG, `lockMission start! missionId: ${missionId}`);
    this.mMissionId = missionId;
    this.mLockState = true;
    missionManager.lockMission(missionId, this.lockCallback.bind(this));
  }

  /**
   * unlockMission
   *
   * @param missionId mission id to unlock.
   */
  unlockMission(missionId: number): void {
    Log.showInfo(TAG, `unlockMission start! missionId: ${missionId}`);
    this.mMissionId = missionId;
    this.mLockState = false;
    missionManager.unlockMission(missionId, this.lockCallback.bind(this));
  }

  private async lockCallback(): Promise<void> {
    Log.showDebug(TAG, `lockCallback start`);
    // update mission recent card
    let mRecentMissionsList = await amsMissionManager.getRecentMissionsList();
    mRecentMissionsList.find(item => {
      return item.missionId === this.mMissionId;
    }).lockedState = this.mLockState;
    if (globalThis.recentMode && windowManager.isSplitWindowMode(globalThis.recentMode)) {
      mRecentMissionsList.forEach((item, index) => {
        if (item.missionId == globalThis.splitMissionId) {
          mRecentMissionsList.splice(index, 1);
          return;
        }
      });
    }
    AppStorage.SetOrCreate('recentMissionsList', mRecentMissionsList);
  };

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
      let missionSnapshot: missionManager.MissionSnapshot = null;
      await missionManager.getMissionSnapShot('', missionId)
        .then((res) => {
          Log.showDebug(TAG, `getMissionSnapShot ${missionId} success ${JSON.stringify(res)}`);
          missionSnapshot = res;
        })
        .catch((err) => {
          Log.showError(TAG, `getMissionSnapShot error: ${JSON.stringify(err)}`);
        });
      const imageInfo = await missionSnapshot.snapshot.getImageInfo();
      Log.showDebug(TAG, `getMissionSnapShot success ${JSON.stringify(imageInfo)}`);
      snapShotInfo.missionId = missionId;
      snapShotInfo.snapShotImage = missionSnapshot.snapshot;
      snapShotInfo.snapShotImageWidth = imageInfo.size.width;
      snapShotInfo.snapShotImageHeight = imageInfo.size.height;
    } catch (err) {
      Log.showError(TAG, `missionManager.getMissionSnapShot err: ${err}`);
    }
    return snapShotInfo;
  }

  /**
   * Move mission to front
   *
   * @param missionId
   */
  async moveMissionToFront(missionId: number, winMode?: number) {
    Log.showInfo(TAG, `moveMissionToFront missionId:  ${missionId}`);
    let promise = winMode ? missionManager.moveMissionToFront(missionId, { windowMode: winMode }) :
    missionManager.moveMissionToFront(missionId);
    const res = await promise.catch(err => {
      Log.showError(TAG, `moveMissionToFront err: ${JSON.stringify(err)}`);
    });
    Log.showDebug(TAG, `moveMissionToFront missionId end: ${JSON.stringify(res)}`);
    return res;
  }
}

export const amsMissionManager = AmsMissionManager.getInstance();