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
import { Log } from '../utils/Log';
import { Trace } from '../utils/Trace';
import { StyleConstants } from '../constants/StyleConstants';
import { CommonConstants } from '../constants/CommonConstants';
import OverlayAppIcon from './OverlayAppIcon';
import RemoteConstants from '../constants/RemoteConstants';
import { localEventManager } from '../manager/LocalEventManager';
import { EventConstants } from '../constants/EventConstants';
import { CloseAppManager } from '../manager/CloseAppManager';
import WindowAnimationControllerImpl from '../animation/remoteanimation/WindowAnimationControllerImpl';

const TAG = 'RemoteWindowWrapper';

@Observed
class RemoteVo {
  public remoteAnimationType: number;
  public finishCallback: windowAnimationManager.WindowAnimationFinishedCallback;
  public target: windowAnimationManager.WindowAnimationTarget;
  public fromWindowTarget: windowAnimationManager.WindowAnimationTarget;
  public remoteWindowKey: string;
  public iconInfo: any;
  public appItemInfo: any;
  public count: number = 0;

  mScreenWidth: number;
  mScreenHeight: number;

  startAppTypeFromPageDesktop: number;

  remoteWindowScaleX: number;
  remoteWindowScaleY: number;
  remoteWindowTranslateX: number;
  remoteWindowTranslateY: number;
  remoteWindowWindowAlpha: number;
  remoteWindowRadius: number;

  fromRemoteWindowScaleX: number = 1.0;
  fromRemoteWindowScaleY: number = 1.0;
  fromRemoteWindowTranslateX: number = 0;
  fromRemoteWindowTranslateY: number = 0;
  fromRemoteWindowWindowAlpha: number = 1.0;

  startAppIconScaleX: number;
  startAppIconScaleY: number;
  startAppIconTranslateX: number;
  startAppIconTranslateY: number;
  startAppIconWindowAlpha: number;

  constructor(
    remoteAnimationType: number,
    startAppTypeFromPageDesktop: number,
    target: windowAnimationManager.WindowAnimationTarget,
    iconInfo: any = {},
    appItemInfo: any = {},
    fromWindowTarget: windowAnimationManager.WindowAnimationTarget = undefined,
    finishCallback: windowAnimationManager.WindowAnimationFinishedCallback
  ) {
    this.remoteAnimationType = remoteAnimationType;
    this.target = target;
    this.fromWindowTarget = fromWindowTarget;
    this.mScreenWidth = px2vp(this.target.windowBounds.width);
    this.mScreenHeight = px2vp(this.target.windowBounds.height);
    this.iconInfo = iconInfo;
    this.appItemInfo = appItemInfo;
    this.startAppTypeFromPageDesktop = startAppTypeFromPageDesktop;
    this.finishCallback = finishCallback;
    this.remoteWindowKey = this.target.bundleName + this.target.abilityName + this.target.missionId;
    this.initRemoteWindowProperty();
  }

