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

import router from '@system.router';
import featureAbility from '@ohos.ability.featureAbility';
import launcherAbilityManager from '../../../../../../../../common/src/main/ets/default/manager/LauncherAbilityManager.ets';
import RecentsModel from '../../../../../../../../common/src/main/ets/default/model/RecentsModel.ets';
import LayoutConfigManager from '../../../../../../../../common/src/main/ets/default/layoutconfig/LayoutConfigManager.ets';
import RecentModeConfig from '../../../../../../../../common/src/main/ets/default/layoutconfig/RecentModeConfig.ets';

/**
 * Class RecentsPresenter.
 */
export default class RecentsPresenter {
  private static sRecentsPresenter: RecentsPresenter = null;
  private mRecentsModel: RecentsModel;
  private mRecentModeConfig: RecentModeConfig;
  private mRecentsLimit: number;
  private mRecentProcessList = [];

  private constructor() {
    this.mRecentsModel = new RecentsModel();
    this.mRecentModeConfig = LayoutConfigManager.getModeConfig(RecentModeConfig.RECENT_MODE_CONFIG);
    this.mRecentsLimit = this.mRecentModeConfig.getRecentProcessLimit();
  }

  /**
   * Return an instance of RecentsPresenter.
   */
  public static getInstance(): RecentsPresenter {
    if (RecentsPresenter.sRecentsPresenter == null) {
      RecentsPresenter.sRecentsPresenter = new RecentsPresenter();
    }
    return RecentsPresenter.sRecentsPresenter;
  }

  /**
   * Callback function of getRecentProcessList.
   */
  public async getRecentProcessList() {
    console.info("Launcher recents  RecentsPresenter getRecentProcessList start");
    this.mRecentProcessList = [];
    let allRecentList = await this.mRecentsModel.getRecentProcessList();
    for (let i = 0; i < this.mRecentsLimit && i < allRecentList.length; i++) {
      this.mRecentProcessList.push(allRecentList[i])
    }
    console.info("Launcher recents  RecentsPresenter getRecentProcessList length" + this.mRecentProcessList.length);
    AppStorage.SetOrCreate('recentProcessList', this.mRecentProcessList);
  }

  /**
   * Clear recent process.
   */
  public async clearRecentProcess() {
    console.info("Launcher recents  RecentsPresenter clearRecentProcess");
    await launcherAbilityManager.clearRecentTask();
    this.mRecentProcessList = [];
    AppStorage.SetOrCreate('recentProcessList', this.mRecentProcessList);
    this.terminateRecentIfAllClear();
  }

  /**
   * Remove recent process.
   *
   * @param {string} missionId - The missionId of recent process.
   */
  public async removeRecentProcess(missionId) {
    console.info("Launcher recents  RecentsPresenter removeRecentProcess missionId " + missionId);
    await launcherAbilityManager.removeRecentTask(missionId);
    for (let i = 0; i < this.mRecentProcessList.length; i++) {
      if (this.mRecentProcessList[i].missionId === missionId) {
        this.mRecentProcessList.splice(i, 1);
        break;
      }
    }
    AppStorage.SetOrCreate('recentProcessList', this.mRecentProcessList);
    this.terminateRecentIfAllClear();
  }

  private terminateRecentIfAllClear(): void {
    setTimeout(() => {
      if (this.mRecentProcessList.length == 0) {
        console.info("Launcher recents  all recent cleared");
        featureAbility.terminateAbility();
      }
    },1000);
  }

  /**
   * Back to desktop.
   */
  public back() {
    console.info("Launcher recents  RecentsPresenter back");
    router.back();
  }

  /**
   * Start app.
   *
   * @param {object} appInfo - The app info.
   */
  public startUpApp(abilityName, bundleName) {
    console.info("Launcher recents  RecentsPresenter startUpApp abilityName: " + abilityName);
    launcherAbilityManager.startLauncherAbility(abilityName, bundleName);
  }
}