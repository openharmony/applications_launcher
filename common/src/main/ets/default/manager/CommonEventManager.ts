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

import CommonEvent from '@ohos.commonEvent';
import { AsyncCallback } from 'basic';
import { CommonEventData } from 'commonEvent/commonEventData';
import { CommonEventSubscriber } from 'commonEvent/commonEventSubscriber';

const TAG = 'CommonEventManager';

/**
 * Wrapper class for CommonEvent.
 */
class CommonEventManager {
  RECENT_FULL_SCREEN = 'CREATE_RECENT_WINDOW_EVENT';
  RECENT_SPLIT_SCREEN = 'common.event.SPLIT_SCREEN';

  private callbackList: AsyncCallback<CommonEventData>[] = [];
  private subscriberList: CommonEventSubscriber[] = [];

  /**
   * get CommonEventManager instance
   *
   * @return CommonEventManager singleton
   */
  static getInstance(): CommonEventManager {
    if (globalThis.CommonEventManager == null) {
      globalThis.CommonEventManager = new CommonEventManager();
    }
    return globalThis.CommonEventManager;
  }

  private constructor() {
  }

  /**
   * Register common event listener.
   */
  public registerCommonEvent(subscriber: CommonEventSubscriber, eventCallback: AsyncCallback<CommonEventData>): void {
    if (this.subscriberList.indexOf(subscriber) != -1) {
      return;
    }
    CommonEvent.subscribe(subscriber, eventCallback);
    this.subscriberList.push(subscriber);
    this.callbackList.push(eventCallback);
  }

  /**
   * Unregister common event listener.
   */
  public unregisterCommonEvent(subscriber: CommonEventSubscriber, eventCallback: AsyncCallback<CommonEventData>): void {
    const subscriberIndex: number = this.subscriberList.indexOf(subscriber);
    const callbackIndex: number = this.callbackList.indexOf(eventCallback);
    if (subscriberIndex != -1) {
      CommonEvent.unsubscribe(subscriber);
      this.subscriberList.splice(subscriberIndex, 1);
    }
    callbackIndex != -1 && this.callbackList.splice(callbackIndex, 1);
  }
}

const commonEventManager = CommonEventManager.getInstance();
export default commonEventManager;