  initRemoteWindowProperty() {
    if (this.remoteAnimationType == RemoteConstants.TYPE_START_APP_FROM_LAUNCHER) {
      const res = this.calculateStartAppProperty();
      Log.showInfo(TAG, `initRemoteWindowProperty res: ${JSON.stringify(res)}, mScreenWidth: ${this.mScreenWidth}, mScreenHeight: ${this.mScreenHeight}, startAppTypeFromPageDesktop: ${this.startAppTypeFromPageDesktop}`);
      this.remoteWindowScaleX = res.startAppCalculateScaleX;
      this.remoteWindowScaleY = res.startAppCalculateScaleY;
      this.remoteWindowTranslateX = res.startAppCalculateTranslateX;
      this.remoteWindowTranslateY = res.startAppCalculateTranslateY;
      this.remoteWindowWindowAlpha = 0.0;
      this.remoteWindowRadius = 96;

      this.startAppIconWindowAlpha = 1.0;
      this.startAppIconScaleX = 1.0;
      this.startAppIconScaleY = 1.0;
      this.startAppIconTranslateX = 0.0;
      this.startAppIconTranslateY = 0.0;
      this.count = 1;
    } else if (this.remoteAnimationType == RemoteConstants.TYPE_START_APP_FROM_RECENT) {
    } else if (this.remoteAnimationType == RemoteConstants.TYPE_START_APP_FROM_OTHER) {
    } else if (this.remoteAnimationType == RemoteConstants.TYPE_APP_TRANSITION) {
      this.remoteWindowScaleX = 1.0;
      this.remoteWindowScaleY = 1.0;
      this.remoteWindowTranslateX = px2vp(this.target?.windowBounds.width - this.target?.windowBounds.left);
      this.remoteWindowTranslateY = 0.0;
      this.remoteWindowWindowAlpha = 1.0;
      this.remoteWindowRadius = 12;

      this.startAppIconScaleX = 1.0;
      this.startAppIconScaleY = 1.0;
      this.startAppIconTranslateX = 0.0;
      this.startAppIconTranslateY = 0.0;
      this.startAppIconWindowAlpha = 1.0;
    } else if (this.remoteAnimationType == RemoteConstants.TYPE_MINIMIZE_WINDOW) {
      this.remoteWindowScaleX = 1.0;
      this.remoteWindowScaleY = 1.0;
      this.remoteWindowTranslateX = 0.0;
      this.remoteWindowTranslateY = 0.0;
      this.remoteWindowWindowAlpha = 1.0;
      this.remoteWindowRadius = 12;

      const res = this.calculateCloseAppProperty();
      this.startAppIconScaleX = res.closeAppCalculateScaleX;
      this.startAppIconScaleY = res.closeAppCalculateScaleY;
      this.startAppIconTranslateX = -res.closeAppCalculateTranslateX;
      this.startAppIconTranslateY = -res.closeAppCalculateTranslateY;
      this.startAppIconWindowAlpha = 0.0;
    } else if (this.remoteAnimationType == RemoteConstants.TYPE_CLOSE_WINDOW) {
      this.remoteWindowScaleX = 1.0;
      this.remoteWindowScaleY = 1.0;
      this.remoteWindowTranslateX = 0.0;
      this.remoteWindowTranslateY = 0.0;
      this.remoteWindowRadius = 12;
      this.remoteWindowWindowAlpha = 1.0;

      this.startAppIconScaleX = 1.0;
      this.startAppIconScaleY = 1.0;
      this.startAppIconTranslateX = 0.0;
      this.startAppIconTranslateY = 0.0;
      this.startAppIconWindowAlpha = 0.0;
    }
  }

  calculateStartAppProperty() {
    let startAppCalculateScaleX: number;
    let startAppCalculateScaleY: number;
    let startAppCalculateTranslateX: number;
    let startAppCalculateTranslateY: number;
    Log.showInfo(TAG, `calculateStartAppProperty appIconSize: ${this.iconInfo?.appIconSize}, windowBounds: ${JSON.stringify(this.target?.windowBounds)},
    appIconPosition: [${this.iconInfo?.appIconPositionX}, ${this.iconInfo?.appIconPositionY}], appIconPositionY: ${this.startAppTypeFromPageDesktop}`);
    startAppCalculateScaleX = this.iconInfo?.appIconSize / px2vp(this.target?.windowBounds.width);
    startAppCalculateTranslateX = this.iconInfo?.appIconPositionX + this.iconInfo?.appIconSize / 2
    - (px2vp(this.target?.windowBounds.left) + px2vp(this.target?.windowBounds.width) / 2);

    if (this.startAppTypeFromPageDesktop === CommonConstants.OVERLAY_TYPE_CARD) {
      startAppCalculateScaleY = this.iconInfo?.appIconHeight / px2vp(this.target?.windowBounds.height);
      startAppCalculateTranslateY = this.iconInfo?.appIconPositionY + this.iconInfo?.appIconHeight / 2
      - (px2vp(this.target?.windowBounds.top) + px2vp(this.target?.windowBounds.height) / 2);
    } else {
      startAppCalculateScaleY = this.iconInfo?.appIconSize / px2vp(this.target?.windowBounds.height);
      startAppCalculateTranslateY = this.iconInfo?.appIconPositionY + this.iconInfo?.appIconSize / 2
      - (px2vp(this.target?.windowBounds.top) + px2vp(this.target?.windowBounds.height) / 2);
    }
    return {
      startAppCalculateScaleX: startAppCalculateScaleX,
      startAppCalculateScaleY: startAppCalculateScaleY,
      startAppCalculateTranslateX: startAppCalculateTranslateX,
      startAppCalculateTranslateY: startAppCalculateTranslateY
    }
  }

