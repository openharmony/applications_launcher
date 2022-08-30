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

import windowAnimationManager from '@ohos.animation.windowAnimationManager';
import curves from '@ohos.curves';
import {
  Log,
  Trace,
  CheckEmptyUtils,
  StyleConstants,
  CommonConstants,
  ResourceManager
} from '@ohos/common';
import OverlayAppIcon from './OverlayAppIcon';
import RemoteConstants from '../constants/RemoteConstants';
import { localEventManager } from '../manager/LocalEventManager';
import { EventConstants } from '../constants/EventConstants';
import { CloseAppManager } from '../manager/CloseAppManager';
import WindowAnimationControllerImpl from '../animation/remoteanimation/WindowAnimationControllerImpl';

const TAG = 'RemoteWindowWrapper';

@Component
export struct RemoteWindowWrapper {
  @State @Watch('doAnimation') target: windowAnimationManager.WindowAnimationTarget = undefined;
  @State remoteWindowScaleX: number = 1.0;
  @State remoteWindowScaleY: number = 1.0;
  @State remoteWindowTranslateX: number = 0;
  @State remoteWindowTranslateY: number = 0;
  @State remoteWindowWindowAlpha: number = 0.0;
  @State startAppIconScaleX: number = 1.0;
  @State startAppIconScaleY: number = 1.0;
  @State startAppIconTranslateX: number = 0;
  @State startAppIconTranslateY: number = 0;
  @State startAppIconWindowAlpha: number = 0.0;
  @State closeAppIconScaleX: number = 1.0;
  @State closeAppIconScaleY: number = 1.0;
  @State closeAppIconTranslateX: number = 0;
  @State closeAppIconTranslateY: number = 0;
  @State closeAppIconWindowAlpha: number = 0.0;
  remoteAnimationType: number = 0;
  @State startAppTypeFromPageDesktop: number = 1;
  private mCloseAppManager: CloseAppManager;
  private mScreenWidth: number = 0;
  private mScreenHeight: number = 0;
  @State closeAppIconInfo: {
    appIconSize: number,
    appIconHeight: number,
    appIconPositionX: number,
    appIconPositionY: number
  } =
    { appIconSize: 0,
      appIconHeight: 0,
      appIconPositionX: 0,
      appIconPositionY: 0 };
  @State startAppIconInfo: {
    appIconSize: number,
    appIconHeight: number,
    appIconPositionX: number,
    appIconPositionY: number
  } =
    { appIconSize: 0,
      appIconHeight: 0,
      appIconPositionX: 0,
      appIconPositionY: 0 };
  startAppCalculateScaleX: number = 1.0;
  startAppCalculateScaleY: number = 1.0;
  startAppCalculateTranslateX: number = 0;
  startAppCalculateTranslateY: number = 0;
  closeAppCalculateScaleX: number = 1.0;
  closeAppCalculateScaleY: number = 1.0;
  closeAppCalculateTranslateX: number = 0;
  closeAppCalculateTranslateY: number = 0;
  private mStartAppItemInfo: any;
  private mCloseAppItemInfo: any;
  private mFinishCallback: windowAnimationManager.WindowAnimationFinishedCallback;

  aboutToAppear(): void  {
    Log.showInfo(TAG, `aboutToAppear called!!`);
    let control = new WindowAnimationControllerImpl();
    windowAnimationManager.setController(control);
    this.startAppTypeFromPageDesktop = AppStorage.Get('startAppTypeFromPageDesktop');
    this.mCloseAppManager = CloseAppManager.getInstance();
    control.onStartAppFromLauncher = (startingWindowTarget, finishCallback) => {
      Log.showInfo(TAG, `remote window animaion onStartAppFromLauncher`);
      this.remoteAnimationType = RemoteConstants.TYPE_START_APP_FROM_LAUNCHER;
      this.mFinishCallback = finishCallback;
      this.target = startingWindowTarget;
    }

    control.onStartAppFromRecent = (startingWindowTarget, finishCallback) => {
      Log.showInfo(TAG, `remote window animaion onStartAppFromRecent`);
      this.remoteAnimationType = RemoteConstants.TYPE_START_APP_FROM_RECENT;
      this.mFinishCallback = finishCallback;
      this.target = startingWindowTarget;
    }

    control.onStartAppFromOther = (startingWindowTarget, finishCallback) => {
      Log.showInfo(TAG, `remote window animaion onStartAppFromOther`);
      this.remoteAnimationType = RemoteConstants.TYPE_START_APP_FROM_OTHER;
      this.mFinishCallback = finishCallback;
      this.target = startingWindowTarget;
    }

    control.onAppTransition = (fromWindowTarget, toWindowTarget, finishCallback) => {
      Log.showInfo(TAG, `remote window animaion onAppTransition`);
      this.remoteAnimationType = RemoteConstants.TYPE_APP_TRANSITION;
      this.mFinishCallback = finishCallback;
      this.target = toWindowTarget;
    }

    control.onMinimizeWindow = (minimizingWindowTarget, finishCallback) => {
      this.remoteAnimationType = RemoteConstants.TYPE_MINIMIZE_WINDOW;
      Log.showInfo(TAG, `remote window animaion onMinimizeWindow`);
      this.mCloseAppManager.getAppIconInfo(minimizingWindowTarget);
      this.mFinishCallback = finishCallback;
      this.target = minimizingWindowTarget;
    }

    control.onCloseWindow = (closingWindowTarget, finishCallback) => {
      Log.showInfo(TAG, `remote window animaion onCloseWindow`);
      this.remoteAnimationType = RemoteConstants.TYPE_CLOSE_WINDOW;
      this.mCloseAppManager.getAppIconInfo(closingWindowTarget);
      this.mFinishCallback = finishCallback;
      this.target = closingWindowTarget;
    }
  }

