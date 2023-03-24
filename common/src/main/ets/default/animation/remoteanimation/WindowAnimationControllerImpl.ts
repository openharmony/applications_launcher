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
import Prompt from '@ohos.promptAction';
import windowAnimationManager from '@ohos.animation.windowAnimationManager';
import { CheckEmptyUtils } from '../../utils/CheckEmptyUtils';
import { Log } from '../../utils/Log';
import RemoteConstants from '../../constants/RemoteConstants';

const TAG = 'WindowAnimationControllerImpl';

class WindowAnimationControllerImpl implements windowAnimationManager.WindowAnimationController {
  onStartAppFromLauncher(startingWindowTarget: windowAnimationManager.WindowAnimationTarget,
                         finishCallback: windowAnimationManager.WindowAnimationFinishedCallback): void
  {
    Log.showInfo(TAG, `remote window animaion onStartAppFromLauncher`);
    this.setRemoteAnimation(startingWindowTarget, null, finishCallback, RemoteConstants.TYPE_START_APP_FROM_LAUNCHER);
    this.printfTarget(startingWindowTarget);
    finishCallback.onAnimationFinish();
  }

  onStartAppFromRecent(startingWindowTarget: windowAnimationManager.WindowAnimationTarget,
                       finishCallback: windowAnimationManager.WindowAnimationFinishedCallback): void {
    Log.showInfo(TAG, `remote window animaion onStartAppFromRecent`);
    this.setRemoteAnimation(startingWindowTarget, null, finishCallback, RemoteConstants.TYPE_START_APP_FROM_RECENT);
    this.printfTarget(startingWindowTarget);
    finishCallback.onAnimationFinish();
  }

  onStartAppFromOther(startingWindowTarget: windowAnimationManager.WindowAnimationTarget,
                      finishCallback: windowAnimationManager.WindowAnimationFinishedCallback): void {
    Log.showInfo(TAG, `remote window animaion onStartAppFromOther`);
    this.setRemoteAnimation(startingWindowTarget, null, finishCallback, RemoteConstants.TYPE_START_APP_FROM_OTHER);
    this.printfTarget(startingWindowTarget);
    finishCallback.onAnimationFinish();
  }

  onAppTransition(fromWindowTarget: windowAnimationManager.WindowAnimationTarget,
                  toWindowTarget: windowAnimationManager.WindowAnimationTarget,
                  finishCallback: windowAnimationManager.WindowAnimationFinishedCallback): void{
    Log.showInfo(TAG, `remote window animaion onAppTransition`);
    this.setRemoteAnimation(toWindowTarget, fromWindowTarget, finishCallback, RemoteConstants.TYPE_APP_TRANSITION);
    this.printfTarget(fromWindowTarget);
    this.printfTarget(toWindowTarget);
    finishCallback.onAnimationFinish();
  }

  onMinimizeWindow(minimizingWindowTarget: windowAnimationManager.WindowAnimationTarget,
                   finishCallback: windowAnimationManager.WindowAnimationFinishedCallback): void {
    Log.showInfo(TAG, `remote window animaion onMinimizeWindow`);
    this.setRemoteAnimation(null, minimizingWindowTarget, finishCallback, RemoteConstants.TYPE_MINIMIZE_WINDOW);
    this.printfTarget(minimizingWindowTarget);
    finishCallback.onAnimationFinish();
  }

  onCloseWindow(closingWindowTarget: windowAnimationManager.WindowAnimationTarget,
                finishCallback: windowAnimationManager.WindowAnimationFinishedCallback): void {
    Log.showInfo(TAG, `remote window animaion onCloseWindow`);
    this.setRemoteAnimation(null, closingWindowTarget, finishCallback, RemoteConstants.TYPE_CLOSE_WINDOW);
    this.printfTarget(closingWindowTarget);
    finishCallback.onAnimationFinish();
  }

  onScreenUnlock(finishCallback: windowAnimationManager.WindowAnimationFinishedCallback): void {
    Log.showInfo(TAG, `remote window animaion onScreenUnlock`);
    this.setRemoteAnimation(null, null, finishCallback, RemoteConstants.TYPE_SCREEN_UNLOCK);
    finishCallback.onAnimationFinish();
  }

  onWindowAnimationTargetsUpdate(fullScreenWindowTarget: windowAnimationManager.WindowAnimationTarget, floatingWindowTargets: Array<windowAnimationManager.WindowAnimationTarget>): void {}

  printfTarget(target: windowAnimationManager.WindowAnimationTarget): void {
    if (CheckEmptyUtils.isEmpty(target) || CheckEmptyUtils.isEmpty(target.windowBounds)) {
      Log.showInfo(TAG, `remote window animaion with invalid target`);
      return;
    }
    Log.showInfo(TAG, `remote window animaion bundleName: ${target.bundleName} abilityName: ${target.abilityName}`);
    Log.showInfo(TAG, `remote window animaion windowBounds left: ${target.windowBounds.left} top: ${target.windowBounds.top}
      width: ${target.windowBounds.width} height: ${target.windowBounds.height} radius: ${target.windowBounds.radius}`);
  }

  private setRemoteAnimation(startingWindowTarget: windowAnimationManager.WindowAnimationTarget,
                             closingWindowTarget: windowAnimationManager.WindowAnimationTarget,
                             finishCallback: windowAnimationManager.WindowAnimationFinishedCallback,
                             remoteAnimationType: number): void {
    if (!CheckEmptyUtils.isEmpty(startingWindowTarget)) {
      AppStorage.SetOrCreate('startingWindowTarget', startingWindowTarget);
    }

    if (!CheckEmptyUtils.isEmpty(closingWindowTarget)) {
      AppStorage.SetOrCreate('closingWindowTarget', closingWindowTarget);
    }

    if (!CheckEmptyUtils.isEmpty(finishCallback)) {
      AppStorage.SetOrCreate('remoteAnimationFinishCallback', finishCallback);
    }

    AppStorage.SetOrCreate('remoteAnimationType', remoteAnimationType);
  }
}

export default WindowAnimationControllerImpl