  calculateCloseAppProperty() {
    let closeAppCalculateScaleX: number;
    let closeAppCalculateScaleY: number;
    let closeAppCalculateTranslateX: number;
    let closeAppCalculateTranslateY: number;
    closeAppCalculateScaleX = px2vp(this.target?.windowBounds.width) / this.iconInfo?.appIconSize;
    closeAppCalculateTranslateX = this.iconInfo?.appIconPositionX + this.iconInfo?.appIconSize / 2
    - (px2vp(this.target?.windowBounds.left) + px2vp(this.target?.windowBounds.width) / 2);
    if (this.startAppTypeFromPageDesktop === CommonConstants.OVERLAY_TYPE_CARD) {
      closeAppCalculateScaleY = px2vp(this.target?.windowBounds.height) / this.iconInfo?.appIconHeight;
      closeAppCalculateTranslateY = this.iconInfo?.appIconPositionY + this.iconInfo?.appIconHeight / 2
      - (px2vp(this.target?.windowBounds.top) + px2vp(this.target?.windowBounds.height) / 2);
    } else {
      closeAppCalculateScaleY = px2vp(this.target?.windowBounds.height) / this.iconInfo?.appIconSize;
      closeAppCalculateTranslateY = this.iconInfo?.appIconPositionY + this.iconInfo?.appIconSize / 2
      - (px2vp(this.target?.windowBounds.top) + px2vp(this.target?.windowBounds.height) / 2);
    }
    return {
      closeAppCalculateScaleX: closeAppCalculateScaleX,
      closeAppCalculateScaleY: closeAppCalculateScaleY,
      closeAppCalculateTranslateX: closeAppCalculateTranslateX,
      closeAppCalculateTranslateY: closeAppCalculateTranslateY
    }
  }
}

@Component
export struct RemoteWindowWrapper {
  private mCloseAppManager: CloseAppManager;
  private mLastRemoteVo: RemoteVo;
  @StorageLink('remoteWindowList') remoteWindowList: RemoteVo[] = [];

  getRemoteWindowVo(remoteWindowKey: string): RemoteVo {
    const remoteVoIndex = this.remoteWindowList.findIndex(item => {
      return (item.remoteWindowKey) == remoteWindowKey;
    })
    if (remoteVoIndex != -1) {
      return this.remoteWindowList[remoteVoIndex];
    } else if (this.mLastRemoteVo && this.mLastRemoteVo.remoteWindowKey === remoteWindowKey) {
      return this.mLastRemoteVo;
    } else {
      return null;
    }
  }

  private pushRemoteVoIntoList(remoteVo: RemoteVo): void {
    const remoteVoIndex = this.remoteWindowList.findIndex(item => {
      return (item.remoteWindowKey) == remoteVo.remoteWindowKey;
    })
    if (remoteVoIndex == -1) {
      this.remoteWindowList.push(remoteVo);
    }
  }

