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
import { CommonConstants } from '@ohos/common';
import { EventConstants } from '@ohos/common';
import { windowManager } from '@ohos/common';
import { localEventManager } from '@ohos/common';
import { SettingsModel } from '@ohos/common';
import { LayoutViewModel } from '@ohos/common';
import { SmartDock } from '@ohos/smartdock/component';
import { PageDesktopLayout } from '@ohos/pagedesktop/component';
import { FolderOpenComponent } from '@ohos/bigfolder/component';
import { BigFolderConstants, BigFolderStyleConfig } from '@ohos/bigfolder';
import PhoneStage from '../common/PhoneStage';
import StyleConstants from '../common/constants/StyleConstants';
import { SmartDockStyleConfig } from '@ohos/smartdock';
import PhonePageDesktopGridStyleConfig from '../common/PhonePageDesktopGridStyleConfig';
import { FormStyleConfig } from '@ohos/form';

const TAG = 'EntryView';

interface LocalEventListener {
  onReceiveEvent: (event: string, params: string) => void;
}

@Entry
@Component
struct EntryView {
  @StorageLink('screenWidth') screenWidth: number = 0;
  @StorageLink('screenHeight') @Watch('updateScreenInfo') screenHeight: number = 0;
  @StorageLink('deviceType') deviceType: string = CommonConstants.DEFAULT_DEVICE_TYPE;
  @State workSpaceWidth: number = 0;
  @State workSpaceHeight: number = 0;
  @State dockHeight: number = 0;
  private mStage: PhoneStage = new PhoneStage();
  private navigationBarStatus: string | undefined;

  onPageShow(): void {
    Log.showInfo(TAG, 'onPageShow');
  }

  onPageHide(): void {
    Log.showInfo(TAG, 'onPageHide');
  }

  aboutToAppear(): void {
    Log.showInfo(TAG, 'aboutToAppear');
    this.mStage.onCreate();
    this.navigationBarStatus = SettingsModel.getInstance().getValue();
    this.getWindowSize();
    this.updateScreenSize();

    this.registerPageDesktopNavigatorStatusChangeEvent(this.mLocalEventListener);

  }

  registerPageDesktopNavigatorStatusChangeEvent(listener: LocalEventListener): void {
    localEventManager.registerEventListener(listener, [EventConstants.EVENT_NAVIGATOR_BAR_STATUS_CHANGE]);
  }

  private readonly mLocalEventListener: LocalEventListener = {
    onReceiveEvent: (event: string, params: string) => {
      Log.showDebug(TAG, `receive event: ${event}, params: ${params}`);
      if (event === EventConstants.EVENT_NAVIGATOR_BAR_STATUS_CHANGE) {
        this.navigationBarStatus = params;
        this.updateScreenInfo();
      }
    }
  };

  aboutToDisappear(): void {
    this.mStage.onDestroy();
    Log.showInfo(TAG, 'aboutToDisappear');
  }

  onBackPress(): boolean {
    Log.showInfo(TAG, 'onBackPress');
    ContextMenu.close();
    AppStorage.setOrCreate('overlayMode', CommonConstants.OVERLAY_TYPE_HIDE);
    AppStorage.setOrCreate('openFolderStatus', BigFolderConstants.OPEN_FOLDER_STATUS_CLOSE);
    return true;
  }

  private updateScreenInfo(): void {
    Log.showDebug(TAG, 'updateScreenInfo');
    if (this.screenWidth != 0 && this.screenHeight != 0) {
      LayoutViewModel.getInstance().initScreen(this.navigationBarStatus);
      SmartDockStyleConfig.getInstance();
      PhonePageDesktopGridStyleConfig.getInstance();
      BigFolderStyleConfig.getInstance();
      FormStyleConfig.getInstance();
      this.updateScreenSize();
    }
  }

  private getWindowSize(): void {
    try {
      this.screenWidth = px2vp(windowManager.getWindowWidth());
      this.screenHeight = px2vp(windowManager.getWindowHeight());
      AppStorage.setOrCreate('screenWidth', this.screenWidth);
      AppStorage.setOrCreate('screenHeight', this.screenHeight);
    } catch (error) {
      Log.showError(TAG, `getWindowWidth or getWindowHeight error: ${error}`);
    }
  }

  private updateScreenSize(): void {
    this.workSpaceWidth = this.screenWidth;
    this.workSpaceHeight = LayoutViewModel.getInstance().getWorkSpaceHeight() as number;
    this.dockHeight = LayoutViewModel.getInstance().getDockHeight() as number;
    AppStorage.setOrCreate('workSpaceWidth', this.workSpaceWidth);
    AppStorage.setOrCreate('workSpaceHeight', this.workSpaceHeight);
    AppStorage.setOrCreate('dockHeight', this.dockHeight);
    Log.showDebug(TAG, `updateScreenSize product: ${this.deviceType}, screenWidth: ${this.screenWidth}, screenHeight: ${this.screenHeight},
      workSpaceWidth: ${this.workSpaceWidth}, workSpaceHeight: ${this.workSpaceHeight}, dockHeight: ${this.dockHeight}`);
  }

  build() {
    Stack() {
      Flex({ direction: FlexDirection.Column, alignItems: ItemAlign.Center, justifyContent: FlexAlign.Start }) {
        Column() {
          PageDesktopLayout();
        }
        .height(this.workSpaceHeight)
        .onAreaChange((oldValue: Area, newValue: Area) => {
          Log.showDebug(TAG, `onAreaChange navigationBarStatus: ${this.navigationBarStatus}`);
          if (JSON.stringify(oldValue) == JSON.stringify(newValue)) return;
          if (this.navigationBarStatus == '1') {
            setTimeout(() => {
              SettingsModel.getInstance().setValue(this.navigationBarStatus);
            }, 50)
          }
        })

        Column() {
          SmartDock();
        }
        .height(this.dockHeight)
      }

      FolderOpenComponent();
    }
    .backgroundImage(StyleConstants.DEFAULT_BACKGROUND_IMAGE)
    .backgroundImageSize(ImageSize.Cover)
    .backgroundImagePosition(Alignment.Center)
    .width('100%')
    .height('100%')
  }
}
