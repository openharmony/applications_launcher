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
import { RdbStoreManager } from './RdbStoreManager';
import { localEventManager } from './LocalEventManager';
import { launcherAbilityManager } from './LauncherAbilityManager';
import BadgeItemInfo from '../bean/BadgeItemInfo';
import { EventConstants } from '../constants/EventConstants';

const TAG = 'BadgeManager';

/**
 * badge manager
 */
export class BadgeManager {
  private readonly mDbStoreManager: RdbStoreManager;

  static UPDATE_BADGE = 'updateBadge';

  private readonly listener;

  private constructor() {
    this.mDbStoreManager = RdbStoreManager.getInstance();
    this.listener = this.appRemovedCallBack.bind(this);
    this.registerAppListEvent();
  }
  /**
   * badge manager instance
   *
   * @return badgeManager instance
   */
  static getInstance(): BadgeManager {
    if (globalThis.BadgeManagerInstance == null) {
      globalThis.BadgeManagerInstance = new BadgeManager();
    }
    return globalThis.BadgeManagerInstance;
  }

  async getAllBadge(): Promise<BadgeItemInfo[]> {
    const badgeList = await this.mDbStoreManager.getAllBadge();
    return badgeList;
  }

  async getBadgeByBundle(bundleName: string, callback: ((badgeNumber: number) => void)): Promise<void> {
    const badgeList = await this.mDbStoreManager.getBadgeByBundle(bundleName);
    if (badgeList.length > 0) {
      callback(badgeList[0].badgeNumber);
    } else {
      callback(0);
    }
  }

  async getBadgeByBundleSync(bundleName: string): Promise<number> {
    const badgeList = await this.mDbStoreManager.getBadgeByBundle(bundleName);
    if (badgeList.length > 0) {
      return badgeList[0].badgeNumber;
    } else {
      return 0;
    }
  }

  async updateBadgeNumber(bundleName: string, badgeNum: number): Promise<boolean> {
    Log.showDebug(TAG, `updateBadgeNumber, bundleName:${bundleName}, badgeNum:${badgeNum}`);
    let result = false;
    if (badgeNum < 0 || this.ifStringIsNull(bundleName)) {
      return result;
    }

    result = await this.mDbStoreManager.updateBadgeByBundle(bundleName, badgeNum);
    if (result) {
      const badgeInfo: BadgeItemInfo = new BadgeItemInfo();
      badgeInfo.bundleName = bundleName;
      badgeInfo.badgeNumber = badgeNum;
      localEventManager.sendLocalEventSticky(EventConstants.EVENT_BADGE_UPDATE, badgeInfo);
    }
    return result;
  }

  /**
   * register app listener.
   */
  registerAppListEvent(): void {
    launcherAbilityManager.registerLauncherAbilityChangeListener(this.listener);
  }

  /**
   * unregister app listener.
   */
  unregisterAppListEvent(): void {
    launcherAbilityManager.unregisterLauncherAbilityChangeListener(this.listener);
  }

  private async appRemovedCallBack(event, bundleName: string, userId): Promise<void> {
    Log.showDebug(TAG, 'Launcher AppModel installationSubscriberCallBack event = ' + event);
    if (event == EventConstants.EVENT_PACKAGE_REMOVED) {
      this.mDbStoreManager.deleteBadgeByBundle(bundleName);
    }
  }

  private ifStringIsNull(str: string | null | undefined): boolean {
    if (str == undefined || str == '' || str == null) {
      return true;
    }
    return false;
  }
}