  aboutToAppear(): void {
    let control = new WindowAnimationControllerImpl();
    this.mCloseAppManager = CloseAppManager.getInstance();
    windowAnimationManager.setController(control);
    control.onStartAppFromLauncher = (startingWindowTarget, finishCallback) => {
      Log.showInfo(TAG, `remote window animaion onStartAppFromLauncher`);
      const remoteWindowKey = startingWindowTarget.bundleName + startingWindowTarget.abilityName + startingWindowTarget.missionId;
      const startAppTypeFromPageDesktop: number = AppStorage.Get('startAppTypeFromPageDesktop');
      const appItemInfo: any = AppStorage.Get('startAppItemInfo');
      const startAppIconInfo: any = AppStorage.Get('startAppIconInfo');
      let remoteVo: RemoteVo | null = this.getRemoteWindowVo(remoteWindowKey);
      if (remoteVo) {
        remoteVo.remoteAnimationType = RemoteConstants.TYPE_START_APP_FROM_LAUNCHER;
        remoteVo.target = startingWindowTarget;
        remoteVo.startAppTypeFromPageDesktop = startAppTypeFromPageDesktop;
        remoteVo.iconInfo = startAppIconInfo;
        remoteVo.appItemInfo = appItemInfo;
        remoteVo.count = remoteVo.count + 1;
      } else {
        remoteVo = new RemoteVo(
          RemoteConstants.TYPE_START_APP_FROM_LAUNCHER,
          startAppTypeFromPageDesktop,
          startingWindowTarget,
          startAppIconInfo,
          appItemInfo,
          undefined,
          finishCallback
        );
        this.mLastRemoteVo = remoteVo;
      }
      this.pushRemoteVoIntoList(remoteVo);
      AppStorage.SetOrCreate(remoteWindowKey, remoteVo.count);
      this.calculateAppProperty(remoteVo, finishCallback);
    }

    control.onStartAppFromRecent = (startingWindowTarget, finishCallback) => {
      Log.showInfo(TAG, `remote window animaion onStartAppFromRecent`);
      const remoteWindowKey = startingWindowTarget.bundleName + startingWindowTarget.abilityName + startingWindowTarget.missionId;
      const startAppTypeFromPageDesktop: number = AppStorage.Get('startAppTypeFromPageDesktop');
      const appItemInfo: any = AppStorage.Get('startAppItemInfo');
      const startAppIconInfo: any = AppStorage.Get('startAppIconInfo');
      let remoteVo: RemoteVo | null = this.getRemoteWindowVo(remoteWindowKey);
      if (remoteVo) {
        remoteVo.remoteAnimationType = RemoteConstants.TYPE_START_APP_FROM_LAUNCHER;
        remoteVo.target = startingWindowTarget;
        remoteVo.startAppTypeFromPageDesktop = startAppTypeFromPageDesktop;
        remoteVo.iconInfo = startAppIconInfo;
        remoteVo.appItemInfo = appItemInfo;
        remoteVo.count = remoteVo.count + 1;
      } else {
        remoteVo = new RemoteVo(
          RemoteConstants.TYPE_START_APP_FROM_LAUNCHER,
          startAppTypeFromPageDesktop,
          startingWindowTarget,
          startAppIconInfo,
          appItemInfo,
          undefined,
          finishCallback
        );
        this.mLastRemoteVo = remoteVo;
      }
      this.pushRemoteVoIntoList(remoteVo);
      AppStorage.SetOrCreate(remoteWindowKey, remoteVo.count);
      this.calculateAppProperty(remoteVo, finishCallback);
    }

    control.onStartAppFromOther = (startingWindowTarget, finishCallback) => {
      Log.showInfo(TAG, `remote window animaion onStartAppFromOther`);
      const remoteWindowKey = startingWindowTarget.bundleName + startingWindowTarget.abilityName + startingWindowTarget.missionId;
      const startAppTypeFromPageDesktop: number = AppStorage.Get('startAppTypeFromPageDesktop');
      const appItemInfo: any = AppStorage.SetOrCreate('startAppItemInfo', {});
      const startAppIconInfo: any = AppStorage.SetOrCreate('startAppIconInfo', {});
      let remoteVo: RemoteVo | null = this.getRemoteWindowVo(remoteWindowKey);
      if (remoteVo) {
        remoteVo.remoteAnimationType = RemoteConstants.TYPE_START_APP_FROM_LAUNCHER;
        remoteVo.target = startingWindowTarget;
        remoteVo.startAppTypeFromPageDesktop = startAppTypeFromPageDesktop;
        remoteVo.iconInfo = startAppIconInfo;
        remoteVo.appItemInfo = appItemInfo;
        remoteVo.count = remoteVo.count + 1;
      } else {
        remoteVo = new RemoteVo(
          RemoteConstants.TYPE_START_APP_FROM_LAUNCHER,
          startAppTypeFromPageDesktop,
          startingWindowTarget,
          startAppIconInfo,
          appItemInfo,
          undefined,
          finishCallback
        );
        this.mLastRemoteVo = remoteVo;
      }
      this.pushRemoteVoIntoList(remoteVo);
      AppStorage.SetOrCreate(remoteWindowKey, remoteVo.count);
      this.calculateAppProperty(remoteVo, finishCallback);
    }

    control.onAppTransition = (fromWindowTarget, toWindowTarget, finishCallback) => {
      Log.showInfo(TAG, `remote window animaion onAppTransition`);
      const remoteWindowKey = toWindowTarget.bundleName + toWindowTarget.abilityName + toWindowTarget.missionId;
      const startAppTypeFromPageDesktop: number = AppStorage.Get('startAppTypeFromPageDesktop');
      const remoteVo = new RemoteVo(
        RemoteConstants.TYPE_APP_TRANSITION,
        startAppTypeFromPageDesktop,
        toWindowTarget,
        {},
        {},
        fromWindowTarget,
        finishCallback
      );
      this.mLastRemoteVo = remoteVo;
      this.pushRemoteVoIntoList(remoteVo);
      this.calculateAppProperty(remoteVo, finishCallback);
    }

    control.onMinimizeWindow = (minimizingWindowTarget, finishCallback) => {
      Log.showInfo(TAG, `remote window animaion onMinimizeWindow`);
      const startAppTypeFromPageDesktop: number = AppStorage.Get('startAppTypeFromPageDesktop');
      const appInfo: {iconInfo: any, appItemInfo: any} = this.mCloseAppManager.getAppInfo(minimizingWindowTarget);
      const remoteWindowKey = minimizingWindowTarget.bundleName + minimizingWindowTarget.abilityName + minimizingWindowTarget.missionId;
      let remoteVo: RemoteVo | null = this.getRemoteWindowVo(remoteWindowKey);
      if (appInfo.appItemInfo?.page) {
        AppStorage.SetOrCreate('pageIndex', appInfo.appItemInfo?.page);
      }
      if (remoteVo) {
        remoteVo.remoteAnimationType = RemoteConstants.TYPE_MINIMIZE_WINDOW;
        remoteVo.target = minimizingWindowTarget;
        remoteVo.startAppTypeFromPageDesktop = startAppTypeFromPageDesktop;
        remoteVo.iconInfo = appInfo.iconInfo;
        remoteVo.appItemInfo = appInfo.appItemInfo;
        remoteVo.count = remoteVo.count + 1;
      } else {
        remoteVo = new RemoteVo(
          RemoteConstants.TYPE_MINIMIZE_WINDOW,
          startAppTypeFromPageDesktop,
          minimizingWindowTarget,
          appInfo.iconInfo,
          appInfo.appItemInfo,
          undefined,
          finishCallback
        );
        this.mLastRemoteVo = remoteVo;
      }
      this.pushRemoteVoIntoList(remoteVo);
      AppStorage.SetOrCreate(remoteWindowKey, remoteVo.count);
      this.calculateAppProperty(remoteVo, finishCallback);
    }

    control.onCloseWindow = (closingWindowTarget, finishCallback) => {
      Log.showInfo(TAG, `remote window animaion onCloseWindow`);
      const startAppTypeFromPageDesktop: number = AppStorage.Get('startAppTypeFromPageDesktop');
      const appInfo: {iconInfo: any, appItemInfo: any} = this.mCloseAppManager.getAppInfo(closingWindowTarget);
      const remoteWindowKey = closingWindowTarget.bundleName + closingWindowTarget.abilityName + closingWindowTarget.missionId;
      let remoteVo: RemoteVo | null = this.getRemoteWindowVo(remoteWindowKey);
      if (remoteVo) {
        remoteVo.remoteAnimationType = RemoteConstants.TYPE_MINIMIZE_WINDOW;
        remoteVo.target = closingWindowTarget;
        remoteVo.startAppTypeFromPageDesktop = startAppTypeFromPageDesktop;
        remoteVo.iconInfo = appInfo.iconInfo;
        remoteVo.appItemInfo = appInfo.appItemInfo;
      } else {
        remoteVo = new RemoteVo(
          RemoteConstants.TYPE_MINIMIZE_WINDOW,
          startAppTypeFromPageDesktop,
          closingWindowTarget,
          appInfo.iconInfo,
          appInfo.appItemInfo,
          undefined,
          finishCallback
        );
        this.mLastRemoteVo = remoteVo;
      }
      this.pushRemoteVoIntoList(remoteVo);
      AppStorage.SetOrCreate(remoteWindowKey, remoteVo.count);
      this.calculateAppProperty(remoteVo, finishCallback);
    }
  }

