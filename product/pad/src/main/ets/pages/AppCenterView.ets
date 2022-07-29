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

import { Log } from '@ohos/common';
import { StyleConstants } from '@ohos/common';
import { CommonConstants } from '@ohos/common';
import { windowManager } from '@ohos/common';
import { LayoutViewModel } from '@ohos/common';
import { SmartDock } from '@ohos/smartdock';
import { AppGridLayout } from '@ohos/appcenter';
import { AppGridViewModel } from '@ohos/appcenter';
import PadStage from '../common/PadStage';

const TAG = "AppCenterView";

@Entry
@Component
struct AppCenterView {
  @State workSpaceHeight: number = 0;
  @State dockHeight: number = 0;
  @State device: string = CommonConstants.PAD_DEVICE_TYPE;
  private mLayoutViewModel: LayoutViewModel;
  mAppGridViewModel: AppGridViewModel = null;

  aboutToAppear(): void  {
    Log.showInfo(TAG, 'aboutToAppear');
    AppStorage.SetOrCreate('device', this.device);
    this.mLayoutViewModel = LayoutViewModel.getInstance();
  }

  onPageShow(): void {
    Log.showInfo(TAG, 'onPageShow');
    // move appCenter startup front when power on
    this.updateScreenSize();
    this.mAppGridViewModel = AppGridViewModel.getInstance();
    this.mAppGridViewModel.registerAppListChange();
  }

  onPageHide(): void {
    Log.showInfo(TAG, 'onPageHide');
    this.mAppGridViewModel.unregisterAppListChange();
  }

  aboutToDisappear(): void {
    Log.showInfo(TAG, 'aboutToDisappear');
  }

  private async updateScreenSize() {
    let screenWidth = await windowManager.getWindowWidth();
    let screenHeight = await windowManager.getWindowHeight();
    this.workSpaceHeight = this.mLayoutViewModel.getWorkSpaceHeight();
    this.dockHeight = this.mLayoutViewModel.getDockHeight();
    Log.showInfo(TAG, `updateScreenSize product: ${this.device}, screenWidth: ${screenWidth}, screenHeight: ${screenHeight}`);
  }

  onBackPress(): boolean {
    Log.showInfo(TAG, `onBackPress`);
    AppStorage.SetOrCreate('selectDesktopAppItem', '');
    windowManager.destroyWindow(windowManager.APP_CENTER_WINDOW_NAME);
    return true;
  }

  private buildLog(): boolean {
    Log.showDebug(TAG, `AppCenterView buildLog`);
    return true;
  }

  build() {
    Stack() {
      if (this.buildLog()) {
      }
      Column() {
        Column() {
          Flex({ direction: FlexDirection.Column, alignItems: ItemAlign.Center, justifyContent: FlexAlign.Center }) {
            AppGridLayout();
          }
          .margin({
            top: StyleConstants.DEFAULT_28
          })
        }
        .height(this.workSpaceHeight)

        Column() {
          SmartDock({
            device: this.device,
          })
        }
        .height(this.dockHeight)
      }
      .width('100%')
      .height('100%')
    }
    .backgroundImage('/common/pics/ic_wallpaper_recent.jpg')
    .backgroundImageSize(ImageSize.Cover)
    .width('100%')
    .height('100%')
    .onClick(() => {
      Log.showInfo(TAG, 'click appcenter area');
      let contextFlag = AppStorage.Get('contextMenuState');
      if (contextFlag) {
        AppStorage.SetOrCreate('contextMenuState', false);
      }else {
        this.onBackPress();
      }
    })
  }
}