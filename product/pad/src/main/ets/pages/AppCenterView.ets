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

import windowManager from '../../../../../../common/src/main/ets/default/manager/WindowManager';
import CommonConstants from '../../../../../../common/src/main/ets/default/constants/CommonConstants';
import LayoutViewModel from '../../../../../../common/src/main/ets/default/viewmodel/LayoutViewModel';
import StyleConstants from '../../../../../../common/src/main/ets/default/constants/StyleConstants';
import Log from '../../../../../../common/src/main/ets/default/utils/Log';
import AppGridLayout from '../../../../../../feature/appcenter/src/main/ets/default/layout/AppGridLayout.ets';
import SmartDock from '../../../../../../feature/smartdock/src/main/ets/default/layout/SmartDock.ets';
import AppGridPresenter from '../../../../../../feature/appcenter/src/main/ets/default/common/presenter/AppGridPresenter';
import PadStage from '../common/PadStage';

const TAG = "AppCenterView";

@Entry
@Component
struct AppCenterView {
  @State workSpaceHeight: number = 0;
  @State dockHeight: number = 0;
  @State indicatorHeight: number = 0;
  @State device: string = CommonConstants.PAD_DEVICE_TYPE;
  private mLayoutViewModel: LayoutViewModel;
  mAppGridPresenter: AppGridPresenter = null;
  private mStage: PadStage = new PadStage();

  aboutToAppear(): void  {
    Log.showInfo(TAG, 'aboutToAppear');
    this.mStage.onCreate();
    AppStorage.SetOrCreate('device', this.device);
    this.mLayoutViewModel = LayoutViewModel.getInstance();
  }

  onPageShow(): void {
    Log.showInfo(TAG, 'onPageShow');
    // move appCenter startup front when power on
    this.updateScreenSize();
    this.mAppGridPresenter = AppGridPresenter.getInstance();
    this.mAppGridPresenter.getAppList();
    this.mAppGridPresenter.registerAppListChange();
  }

  onPageHide(): void {
    Log.showInfo(TAG, 'onPageHide');
    this.mAppGridPresenter.unregisterAppListChange();
  }

  aboutToDisappear(): void {
    Log.showInfo(TAG, 'aboutToDisappear');
  }

  private async updateScreenSize() {
    let screenWidth = await windowManager.getWindowWidth();
    let screenHeight = await windowManager.getWindowHeight();
    this.workSpaceHeight = this.mLayoutViewModel.getWorkSpaceHeight();
    this.dockHeight = this.mLayoutViewModel.getDockHeight();
    this.indicatorHeight = this.mLayoutViewModel.getIndicator();
    Log.showInfo(TAG, `updateScreenSize product: ${this.device}, screenWidth: ${screenWidth}, screenHeight: ${screenHeight}`);
  }

  onBackPress(): boolean {
    Log.showInfo(TAG, `onBackPress`);
    ContextMenu.close();
    AppStorage.SetOrCreate('selectDesktopAppItem', '');
    windowManager.hideWindow(windowManager.APP_CENTER_WINDOW_NAME);
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
      this.onBackPress();
    })
  }
}