  removeRemoteWindowFromList(remoteWindowKey: string): void {
    const remoteWindowIndex = this.remoteWindowList.findIndex(item => {
      return item.remoteWindowKey === remoteWindowKey;
    });
    if (remoteWindowIndex != CommonConstants.INVALID_VALUE) {
      this.remoteWindowList.splice(remoteWindowIndex, 1);
      Log.showDebug(TAG, `removeRemoteWindowFromList remoteWindowList length: ${this.remoteWindowList.length}`);
    }
  }

  calculateAppProperty(remoteVo: RemoteVo, finishCallback: windowAnimationManager.WindowAnimationFinishedCallback) {
    Log.showDebug(TAG, `calculateAppProperty ${remoteVo.remoteAnimationType}`);
    if (remoteVo.remoteAnimationType == RemoteConstants.TYPE_START_APP_FROM_LAUNCHER) {
      Trace.start(Trace.CORE_METHOD_START_APP_ANIMATION);
      const callback = Object.assign(finishCallback);
      const count = remoteVo.count;
      localEventManager.sendLocalEventSticky(EventConstants.EVENT_ANIMATION_START_APPLICATION, null);
      animateTo({
        duration: 50,
        delay: 50,
        curve: Curve.Friction,
        onFinish: () => {
        }
      }, () => {
        remoteVo.startAppIconWindowAlpha = 0.0;
        remoteVo.remoteWindowWindowAlpha = 1.0;
      })

      animateTo({
        duration: 370,
        // @ts-ignore
        curve: curves.springMotion(0.25, 0.99, 0),
        onFinish: () => {
          callback.onAnimationFinish();
          Trace.end(Trace.CORE_METHOD_START_APP_ANIMATION);
          const startCount: number = AppStorage.Get(remoteVo.remoteWindowKey);
          Log.showDebug(TAG, `calculateAppProperty ${remoteVo.remoteAnimationType}, count: ${count}, startCount: ${startCount}`);
          if (startCount === count) {
            this.removeRemoteWindowFromList(remoteVo.remoteWindowKey);
            AppStorage.SetOrCreate(remoteVo.remoteWindowKey, 0);
          }
        }
      }, () => {
        remoteVo.remoteWindowScaleX = 1.0;
        remoteVo.remoteWindowScaleY = 1.0;
        remoteVo.remoteWindowTranslateX = 0.0;
        remoteVo.remoteWindowTranslateY = 0.0;
        remoteVo.startAppIconScaleX = remoteVo.mScreenWidth / remoteVo.iconInfo?.appIconSize;
        remoteVo.startAppIconTranslateX = remoteVo.mScreenWidth / 2 - remoteVo.iconInfo?.appIconPositionX - remoteVo.iconInfo?.appIconSize / 2;
        remoteVo.remoteWindowRadius = 0;
        if (remoteVo.startAppTypeFromPageDesktop === CommonConstants.OVERLAY_TYPE_CARD) {
          remoteVo.startAppIconScaleY = remoteVo.mScreenHeight / remoteVo.iconInfo?.appIconHeight;
          remoteVo.startAppIconTranslateY = remoteVo.mScreenHeight / 2 + px2vp(remoteVo.target.windowBounds.top) - remoteVo.iconInfo?.appIconPositionY - remoteVo.iconInfo?.appIconHeight / 2;
        } else {
          remoteVo.startAppIconScaleY = remoteVo.mScreenHeight / remoteVo.iconInfo?.appIconSize;
          remoteVo.startAppIconTranslateY = remoteVo.mScreenHeight / 2 + px2vp(remoteVo.target.windowBounds.top) - remoteVo.iconInfo?.appIconPositionY - remoteVo.iconInfo?.appIconSize / 2;
        }
      })
    } else if (remoteVo.remoteAnimationType  == RemoteConstants.TYPE_MINIMIZE_WINDOW) {
      Trace.start(Trace.CORE_METHOD_CLOSE_APP_ANIMATION);
      const res = remoteVo.calculateCloseAppProperty();
      const callback = Object.assign(finishCallback);
      const count = remoteVo.count;
      localEventManager.sendLocalEventSticky(EventConstants.EVENT_ANIMATION_CLOSE_APPLICATION, null);
      animateTo({
        duration: 370,
        // @ts-ignore
        curve: curves.springMotion(0.25, 0.99, 0),
        onFinish: () => {
          callback.onAnimationFinish();
          Trace.end(Trace.CORE_METHOD_CLOSE_APP_ANIMATION);
          const startCount: number = AppStorage.Get(remoteVo.remoteWindowKey);
          Log.showDebug(TAG, `calculateAppProperty ${remoteVo.remoteAnimationType}, count: ${count}, startCount: ${startCount}`);
          if (startCount === count) {
            this.removeRemoteWindowFromList(remoteVo.remoteWindowKey);
            AppStorage.SetOrCreate(remoteVo.remoteWindowKey, 0);
          }
        }
      }, () => {
        remoteVo.remoteWindowScaleX = 1 / res.closeAppCalculateScaleX;
        remoteVo.remoteWindowScaleY = 1 / res.closeAppCalculateScaleY;
        remoteVo.remoteWindowTranslateX = res.closeAppCalculateTranslateX;
        remoteVo.remoteWindowTranslateY = res.closeAppCalculateTranslateY;

        remoteVo.startAppIconScaleX = 1.0;
        remoteVo.startAppIconScaleY = 1.0;
        remoteVo.startAppIconTranslateX = 0.0;
        remoteVo.startAppIconTranslateY = 0.0;
        remoteVo.remoteWindowRadius = 96;
      })

      animateTo({
        duration: 50,
        delay: 50,
        curve: Curve.Friction,
        onFinish: () => {
        }
      }, () => {
        remoteVo.startAppIconWindowAlpha = 1.0;
        remoteVo.remoteWindowWindowAlpha = 0;
      })
    } else if (remoteVo.remoteAnimationType  == RemoteConstants.TYPE_CLOSE_WINDOW) {
    } else if (remoteVo.remoteAnimationType  == RemoteConstants.TYPE_APP_TRANSITION) {
      const callback = Object.assign(finishCallback);
      animateTo({
        duration: 300,
        curve: Curve.Friction,
        onFinish: () => {
          this.removeRemoteWindowFromList(remoteVo.remoteWindowKey);
        }
      }, () => {
        remoteVo.remoteWindowRadius = 0;
        remoteVo.remoteWindowTranslateX = 0;
        remoteVo.fromRemoteWindowTranslateX = px2vp(remoteVo.fromWindowTarget?.windowBounds.left - remoteVo.fromWindowTarget?.windowBounds.width);
      })

      animateTo({
        duration: 150,
        curve: Curve.Friction,
        onFinish: () => {
          this.removeRemoteWindowFromList(remoteVo.remoteWindowKey);
        }
      }, () => {
        remoteVo.remoteWindowScaleX = 0.9
        remoteVo.remoteWindowScaleY = 0.9
        remoteVo.fromRemoteWindowScaleX = 0.9
        remoteVo.fromRemoteWindowScaleY = 0.9
      })

      animateTo({
        duration: 350,
        delay: 150,
        curve: Curve.Friction,
        onFinish: () => {
          callback.onAnimationFinish();
          this.removeRemoteWindowFromList(remoteVo.remoteWindowKey);
        }
      }, () => {
        remoteVo.remoteWindowScaleX = 1.0
        remoteVo.remoteWindowScaleY = 1.0
        remoteVo.fromRemoteWindowScaleX = 1.0
        remoteVo.fromRemoteWindowScaleY = 1.0
      })
    }
  }

