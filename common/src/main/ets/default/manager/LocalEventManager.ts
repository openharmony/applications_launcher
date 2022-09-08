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
import { CommonConstants } from '../constants/CommonConstants';

const TAG = 'LocalEventManager';

/**
 * Local event management class
 * main duty:
 * 1.Registration and deregistration of event listeners
 * 2.distribution of events
 */
class LocalEventManager {
  private mEventListenerMap: Object = {};

  private mEventMsgCache: Object = {};

  /**
   * Get the local event management class object
   *
   * @return Single instance of local event management class object
   */
  static getInstance(): LocalEventManager {
    if (globalThis.localEventManager == null) {
      globalThis.localEventManager = new LocalEventManager();
    }
    return globalThis.localEventManager;
  }

  /**
   * register listener
   *
   * @param listener
   * @param events
   */
  registerEventListener(listener, events: string[]): void {
    Log.showInfo(TAG, `registerEventListener events: ${JSON.stringify(events)}`);
    if (listener != null && events != null) {
      for (let index = 0; index < events.length; index++) {
        const event: string = events[index];
        if (this.mEventListenerMap[event] == undefined) {
          this.mEventListenerMap[event] = new Array<any>();
        }
        if (this.mEventListenerMap[event].indexOf(listener) === CommonConstants.INVALID_VALUE) {
          this.mEventListenerMap[event].push(listener);
        }
      }
    }
  }

  /**
   * unregister listener
   *
   * @param listener
   */
  unregisterEventListener(listener): void {
    Log.showInfo(TAG, 'unregisterEventListener event listener');
    for(const key in this.mEventListenerMap) {
      const listenerList: any[] = this.mEventListenerMap[key];
      const index: number = listenerList.indexOf(listener);
      if (index != CommonConstants.INVALID_VALUE) {
        this.mEventListenerMap[key].splice(index, 1);
      }
    }
  }

  /**
   * Send local broadcasts synchronously
   *
   * @param event
   * @param params
   */
  sendLocalEvent(event, params?): void {
    Log.showInfo(TAG, `sendLocalEvent event: ${JSON.stringify(event)}`);
    let listenerList = this.mEventListenerMap[event];
    if (listenerList != undefined) {
      Log.showDebug(TAG, `sendLocalEvent listenerList length: ${listenerList.length}`);
      for (let listener of listenerList) {
        listener.onReceiveEvent(event, params);
      }
    } else {
      Log.showInfo(TAG, 'sendLocalEvent, send local event with no receiver');
    }
  }

  /**
   * Send local broadcast asynchronously
   *
   * @param event
   * @param params
   */
  async sendLocalEventAsync(event, params?): Promise<void> {
    this.sendLocalEvent(event, params);
  }

  /**
   * Send sticky local broadcast (async only)
   *
   * @param event
   * @param params
   */
  async sendLocalEventSticky(event, params): Promise<void> {
    Log.showDebug(TAG, `sendLocalEventSticky, send local event sticky, params: ${JSON.stringify(params)}`);
    this.sendLocalEvent(event, params);
    this.mEventMsgCache[event] = params;
  }
}

export const localEventManager = LocalEventManager.getInstance();
