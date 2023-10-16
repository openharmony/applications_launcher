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

import Input from '@ohos.multimodalInput.inputEventClient';
import touchEvent from '@ohos.multimodalInput.touchEvent';
import {
  Log,
  windowManager,
  CommonConstants
} from '@ohos/common';

const TAG = 'GestureNavigationExecutors';

export default class GestureNavigationExecutors {
  private static readonly HOME_DISTANCE_LIMIT_MIN = 0.1;
  private static readonly RECENT_DISTANCE_LIMIT_MIN = 0.15;
  private static readonly NS_PER_MS = 1000000;
  private timeOfFirstLeavingTheBackEventHotArea: number | null = null;
  private screenWidth = 0;
  private screenHeight = 0;
  private curEventType: touchEvent.Action | null = null;
  private eventName: string | null = null;
  private startEventPosition: {x: number, y: number} | null = null;
  private preEventPosition: {x: number, y: number} | null = null;
  private preEventTime: number | null = null;
  private preSpeed = 0;
  private startTime = 0;

  private constructor() {
  }

  /**
   * Set screenWidth.
   */
  setScreenWidth(screenWidth: number) {
    this.screenWidth = screenWidth;
  }

  /**
   * Set screenHeight.
   */
  setScreenHeight(screenHeight: number) {
    this.screenHeight = screenHeight;
  }

  /**
   * Get the GestureNavigationExecutors instance.
   */
  static getInstance(): GestureNavigationExecutors {
    if (globalThis.sGestureNavigationExecutors == null) {
      globalThis.sGestureNavigationExecutors = new GestureNavigationExecutors();
    }
    return globalThis.sGestureNavigationExecutors;
  }

  /**
   * touchEvent Callback.
   * @return true: Returns true if the gesture is within the specified hot zone.
   */
  touchEventCallback(event: touchEvent.TouchEvent): boolean {
    Log.showDebug(TAG, `touchEventCallback enter. ${JSON.stringify(event)}`);
    if (event.touches.length !== 1 || !event.actionTime || !event.action) {
      return false;
    }
    const startXPosition = event.touches[0].screenX;
    const startYPosition = event.touches[0].screenY;
    if (event.action === touchEvent.Action.DOWN && this.isSpecifiesRegion(startXPosition, startYPosition)) {
      this.initializationParameters();
      this.startEventPosition = this.preEventPosition = {
        x: startXPosition,
        y: startYPosition
      };
      this.startTime = this.preEventTime = event.actionTime;
      this.curEventType = event.action;
      if (vp2px(16) >= startXPosition || startXPosition >= (this.screenWidth - vp2px(16))) {
        this.eventName = 'backEvent';
        return true;
      }
    }
    if (this.startEventPosition && this.isSpecifiesRegion(this.startEventPosition.x, this.startEventPosition.y)) {
      if (event.action === touchEvent.Action.MOVE) {
        this.curEventType = event.action;
        const curTime = event.actionTime;
        const speedX = (startXPosition - this.preEventPosition.x) / ((curTime - this.preEventTime) / 1000);
        const speedY = (startYPosition - this.preEventPosition.y) / ((curTime - this.preEventTime) / 1000);
        const sqrt = Math.sqrt(speedX * speedX + speedY * speedY);
        const curSpeed = startYPosition <= this.preEventPosition.y ? -sqrt : sqrt;
        const acceleration = (curSpeed - this.preSpeed) / ((curTime - this.preEventTime) / 1000);
        this.preEventPosition = {
          x: startXPosition,
          y: startYPosition
        };
        this.preSpeed = curSpeed;
        const isDistance = this.isRecentsViewShowOfDistanceLimit(startYPosition);
        const isSpeed = this.isRecentsViewShowOfSpeedLimit(curTime, acceleration, curSpeed);
        this.preEventTime = curTime;
        if (isDistance && isSpeed && !this.eventName && curSpeed) {
          this.eventName = 'recentEvent';
          this.recentEventCall();
          return true;
        }
        if (this.eventName == 'backEvent' && startXPosition > vp2px(16) && !this.timeOfFirstLeavingTheBackEventHotArea) {
          this.timeOfFirstLeavingTheBackEventHotArea = (curTime - this.startTime) / 1000;
        }
      }
      if (event.action === touchEvent.Action.UP) {
        let distance = 0;
        let slidingSpeed = 0;
        if (this.curEventType === touchEvent.Action.MOVE) {
          if (this.eventName == 'backEvent') {
            distance = Math.abs((startXPosition - this.startEventPosition.x));
            if (distance >= vp2px(16) * 1.2 && this.timeOfFirstLeavingTheBackEventHotArea <= 120) {
              this.backEventCall();
              this.initializationParameters();
              return true;
            }
          } else if (this.eventName == 'recentEvent') {
            this.initializationParameters();
            return true;
          } else {
            distance = this.startEventPosition.y - startYPosition;
            const isDistance = this.isHomeViewShowOfDistanceLimit(startYPosition);
            Log.showDebug(TAG, `touchEventCallback isDistance: ${isDistance}`);
            if (isDistance) {
              slidingSpeed = distance / ((event.actionTime - this.startTime) / GestureNavigationExecutors.NS_PER_MS);
              Log.showDebug(TAG, `touchEventCallback homeEvent slidingSpeed: ${slidingSpeed}`);
              if (slidingSpeed >= vp2px(500)) {
                this.homeEventCall();
              }
              this.initializationParameters();
              return true;
            }
          }
        }
        this.initializationParameters();
      }
    }
    return false;
  }

