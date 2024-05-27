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
import mediaquery from '@ohos.mediaquery'
import { Log } from '@ohos/common';
import { Trace } from '@ohos/common';
import { CommonConstants } from '@ohos/common';
import { EventConstants } from '@ohos/common';
import { windowManager } from '@ohos/common';
import { localEventManager } from '@ohos/common';
import { SettingsModel, LayoutViewModel } from '@ohos/common';
import { RemoteWindowWrapper } from '@ohos/common/component';
import { SmartDock } from '@ohos/smartdock/component';
import { PageDesktopLayout } from '@ohos/pagedesktop/component';
import { BigFolderConstants, BigFolderStyleConfig } from '@ohos/bigfolder';
import { FolderOpenComponent } from '@ohos/bigfolder/component';
import PadStage from '../common/PadStage';
import StyleConstants from '../common/constants/StyleConstants';
import { FormStyleConfig } from '@ohos/form';
import AppCenterGridStyleConfig from '@ohos/appcenter/src/main/ets/default/common/AppCenterGridStyleConfig';
import PadPageDesktopGridStyleConfig from '../common/PadPageDesktopGridStyleConfig';
import { SmartDockStyleConfig } from '@ohos/smartdock';
import display from '@ohos.display';

const RAW_IMAGE_CACHE_SIZE = 20000000;
const TAG = 'EntryView';

interface LocalEventListener {
  onReceiveEvent: (event: string, params: string) => void;
}

@Entry
@Component
struct EntryView {
  @StorageLink('screenWidth') screenWidth: number = 0;
  @StorageLink('screenHeight') @Watch('updateScreenInfo') screenHeight: number = 0;
  @StorageLink('deviceType') deviceType: string = CommonConstants.PAD_DEVICE_TYPE;
  @State workSpaceWidth: number = 0;
  @State workSpaceHeight: number = 0;
  @State dockHeight: number = 0;
  private mStage: PadStage = new PadStage();
  private navigationBarStatus: string | undefined;
  private mOrientationListener = mediaquery.matchMediaSync('(orientation: landscape)');
  @State mAppScaleX: number = 1.0;
  @State mAppScaleY: number = 1.0;
  @State mAppAlpha: number = 1.0;
  @StorageLink('IsSetImageRawDataCacheSize') isSetImageRawDataCacheSize?: boolean = undefined;
  async onPortrait(mediaQueryResult: mediaquery.MediaQueryResult) {
    if (mediaQueryResult.matches) {
      Log.showInfo(TAG, 'screen change to landscape');
      AppStorage.setOrCreate('isPortrait', false);
    } else {
      Log.showInfo(TAG, 'screen change to portrait');
      AppStorage.setOrCreate('isPortrait', true);
    }
    let dis: display.Display | null = null;
    try {
      dis = display.getDefaultDisplaySync();
      Log.showInfo(TAG, `change to display: ${JSON.stringify(dis)}`);
      AppStorage.setOrCreate('screenWidth', px2vp(dis.width));
      AppStorage.setOrCreate('screenHeight', px2vp(dis.height));
      Log.showDebug(TAG, `screenWidth and screenHeight: ${AppStorage.get('screenWidth')},${AppStorage.get('screenHeight')}`);
    } catch (err) {
      Log.showError(TAG, `display.getDefaultDisplaySync err: ${JSON.stringify(err)}`)
    }
  }

  aboutToAppear(): void  {
    Log.showInfo(TAG, 'aboutToAppear');
    this.mStage.onCreate();
    this.navigationBarStatus = SettingsModel.getInstance().getValue();
    this.getWindowSize();
    this.updateScreenSize();
    this.mOrientationListener.on('change', this.onPortrait);
    this.registerPageDesktopNavigatorStatusChangeEvent(this.mLocalEventListener);
  }

  registerPageDesktopNavigatorStatusChangeEvent(listener: LocalEventListener): void {
    localEventManager.registerEventListener(listener, [
      EventConstants.EVENT_NAVIGATOR_BAR_STATUS_CHANGE,
      EventConstants.EVENT_ANIMATION_START_APPLICATION,
      EventConstants.EVENT_ANIMATION_CLOSE_APPLICATION
    ]);
  }

  private readonly mLocalEventListener: LocalEventListener = {
    onReceiveEvent: (event: string, params: string) => {
      Log.showInfo(TAG, `receive event: ${event}, params: ${params}`);
      if (event === EventConstants.EVENT_NAVIGATOR_BAR_STATUS_CHANGE) {
        this.navigationBarStatus = params;
        this.updateScreenInfo();
      } else if (event === EventConstants.EVENT_ANIMATION_START_APPLICATION) {
        this.startAppAnimation();
      } else if (event === EventConstants.EVENT_ANIMATION_CLOSE_APPLICATION) {
        this.closeAppAnimation();
      }
    }
  };