  calculateStartAppProperty() {
    this.startAppCalculateScaleX = this.startAppIconInfo?.appIconSize / px2vp(this.target?.windowBounds.width);
    this.startAppCalculateTranslateX = this.startAppIconInfo?.appIconPositionX + this.startAppIconInfo?.appIconSize / 2
    - (px2vp(this.target?.windowBounds.left) + px2vp(this.target?.windowBounds.width) / 2);

    if (this.startAppTypeFromPageDesktop === CommonConstants.OVERLAY_TYPE_CARD) {
      this.startAppCalculateScaleY = this.startAppIconInfo?.appIconHeight / px2vp(this.target?.windowBounds.height);
      this.startAppCalculateTranslateY = this.startAppIconInfo?.appIconPositionY + this.startAppIconInfo?.appIconHeight / 2
      - (px2vp(this.target?.windowBounds.top) + px2vp(this.target?.windowBounds.height) / 2);
    } else {
      this.startAppCalculateScaleY = this.startAppIconInfo?.appIconSize / px2vp(this.target?.windowBounds.height);
      this.startAppCalculateTranslateY = this.startAppIconInfo?.appIconPositionY + this.startAppIconInfo?.appIconSize / 2
      - (px2vp(this.target?.windowBounds.top) + px2vp(this.target?.windowBounds.height) / 2);
    }
    Log.showInfo(TAG, `calculateStartAppProperty ---> startAppCalculateScaleX is ${this.startAppCalculateScaleX} ,
    startAppCalculateScaleY is ${this.startAppCalculateScaleY} ,
    startAppCalculateTranslateX is ${this.startAppCalculateTranslateX} ,
    startAppCalculateTranslateY is ${this.startAppCalculateTranslateY}`);
  }

  calculateCloseAppProperty() {
    this.closeAppCalculateScaleX = px2vp(this.target?.windowBounds.width) / this.closeAppIconInfo?.appIconSize;
    this.closeAppCalculateTranslateX = this.closeAppIconInfo?.appIconPositionX + this.closeAppIconInfo?.appIconSize / 2
    - (px2vp(this.target?.windowBounds.left) + px2vp(this.target?.windowBounds.width) / 2);
    if (this.startAppTypeFromPageDesktop === CommonConstants.OVERLAY_TYPE_CARD) {
      this.closeAppCalculateScaleY = px2vp(this.target?.windowBounds.height) / this.closeAppIconInfo?.appIconHeight;
      this.closeAppCalculateTranslateY = this.closeAppIconInfo?.appIconPositionY + this.closeAppIconInfo?.appIconHeight / 2
      - (px2vp(this.target?.windowBounds.top) + px2vp(this.target?.windowBounds.height) / 2);
    } else {
      this.closeAppCalculateScaleY = px2vp(this.target?.windowBounds.height) / this.closeAppIconInfo?.appIconSize;
      this.closeAppCalculateTranslateY = this.closeAppIconInfo?.appIconPositionY + this.closeAppIconInfo?.appIconSize / 2
      - (px2vp(this.target?.windowBounds.top) + px2vp(this.target?.windowBounds.height) / 2);
    }

    Log.showInfo(TAG, `calculateCloseAppProperty ---> closeAppCalculateScaleX is ${this.closeAppCalculateScaleX} ,
    closeAppCalculateScaleY is ${this.closeAppCalculateScaleY} ,
    closeAppCalculateTranslateX is ${this.closeAppCalculateTranslateX} ,
    closeAppCalculateTranslateY is ${this.closeAppCalculateTranslateY}`);
  }

