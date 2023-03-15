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

import { Log } from '@ohos/common';
import { windowManager } from '@ohos/common';
import { amsMissionManager } from '@ohos/common';
import { layoutConfigManager } from '@ohos/common';
import { RecentMissionInfo } from '@ohos/common';
import { RecentMissionsModel } from '@ohos/common';
import RecentModeFeatureConfig from '../common/layoutconfig/RecentModeFeatureConfig';

const TAG = 'RecentMissionsViewModel';

/**
 * Class RecentMissionsViewModel.
 */
export class RecentMissionsViewModel {
  private mRecentMissionsModel: RecentMissionsModel;
  private mRecentModeFeatureConfig: RecentModeFeatureConfig;
  private mRecentMissionsLimit: number;
  private mRecentMissionsList: RecentMissionInfo[] = [];

  private constructor() {
    Log.showInfo(TAG, 'constructor start');
    this.mRecentMissionsModel = RecentMissionsModel.getInstance();
    let config = layoutConfigManager.getModeConfig(RecentModeFeatureConfig.RECENT_MISSIONS_MODE_CONFIG);
    if (config instanceof RecentModeFeatureConfig) {
      this.mRecentModeFeatureConfig = <RecentModeFeatureConfig> config;
      this.mRecentMissionsLimit = this.mRecentModeFeatureConfig.getRecentMissionsLimit();
    }
  }

  /**
   * Delete recent missions.
   *
   */
  private async deleteRecentMissions(): Promise<void> {
    await amsMissionManager.clearAllMissions();
  }

  /**
   * Get the recent mission view model object.
   *
   * @return {object} recent mission view model singleton
   */
  static getInstance(): RecentMissionsViewModel {
    if (globalThis.RecentMissionsViewModelInstance == null) {
      globalThis.RecentMissionsViewModelInstance = new RecentMissionsViewModel();
    }
    return globalThis.RecentMissionsViewModelInstance;
  }

  /**
   * Get the recent mission row type.
   *
   * @return {string} row type
   */
  getRecentMissionsRowType(): string {
    return this.mRecentModeFeatureConfig.getRecentMissionsRowType();
  }

  /**
   * Callback function of getRecentMissionsList.
   */
  async getRecentMissionsList(): Promise<void> {
    Log.showDebug(TAG, 'getRecentMissionsList start');
    this.mRecentMissionsList = await amsMissionManager.getRecentMissionsList();
    const snapShotTime = new Date().toString();
    for (let item of this.mRecentMissionsList) {
      item.snapShotTime = snapShotTime;
    }
    if (globalThis.recentMode && windowManager.isSplitWindowMode(globalThis.recentMode)) {
      this.mRecentMissionsList.forEach((item, index) => {
        if (item.missionId == globalThis.splitMissionId) {
          this.mRecentMissionsList.splice(index, 1);
          return;
        }
      });
    }
    Log.showDebug(TAG, `getRecentMissionsList length: ${this.mRecentMissionsList.length}`);
    AppStorage.SetOrCreate('recentMissionsList', this.mRecentMissionsList);
  }

  /**
   * Delete recent mission.
   *
   * @param {boolean} isClickDelBtn - The flag of click delete button.
   * @param {number} missionId - The missionId of current recent mission.
   */
  async deleteRecentMission(isClickDelBtn: boolean, missionId: number): Promise<void> {
    Log.showDebug(TAG, `deleteRecentMissions missionId: ${missionId}`);
    if (!isClickDelBtn && missionId != -1) {
      await amsMissionManager.clearMission(missionId);
      this.mRecentMissionsList = AppStorage.Get('recentMissionsList');
      this.mRecentMissionsList = this.mRecentMissionsList == null ? this.mRecentMissionsList : this.mRecentMissionsList.filter((item) => {
        return item.missionId != missionId;
      });
    } else {
      await this.deleteRecentMissions();
      this.mRecentMissionsList = AppStorage.Get('recentMissionsList');
      this.mRecentMissionsList = this.mRecentMissionsList == null ? this.mRecentMissionsList : this.mRecentMissionsList.filter((item) => {
        return item.lockedState === true;
      });
      if (this.mRecentMissionsList && this.mRecentMissionsList.length) {
        windowManager.minimizeAllApps();
      }
      return;
    }
    animateTo({
      duration: 200,
      curve: Curve.EaseInOut,
      delay: 100,
      playMode: PlayMode.Normal,
      tempo: 0.5,
      iterations: 1,
      onFinish: () => {
      }
    }, () => {
      AppStorage.SetOrCreate('recentMissionsList', this.mRecentMissionsList);
    });
    if (this.mRecentMissionsList.length == 0) {
      this.terminateRecentIfAllClear();
    }
  }

  /**
   * Set recent mission locked status.
   *
   * @param {string} missionId - The missionId of current recent mission.
   * @param {boolean} lockedState - The lockedState of current recent mission.
   */
  setRecentMissionLock(missionId: number, lockedState: boolean): void {
    if (lockedState) {
      amsMissionManager.lockMission(missionId);
    } else {
      amsMissionManager.unlockMission(missionId);
    }
  }

  /**
   * Get mission snapshot
   *
   * @param missionId - The missionId of current recent mission.
   *
   * @return snapshot - The snapshot of current recent mission.
   */
  async getMissionSnapShot(missionId: number, callback?: any) {
    Log.showDebug(TAG, `getMissionSnapShot missionId: ${missionId}`);
    let snapShot = await amsMissionManager.getMissionSnapShot(missionId);
    if (callback != undefined) {
      callback(missionId, snapShot);
    } else {
      return snapShot;
    }
  }

  /**
   * Move the recent mission to front
   *
   * @param missionId - The missionId of current recent mission.
   */
  async moveMissionToFront(missionId: number): Promise<void> {
    if (globalThis.recentMode && windowManager.isSplitWindowMode(globalThis.recentMode)) {
      await amsMissionManager.moveMissionToFront(missionId, globalThis.recentMode);
    } else {
      await amsMissionManager.moveMissionToFront(missionId);
    }
  }

  /**
   * Terminate recent if clear all missions.
   */
  terminateRecentIfAllClear(): void {
    Log.showDebug(TAG, 'terminateRecentIfAllClear all recent cleared');
    windowManager.hideWindow(windowManager.RECENT_WINDOW_NAME);
  }

  /**
   * Back to desktop.
   */
  backView(): void {
    Log.showDebug(TAG, 'backView start');
    windowManager.hideWindow(windowManager.RECENT_WINDOW_NAME);
  }
}