  private initializationParameters() {
    this.startEventPosition = null;
    this.eventName = null;
    this.preEventPosition = null;
    this.timeOfFirstLeavingTheBackEventHotArea = null;
    this.startTime = 0;
    this.preSpeed = 0;
  }

  private backEventCall() {
    Log.showInfo(TAG, 'backEventCall backEvent start');
    let keyEvent = {
      isPressed: true,
      keyCode: 2,
      keyDownDuration: 1,
      isIntercepted: false
    };

    let res = Input.injectEvent({KeyEvent: keyEvent});
    Log.showDebug(TAG, `backEventCall result: ${res}`);
    keyEvent = {
      isPressed: false,
      keyCode: 2,
      keyDownDuration: 1,
      isIntercepted: false
    };

    setTimeout(() => {
      res = Input.injectEvent({KeyEvent: keyEvent});
      Log.showDebug(TAG, `backEventCall result: ${res}`);
    }, 20)
  }

  private homeEventCall() {
    Log.showInfo(TAG, 'homeEventCall homeEvent start');
    globalThis.desktopContext.startAbility({
      bundleName: CommonConstants.LAUNCHER_BUNDLE,
      abilityName: CommonConstants.LAUNCHER_ABILITY
    })
      .then(() => {
        Log.showDebug(TAG, 'homeEventCall startAbility Promise in service successful.');
      })
      .catch(() => {
        Log.showDebug(TAG, 'homeEventCall startAbility Promise in service failed.');
      });
  }

  private recentEventCall() {
    Log.showInfo(TAG, 'recentEventCall recentEvent start');
    globalThis.createWindowWithName(windowManager.RECENT_WINDOW_NAME, windowManager.RECENT_RANK);
  }

  private isRecentsViewShowOfDistanceLimit(eventY: number) {
    return (this.screenHeight - eventY) / this.screenHeight >= GestureNavigationExecutors.RECENT_DISTANCE_LIMIT_MIN;
  }

  private isHomeViewShowOfDistanceLimit(eventY: number) {
    return (this.screenHeight - eventY) / this.screenHeight >= GestureNavigationExecutors.HOME_DISTANCE_LIMIT_MIN;
  }

  private isRecentsViewShowOfSpeedLimit(curTime: number, acceleration: number, curSpeed: number): boolean {
    const MIN_ACCELERATION = 0.05;
    const CUR_SPEED_NEGATIVE_FIVE = -5.0;
    const CUR_SPEED_NEGATIVE_ONE = -1.0;
    const TIMESTAMP_CONVERTED_TO_MILLISECONDS_CARDINALITY = 1000;// 时间戳转换为毫秒的基数
    const MIN_TIME_DIFFERENCE = 10.0;// 最小时间差
    return (acceleration > MIN_ACCELERATION && curSpeed > CUR_SPEED_NEGATIVE_FIVE) ||
      ((curSpeed > CUR_SPEED_NEGATIVE_ONE) &&
        (curTime - this.preEventTime) / TIMESTAMP_CONVERTED_TO_MILLISECONDS_CARDINALITY > MIN_TIME_DIFFERENCE);
  }

  private isSpecifiesRegion(startXPosition: number, startYPosition: number) {
    const isStatusBarRegion = startYPosition <= this.screenHeight * 0.07;
    const isSpecifiesXRegion = startXPosition <= vp2px(16) || startXPosition >= (this.screenWidth - vp2px(16));
    const isSpecifiesYRegion = (this.screenHeight - vp2px(22)) <= startYPosition && startYPosition <= this.screenHeight;
    return (isSpecifiesXRegion && !isStatusBarRegion) || (isSpecifiesYRegion && !isSpecifiesXRegion);
  }
}