  doAnimation() {
    let callback = Object.assign(this.mFinishCallback)
    Log.showInfo(TAG, `doAnimation called -------- ${this.remoteAnimationType}`);
    switch (this.remoteAnimationType) {
      case RemoteConstants.TYPE_START_APP_FROM_RECENT:
      case RemoteConstants.TYPE_START_APP_FROM_LAUNCHER:
        if (this.target.bundleName === "com.ohos.launcher") {
          this.startAppFromOther(callback);
        } else {
          this.startAppAnimation(callback);
        }
        break;
      case RemoteConstants.TYPE_START_APP_FROM_OTHER:
      case RemoteConstants.TYPE_APP_TRANSITION:
        Log.showInfo(TAG, `doAnimation bundleName-------- ${this.target.bundleName}`);
        if (this.target.bundleName === "com.ohos.photos" || this.target.bundleName === "com.ohos.camera") {
          this.startAppAnimation(callback);
        } else {
          this.startAppFromOther(callback);
        }
        break;
      case RemoteConstants.TYPE_MINIMIZE_WINDOW:
      case RemoteConstants.TYPE_CLOSE_WINDOW:
        if (this.target.bundleName === "com.ohos.launcher") {
          this.closeWindow(callback);
        } else {
          this.minimizeWindow(callback);
        }
        break;
      default:
        break;
    }
  }

  private minimizeWindow(callback): void {
    Log.showInfo(TAG, `minimizeWindow --- target ${JSON.stringify(this.target)}`);
    Trace.start(Trace.CORE_METHOD_CLOSE_APP_ANIMATION);
    this.startAppTypeFromPageDesktop = AppStorage.Get('startAppTypeFromPageDesktop');
    if (this.startAppTypeFromPageDesktop === CommonConstants.OVERLAY_TYPE_CARD) {
      this.closeAppIconInfo = AppStorage.Get('startAppIconInfo');
      this.mCloseAppItemInfo = AppStorage.Get('startAppItemInfo');
    } else {
      this.mCloseAppItemInfo = this.mCloseAppManager.getAppCloseItemInfo();
      this.closeAppIconInfo = this.mCloseAppManager.getAppCloseIconInfo();
    }
    Log.showDebug(TAG, `minimizeWindow --- mCloseAppItemInfo is ${JSON.stringify(this.mCloseAppItemInfo)} , closeAppIconInfo is ${JSON.stringify(this.closeAppIconInfo)}`);
    localEventManager.sendLocalEventSticky(EventConstants.EVENT_ANIMATION_CLOSE_APPLICATION, null);
    this.calculateCloseAppProperty();
    this.remoteWindowScaleX = 1.0;
    this.remoteWindowScaleY = 1.0;
    this.remoteWindowTranslateX = 0;
    this.remoteWindowTranslateY = 0;
    this.closeAppIconScaleX = this.closeAppCalculateScaleX;
    this.closeAppIconScaleY = this.closeAppCalculateScaleY;
    this.closeAppIconTranslateX = -this.closeAppCalculateTranslateX;
    this.closeAppIconTranslateY = -this.closeAppCalculateTranslateY;

    animateTo({
      duration: 700,
      curve: curves.springMotion(0.40, 0.99, 0),
      onFinish: () => {
        callback.onAnimationFinish();
        this.closeAppIconWindowAlpha = 0;
        Trace.end(Trace.CORE_METHOD_CLOSE_APP_ANIMATION);
      }
    }, () => {
      this.remoteWindowScaleX = 1 / this.closeAppCalculateScaleX;
      this.remoteWindowScaleY = 1 / this.closeAppCalculateScaleY;
      this.remoteWindowTranslateX = this.closeAppCalculateTranslateX;
      this.remoteWindowTranslateY = this.closeAppCalculateTranslateY;
      this.closeAppIconScaleX = 1.0;
      this.closeAppIconScaleY = 1.0;
      this.closeAppIconTranslateX = 0.0;
      this.closeAppIconTranslateY = 0.0;
    })

    this.closeAppIconWindowAlpha = 0;
    animateTo({
      duration: 140,
      delay: 150,
      curve: Curve.Friction,
      onFinish: () => {
      }
    }, () => {
      this.closeAppIconWindowAlpha = 1.0;
    })
    this.remoteWindowWindowAlpha = 1.0;

    animateTo({
      duration: 140,
      delay: 220,
      curve: Curve.Friction,
      onFinish: () => {
      }
    }, () => {
      this.remoteWindowWindowAlpha = 0.0;
    })
  }