  build() {
    Stack() {
      ForEach(this.remoteWindowList, (item) => {
        if (item.remoteAnimationType == RemoteConstants.TYPE_APP_TRANSITION) {
          StartAppTransitionRemoteWindow({
            targetInfo: item
          })
        } else {
          StartAppFromLauncherRemoteWindow({
            targetInfo: item
          })
        }
      }, (item) => item.remoteWindowKey)
    }
    .width(StyleConstants.PERCENTAGE_100)
    .height(StyleConstants.PERCENTAGE_100)
    .focusable(false)
    .enabled(false)
  }
}

@Component
export struct StartAppFromLauncherRemoteWindow {
  @ObjectLink targetInfo: RemoteVo;

  aboutToAppear(): void {
  }

  aboutToDisappear(): void {
  }

  build() {
    Stack() {
      Column() {
        if (this.targetInfo.startAppTypeFromPageDesktop === CommonConstants.OVERLAY_TYPE_CARD) {
          FormComponent({
            id: this.targetInfo.appItemInfo?.cardId,
            name: this.targetInfo.appItemInfo?.cardName,
            bundle: this.targetInfo.appItemInfo?.bundleName,
            ability: this.targetInfo.appItemInfo?.abilityName,
            module: this.targetInfo.appItemInfo?.moduleName,
            dimension: this.targetInfo.appItemInfo?.cardDimension
          })
            .clip(new Rect({
              width: this.targetInfo.iconInfo?.appIconSize,
              height: this.targetInfo.iconInfo?.appIconHeight,
              radius: 24
            }))
            .size({ width: this.targetInfo.iconInfo?.appIconSize, height: this.targetInfo.iconInfo?.appIconHeight })
        } else {
          OverlayAppIcon({
            iconSize: this.targetInfo.iconInfo?.appIconSize,
            icon: this.targetInfo.appItemInfo?.icon
          })
        }
      }
      .translate({ x: this.targetInfo.startAppIconTranslateX, y: this.targetInfo.startAppIconTranslateY })
      .scale({ x: this.targetInfo.startAppIconScaleX, y: this.targetInfo.startAppIconScaleY })
      .opacity(this.targetInfo.startAppIconWindowAlpha)
      .position({
        x: this.targetInfo.iconInfo?.appIconPositionX,
        y: this.targetInfo.iconInfo?.appIconPositionY,
      })

      RemoteWindow(this.targetInfo.target)
        .translate({ x: this.targetInfo.remoteWindowTranslateX, y: this.targetInfo.remoteWindowTranslateY })
        .scale({ x: this.targetInfo.remoteWindowScaleX, y: this.targetInfo.remoteWindowScaleY })
        .opacity(this.targetInfo.remoteWindowWindowAlpha)
        .position({ x: px2vp(this.targetInfo.target?.windowBounds.left), y: px2vp(this.targetInfo.target?.windowBounds.top) })
        .width(px2vp(this.targetInfo.target?.windowBounds.width))
        .height(px2vp(this.targetInfo.target?.windowBounds.height))
        .borderRadius(this.targetInfo.remoteWindowRadius)
    }
    .width(StyleConstants.PERCENTAGE_100)
    .height(StyleConstants.PERCENTAGE_100)
    .focusable(false)
    .enabled(false)
  }
}

