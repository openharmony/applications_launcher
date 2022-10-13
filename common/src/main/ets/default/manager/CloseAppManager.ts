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

import { BaseCloseAppHandler } from '../base/BaseCloseAppHandler';
import { CheckEmptyUtils } from '../utils/CheckEmptyUtils';
import { Log } from '../utils/Log';

const TAG = 'CloseAppManager';

/**
 * close app manager
 */
export class CloseAppManager {
  private mBaseCloseAppHandlerList: Array<BaseCloseAppHandler> = new Array<BaseCloseAppHandler>();
  private mPagedesktopCloseItemInfo: any;
  private mPagedesktopClosePosition: {
    appIconSize: number,
    appIconHeight: number,
    appIconPositionX: number,
    appIconPositionY: number
  } = { appIconSize: 0,
    appIconHeight: 0,
    appIconPositionX: 0,
    appIconPositionY: 0 };
  private mSmartdockCloseItemInfo: any;
  private mSmartdockClosePosition: {
    appIconSize: number,
    appIconHeight: number,
    appIconPositionX: number,
    appIconPositionY: number
  } = { appIconSize: 0,
    appIconHeight: 0,
    appIconPositionX: 0,
    appIconPositionY: 0 }

  constructor() {
  }

  static getInstance(): CloseAppManager {
    if (globalThis.CloseAppManager == null) {
      globalThis.CloseAppManager = new CloseAppManager();
    }
    return globalThis.CloseAppManager;
  }

  /**
   * register baseCloseAppHandler to manager
   *
   * @param baseCloseAppHandler the instance of close app handler
   */
  public registerCloseAppHandler(baseCloseAppHandler: BaseCloseAppHandler): void {
    if (CheckEmptyUtils.isEmpty(baseCloseAppHandler)) {
      Log.showError(TAG, `registerCloseAppHandler with invalid baseCloseAppHandler`)
      return;
    }

    this.mBaseCloseAppHandlerList.push(baseCloseAppHandler);
    Log.showInfo(TAG, `registerCloseAppHandler mBaseCloseAppHandlerList is ${this.mBaseCloseAppHandlerList.length}} `)
  }

  /**
   * unregister baseCloseAppHandler to manager
   *
   * @param baseCloseAppHandler the instance of close app handler
   */
  public unregisterCloseAppHandler(baseCloseAppHandler: BaseCloseAppHandler): void {
    if (CheckEmptyUtils.isEmpty(baseCloseAppHandler)) {
      Log.showError(TAG, `unregisterCloseAppHandler with invalid baseCloseAppHandler`)
      return;
    }

    let index: number = 0;
    for (var i = 0; i < this.mBaseCloseAppHandlerList.length; i++) {
      if (this.mBaseCloseAppHandlerList[i] === baseCloseAppHandler) {
        index = i;
        break;
      }
    }

    this.mBaseCloseAppHandlerList.splice(index, 1);
    Log.showInfo(TAG, `unregisterCloseAppHandler mBaseCloseAppHandlerList is ${this.mBaseCloseAppHandlerList.length}`)
  }

  /**
   * get app icon info
   *
   * @param windowTarget windowTarget close window target
   */
  public getAppIconInfo(windowTarget): void {
    if (CheckEmptyUtils.isEmptyArr(this.mBaseCloseAppHandlerList)) {
      Log.showError(TAG, `getAppIconInfo with invalid mBaseCloseAppHandlerList`);
      return;
    }

    for (var i = 0; i < this.mBaseCloseAppHandlerList.length; i++) {
      this.mBaseCloseAppHandlerList[i].getAppIconInfo(windowTarget);
    }
  }

  /**
   * get app icon info
   *
   * @param windowTarget windowTarget close window target
   */
  public getAppInfo(windowTarget): any {
    if (CheckEmptyUtils.isEmptyArr(this.mBaseCloseAppHandlerList)) {
      Log.showError(TAG, `getAppIconInfo with invalid mBaseCloseAppHandlerList`);
      return {};
    }

    for (var i = 0; i < this.mBaseCloseAppHandlerList.length; i++) {
      this.mBaseCloseAppHandlerList[i].getAppIconInfo(windowTarget);
    }

    return {iconInfo: this.getAppCloseIconInfo(), appItemInfo: this.getAppCloseItemInfo()}
  }

  public addPagedesktopClosePosition(pagedesktopCloseIconInfo: any, pagedesktopCloseItemInfo?: any) {
    Log.showDebug(TAG, `addPagedesktopClosePosition pagedesktopCloasIconInfo is ${JSON.stringify(pagedesktopCloseIconInfo)}`)
    this.mPagedesktopClosePosition = pagedesktopCloseIconInfo;
    this.mPagedesktopCloseItemInfo = pagedesktopCloseItemInfo;
  }

  public addSmartDockClosePosition(smartdockCloseIconInfo: any, smartdockCloseItemInfo: any) {
    Log.showDebug(TAG, `addSmartDockClosePosition smartdockCloasIconInfo is ${JSON.stringify(smartdockCloseIconInfo)}`)
    this.mSmartdockClosePosition = smartdockCloseIconInfo;
    this.mSmartdockCloseItemInfo = smartdockCloseItemInfo;
  }

  public getAppCloseIconInfo(): any{
    if (CheckEmptyUtils.isEmpty(this.mPagedesktopClosePosition)) {
      Log.showDebug(TAG, `getAppCloseIconInfo return mSmartdockClosePosition is ${JSON.stringify(this.mSmartdockClosePosition)}`)
      return this.mSmartdockClosePosition;
    } else {
      Log.showDebug(TAG, `getAppCloseIconInfo return mPagedesktopClosePosition is ${JSON.stringify(this.mPagedesktopClosePosition)}`)
      return this.mPagedesktopClosePosition;
    }
  }

  public getAppCloseItemInfo(): any{
    if (CheckEmptyUtils.isEmpty(this.mPagedesktopClosePosition)) {
      Log.showDebug(TAG, `getAppCloseIconInfo return mSmartdockClosePosition is ${JSON.stringify(this.mSmartdockClosePosition)}`)
      return this.mSmartdockCloseItemInfo;
    } else {
      Log.showDebug(TAG, `getAppCloseIconInfo return mPagedesktopClosePosition is ${JSON.stringify(this.mPagedesktopClosePosition)}`)
      return this.mPagedesktopCloseItemInfo;
    }
  }
}
