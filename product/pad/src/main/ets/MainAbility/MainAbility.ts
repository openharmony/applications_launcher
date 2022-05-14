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

import ServiceExtension from '@ohos.application.ServiceExtensionAbility';
import display from '@ohos.display';
import Want from '@ohos.application.Want';
import windowManager from '../../../../../../common/src/main/ets/default/manager/WindowManager';
import Log from '../../../../../../common/src/main/ets/default/utils/Log';
import GestureNavigationManage from '../../../../../../feature/gesturenavigation/src/main/ets/default/common/GestureNavigationManage';
import StyleConstants from '../common/constants/StyleConstants';

const TAG = 'LauncherMainAbility';

export default class MainAbility extends ServiceExtension {
  onCreate(want: Want): void {
    Log.showInfo(TAG,'onCreate start');
    this.initGlobalConst();
    windowManager.createWindow(this.context, windowManager.DESKTOP_WINDOW_NAME,
      windowManager.DESKTOP_RANK, 'pages/EntryView');
  }

  private initGlobalConst(): void {
    globalThis.desktopContext = this.context;
    globalThis.createWindowWithName = ((windowName: string, windowRank: number) => {
      Log.showInfo(TAG, 'createWindowWithName Begin' + windowName);
      windowManager.createWindowIfAbsent(this.context, windowName, windowRank, 'pages/' + windowName);
    });
    this.startGestureNavigation();
  }

  private startGestureNavigation(): void {
    const gestureNavigationManage = GestureNavigationManage.getInstance();
    display.getDefaultDisplay()
      .then((dis: { id: number, width: number, height: number, refreshRate: number }) => {
        Log.showInfo(TAG, `startGestureNavigation display: ${JSON.stringify(dis)}`);
        gestureNavigationManage.initWindowSize(dis);
      });
  }

  onDestroy(): void {
    windowManager.destroyWindow(windowManager.DESKTOP_WINDOW_NAME);
    windowManager.destroyWindow(windowManager.RECENT_WINDOW_NAME);
    windowManager.destroyWindow(windowManager.APP_CENTER_WINDOW_NAME);
    Log.showInfo(TAG, 'onDestroy success');
  }

  onRequest(want: Want, startId: number): void {
    Log.showInfo(TAG,`onRequest, want: ${want.abilityName}`);
    windowManager.minimizeAllApps();
    windowManager.hideWindow(windowManager.RECENT_WINDOW_NAME);
    windowManager.hideWindow(windowManager.APP_CENTER_WINDOW_NAME);
    this.closeFolder();
    this.closeRecentDockPopup();
  }

  private closeFolder(): void {
    AppStorage.SetOrCreate('openFolderPageIndex', StyleConstants.DEFAULT_NUMBER_0);
    AppStorage.SetOrCreate('openFolderStatus', StyleConstants.DEFAULT_NUMBER_0);
  }

  private closeRecentDockPopup(): void {
    let num: number = AppStorage.Get('sysUiRecentOnClickEvent');
    AppStorage.SetOrCreate('sysUiRecentOnClickEvent', ++num);
  }
}