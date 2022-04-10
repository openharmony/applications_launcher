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

import CommonConstants from '../constants/CommonConstants';
import Log from '../utils/Log';

const TAG = 'LocalEventManager';
/**
 * 本地事件管理类
 * 主要职责：
 * 1、事件监听的注册、反注册
 * 2、事件的分发
 */
class LocalEventManager {
  private mEventListenerMap: Object = {};

  private mEventMsgCache: Object = {};

  /**
   * 获取本地事件管理类对象
   *
   * @return 本地事件管理类对象单一实例
   */
  static getInstance(): LocalEventManager {
    if (globalThis.localEventManager == null) {
      Log.showInfo(TAG, 'getInstance');
      globalThis.localEventManager = new LocalEventManager();
    }
    return globalThis.localEventManager;
  }

  /**
   * 注册监听器
   *
   * @param listener 监听对象
   * @param events 监听的事件
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
   * 解除注册监听器
   *
   * @param listener 监听对象
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
   * 同步发送本地广播
   *
   * @param event 事件
   * @param params 事件参数
   */
  sendLocalEvent(event, params?): void {
    Log.showInfo(TAG, `sendLocalEvent event: ${JSON.stringify(event)}`);
    let listenerList = this.mEventListenerMap[event];
    if (listenerList != undefined) {
      Log.showInfo(TAG, `sendLocalEvent listenerList length: ${listenerList.length}`);
      for (let listener of listenerList) {
        listener.onReceiveEvent(event, params);
      }
    } else {
      Log.showInfo(TAG, 'sendLocalEvent, send local event with no receiver');
    }
  }

  /**
   * 异步发送本地广播
   *
   * @param event 事件
   * @param params 事件参数
   */
  async sendLocalEventAsync(event, params?): Promise<void> {
    Log.showInfo(TAG, 'sendLocalEventAsync, send local event async');
    this.sendLocalEvent(event, params);
  }

  /**
   * 发送粘性本地广播(仅支持异步)
   *
   * @param event 事件
   * @param params 事件参数
   */
  async sendLocalEventSticky(event, params): Promise<void> {
    Log.showInfo(TAG, `sendLocalEventSticky, send local event sticky, params: ${JSON.stringify(params)}`);
    this.sendLocalEvent(event, params);
    this.mEventMsgCache[event] = params;
  }
}

const localEventManager = LocalEventManager.getInstance();
export default localEventManager;