  private startAppAnimation(): void {
    animateTo({
      duration: 500,
      curve: Curve.Friction,
      onFinish: () => {},
    }, () => {
      this.mAppScaleX = 0.95;
      this.mAppScaleY = 0.95;
    })
  }

  private closeAppAnimation(): void {
    animateTo({
      duration: 370,
      delay: 0,
      curve: Curve.Friction,
    }, () => {
      this.mAppScaleX = 1.0;
      this.mAppScaleY = 1.0;
    })
  }

  private updateScreenInfo(): void {
    Log.showInfo(TAG, 'updateScreenInfo');
    if (this.screenWidth !== 0 && this.screenHeight !== 0) {
      LayoutViewModel.getInstance().initScreen(this.navigationBarStatus);
      SmartDockStyleConfig.getInstance();
      PadPageDesktopGridStyleConfig.getInstance();
      AppCenterGridStyleConfig.getInstance();
      BigFolderStyleConfig.getInstance();
      FormStyleConfig.getInstance();
      this.updateScreenSize();
    }
  }

  onPageShow(): void {
    Log.showInfo(TAG, 'onPageShow');
    if (typeof this.isSetImageRawDataCacheSize === 'undefined') {
      Log.showInfo(TAG, 'onPageShow setImageRawDataCacheSize');

      // If cannot compile this, comment next line or add following code into Class App in "@system.app.d.ts":
      // static setImageRawDataCacheSize(value: number): void;
      app.setImageRawDataCacheSize(RAW_IMAGE_CACHE_SIZE);
      app.setImageCacheCount(100);
      this.isSetImageRawDataCacheSize = true;
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
    Log.showDebug(TAG, `updateScreenSize product: ${this.deviceType}, screenWidth: ${this.screenWidth}, screenHeight: ${this.screenHeight}, workSpaceWidth: ${this.workSpaceWidth}, workSpaceHeight: ${this.workSpaceHeight}, dockHeight: ${this.dockHeight}`);
  }

  aboutToDisappear(): void {
    this.mOrientationListener.off('change', this.onPortrait);
    this.mStage.onDestroy();
  }

  onBackPress(): boolean {
    Log.showInfo(TAG, 'onBackPress');
    ContextMenu.close();
    AppStorage.setOrCreate('overlayMode', CommonConstants.OVERLAY_TYPE_HIDE);
    AppStorage.setOrCreate('openFolderStatus', BigFolderConstants.OPEN_FOLDER_STATUS_CLOSE);
    AppStorage.setOrCreate('selectDesktopAppItem', '');
    this.closeRecentDockPopup();
    return true;
  }

  private closeRecentDockPopup(): void {
    let num: number = AppStorage.get('sysUiRecentOnClickEvent') as number;
    AppStorage.setOrCreate('sysUiRecentOnClickEvent', ++num);
  }

  private buildLog(): boolean {
    Log.showInfo(TAG, 'buildLog');
    return true;
  }

  build() {
    Stack() {
      if (this.buildLog()) {}
      Column() {
        Column() {
          PageDesktopLayout();
        }
        .alignItems(HorizontalAlign.Center)
        .justifyContent(FlexAlign.Center)
        .height(this.workSpaceHeight)
        .onAreaChange((oldValue: Area, newValue: Area) => {
          Log.showDebug(TAG, `onAreaChange navigationBarStatus: ${this.navigationBarStatus}`);
          if (JSON.stringify(oldValue) == JSON.stringify(newValue)) return;
          if (this.navigationBarStatus == '1') {
            setTimeout(() => {
              SettingsModel.getInstance().setValue(this.navigationBarStatus);
            }, 30);
          }
        })

        Column() {
          SmartDock({
            showAppCenter: () => {
              Trace.start(Trace.CORE_METHOD_START_APP_CENTER);
              windowManager.createWindowWithName(windowManager.APP_CENTER_WINDOW_NAME, windowManager.DESKTOP_RANK);
            }
          });
        }
        .height(this.dockHeight)
      }
      .width('100%')
      .height('100%')
      .scale({ x: this.mAppScaleX, y: this.mAppScaleY })
      .opacity(this.mAppAlpha)

      if ((AppStorage.get<number>('openFolderStatus') as number) !== BigFolderConstants.OPEN_FOLDER_STATUS_CLOSE) {
        FolderOpenComponent();
      }
      RemoteWindowWrapper();
    }
    .backgroundImage(StyleConstants.DEFAULT_BACKGROUND_IMAGE)
    .backgroundImageSize(ImageSize.Cover)
    .backgroundImagePosition(Alignment.Center)
    .width('100%')
    .height('100%')
  }
}
