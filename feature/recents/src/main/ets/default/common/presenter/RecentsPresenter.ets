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
import Router from '@system.router';
import RecentsModel from '../model/RecentsModel.ets';
let mRecentsModel: RecentsModel = RecentsModel.getInstance();
let mRecentsLimit: number = mRecentsModel.getRecentProcessLimit();
let recentProcessList = [];

/**
 * Class RecentsPresenter.
 */
export default class RecentsPresenter {
  private static recentsPresenter: RecentsPresenter = new RecentsPresenter();

  /**
   * Return an instance of RecentsPresenter.
   */
  public static getInstance(): RecentsPresenter {
    return this.recentsPresenter;
  }

  /**
   * Callback function of getRecentProcessList.
   */
  getRecentProcessList() {
    console.info("Launcher recents  RecentsPresenter getRecentProcessList start");
    mRecentsModel.getRecentProcessList((data) => {
      let recentProcessList = data;
      if (recentProcessList.length > mRecentsLimit) {
        recentProcessList.splice(0, recentProcessList.length - mRecentsLimit);
      }
      console.info("Launcher recents  RecentsPresenter mRecentsModel.getRecentProcessList getRecentProcessList recentProcessList = " + JSON.stringify(recentProcessList));
    });
    console.info("Launcher recents  RecentsPresenter getRecentProcessList end")
  }

  /**
   * Clear recent process.
   */
  clearRecentProcess() {
    console.info("Launcher recents  RecentsPresenter clearRecentProcess start");
    mRecentsModel.clearRecentProcess();
    console.log("Launcher recents  RecentsPresenter clearRecentProcess recentProcessList" + JSON.stringify(recentProcessList));
    console.info("Launcher recents  RecentsPresenter clearRecentProcess end");
  }

  /**
   * Remove recent process.
   *
   * @param {string} missionId - The missionId of recent process.
   */
  removeRecentProcess(missionId) {
    console.info("Launcher recents  RecentsPresenter removeRecentProcess start missionId = " + missionId);
    mRecentsModel.removeRecentProcess(missionId);
    console.info("Launcher recents  RecentsPresenter removeRecentProcess end");
  }

  /**
   * Back to desktop.
   */
  back() {
    console.info("Launcher recents  RecentsPresenter back start");
    Router.back();
    console.info("Launcher recents  RecentsPresenter back end");
  }

  /**
   * Start app.
   *
   * @param {object} appInfo - The app info.
   */
  startUpApp(appInfo) {
    console.info("Launcher recents  RecentsPresenter startUpApp start appInfo = " + JSON.stringify(appInfo));
    mRecentsModel.startAbility(appInfo);
    console.info("Launcher recents  RecentsPresenter startUpApp end ");
  }
}