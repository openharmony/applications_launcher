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

import ServiceExtension from '@ohos.app.ability.ServiceExtensionAbility';
import display from '@ohos.display';
import Want from '@ohos.app.ability.Want';
import {
  Log,
  CommonConstants,
  windowManager,
  RdbStoreManager,
  FormConstants,
  FormListInfoCacheManager,
  ResourceManager,
  launcherAbilityManager,
  navigationBarCommonEventManager,
  localEventManager,
  EventConstants,
  DisplayManager
} from '@ohos/common';
import { GestureNavigationManager } from '@ohos/gesturenavigation';
import StyleConstants from '../common/constants/StyleConstants';
import { PageDesktopViewModel } from '@ohos/pagedesktop';
import Window from '@ohos.window';
import inputConsumer from '@ohos.multimodalInput.inputConsumer';
import { KeyCode } from '@ohos.multimodalInput.keyCode';
import window from '@ohos.window';
import { PreferencesHelper } from '@ohos/common/src/main/ets/default/manager/PreferencesHelper';
import systemParameter from '@ohos.systemparameter';

const TAG = 'LauncherMainAbility';

export default class MainAbility extends ServiceExtension {
  private displayManager: DisplayManager = undefined

  onCreate(want: Want): void {
    Log.showInfo(TAG,'onCreate start');
    this.context.area = 0;
    this.initLauncher();
  }

  async initLauncher(): Promise<void> {
    // init Launcher context
    globalThis.desktopContext = this.context;

    let registerWinEvent = (win: window.Window) => {
      win.on('windowEvent', (stageEventType) => {
        // 桌面获焦或失焦时，通知桌面的卡片变为可见状态
        if (stageEventType === window.WindowEventType.WINDOW_ACTIVE) {
          launcherAbilityManager.checkBundleMonitor();
          localEventManager.sendLocalEventSticky(EventConstants.EVENT_REQUEST_FORM_ITEM_VISIBLE, null);
          Log.showInfo(TAG, `lifeCycleEvent change: ${stageEventType}`);
        }
      })
    };

    // create Launcher entry view
    windowManager.createWindow(globalThis.desktopContext, windowManager.DESKTOP_WINDOW_NAME,
      windowManager.DESKTOP_RANK, 'pages/' + windowManager.DESKTOP_WINDOW_NAME, true, registerWinEvent);

    await PreferencesHelper.getInstance().initPreference(globalThis.desktopContext);

    // init global const
    this.initGlobalConst();

    // init rdb
    let dbStore = RdbStoreManager.getInstance();

    await dbStore.initRdbConfig();
    await dbStore.createTable();

    // init Gesture navigation
    this.startGestureNavigation();

    windowManager.registerWindowEvent();
    navigationBarCommonEventManager.registerNavigationBarEvent();
    // load recent
    windowManager.createRecentWindow();
    this.registerInputConsumer();
    this.displayManager = DisplayManager.getInstance();

    AppStorage.setOrCreate('loaded', true);
    systemParameter.set('bootevent.launcher.ready', 'true');
  }

  private registerInputConsumer(): void {
    // register/unregister HOME inputConsumer
    inputConsumer.on('key', {
      preKeys: [],
      finalKey: KeyCode.KEYCODE_HOME,
      finalKeyDownDuration: 0,
      isFinalKeyDown: true
    }, () => {
      Log.showInfo(TAG, 'HOME inputConsumer homeEvent start');
      globalThis.desktopContext.startAbility({
        bundleName: CommonConstants.LAUNCHER_BUNDLE,
        abilityName: CommonConstants.LAUNCHER_ABILITY
      })
        .then(() => {
          Log.showDebug(TAG, 'HOME inputConsumer startAbility Promise in service successful.');
        })
        .catch(() => {
          Log.showDebug(TAG, 'HOME inputConsumer startAbility Promise in service failed.');
        });
    });
    // register/unregister RECENT inputConsumer
    inputConsumer.on('key', {
      preKeys: [],
      finalKey: KeyCode.KEYCODE_FUNCTION,
      finalKeyDownDuration: 0,
      isFinalKeyDown: true
    }, () => {
      Log.showInfo(TAG, 'RECENT inputConsumer recentEvent start');
      windowManager.createWindowWithName(windowManager.RECENT_WINDOW_NAME, windowManager.RECENT_RANK);
    });
  }

  private unregisterInputConsumer(): void {
    // unregister HOME inputConsumer
    inputConsumer.off('key', {
      preKeys: [],
      finalKey: KeyCode.KEYCODE_HOME,
      finalKeyDownDuration: 0,
      isFinalKeyDown: true
    });
    // unregister RECENT inputConsumer
    inputConsumer.off('key', {
      preKeys: [],
      finalKey: KeyCode.KEYCODE_FUNCTION,
      finalKeyDownDuration: 0,
      isFinalKeyDown: true
    });
  }

  private initGlobalConst(): void {
    // init create window global function
    globalThis.createWindowWithName = ((windowName: string, windowRank: number): void => {
      Log.showInfo(TAG, `createWindowWithName begin windowName: ${windowName}`);
      if (windowName === windowManager.RECENT_WINDOW_NAME) {
        windowManager.createRecentWindow();
      } else {
        windowManager.createWindowIfAbsent(globalThis.desktopContext, windowName, windowRank, 'pages/' + windowName);
      }
    });
  }

  private startGestureNavigation(): void {
    const gestureNavigationManage = GestureNavigationManager.getInstance();
    let dis: display.Display = display.getDefaultDisplaySync();
    dis && gestureNavigationManage.initWindowSize(dis);
  }

  onDestroy(): void {
    windowManager.unregisterWindowEvent();
    this.unregisterInputConsumer();
    navigationBarCommonEventManager.unregisterNavigationBarEvent();
    windowManager.destroyWindow(windowManager.DESKTOP_WINDOW_NAME);
    windowManager.destroyRecentWindow();
    this.displayManager?.destroySubDisplayWindow();
    Log.showInfo(TAG, 'onDestroy success');
  }

  onRequest(want: Want, startId: number): void {
    Log.showInfo(TAG,`onRequest, want:${want.abilityName}`);
    // if app publish card to launcher
    if(want.action === FormConstants.ACTION_PUBLISH_FORM) {
      PageDesktopViewModel.getInstance().publishCardToDesktop(want.parameters);
    }
    if (startId !== 1) {
      windowManager.minimizeAllApps();
    }
    windowManager.hideWindow(windowManager.RECENT_WINDOW_NAME);
    localEventManager.sendLocalEventSticky(EventConstants.EVENT_OPEN_FOLDER_TO_CLOSE, null);
  }

  onConfigurationUpdate(config): void {
    Log.showInfo(TAG, 'onConfigurationUpdated, config:' + JSON.stringify(config));
    const systemLanguage = AppStorage.get('systemLanguage');
    if(systemLanguage !== config.language) {
      this.clearCacheWhenLanguageChange();
    }
    AppStorage.setOrCreate('systemLanguage', config.language);
  }

  private clearCacheWhenLanguageChange(): void {
    FormListInfoCacheManager.getInstance().clearCache();
    ResourceManager.getInstance().clearAppResourceCache();
    launcherAbilityManager.cleanAppMapCache();
    PageDesktopViewModel.getInstance().updateDesktopInfo();
    PageDesktopViewModel.getInstance().updateForms();
  }
}
