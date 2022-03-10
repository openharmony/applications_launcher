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

import windowManager from '../../../../../../../common/src/main/ets/default/manager/WindowManager';
import RdbStoreManager from '../../../../../../../common/src/main/ets/default/manager/RdbStoreManager';
import LayoutConfigManager from '../../../../../../../common/src/main/ets/default/layoutconfig/LayoutConfigManager';
import SmartDock from '../../../../../../../feature/smartdock/src/main/ets/default/layout/SmartDock.ets';
import CommonConstants from '../../../../../../../common/src/main/ets/default/constants/CommonConstants';
import PageDesktopLayout from '../../../../../../../feature/pagedesktop/src/main/ets/default/layout/PageDesktopLayout.ets';
import AppListLayout from '../../../../../../../feature/appcenter/src/main/ets/default/layout/AppListLayout.ets';
import CustomOverlay from '../../../../../../../common/src/main/ets/default/uicomponents/CustomOverlay.ets';
import PageDesktopModeConfig from '../../../../../../../common/src/main/ets/default/layoutconfig/PageDesktopModeConfig';
import PhoneStage from '../common/PhoneStage';
import StyleConstants from '../common/constants/StyleConstants';
import FolderOpenComponent from '../../../../../../../feature/bigfolder/src/main/ets/default/view/FolderOpenComponent.ets';
import FeatureConstants from '../../../../../../../feature/bigfolder/src/main/ets/default/common/constants/FeatureConstants';
import LayoutViewModel from '../../../../../../../feature/launcherlayout/src/main/ets/default/common/viewmodel/LayoutViewModel';
import AppBadgeMessage from '../../../../../../../common/src/main/ets/default/bean/AppBadgeMessage';
import BadgeManager from '../../../../../../../common/src/main/ets/default/manager/BadgeManager';
import Log from '../../../../../../../common/src/main/ets/default/utils/Log';
import RecentEvent from '../common/recentEvent';

const TAG = "EntryView";

@Entry
@Component
struct LayoutManager {
  @StorageLink('AppPageStartConfig') mAppPageStartConfig: string = '';
  @State workSpaceWidth: number = 0;
  @State workSpaceHeight: number = 0;
  @State dockHeight: number = 0;
  @State indicatorHeight: number = 0;
  @State device: string = 'phone';
  private mStage: PhoneStage = new PhoneStage();
  private mLayoutViewModel: LayoutViewModel;

  private aboutToAppear(): void {
    this.mStage.onCreate();
    let dbStore = RdbStoreManager.getInstance();
    dbStore.initRdbConfig();
    AppStorage.SetOrCreate('dockDevice', this.device);
    this.mLayoutViewModel = LayoutViewModel.getInstance();
    this.updateScreenSize();
    // ServiceExtension can't access callee.
    // globalThis.callee.on(BadgeManager.UPDATE_BADGE, this.updateBadge);
    let mCallback: Record<string, () => void> = {
      "onStateChange": () => this.createRecent()
    };
    RecentEvent.registerCallback(mCallback);
  }

  private createRecent(): void {
    Log.showInfo(TAG, 'receive Subscriber success');
    globalThis.createRecentWindow();
  }

  private updateBadge(badgeData): AppBadgeMessage {
    Log.showInfo(TAG, 'updateBadge is calld');
    let badgeMsg = new AppBadgeMessage(CommonConstants.INVALID_VALUE, '');
    badgeData.readSequenceable(badgeMsg);
    Log.showInfo(TAG, `updateBadge is called, badgeMsg.badge:${badgeMsg.badge}, badgeMsg.bundleName:${badgeMsg.bundleName}`);
    BadgeManager.getInstance().updateBadgeNumber(badgeMsg.bundleName, badgeMsg.badge);
    return new AppBadgeMessage(0, 'update badge success');
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
    AppStorage.SetOrCreate('systemUiHeght', CommonConstants.PHONE_SYSTEM_UI_HEIGHT);
        Log.showInfo(TAG, `updateScreenSize product: ${this.device}, screenWidth: ${screenWidth}
    , screenHeight: ${screenHeight}, systemUiHeght: ${CommonConstants.PHONE_SYSTEM_UI_HEIGHT}`);
    this.workSpaceWidth = screenWidth;
    AppStorage.SetOrCreate('workSpaceWidth', this.workSpaceWidth);
    AppStorage.SetOrCreate('workSpaceHeight', this.workSpaceHeight);
  }

  private aboutToDisappear(): void {
    this.mStage.onDestroy();
  }

  onPageShow(): void {
    Log.showInfo(TAG, 'onPageShow');
    this.mAppPageStartConfig = LayoutConfigManager.getModeConfig<PageDesktopModeConfig>(PageDesktopModeConfig.DESKTOP_MODE_CONFIG).getAppStartPageType();
  }

  private onBackPress(): void {
    ContextMenu.close();
    AppStorage.SetOrCreate('dialogControllerStatus', !AppStorage.Get('dialogControllerStatus'));
    AppStorage.SetOrCreate('overlayMode', CommonConstants.OVERLAY_TYPE_HIDE);
    AppStorage.SetOrCreate('openFolderStatus', FeatureConstants.OPEN_FOLDER_STATUS_CLOSE);
  }

  build() {
    Stack() {
      Flex({ direction: FlexDirection.Column, alignItems: ItemAlign.Start, justifyContent: FlexAlign.Start }) {
        if (this.mAppPageStartConfig === 'Grid') {
          Column() {
            PageDesktopLayout({
              device: this.device
            });
          }
          .height(this.workSpaceHeight)
          Column() {
          }.height(this.indicatorHeight)
          Column() {
            SmartDock()
          }
          .height(this.dockHeight)
        } else {
          AppListLayout();
        }
      }
      FolderOpenComponent()
      CustomOverlay()
    }
    .backgroundImage(StyleConstants.DEFAULT_BACKGROUND_IMAGE)
    .backgroundImageSize(ImageSize.Cover)
    .width('100%')
    .height('100%')
  }
}