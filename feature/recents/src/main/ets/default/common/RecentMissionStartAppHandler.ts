/**
 * Copyright (c) 2022-2022 Huawei Device Co., Ltd.
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

import { BaseStartAppHandler , Log } from '@ohos/common';
import { RecentsStyleConstants } from './constants/RecentsStyleConstants';


const TAG = 'RecentMissionStartAppHandler';

/**
 * Desktop workspace start app processing class
 */
export class RecentMissionStartAppHandler extends BaseStartAppHandler {
  private constructor() {
    super();
  }

  static getInstance(): RecentMissionStartAppHandler {
    if (globalThis.RecentMissionStartAppHandler == null) {
      globalThis.RecentMissionStartAppHandler = new RecentMissionStartAppHandler();
    }
    return globalThis.RecentMissionStartAppHandler;
  }

  protected calculateAppIconPosition(): void {
    const RecentMissionInfo = AppStorage.Get('startAppItemInfo');
    Log.showInfo(TAG, `recentMission_CalculateAppIconPosition:${JSON.stringify(RecentMissionInfo)} `);
    const isSingleLayout = RecentMissionInfo['isSingleLayout'];
//    this.mAppIconSize = RecentsStyleConstants.SINGLE_LIST_DEFAULT_APP_ICON_SIZE_NEW ;
    const position = RecentMissionInfo['position'];
    this.mAppIconPositionX = position.x;
    this.mAppIconPositionY = position.y;
  }

}
