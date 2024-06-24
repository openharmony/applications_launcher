/*
 * Copyright (c) 2022 Huawei Device Co., Ltd.
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

import { AsyncCallback} from '@ohos.base';
import inputMonitor from '@ohos.multimodalInput.inputMonitor';
import {
  Log,
  CommonConstants,
  settingsDataManager,
  localEventManager,
  EventConstants
} from '@ohos/common';
import dataShare from '@ohos.data.dataShare';
import GestureNavigationExecutors from './GestureNavigationExecutors';
import display from '@ohos.display';

const TAG = 'GestureNavigationManage';

export class GestureNavigationManager {
  private readonly uri: string | null = null;
  private helper: dataShare.DataShareHelper;
  private MAX_RETRY_TIME = 10;
  private readonly sGestureNavigationExecutors: GestureNavigationExecutors = GestureNavigationExecutors.getInstance();
  private touchEventCallback: inputMonitor.TouchEventReceiver | null = null;

  private constructor() {
    this.uri = settingsDataManager.getUri(CommonConstants.NAVIGATION_BAR_STATUS_KEY);
    this.helper = settingsDataManager.getHelper(globalThis.desktopContext, this.uri);
  }

  private setValue(value: string) {
    settingsDataManager.setValue(this.helper, CommonConstants.NAVIGATION_BAR_STATUS_KEY, value);
  }

  private getValue() {
    return settingsDataManager.getValue(this.helper, CommonConstants.NAVIGATION_BAR_STATUS_KEY, '1');
  }

  /**
   * Monitor data changes.
   * @param callback
   */
  private registerListenForDataChanges(callback: AsyncCallback<void>) {
    this.helper = settingsDataManager.getHelper(globalThis.desktopContext, this.uri);
    Log.showInfo(TAG, 'helper:' + this.helper +  'registerListenForDataChanges uri:' + this.uri);
    this.helper.on('dataChange', this.uri, callback);
  }

  initWindowSize(display: display.Display) {
    if (globalThis.sGestureNavigationExecutors) {
      globalThis.sGestureNavigationExecutors.setScreenWidth(display.width);
      globalThis.sGestureNavigationExecutors.setScreenHeight(display.height);
      this.touchEventCallback = globalThis.sGestureNavigationExecutors.touchEventCallback
        .bind(globalThis.sGestureNavigationExecutors);
      settingsDataManager.createDataShareHelper(this.MAX_RETRY_TIME);
    }
  }

  private getGestureNavigationStatus() {
    Log.showDebug(TAG, 'getGestureNavigationStatus enter');
    let gestureNavigationStatus = null;
    try {
      gestureNavigationStatus = this.getValue();
      Log.showDebug(TAG, `getGestureNavigationStatus gestureNavigationStatus:  ${gestureNavigationStatus}`);
      this.handleEventSwitches(gestureNavigationStatus);

      // 初始化时保持弹窗的距离底部的位置和（打开/关闭）三键时的位置一致
      AppStorage.setOrCreate('NavigationBarStatusValue', gestureNavigationStatus === '0' ? true : false);

      this.registerListenForDataChanges(this.dataChangesCallback.bind(this));
    } catch (error) {
      Log.showError(TAG, `getGestureNavigationStatus error: ${JSON.stringify(error)}`);
    }
  }

  private dataChangesCallback(data: any) {
    Log.showInfo(TAG, 'dataChangesCallback data:' + data);
    const getRetValue = this.getValue();
    this.handleEventSwitches(getRetValue);
    AppStorage.setOrCreate('NavigationBarStatusValue', getRetValue === '0' ? true : false);
    localEventManager.sendLocalEventSticky(EventConstants.EVENT_NAVIGATOR_BAR_STATUS_CHANGE, getRetValue);
  }

  private turnOnTouchEventCallback() {
    Log.showWarn(TAG, 'turnOnTouchEventCallback start');
    inputMonitor.on('touch', this.touchEventCallback);
  }

  private turnOffTouchEventCallback() {
    Log.showWarn(TAG, 'turnOffTouchEventCallback start');
    inputMonitor.off('touch', this.touchEventCallback);
  }

  private handleEventSwitches(gestureNavigationStatus: string) {
    if (gestureNavigationStatus == '0') {
      this.turnOnTouchEventCallback();
    } else {
      this.turnOffTouchEventCallback();
    }
  }

  /**
   * Get the GestureNavigationManage instance.
   */
  static getInstance(): GestureNavigationManager {
    if (globalThis.sGestureNavigationManager == null) {
      globalThis.sGestureNavigationManager = new GestureNavigationManager();
    }
    return globalThis.sGestureNavigationManager;
  }
}