  private closeWindow(callback): void {
    this.remoteWindowScaleX = 1.0;
    this.remoteWindowScaleY = 1.0;
    this.remoteWindowTranslateX = 0.0;
    this.remoteWindowTranslateY = 0.0;
    animateTo({
      duration: 400,
      curve: Curve.LinearOutSlowIn,
      onFinish: () => {
        callback.onAnimationFinish();
      }
    }, () => {
      this.remoteWindowScaleX = 0.9;
      this.remoteWindowScaleY = 0.9;
    })

    this.remoteWindowWindowAlpha = 1.0;
    animateTo({
      duration: 300,
      delay: 50,
      curve: Curve.LinearOutSlowIn,
      onFinish: () => {
      }
    }, () => {
      this.remoteWindowWindowAlpha = 0.0;
    })
  }

  private startAppFromOther(callback): void {
    this.remoteWindowScaleX = 0.8;
    this.remoteWindowScaleY = 0.8;
    this.remoteWindowTranslateX = 0.0;
    this.remoteWindowTranslateY = 0.0;
    animateTo({
      duration: 400,
      curve: Curve.LinearOutSlowIn,
      onFinish: () => {
        callback.onAnimationFinish();
      }
    }, () => {
      this.remoteWindowScaleX = 1.0;
      this.remoteWindowScaleY = 1.0;
    })

    this.remoteWindowWindowAlpha = 0.0;
    animateTo({
      duration: 300,
      delay: 50,
      curve: Curve.LinearOutSlowIn,
      onFinish: () => {
      }
    }, () => {
      this.remoteWindowWindowAlpha = 1.0;
    })
  }

  private startAppAnimation(callback): void {
    Log.showInfo(TAG, `startAppAnimation called!! --- target ${JSON.stringify(this.target)}`);
    this.mStartAppItemInfo = null;
    this.mStartAppItemInfo = AppStorage.Get('startAppItemInfo');
    this.mScreenWidth = AppStorage.Get('screenWidth');
    this.mScreenHeight = AppStorage.Get('screenHeight');
    this.startAppTypeFromPageDesktop = AppStorage.Get('startAppTypeFromPageDesktop');
    this.startAppIconInfo = AppStorage.Get('startAppIconInfo');
    Log.showInfo(TAG, `startAppIconInfo is ${JSON.stringify(this.startAppIconInfo)} , mStartAppItemInfo is ${this.mStartAppItemInfo}`);

    localEventManager.sendLocalEventSticky(EventConstants.EVENT_ANIMATION_START_APPLICATION, null);
    this.calculateStartAppProperty();
    this.remoteWindowScaleX = this.startAppCalculateScaleX;
    this.remoteWindowScaleY = this.startAppCalculateScaleY;
    this.remoteWindowTranslateX = this.startAppCalculateTranslateX;
    this.remoteWindowTranslateY = this.startAppCalculateTranslateY;
    this.startAppIconScaleX = 1.0;
    this.startAppIconScaleY = 1.0;
    this.startAppIconTranslateX = 0.0;
    this.startAppIconTranslateY = 0.0;

    animateTo({
      duration: 500,
      curve: curves.springMotion(0.42, 0.99, 0),
      onFinish: () => {
        callback.onAnimationFinish();
        Trace.end(Trace.CORE_METHOD_START_APP_ANIMATION);
      }
    }, () => {
      this.remoteWindowScaleX = 1.0;
      this.remoteWindowScaleY = 1.0;
      this.remoteWindowTranslateX = 0.0;
      this.remoteWindowTranslateY = 0.0;
      this.startAppIconScaleX = this.mScreenWidth / this.startAppIconInfo.appIconSize;
      this.startAppIconTranslateX = this.mScreenWidth / 2 - this.startAppIconInfo.appIconPositionX - this.startAppIconInfo.appIconSize / 2;
      this.startAppIconScaleY = this.mScreenHeight / this.startAppIconInfo.appIconSize;
      this.startAppIconTranslateY = this.mScreenHeight / 2 - this.startAppIconInfo.appIconPositionY - this.startAppIconInfo.appIconSize / 2;
      if (this.startAppTypeFromPageDesktop === CommonConstants.OVERLAY_TYPE_CARD) {
        this.startAppIconScaleY = this.mScreenHeight / this.startAppIconInfo.appIconHeight;
        this.startAppIconTranslateY = this.mScreenHeight / 2 - this.startAppIconInfo.appIconPositionY - this.startAppIconInfo.appIconHeight / 2;
      } else {
        this.startAppIconScaleY = this.mScreenHeight / this.startAppIconInfo.appIconSize;
        this.startAppIconTranslateY = this.mScreenHeight / 2 - this.startAppIconInfo.appIconPositionY - this.startAppIconInfo.appIconSize / 2;
      }
    })

    this.startAppIconWindowAlpha = 1.0;
    this.remoteWindowWindowAlpha = 0.0;
    animateTo({
      duration: 50,
      delay: 50,
      curve: Curve.Friction,
      onFinish: () => {
        this.startAppIconWindowAlpha = 0.0;
      }
    }, () => {
      this.remoteWindowWindowAlpha = 1.0;
    })
  }

