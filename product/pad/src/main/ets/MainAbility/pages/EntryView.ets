/*
 * Copyright (c) 2021 Huawei Device Co., Ltd.
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

import PadStage from '../common/PadStage';
import windowManager from '../../../../../../../common/src/main/ets/default/manager/WindowManager';
import RdbStoreManager from '../../../../../../../common/src/main/ets/default/manager/RdbStoreManager';
import CustomOverlay from '../../../../../../../common/src/main/ets/default/uicomponents/CustomOverlay.ets';
import CommonConstants from '../../../../../../../common/src/main/ets/default/constants/CommonConstants';
import PageDesktopLayout from '../../../../../../../feature/pagedesktop/src/main/ets/default/layout/PageDesktopLayout.ets';
import AppGridLayout from '../../../../../../../feature/appcenter/src/main/ets/default/layout/AppGridLayout.ets';
import SmartDock from '../../../../../../../feature/smartdock/src/main/ets/default/layout/SmartDock.ets';
import FolderOpenComponent from '../../../../../../../feature/bigfolder/src/main/ets/default/view/FolderOpenComponent.ets';
import FeatureConstants from '../../../../../../../feature/bigfolder/src/main/ets/default/common/constants/FeatureConstants';
import AppBadgeMessage from '../../../../../../../common/src/main/ets/default/bean/AppBadgeMessage';
import BadgeManager from '../../../../../../../common/src/main/ets/default/manager/BadgeManager';
import LayoutViewModel from '../../../../../../../feature/launcherlayout/src/main/ets/default/common/viewmodel/LayoutViewModel';
import Trace from '../../../../../../../common/src/main/ets/default/utils/Trace';
import StyleConstants from '../../../../../../../common/src/main/ets/default/constants/StyleConstants';
import app from '@system.app';
import PageDesktopDragHandler from '../../../../../../../feature/pagedesktop/src/main/ets/default/common/PageDesktopDragHandler';
import Log from '../../../../../../../common/src/main/ets/default/utils/Log';
import RecentEvent from '../common/recentEvent';

const RAW_IMAGE_CACHE_SIZE = 20000000;
const TAG = "EntryView";

@Entry
@Component
struct EntryView {
  @State showAppCenter: boolean = false;
  @State workSpaceWidth: number = 0;
  @State workSpaceHeight: number = 0;
  @State dockHeight: number = 0;
  @State indicatorHeight: number = 0;
  @State device: string = CommonConstants.PAD_DEVICE_TYPE;
  private mStage: PadStage = new PadStage();
  private mLayoutViewModel: LayoutViewModel;

  private aboutToAppear(): void {
    this.mStage.onCreate();
    let dbStore = RdbStoreManager.getInstance();
    dbStore.initRdbConfig();
    AppStorage.SetOrCreate('dockDevice', this.device);
    this.mLayoutViewModel = LayoutViewModel.getInstance();
    this.updateScreenSize();
    let mCallback: Record<string, () => void> = {
      "onStateChange": () => this.createRecent()
    };
    RecentEvent.registerCallback(mCallback);
  }

  private createRecent(): void {
    Log.showInfo(TAG, 'receive Subscriber success');
    globalThis.createRecentWindow();
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

  private async updateScreenSize(): Promise<void> {
    let screenWidth = await windowManager.getWindowWidth();
    let screenHeight = await windowManager.getWindowHeight();
    this.mLayoutViewModel.calculate(this.device, screenWidth, screenHeight);
    this.workSpaceHeight = this.mLayoutViewModel.getWorkSpaceHeight();
    this.dockHeight = this.mLayoutViewModel.getDockHeight();
    this.indicatorHeight = this.mLayoutViewModel.getIndicator();
    AppStorage.SetOrCreate('screenWidth', screenWidth);
    AppStorage.SetOrCreate('screenHeight', screenHeight);
    AppStorage.SetOrCreate('systemUiHeght', CommonConstants.SYSTEM_UI_HEIGHT);
    Log.showInfo(TAG, `updateScreenSize product: ${this.device}, screenWidth: ${screenWidth}
    , screenHeight: ${screenHeight}, systemUiHeght: ${CommonConstants.SYSTEM_UI_HEIGHT}`);
    this.workSpaceWidth = screenWidth;
    AppStorage.SetOrCreate('workSpaceWidth', this.workSpaceWidth);
    AppStorage.SetOrCreate('workSpaceHeight', this.workSpaceHeight);
  }

  private aboutToDisappear(): void {
    this.mStage.onDestroy();
  }

  private onBackPress(): boolean {
    console.info(`EntryView onBackPress ${this.showAppCenter}`);
    ContextMenu.close();
    AppStorage.SetOrCreate('dialogControllerStatus', !AppStorage.Get('dialogControllerStatus'));
    AppStorage.SetOrCreate('overlayMode', CommonConstants.OVERLAY_TYPE_HIDE);
    AppStorage.SetOrCreate('openFolderStatus', FeatureConstants.OPEN_FOLDER_STATUS_CLOSE);
    AppStorage.SetOrCreate('selectDesktopAppItem', '');
    this.showAppCenter = false;
    PageDesktopDragHandler.getInstance().reset();
    return true;
  }

  private buildLog(): boolean {
    Log.showInfo(TAG, `buildLog ${this.showAppCenter}`);
    return true;
  }

  build() {
    Stack() {
      if (this.buildLog()) {
      }
      Column() {
        Column() {
          Flex({ direction: FlexDirection.Column, alignItems: ItemAlign.Center, justifyContent: FlexAlign.Center }) {
            if (this.showAppCenter) {
              AppGridLayout();
            } else {
              PageDesktopLayout({
                device: this.device,
              });
            }
          }
        }
        .height(this.workSpaceHeight)
        Column() {
        }
        .height(this.indicatorHeight)
        Column() {
          SmartDock({
            device: this.device,
            showAppCenter: () => {
              Trace.start(Trace.CORE_METHOD_START_APP_CENTER);
              this.showAppCenter = true;
            }
          })
        }
        .height(this.dockHeight)
      }
      .margin({
        top: StyleConstants.DEFAULT_28
      })
      .width('100%')
      .height('100%')

      FolderOpenComponent()
      CustomOverlay()
    }
    .backgroundImage(this.showAppCenter ? '/common/pics/ic_wallpaper_recent.jpg' : '/common/pics/img_wallpaper_default.jpg')
    .backgroundImageSize(ImageSize.Cover)
    .width('100%')
    .height('100%')
  }
}