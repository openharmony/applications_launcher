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
import RdbStoreManager from '../../../../../../common/src/main/ets/default/manager/RdbStoreManager';
import LayoutConfigManager from '../../../../../../common/src/main/ets/default/layoutconfig/LayoutConfigManager';
import CommonConstants from '../../../../../../common/src/main/ets/default/constants/CommonConstants';
import CustomOverlay from '../../../../../../common/src/main/ets/default/uicomponents/CustomOverlay';
import PageDesktopModeConfig from '../../../../../../common/src/main/ets/default/layoutconfig/PageDesktopModeConfig';
import LayoutViewModel from '../../../../../../common/src/main/ets/default/viewmodel/LayoutViewModel';
import LocalEventManager from '../../../../../../common/src/main/ets/default/manager/LocalEventManager';
import EventConstants from '../../../../../../common/src/main/ets/default/constants/EventConstants';
import Log from '../../../../../../common/src/main/ets/default/utils/Log';
import SmartDock from '../../../../../../feature/smartdock/src/main/ets/default/layout/SmartDock';
import PageDesktopLayout from '../../../../../../feature/pagedesktop/src/main/ets/default/layout/PageDesktopLayout';
import AppListLayout from '../../../../../../feature/appcenter/src/main/ets/default/layout/AppListLayout';
import FolderOpenComponent from '../../../../../../feature/bigfolder/src/main/ets/default/view/FolderOpenComponent';
import FeatureConstants from '../../../../../../feature/bigfolder/src/main/ets/default/common/constants/FeatureConstants';
import SettingsModel from '../../../../../../common/src/main/ets/default/model/SettingsModel';
import PhoneStage from '../common/PhoneStage';
import StyleConstants from '../common/constants/StyleConstants';

const TAG = "EntryView";

@Entry
@Component
struct EntryView {
  @StorageLink('screenWidth') screenWidth: number = 0;
  @StorageLink('screenHeight') @Watch('updateScreenInfo') screenHeight: number = 0;
  @State workSpaceWidth: number = 0;
  @State workSpaceHeight: number = 0;
  @State dockHeight: number = 0;
  @State device: string = 'phone';
  private mStage: PhoneStage = new PhoneStage();
  private mLayoutViewModel: LayoutViewModel;
  private navigationBarStatus: string | undefined;

  onPageShow(): void {
    Log.showInfo(TAG, 'onPageShow');
  }

  onPageHide(): void {
    Log.showInfo(TAG, 'onPageHide');
  }

  aboutToAppear(): void  {
    Log.showInfo(TAG, 'aboutToAppear');
    AppStorage.SetOrCreate('device', this.device);
    this.mStage.onCreate();

    // init layout config
    this.mLayoutViewModel = LayoutViewModel.getInstance();
    this.getWindowSize();
    this.updateScreenSize();

    this.registerPageDesktopNavigatorStatusChangeEvent(this.mLocalEventListener);
    this.navigationBarStatus = SettingsModel.getInstance().getValue();
  }

  registerPageDesktopNavigatorStatusChangeEvent(listener): void {
    LocalEventManager.registerEventListener(listener, [EventConstants.EVENT_NAVIGATOR_BAR_STATUS_CHANGE]);
  }

  private readonly mLocalEventListener = {
    onReceiveEvent: (event, params) => {
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
    AppStorage.SetOrCreate('dialogControllerStatus', !AppStorage.Get('dialogControllerStatus'));
    AppStorage.SetOrCreate('overlayMode', CommonConstants.OVERLAY_TYPE_HIDE);
    AppStorage.SetOrCreate('openFolderStatus', FeatureConstants.OPEN_FOLDER_STATUS_CLOSE);
    return true;
  }

  private updateScreenInfo(): void {
    Log.showDebug(TAG, 'updateScreenInfo');
    if (this.screenWidth != 0 && this.screenHeight != 0) {
      this.mLayoutViewModel.initScreen(this.navigationBarStatus);
      globalThis.SmartDockStyleConfig.initConfig();
      globalThis.PhonePageDesktopGridStyleConfig.initConfig();
      globalThis.BigFolderStyleConfigInstance.initConfig();
      globalThis.FormStyleConfigInstance.initConfig();
      this.updateScreenSize();
    }
  }

  private async getWindowSize(): Promise<void> {
    try {
      this.screenWidth = await windowManager.getWindowWidth();
      this.screenHeight = await windowManager.getWindowHeight();
      AppStorage.SetOrCreate('screenWidth', this.screenWidth);
      AppStorage.SetOrCreate('screenHeight', this.screenHeight);
    } catch (error) {
      Log.showError(TAG, `getWindowWidth or getWindowHeight error: ${error}`);
      AppStorage.SetOrCreate('screenWidth', 0);
      AppStorage.SetOrCreate('screenHeight', 0);
    }
  }

  private updateScreenSize(): void {
    this.workSpaceWidth = this.screenWidth;
    this.workSpaceHeight = this.mLayoutViewModel.getWorkSpaceHeight();
    this.dockHeight = this.mLayoutViewModel.getDockHeight();
    AppStorage.SetOrCreate('workSpaceWidth', this.workSpaceWidth);
    AppStorage.SetOrCreate('workSpaceHeight', this.workSpaceHeight);
    AppStorage.SetOrCreate('dockHeight', this.dockHeight);
    Log.showDebug(TAG, `updateScreenSize product: ${this.device}, screenWidth: ${this.screenWidth}, screenHeight: ${this.screenHeight}, workSpaceWidth: ${this.workSpaceWidth}, workSpaceHeight: ${this.workSpaceHeight}, dockHeight: ${this.dockHeight}`);
  }

  build() {
    Stack() {
      Flex({ direction: FlexDirection.Column, alignItems: ItemAlign.Center, justifyContent: FlexAlign.Start }) {
        Column() {
          PageDesktopLayout({
            device: this.device
          });
        }
        .height(this.workSpaceHeight)
        Column() {
          SmartDock()
        }
        .onAreaChange((event) => {
          Log.showDebug(TAG, `onAreaChange navigationBarStatus: ${this.navigationBarStatus}`);
          if (this.navigationBarStatus == "1") {
            setTimeout(() => {
              SettingsModel.getInstance().setValue(this.navigationBarStatus);
            }, 50)
          } else {
            SettingsModel.getInstance().setValue(this.navigationBarStatus);
          }
        })
        .height(this.dockHeight)
      }
      FolderOpenComponent()
      CustomOverlay()
    }
    .backgroundImage(StyleConstants.DEFAULT_BACKGROUND_IMAGE)
    .backgroundImageSize(ImageSize.Cover)
    .backgroundImagePosition(Alignment.Center)
    .width('100%')
    .height('100%')
  }
}