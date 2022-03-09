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
import featureAbility from '@ohos.ability.featureAbility';
import launcherAbilityManager from '../../../../../../../common/src/main/ets/default/manager/LauncherAbilityManager';
import amsMissionManager from '../../../../../../../common/src/main/ets/default/manager/AmsMissionManager';
import LayoutConfigManager from '../../../../../../../common/src/main/ets/default/layoutconfig/LayoutConfigManager';
import Log from '../../../../../../../common/src/main/ets/default/utils/Log';
import RecentMissionInfo from '../../../../../../../common/src/main/ets/default/bean/RecentMissionInfo';
import RecentMissionsModel from '../../../../../../../common/src/main/ets/default/model/RecentMissionsModel';
import RecentModeFeatureConfig from '../common/layoutconfig/RecentModeFeatureConfig';

const TAG = 'RecentMissionsViewModel';

/**
 * Class RecentMissionsViewModel.
 */
export default class RecentMissionsViewModel {
  private mRecentMissionsModel: RecentMissionsModel;
  private mRecentModeFeatureConfig: RecentModeFeatureConfig;
  private mRecentMissionsLimit: number;
  private mRecentMissionsList: RecentMissionInfo[] = [];

  private constructor() {
    Log.showInfo(TAG, `constructor start`);
    this.mRecentMissionsModel = RecentMissionsModel.getInstance();
    let config = LayoutConfigManager.getModeConfig(RecentModeFeatureConfig.RECENT_MISSIONS_MODE_CONFIG);
    if (config instanceof RecentModeFeatureConfig) {
      this.mRecentModeFeatureConfig = <RecentModeFeatureConfig>config;
      this.mRecentMissionsLimit = this.mRecentModeFeatureConfig.getRecentMissionsLimit();
    }
  }

  /**
   * Delete recent missions.
   *
   */
  private async deleteRecentMissions() {
    await amsMissionManager.clearAllMissions();
  }

  /**
   * lockMission
   *
   * @param missionId
   */
  private async lockMission(missionId: number) {
    console.info("Launcher AmsMissionManager lockMission start!");
    await amsMissionManager.lockMission(missionId);
  }

  /**
   * unlockMission
   *
   * @param missionId
   */
  private async unlockMission(missionId: number) {
    console.info("Launcher AmsMissionManager unlockMission start!");
    await amsMissionManager.unlockMission(missionId);
  }

  /**
   * Return an instance of RecentMissionsViewModel.
   */
  public static getInstance() {
    if (globalThis.RecentMissionsViewModelInstance == null) {
      globalThis.RecentMissionsViewModelInstance = new RecentMissionsViewModel();
    }
    return globalThis.RecentMissionsViewModelInstance;
  }

  public getRecentMissionsRowType() {
    return this.mRecentModeFeatureConfig.getRecentMissionsRowType();
  }

  /**
   * Callback function of getRecentMissionsList.
   */
  public async getRecentMissionsList() {
    Log.showInfo(TAG, `getRecentMissionsList start`);
    this.mRecentMissionsList = await amsMissionManager.getRecentMissionsList();
    Log.showInfo(TAG, `getRecentMissionsList length: ${this.mRecentMissionsList.length}`);
    AppStorage.SetOrCreate('recentMissionsList', this.mRecentMissionsList);
  }

  /**
   * Delete recent mission.
   *
   * @param {boolean} isClickDelBtn - The flag of click delete button.
   * @param {number} missionId - The missionId of current recent mission.
   */
  public async deleteRecentMission(isClickDelBtn: boolean, missionId: number) {
    Log.showInfo(TAG, `deleteRecentMissions missionId: ${missionId}`);
    let missionIds = [];
    if (!isClickDelBtn && missionId != -1) {
      missionIds.push(missionId);
      await amsMissionManager.clearMission(missionId);
      for (let iRecentMissionsIndex = 0; iRecentMissionsIndex < this.mRecentMissionsList.length; iRecentMissionsIndex++) {
        if (this.mRecentMissionsList[iRecentMissionsIndex].missionId === missionId) {
          this.mRecentMissionsList.splice(iRecentMissionsIndex, 1);
          break;
        }
      }
    } else {
      for (let iRecentMissionsIndex = 0; iRecentMissionsIndex < this.mRecentMissionsList.length; iRecentMissionsIndex++) {
          if (!this.mRecentMissionsList[iRecentMissionsIndex].lockedState) {
            missionIds.push(this.mRecentMissionsList[iRecentMissionsIndex].missionId);
          }
      }
      await this.deleteRecentMissions();
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
    })
    if(this.mRecentMissionsList.length == 0) {
      this.terminateRecentIfAllClear();
    }
  }

  /**
   * Set recent mission locked status.
   *
   * @param {string} missionId - The missionId of current recent mission.
   */
  public async setRecentMissionLock(missionId: number, lockedState: boolean) {
    Log.showInfo(TAG, `setRecentMissionLock missionId: ${missionId}, lockedState: ${lockedState}`);
    if (lockedState) {
      this.lockMission(missionId);
    } else {
      this.unlockMission(missionId);
    }
    this.getRecentMissionsList();
  }

  /**
   * Get mission snapshot
   *
   * @param missionId
   *
   * @return snapshot
   */
  public async getMissionSnapShot(missionId: number, callback?: any) {
    Log.showInfo(TAG, `getMissionSnapShot missionId: ${missionId}`);
    let snapShot = await amsMissionManager.getMissionSnapShot(missionId);
    if (callback != undefined) {
      callback(missionId, snapShot);
    } else {
      return snapShot;
    }
  }

  /**
   * Move mission to front
   *
   * @param missionId
   */
  public async moveMissionToFront(missionId: number) {
    await amsMissionManager.moveMissionToFront(missionId);
  }

  /**
   * Terminate recent.
   */
  public terminateRecentIfAllClear(): void {
    Log.showInfo(TAG, `terminateRecentIfAllClear start`);
    setTimeout(() => {
      if (this.mRecentMissionsList.length === 0) {
        Log.showInfo(TAG, `terminateRecentIfAllClear all recent cleared`);
        featureAbility.terminateAbility();
      }
    }, 1000);
  }

  /**
   * Back to desktop.
   */
  public backView() {
    Log.showInfo(TAG, `backView start`);
    let bundleName = 'com.ohos.launcher';
    let abilityName = 'com.ohos.launcher.MainAbility';
    launcherAbilityManager.startLauncherAbility(abilityName, bundleName);
  }
}