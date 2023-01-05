/**
 * Copyright (c) 2021-2022 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import Window from '@ohos.window';
import display from '@ohos.display';
import CommonEvent from '@ohos.commonEvent';
import featureAbility from '@ohos.ability.featureAbility';
import ServiceExtensionContext from 'application/ServiceExtensionContext';
import { AsyncCallback, BusinessError} from 'basic';
import { CommonEventData } from 'commonEvent/commonEventData';
import { CommonEventSubscriber } from 'commonEvent/commonEventSubscriber';
import { CommonEventSubscribeInfo } from 'commonEvent/commonEventSubscribeInfo';

import commonEventManager from './CommonEventManager'
import { Log } from '../utils/Log';
import { StyleConstants } from '../constants/StyleConstants';

const TAG = 'WindowManager';

/**
 * Wrapper class for window interfaces.
 */
class WindowManager {
  private mDisplayData = null;

  private static subscriber: CommonEventSubscriber;

  private static eventCallback: AsyncCallback<CommonEventData>;

  RECENT_WINDOW_NAME = 'RecentView';

  DESKTOP_WINDOW_NAME = 'EntryView';

  APP_CENTER_WINDOW_NAME = 'AppCenterView';

  FORM_MANAGER_WINDOW_NAME = 'FormManagerView';

  DESKTOP_RANK = Window.WindowType.TYPE_DESKTOP;

  RECENT_RANK = Window.WindowType.TYPE_LAUNCHER_RECENT;

  DOCK_RANK = Window.WindowType.TYPE_LAUNCHER_DOCK;

  /**
   * get WindowManager instance
   *
   * @return WindowManager singleton
   */
  static getInstance(): WindowManager {
    if (globalThis.WindowManager == null) {
      globalThis.WindowManager = new WindowManager();
      this.eventCallback = this.winEventCallback.bind(this);
      this.initSubscriber();
    }
    return globalThis.WindowManager;
  }

  /**
   * get window width
   *
   * @return windowWidth
   */
  async getWindowWidth() {
    if (this.mDisplayData == null) {
      this.mDisplayData = await this.getWindowDisplayData();
    }
    return px2vp(this.mDisplayData.width);
  }

  /**
   * get window height
   *
   * @return windowHeight
   */
  async getWindowHeight() {
    if (this.mDisplayData == null) {
      this.mDisplayData = await this.getWindowDisplayData();
    }
    return px2vp(this.mDisplayData.height);
  }

  private async getWindowDisplayData() {
    let displayData = null;
    await display.getDefaultDisplay()
      .then((res)=>{
        displayData = res;
      }).catch((err)=>{
        Log.showError(TAG, 'getWindowDisplayData error:' + err);
      });
    return displayData;
  }

  isSplitWindowMode(mode): boolean {
    if ((mode == featureAbility.AbilityWindowConfiguration.WINDOW_MODE_SPLIT_PRIMARY) ||
    (mode == featureAbility.AbilityWindowConfiguration.WINDOW_MODE_SPLIT_SECONDARY)) {
      return true;
    }
    return false;
  }

  /**
   * set window size
   *
   * @param width window width
   * @param height window height
   */
  async setWindowSize(width: number, height: number): Promise<void> {
    const abilityWindow = await Window.getTopWindow();
    void abilityWindow.resetSize(width, height);
  }

  /**
   * set window position
   *
   * @param x coordinate x
   * @param y coordinate y
   */
  async setWindowPosition(x: number, y: number): Promise<void> {
    const abilityWindow = await Window.getTopWindow();
    void abilityWindow.moveTo(x, y);
  }

  createWindow(context: ServiceExtensionContext, name: string, windowType: number, loadContent: string,
               isShow: boolean, callback?: Function) {
    Window.create(context, name, windowType).then((win) => {
      void win.setPreferredOrientation(Window.Orientation.AUTO_ROTATION_RESTRICTED);
      void win.loadContent(loadContent).then(() => {
        void win.setSystemBarProperties({
          navigationBarColor: StyleConstants.DEFAULT_SYSTEM_UI_COLOR,
          statusBarColor: StyleConstants.DEFAULT_SYSTEM_UI_COLOR
        }).then(() => {
          win.setBackgroundColor(StyleConstants.DEFAULT_SYSTEM_UI_COLOR, () => {
            Log.showDebug(TAG, `then begin ${name} window loadContent in then!`);
            if (name !== this.RECENT_WINDOW_NAME) {
              void win.setLayoutFullScreen(true).then(() => {
                Log.showDebug(TAG, `${name} setLayoutFullScreen`);
              });
            }
            if (callback) {
              callback(win);
            }
            // there is a low probability that white flashes when no delay because of setBackgroundColor is asynchronous
            setTimeout(() => {
              isShow && this.showWindow(name);
            }, StyleConstants.WINDOW_SHOW_DELAY)
          })
        });
      }, (error) => {
        Log.showError(TAG, `createWindow, create error: ${JSON.stringify(error)}`);
      });
    });
  }

