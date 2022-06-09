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

import app from '@system.app';
import windowManager from '../../../../../../common/src/main/ets/default/manager/WindowManager';
import RdbStoreManager from '../../../../../../common/src/main/ets/default/manager/RdbStoreManager';
import CustomOverlay from '../../../../../../common/src/main/ets/default/uicomponents/CustomOverlay.ets';
import CommonConstants from '../../../../../../common/src/main/ets/default/constants/CommonConstants';
import LayoutViewModel from '../../../../../../common/src/main/ets/default/viewmodel/LayoutViewModel';
import Trace from '../../../../../../common/src/main/ets/default/utils/Trace';
import LocalEventManager from '../../../../../../common/src/main/ets/default/manager/LocalEventManager';
import EventConstants from '../../../../../../common/src/main/ets/default/constants/EventConstants';
import Log from '../../../../../../common/src/main/ets/default/utils/Log';
import PageDesktopLayout from '../../../../../../feature/pagedesktop/src/main/ets/default/layout/PageDesktopLayout';
import SmartDock from '../../../../../../feature/smartdock/src/main/ets/default/layout/SmartDock.ets';
import FolderOpenComponent from '../../../../../../feature/bigfolder/src/main/ets/default/view/FolderOpenComponent.ets';
import FeatureConstants from '../../../../../../feature/bigfolder/src/main/ets/default/common/constants/FeatureConstants';
import PageDesktopDragHandler from '../../../../../../feature/pagedesktop/src/main/ets/default/common/PageDesktopDragHandler';
import SettingsModel from '../../../../../../common/src/main/ets/default/model/SettingsModel';
import RecentEvent from '../common/RecentEvent';
import PadStage from '../common/PadStage';

const RAW_IMAGE_CACHE_SIZE = 20000000;
const TAG = 'EntryView';

@Entry
@Component
struct EntryView {
  @StorageLink('screenWidth') screenWidth: number = 0;
  @StorageLink('screenHeight') @Watch('updateScreenInfo') screenHeight: number = 0;
  @State workSpaceWidth: number = 0;
  @State workSpaceHeight: number = 0;
  @State dockHeight: number = 0;
  @State device: string = CommonConstants.PAD_DEVICE_TYPE;
  private mStage: PadStage = new PadStage();
  private mLayoutViewModel: LayoutViewModel;
  private navigationBarStatus: string | undefined;

  private aboutToAppear(): void  {
    Log.showInfo(TAG, 'aboutToAppear');
    AppStorage.SetOrCreate('device', this.device);
    this.mStage.onCreate();

    // init layout config
    this.mLayoutViewModel = LayoutViewModel.getInstance();
    this.getWindowSize();
    this.updateScreenSize();

    // register recentEvent callback
    let mCallback: Record<string, () => void> = {'onStateChange': () => this.createRecent()};
    RecentEvent.registerCallback(mCallback);
    this.registerPageDesktopNavigatorStatusChangeEvent(this.mLocalEventListener);
    this.navigationBarStatus = SettingsModel.getInstance().getValue();
  }

  registerPageDesktopNavigatorStatusChangeEvent(listener): void {
    LocalEventManager.registerEventListener(listener, [EventConstants.EVENT_NAVIGATOR_BAR_STATUS_CHANGE]);
  }

  private readonly mLocalEventListener = {
    onReceiveEvent: (event, params) => {
      Log.showInfo(TAG, `receive event: ${event}, params: ${params}`);
      if (event === EventConstants.EVENT_NAVIGATOR_BAR_STATUS_CHANGE) {
        this.navigationBarStatus = params;
        this.updateScreenInfo();
      }
    }
  };

  private updateScreenInfo(): void {
    Log.showInfo(TAG, 'updateScreenInfo');
    if (this.screenWidth != 0 && this.screenHeight != 0) {
      this.mLayoutViewModel.initScreen(this.navigationBarStatus);
      globalThis.SmartDockStyleConfig.initConfig();
      globalThis.PadPageDesktopGridStyleConfig.initConfig();
      globalThis.AppCenterGridStyleConfigInstance.initConfig();
      globalThis.BigFolderStyleConfigInstance.initConfig();
      globalThis.FormStyleConfigInstance.initConfig();
      this.updateScreenSize();
    }
  }

  private createRecent(): void {
    Log.showInfo(TAG, 'receive Subscriber success');
    globalThis.createWindowWithName(windowManager.RECENT_WINDOW_NAME, windowManager.RECENT_RANK);
  }

  private onPageShow(): void {
    Log.showInfo(TAG, 'onPageShow');
    if (typeof globalThis.IsSetImageRawDataCacheSize === 'undefined') {
      Log.showInfo(TAG, 'onPageShow setImageRawDataCacheSize');

      // If cannot compile this, comment next line or add following code into Class App in "@system.app.d.ts":
      // static setImageRawDataCacheSize(value: number): void;
      app.setImageRawDataCacheSize(RAW_IMAGE_CACHE_SIZE);
      globalThis.IsSetImageRawDataCacheSize = true;
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
    Log.showInfo(TAG, `updateScreenSize product: ${this.device}, screenWidth: ${this.screenWidth}, screenHeight: ${this.screenHeight}, workSpaceWidth: ${this.workSpaceWidth}, workSpaceHeight: ${this.workSpaceHeight}, dockHeight: ${this.dockHeight}`);
  }

  private aboutToDisappear(): void {
    this.mStage.onDestroy();
  }

  private onBackPress(): boolean {
    Log.showInfo(TAG, 'onBackPress');
    ContextMenu.close();
    AppStorage.SetOrCreate('dialogControllerStatus', !AppStorage.Get('dialogControllerStatus'));
    AppStorage.SetOrCreate('overlayMode', CommonConstants.OVERLAY_TYPE_HIDE);
    AppStorage.SetOrCreate('openFolderStatus', FeatureConstants.OPEN_FOLDER_STATUS_CLOSE);
    AppStorage.SetOrCreate('selectDesktopAppItem', '');
    PageDesktopDragHandler.getInstance().reset();
    this.closeRecentDockPopup();
    return true;
  }

  private closeRecentDockPopup() {
    let num: number = AppStorage.Get('sysUiRecentOnClickEvent');
    AppStorage.SetOrCreate('sysUiRecentOnClickEvent', ++num);
  }

  private buildLog(): boolean {
    Log.showInfo(TAG, 'buildLog');
    return true;
  }

  build() {
    Stack() {
      if (this.buildLog()) {
      }
      Column() {
        Column() {
          Flex({ direction: FlexDirection.Column, alignItems: ItemAlign.Center, justifyContent: FlexAlign.Center }) {
            PageDesktopLayout({
              device: this.device,
            });
          }
        }
        .height(this.workSpaceHeight)

        Column() {
          SmartDock({
            device: this.device,
            showAppCenter: () => {
              Trace.start(Trace.CORE_METHOD_START_APP_CENTER);
              globalThis.createWindowWithName(windowManager.APP_CENTER_WINDOW_NAME, windowManager.DESKTOP_RANK);
            }
          })
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
      .width('100%')
      .height('100%')

      FolderOpenComponent()
      CustomOverlay()
    }
    .backgroundImage('/common/pics/img_wallpaper_default.jpg')
    .backgroundImageSize(ImageSize.Cover)
    .backgroundImagePosition(Alignment.Center)
    .width('100%')
    .height('100%')
  }
}