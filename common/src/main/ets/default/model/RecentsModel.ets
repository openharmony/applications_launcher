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

import launcherAbilityManager from '../manager/LauncherAbilityManager.ets';

/**
 * 最近任务信息数据模型
 */
export default class RecentModel {
  private static sRecentModel: RecentModel = null;

  constructor() {
  }

  /**
   * return an instance of RecentModel.
   */
  public static getInstance() {
    if (RecentModel.sRecentModel ==  null) {
      RecentModel.sRecentModel = new RecentModel();
    }
    return RecentModel.sRecentModel;
  }

  /**
   * Get recent process list.
   *
   * @return The process list.
   */
  public async getRecentProcessList() {
    console.info('Launcher recents RecentModel getRecentProcessList');
    let recentTaskList = await launcherAbilityManager.getRecentTaskListFromMission();
    console.info('Launcher recents getRecentTaskListFromMission length ' + recentTaskList.length);
    return recentTaskList;
  }
}