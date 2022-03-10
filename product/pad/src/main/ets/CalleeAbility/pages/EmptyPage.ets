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
import AppBadgeMessage from '../../../../../../../common/src/main/ets/default/bean/AppBadgeMessage';
import BadgeManager from '../../../../../../../common/src/main/ets/default/manager/BadgeManager';
import CommonConstants from '../../../../../../../common/src/main/ets/default/constants/CommonConstants';
import RdbStoreManager from '../../../../../../../common/src/main/ets/default/manager/RdbStoreManager';

@Entry
@Component
struct EmptyPage {

  private aboutToAppear(): void  {
    console.log('Launcher CalleeAbility aboutToAppear');
    let dbStore = RdbStoreManager.getInstance();
    dbStore.initRdbConfig();
    globalThis.callee.on(BadgeManager.UPDATE_BADGE, this.updateBadge);
  }

  private updateBadge(badgeData) {
    console.log('Launcher CalleeAbility updateBadge is called');
    let badgeMsg = new AppBadgeMessage(CommonConstants.INVALID_VALUE, '');
    badgeData.readSequenceable(badgeMsg);
    console.log(`updateBadge is called, badgeMsg.badge:${badgeMsg.badge}, badgeMsg.bundleName:${badgeMsg.bundleName}`);
    BadgeManager.getInstance().updateBadgeNumber(badgeMsg.bundleName, badgeMsg.badge);
    return new AppBadgeMessage(0, "update badge success");
  }

  build() {
  }
}