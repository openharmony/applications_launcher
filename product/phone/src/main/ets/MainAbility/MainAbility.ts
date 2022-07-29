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
import { Log } from '@ohos/common';
import { windowManager } from '@ohos/common';
import { RdbStoreManager } from '@ohos/common';
import { FormConstants } from '@ohos/common';
import { GestureNavigationManager } from '@ohos/gesturenavigation';
import StyleConstants from '../common/constants/StyleConstants';
import { navigationBarCommonEventManager }  from '@ohos/common';
import PageDesktopViewModel from '../../../../../../feature/pagedesktop/src/main/ets/default/viewmodel/PageDesktopViewModel';

const TAG = 'LauncherMainAbility';

export default class MainAbility extends ServiceExtension {
  onCreate(want: Want): void {
    Log.showInfo(TAG,'onCreate start');
    this.initLauncher();
  }

  async initLauncher(): Promise<void> {
    // init Launcher context
    globalThis.desktopContext = this.context;

    // init global const
    this.initGlobalConst();

    // init Gesture navigation
    this.startGestureNavigation();

    // init rdb
    let dbStore = RdbStoreManager.getInstance();
    await dbStore.initRdbConfig();
    await dbStore.createTable();

    windowManager.registerWindowEvent();
    navigationBarCommonEventManager.registerNavigationBarEvent();

    // create Launcher entry view
    windowManager.createWindow(globalThis.desktopContext, windowManager.DESKTOP_WINDOW_NAME,
      windowManager.DESKTOP_RANK, 'pages/' + windowManager.DESKTOP_WINDOW_NAME);

    // load recent
    windowManager.createRecentWindow();
  }

  private initGlobalConst(): void {
    // init create window global function
    globalThis.createWindowWithName = ((windowName: string, windowRank: number) => {
      Log.showInfo(TAG, `createWindowWithName begin windowName: ${windowName}`);
      if (windowName == windowManager.RECENT_WINDOW_NAME) {
        windowManager.createRecentWindow();
      } else {
        windowManager.createWindowIfAbsent(globalThis.desktopContext, windowName, windowRank, 'pages/' + windowName);
      }
    });
  }

  private startGestureNavigation(): void {
    const gestureNavigationManage = GestureNavigationManager.getInstance();
    display.getDefaultDisplay()
      .then((dis: { id: number, width: number, height: number, refreshRate: number }) => {
        Log.showInfo(TAG, `startGestureNavigation display: ${JSON.stringify(dis)}`);
        gestureNavigationManage.initWindowSize(dis);
      });
  }

  onDestroy(): void {
    windowManager.unregisterWindowEvent();
    navigationBarCommonEventManager.unregisterNavigationBarEvent();
    windowManager.destroyWindow(windowManager.DESKTOP_WINDOW_NAME);
    windowManager.destroyRecentWindow();
    Log.showInfo(TAG, 'onDestroy success');
  }

  onRequest(want: Want, startId: number): void {
    Log.showInfo(TAG,`onRequest, want:${want.abilityName}`);
    // if app publish card to launcher
    if(want.action == FormConstants.ACTION_PUBLISH_FORM) {
      PageDesktopViewModel.getInstance().publishCardToDesktop(want.parameters);
    }
    windowManager.minimizeAllApps();
    windowManager.hideWindow(windowManager.RECENT_WINDOW_NAME);
    this.closeFolder();
  }

  private closeFolder(): void {
    AppStorage.SetOrCreate('openFolderPageIndex', StyleConstants.DEFAULT_NUMBER_0);
    AppStorage.SetOrCreate('openFolderStatus', StyleConstants.DEFAULT_NUMBER_0);
  }
}