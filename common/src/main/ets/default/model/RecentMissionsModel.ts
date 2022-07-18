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

import { Log } from '../utils/Log';
import { amsMissionManager }from '../manager/AmsMissionManager';

const TAG = 'RecentMissionsModel';

/**
 * Recent missions data model.
 */
export class RecentMissionsModel {

  private constructor() {
  }

  /**
   * Return an instance of RecentMissionsModel.
   *
   * @return {object} the model.
   */
  static getInstance(): RecentMissionsModel {
    if (globalThis.RecentMissionsModelInstance == null) {
      globalThis.RecentMissionsModelInstance = new RecentMissionsModel();
    }
    return globalThis.RecentMissionsModelInstance;
  }

  /**
   * Get recent missions list.
   *
   * @return {Array} the missions list.
   */
  async getRecentMissionsList() {
    Log.showInfo(TAG, 'getRecentMissionsList start');
    const recentMissionsList = await amsMissionManager.getRecentMissionsList();
    Log.showInfo(TAG, `getRecentMissionsList length: ${recentMissionsList.length}`);
    return recentMissionsList;
  }
}