@Component
export struct StartAppTransitionRemoteWindow {
  @ObjectLink targetInfo: RemoteVo;
  private target: windowAnimationManager.WindowAnimationTarget;
  private mFromWindowTarget: windowAnimationManager.WindowAnimationTarget = undefined;
  private remoteAnimationType: number = 0;
  private startAppTypeFromPageDesktop: number = 1;
  private mScreenWidth: number = 0;
  private mScreenHeight: number = 0;
  private startAppIconInfo: {
    appIconSize: number,
    appIconHeight: number,
    appIconPositionX: number,
    appIconPositionY: number
  } =
    { appIconSize: 0,
      appIconHeight: 0,
      appIconPositionX: 0,
      appIconPositionY: 0 };
  private mStartAppItemInfo: any = {};
  private mFinishCallback: windowAnimationManager.WindowAnimationFinishedCallback;
  private remoteWindowKey: string;

  aboutToAppear(): void  {
    this.target = this.targetInfo.target;
    this.mFromWindowTarget = this.targetInfo.fromWindowTarget;
    this.mFinishCallback = this.targetInfo.finishCallback;
    this.remoteWindowKey = this.targetInfo.remoteWindowKey;
    this.mStartAppItemInfo = this.targetInfo.appItemInfo;
    this.mScreenWidth = px2vp(this.target.windowBounds.width);
    this.mScreenHeight = px2vp(this.target.windowBounds.height);
  }