  createWindowIfAbsent(context: ServiceExtensionContext, name: string, windowType: number, loadContent: string): void {
    Log.showDebug(TAG, `create, name ${name}`);
    Window.find(name).then(win => {
      void win.show().then(() => {
        Log.showDebug(TAG, `show launcher ${name}`);
      });
    }).catch(error => {
      Log.showError(TAG, `${name} ability is not created, because ${error}`);
      this.createWindow(context, name, windowType, loadContent, true);
    });
  }

  resetSizeWindow(name: string, rect: {
    width: number,
    height: number
  }, callback?: Function): void {
    Log.showDebug(TAG, `resetSizeWindow, name ${name} rect: ${JSON.stringify(rect)}`);
    this.findWindow(name, (win) => {
      Log.showDebug(TAG, `resetSizeWindow, findWindow callback name: ${name}`);
      win.resetSize(rect.width, rect.height).then(() => {
        Log.showDebug(TAG, `resetSizeWindow, resetSize then name: ${name}`);
        if (callback) {
          callback(win);
        }
      });
    });
  }

  showWindow(name: string, callback?: Function): void {
    Log.showDebug(TAG, `showWindow, name ${name}`);
    this.findWindow(name, (win) => {
      Log.showDebug(TAG, `showWindow, findWindow callback name: ${name}`);
      win.show().then(() => {
        Log.showDebug(TAG, `showWindow, show then name: ${name}`);
        if (callback) {
          callback(win);
        }
      });
    });
  }

  hideWindow(name: string, callback?: Function): void {
    Log.showDebug(TAG, `hideWindow, name ${name}`);
    this.findWindow(name, (win) => {
      Log.showDebug(TAG, `hideWindow, findWindow callback name: ${name}`);
      win.hide().then(() => {
        Log.showDebug(TAG, `hideWindow, hide then name: ${name}`);
        if (callback) {
          callback(win);
        }
      });
    });
  }

  minimizeAllApps(): void {
    display.getDefaultDisplay().then(dis => {
      Window.minimizeAll(dis.id).then(() => {
        Log.showDebug(TAG, 'Launcher minimizeAll');
      });
    });
    this.destroyWindow(this.FORM_MANAGER_WINDOW_NAME);
  }

  destroyWindow(name: string, callback?: Function): void {
    Log.showDebug(TAG, `destroyWindow, name ${name}`);
    this.findWindow(name, (win) => {
      Log.showDebug(TAG, `hideWindow, findWindow callback name: ${name}`);
      win.destroy().then(() => {
        Log.showDebug(TAG, `destroyWindow, destroy then name: ${name}`);
        if (callback) {
          callback(win);
        }
      });
    });
  }

  findWindow(name: string, callback?: Function): void {
    Log.showDebug(TAG, `findWindow, name ${name}`);
    void Window.find(name)
      .then((win) => {
        Log.showDebug(TAG, `findWindow, find then name: ${name}`);
        if (callback) {
          callback(win);
        }
      });
  }

  createRecentWindow(mode?: number) {
    Log.showDebug(TAG, 'createRecentWindow Begin, mode=' + mode);
    let setWinMode = (mode && this.isSplitWindowMode(mode)) ? (win) => {
      globalThis.recentMode = mode;
      win.setWindowMode(mode).then();
    } : (win) => {
      globalThis.recentMode = featureAbility.AbilityWindowConfiguration.WINDOW_MODE_FULLSCREEN;
      win.setFullScreen(true).then(() => {
        Log.showDebug(TAG, `${this.RECENT_WINDOW_NAME} setFullScreen`);
      });
    };
    let registerWinEvent = (win) => {
      Log.showDebug(TAG, 'registerWinEvent Begin');
      win.on('lifeCycleEvent', (stageEventType) => {
        Log.showDebug(TAG,`Recent lifeCycleEvent callback stageEventType=${stageEventType}`);
        if (stageEventType == Window.WindowStageEventType.INACTIVE) {
          Log.showDebug(TAG,'Recent MainAbility onWindowStageInactive');
          Window.find(windowManager.RECENT_WINDOW_NAME).then((win) => {
            Log.showDebug(TAG,'Hide recent on inactive');
            win.hide();
          })
        }
      })
    };
    Window.find(windowManager.RECENT_WINDOW_NAME).then(win => {
      setWinMode(win);
      void win.show().then(() => {
        Log.showDebug(TAG, 'show launcher recent ability');
      });
    }).catch(error => {
      Log.showDebug(TAG, `recent window is not created, because ${error}`);
      let callback = (win) => {
        Log.showDebug(TAG, 'Post recent window created');
        registerWinEvent(win);
        setWinMode(win);
      }
      this.createWindow(globalThis.desktopContext, windowManager.RECENT_WINDOW_NAME, windowManager.RECENT_RANK,
        'pages/' + windowManager.RECENT_WINDOW_NAME, false, callback);
    });
  }

