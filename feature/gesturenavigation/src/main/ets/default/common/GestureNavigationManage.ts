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

import inputMonitor from '@ohos.multimodalInput.inputMonitor';
import Log from '../../../../../../../common/src/main/ets/default/utils/Log';
import settingsDataManager from '../../../../../../../common/src/main/ets/default/manager/SettingsDataManager';
import CommonConstants from '../../../../../../../common/src/main/ets/default/constants/CommonConstants';
import GestureNavigationExecutors from './GestureNavigationExecutors';

const TAG = 'GestureNavigationManage';

export default class GestureNavigationManage {
  private readonly uri: string | null = null;
  private readonly helper: any = null;
  private readonly sGestureNavigationExecutors: GestureNavigationExecutors = GestureNavigationExecutors.getInstance();
  private touchEventCallback: inputMonitor.TouchEventReceiver | null = null;

  private constructor() {
    this.uri = settingsDataManager.getUri(CommonConstants.NAVIGATION_BAR_STATUS_KEY);
    Log.showDebug(TAG, `constructor uri:${this.uri}`);
    this.helper = settingsDataManager.getHelper(globalThis.desktopContext, this.uri);
    Log.showDebug(TAG, `constructor helper:${this.helper}`);
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
  private registerListenForDataChanges(callback: Function) {
    this.helper.on('dataChange', this.uri, callback);
  }

  initWindowSize(display: any) {
    if (globalThis.sGestureNavigationExecutors) {
      globalThis.sGestureNavigationExecutors.setScreenWidth(display.width);
      globalThis.sGestureNavigationExecutors.setScreenHeight(display.height);
      this.touchEventCallback = globalThis.sGestureNavigationExecutors.touchEventCallback
        .bind(globalThis.sGestureNavigationExecutors);
      this.getGestureNavigationStatus();
    }
  }

  private getGestureNavigationStatus() {
    Log.showDebug(TAG, 'getGestureNavigationStatus enter');
    let gestureNavigationStatus = null;
    try{
      gestureNavigationStatus = this.getValue();
      Log.showDebug(TAG, `getGestureNavigationStatus gestureNavigationStatus:  ${gestureNavigationStatus}`);
      this.handleEventSwitches(gestureNavigationStatus);
      this.registerListenForDataChanges(this.dataChangesCallback.bind(this));
    }catch (error) {
      Log.showError(TAG, `getGestureNavigationStatus error: ${JSON.stringify(error)}`);
    }
  }

  private dataChangesCallback(data: any) {
    if (data.code !== 0) {
      Log.showDebug(TAG, `dataChangesCallback failed, because ${data.message}`);
    } else {
      const getRetValue = this.getValue();
      this.handleEventSwitches(getRetValue);
      AppStorage.SetOrCreate('NavigationBarStatusValue', getRetValue == '0' ? true : false);
      Log.showDebug(TAG, `dataChangesCallback getRetValue ${getRetValue}`);
    }
  }

  private turnOnTouchEventCallback() {
    inputMonitor.on('touch', this.touchEventCallback);
  }

  private turnOffTouchEventCallback() {
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
  static getInstance(): GestureNavigationManage {
    if (globalThis.sGestureNavigationManage == null) {
      globalThis.sGestureNavigationManage = new GestureNavigationManage();
    }
    return globalThis.sGestureNavigationManage;
  }
}