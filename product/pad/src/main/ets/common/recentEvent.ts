
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

import commonEvent from '@ohos.commonEvent';
import { CommonEventSubscribeInfo } from 'commonEvent/commonEventSubscribeInfo';
import { CommonEventData } from 'commonEvent/commonEventData';
import { BusinessError } from 'basic';
import Log from '../../../../../../common/src/main/ets/default/utils/Log';

const TAG = 'RecentEvent';

const commonEventSubscribeInfo: CommonEventSubscribeInfo = {
  events: ['CREATE_RECENT_WINDOW_EVENT']
};

let commonEventSubscriber: CommonEventData | undefined;

class RecentEvent {
  mCallback: Record<string, () => void> = {};

  registerCallback(callback: Record<string, () => void>): void {
    Log.showInfo(TAG, 'registerCallback');
    this.mCallback = callback;
    if (commonEventSubscriber == undefined) {
      void commonEvent.createSubscriber(commonEventSubscribeInfo, this.createRecentCallBack.bind(this));
    }
  }

  private createRecentCallBack(error: BusinessError, data: CommonEventData): void {
    Log.showInfo(TAG, `createRecentCallBack error: ${JSON.stringify(error)} data: ${JSON.stringify(data)}`);
    commonEventSubscriber = data;
    commonEvent.subscribe(data, (error, data) => {
      Log.showInfo(TAG, `subscribe error: ${JSON.stringify(error)} data: ${JSON.stringify(data)}`);
      if (error.code == 0) {
        this.mCallback.onStateChange();
      } else {
        Log.showError(TAG, 'data is error');
      }
    });
  }
}

const recentEvent = new RecentEvent();
export default recentEvent;