  aboutToDisappear() {
  }

  build() {
    Stack() {
      Column() {
        RemoteWindow(this.targetInfo.target)
          .position({ x: px2vp(this.target?.windowBounds.left), y: px2vp(this.target?.windowBounds.top) })
          .width(px2vp(this.target?.windowBounds.width))
          .height(px2vp(this.target?.windowBounds.height))
          .translate({ x: this.targetInfo.remoteWindowTranslateX, y: this.targetInfo.remoteWindowTranslateY })
          .scale({ x: this.targetInfo.remoteWindowScaleX, y: this.targetInfo.remoteWindowScaleY })
          .opacity(this.targetInfo.remoteWindowWindowAlpha)
          .borderRadius(this.targetInfo.remoteWindowRadius)

        RemoteWindow(this.mFromWindowTarget)
          .translate({ x: this.targetInfo.fromRemoteWindowTranslateX, y: this.targetInfo.fromRemoteWindowTranslateY })
          .scale({ x: this.targetInfo.fromRemoteWindowScaleX, y: this.targetInfo.fromRemoteWindowScaleY })
          .opacity(this.targetInfo.fromRemoteWindowWindowAlpha)
          .position({
            x: px2vp(this.mFromWindowTarget?.windowBounds.left),
            y: px2vp(this.mFromWindowTarget?.windowBounds.top)
          })
          .width(px2vp(this.mFromWindowTarget?.windowBounds.width))
          .height(px2vp(this.mFromWindowTarget?.windowBounds.height))
          .borderRadius(this.targetInfo.remoteWindowRadius)
      }
      .width(StyleConstants.PERCENTAGE_100)
      .height(StyleConstants.PERCENTAGE_100)
      .focusable(false)
      .enabled(false)
    }
  }
}