  build() {
    Stack() {
      if (!CheckEmptyUtils.isEmpty(this.mStartAppItemInfo)) {
        Column() {
          if (this.startAppTypeFromPageDesktop === CommonConstants.OVERLAY_TYPE_CARD) {
            FormComponent({
              id: this.mStartAppItemInfo.cardId,
              name: this.mStartAppItemInfo.cardName,
              bundle: this.mStartAppItemInfo.bundleName,
              ability: this.mStartAppItemInfo.abilityName,
              module: this.mStartAppItemInfo.moduleName,
              dimension: this.mStartAppItemInfo.cardDimension
            })
              .clip(new Rect({
                width: this.startAppIconInfo.appIconSize,
                height: this.startAppIconInfo.appIconHeight,
                radius: 24
              }))
              .size({ width: this.startAppIconInfo.appIconSize, height: this.startAppIconInfo.appIconHeight })
          } else {
            OverlayAppIcon({
              iconSize: this.startAppIconInfo?.appIconSize,
              icon: ResourceManager.getInstance()
                .getCachedAppIcon(this.mStartAppItemInfo.appIconId, this.mStartAppItemInfo.bundleName, this.mStartAppItemInfo.moduleName)
            })
          }
        }
        .translate({ x: this.startAppIconTranslateX, y: this.startAppIconTranslateY })
        .scale({ x: this.startAppIconScaleX, y: this.startAppIconScaleY })
        .opacity(this.startAppIconWindowAlpha)
        .position({
          x: this.startAppIconInfo?.appIconPositionX,
          y: this.startAppIconInfo?.appIconPositionY,
        })
      }

      if (!CheckEmptyUtils.isEmpty(this.mCloseAppItemInfo)) {
        Column() {
          if (this.startAppTypeFromPageDesktop === CommonConstants.OVERLAY_TYPE_CARD) {
            FormComponent({
              id: this.mCloseAppItemInfo.cardId,
              name: this.mCloseAppItemInfo.cardName,
              bundle: this.mCloseAppItemInfo.bundleName,
              ability: this.mCloseAppItemInfo.abilityName,
              module: this.mCloseAppItemInfo.moduleName,
              dimension: this.mCloseAppItemInfo.cardDimension
            })
              .clip(new Rect({
                width: this.closeAppIconInfo.appIconSize,
                height: this.closeAppIconInfo.appIconHeight,
                radius: 24
              }))
              .size({ width: this.closeAppIconInfo.appIconSize, height: this.closeAppIconInfo.appIconHeight })
          } else {
            OverlayAppIcon({
              iconSize: this.closeAppIconInfo?.appIconSize,
              icon: ResourceManager.getInstance()
                .getCachedAppIcon(this.mCloseAppItemInfo.appIconId, this.mCloseAppItemInfo.bundleName, this.mCloseAppItemInfo.moduleName)
            })
          }
        }
        .translate({ x: this.closeAppIconTranslateX, y: this.closeAppIconTranslateY })
        .scale({ x: this.closeAppIconScaleX, y: this.closeAppIconScaleY })
        .opacity(this.closeAppIconWindowAlpha)
        .position({
          x: this.closeAppIconInfo?.appIconPositionX,
          y: this.closeAppIconInfo?.appIconPositionY,
        })
      }

      if (!CheckEmptyUtils.isEmpty(this.target)) {
        RemoteWindow(this.target)
          .translate({ x: this.remoteWindowTranslateX, y: this.remoteWindowTranslateY })
          .scale({ x: this.remoteWindowScaleX, y: this.remoteWindowScaleY })
          .opacity(this.remoteWindowWindowAlpha)
          .position({ x: px2vp(this.target?.windowBounds.left), y: px2vp(this.target?.windowBounds.top) })
          .width(px2vp(this.target?.windowBounds.width))
          .height(px2vp(this.target?.windowBounds.height))
      }
    }
    .width(StyleConstants.PERCENTAGE_100)
    .height(StyleConstants.PERCENTAGE_100)
    .focusable(false)
    .enabled(false)
  }
}