  destroyRecentWindow() {
    this.findWindow(windowManager.RECENT_WINDOW_NAME, win => {
      win.off('lifeCycleEvent', (win) => {
        win.destroy().then(() => {
          Log.showDebug(TAG, 'destroyRecentWindow');
        });
      })
    });
  }

  private static initSubscriber() {
    if (WindowManager.subscriber != null) {
      return;
    }
    const subscribeInfo: CommonEventSubscribeInfo = {
      events: [commonEventManager.RECENT_FULL_SCREEN, commonEventManager.RECENT_SPLIT_SCREEN]
    };
    CommonEvent.createSubscriber(subscribeInfo).then((commonEventSubscriber: CommonEventSubscriber) => {
      Log.showDebug(TAG, "init SPLIT_SCREEN subscriber success");
      WindowManager.subscriber = commonEventSubscriber;
    }, (err) => {
      Log.showError(TAG, `Failed to createSubscriber ${err}`)
    })
  }

  /**
   * Register window event listener.
   */
  public registerWindowEvent() {
    commonEventManager.registerCommonEvent(WindowManager.subscriber, WindowManager.eventCallback);
  }

  /**
   * Unregister window event listener.
   */
  public unregisterWindowEvent() {
    commonEventManager.unregisterCommonEvent(WindowManager.subscriber, WindowManager.eventCallback);
  }

  /**
   * Window event handler.
   */
  private static async winEventCallback(error: BusinessError, data: CommonEventData) {
    Log.showDebug(TAG,`Launcher WindowManager winEventCallback receive data: ${JSON.stringify(data)}.`);
    if (error.code != 0) {
      Log.showError(TAG, `get winEventCallback error: ${JSON.stringify(error)}`);
      return;
    }

    switch (data.event) {
      case commonEventManager.RECENT_FULL_SCREEN:
        // full screen recent window
        windowManager.createRecentWindow();
        break;
      case commonEventManager.RECENT_SPLIT_SCREEN:
        // split window mode
        const windowModeMap = {
          'Primary': featureAbility.AbilityWindowConfiguration.WINDOW_MODE_SPLIT_PRIMARY,
          'Secondary': featureAbility.AbilityWindowConfiguration.WINDOW_MODE_SPLIT_SECONDARY
        };
        if (data.parameters.windowMode != 'Primary' && data.parameters.windowMode != 'Secondary') {
          break;
        }
        windowManager.createRecentWindow(windowModeMap[data.parameters.windowMode]);
        globalThis.splitMissionId = data.parameters.missionId;
        await WindowManager.subscriber.setCode(0)
        await WindowManager.subscriber.finishCommonEvent();
        break;
      default:
        break;
    }
  }

  /**
   * Screen rotation callback.
   */
  public async onPortrait(mediaQueryResult) {
    if (mediaQueryResult.matches) {
      Log.showInfo(TAG, 'screen change to landscape');
      AppStorage.SetOrCreate('isPortrait', false);
    } else {
      Log.showInfo(TAG, 'screen change to portrait');
      AppStorage.SetOrCreate('isPortrait', true);
    }
    display.getDefaultDisplay()
      .then((dis: {
        id: number,
        width: number,
        height: number,
        refreshRate: number
      }) => {
        Log.showInfo(TAG, `change to display: ${JSON.stringify(dis)}`);
        AppStorage.SetOrCreate('screenWidth', px2vp(dis.width));
        AppStorage.SetOrCreate('screenHeight', px2vp(dis.height));
        Log.showDebug(TAG, `screenWidth and screenHeight: ${AppStorage.Get('screenWidth')},${AppStorage.Get('screenHeight')}`);
      });
  }

}

export const windowManager = WindowManager.getInstance();