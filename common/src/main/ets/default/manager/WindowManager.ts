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

import window from '@ohos.window';
import display from '@ohos.display';
import commonEventMgr from '@ohos.commonEventManager';
import common from '@ohos.app.ability.common';
import { AsyncCallback, BusinessError } from '@ohos.base';
import AbilityConstant from '@ohos.app.ability.AbilityConstant';
import commonEventManager from './CommonEventManager'
import { Log } from '../utils/Log';
import { StyleConstants } from '../constants/StyleConstants';

const TAG = 'WindowManager';

/**
 * Wrapper class for window interfaces.
 */
class WindowManager {
  private mDisplayData: display.Display | null = null;

  private static subscriber: commonEventMgr.CommonEventSubscriber;

  private static eventCallback: AsyncCallback<commonEventMgr.CommonEventData>;

  RECENT_WINDOW_NAME = 'RecentView';

  DESKTOP_WINDOW_NAME = 'EntryView';

  APP_CENTER_WINDOW_NAME = 'AppCenterView';

  FORM_MANAGER_WINDOW_NAME = 'FormManagerView';

  FORM_SERVICE_WINDOW_NAME = 'FormServiceView';

  DESKTOP_RANK = window.WindowType.TYPE_DESKTOP;

  RECENT_RANK = window.WindowType.TYPE_LAUNCHER_RECENT;

  DOCK_RANK = window.WindowType.TYPE_LAUNCHER_DOCK;

  recentMode?: number;

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
  getWindowWidth(): number {
    if (this.mDisplayData == null) {
      this.mDisplayData = this.getWindowDisplayData();
    }
    return this.mDisplayData?.width as number;
  }

  /**
   * get window height
   *
   * @return windowHeight
   */
  getWindowHeight(): number {
    if (this.mDisplayData == null) {
      this.mDisplayData = this.getWindowDisplayData();
    }
    return this.mDisplayData?.height as number;
  }

  private getWindowDisplayData(): display.Display | null {
    let displayData: display.Display | null = null;
    try {
      displayData = display.getDefaultDisplaySync();
    } catch(err) {
      Log.showError(TAG, `display.getDefaultDisplaySync error: ${JSON.stringify(err)}`);
    }
    return displayData;
  }

  isSplitWindowMode(mode): boolean {
    if ((mode === AbilityConstant.WindowMode.WINDOW_MODE_SPLIT_PRIMARY) ||
    (mode === AbilityConstant.WindowMode.WINDOW_MODE_SPLIT_SECONDARY)) {
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
    const abilityWindow = await window.getLastWindow(globalThis.desktopContext as common.BaseContext);
    void abilityWindow.resize(width, height);
  }

  /**
   * set window position
   *
   * @param x coordinate x
   * @param y coordinate y
   */
  async setWindowPosition(x: number, y: number): Promise<void> {
    const abilityWindow = await window.getLastWindow(globalThis.desktopContext as common.BaseContext);
    void abilityWindow.moveWindowTo(x, y);
  }

  /**
   * 隐藏状态栏
   *
   * @param name windowName
   */
  hideWindowStatusBar(name: string) {
    let names: Array<'status'|'navigation'> = ['navigation'];
    this.setWindowSystemBar(name, names);
  }

  /**
   * 显示状态栏
   *
   * @param name
   */
  showWindowStatusBar(name: string) {
    let names: Array<'status'|'navigation'> = ['navigation', 'status'];
    this.setWindowSystemBar(name, names);
  }

  /**
   * 设置状态栏与导航栏显隐
   *
   * @param windowName
   * @param names 值为 'status'|'navigation' 枚举
   */
  private setWindowSystemBar(windowName: string, names: Array<'status'|'navigation'>) {
    this.findWindow(windowName, win => {
      win.setWindowSystemBarEnable(names).then(() => {
        Log.showInfo(TAG, `set statusBar success`);
      }).catch(err => {
        Log.showInfo(TAG, `set statusBar failed, Cause: ${JSON.stringify(err)}`);
      })
    })
  }

  createWindow(context: common.ServiceExtensionContext, name: string, windowType: number, loadContent: string,
               isShow: boolean, callback?: Function) {
    let cfg: window.Configuration = {
      name: name,
      windowType: windowType,
      ctx: context
    };
    try {
      window.createWindow(cfg)
        .then((win: window.Window) => {
          win.setPreferredOrientation(window.Orientation.AUTO_ROTATION_RESTRICTED);
          win.setUIContent(loadContent)
            .then(() => {
              win.setWindowSystemBarProperties({
                navigationBarColor: StyleConstants.DEFAULT_SYSTEM_UI_COLOR,
                statusBarColor: StyleConstants.DEFAULT_SYSTEM_UI_COLOR
              }).then(() => {
                win.setWindowBackgroundColor(StyleConstants.DEFAULT_SYSTEM_UI_COLOR);
                Log.showDebug(TAG, `then begin ${name} window loadContent in then!`);
                if (name !== this.RECENT_WINDOW_NAME) {
                  win.setWindowLayoutFullScreen(true).then(() => {
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
              });
            }, (err: BusinessError) => {
              Log.showError(TAG, `createWindow, setUIContent error: ${JSON.stringify(err)}`);
            });
        })
        .catch((err: BusinessError) => {
          Log.showError(TAG, `createWindow, createWindow error: ${JSON.stringify(err)}`);
        })
    } catch (err) {
      let _err = err as BusinessError;
      Log.showError(TAG, `createWindow, error: ${JSON.stringify(_err)}`);
    }
  }

  createWindowIfAbsent(context: common.ServiceExtensionContext, name: string, windowType: number, loadContent: string): void {
    Log.showDebug(TAG, `create, name ${name}`);
    try {
      let win: window.Window = window.findWindow(name);
      win.showWindow().then(() => {
        Log.showDebug(TAG, `show launcher ${name}`);
      });
    } catch (err) {
      let _err = err as BusinessError;
      Log.showError(TAG, `${name} ability is not created, because ${_err.message}`);
      this.createWindow(context, name, windowType, loadContent, true);
    }
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
    try {
      let dis: display.Display = display.getDefaultDisplaySync();
      window.minimizeAll(dis.id).then(() => {
        Log.showDebug(TAG, 'Launcher minimizeAll');
      });
    } catch (err) {
      let errCode = (err as BusinessError).code;
      let errMsg = (err as BusinessError).message;
      Log.showError(TAG, `minimizeAllApps errCode: ${errCode}, errMsg: ${errMsg}`);
    }
    this.destroyWindow(this.FORM_MANAGER_WINDOW_NAME);
    this.destroyWindow(this.FORM_SERVICE_WINDOW_NAME);
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
    try {
      let win: window.Window = window.findWindow(name);
      Log.showDebug(TAG, `findWindow, find then name: ${name}`);
      if (callback) {
        callback(win);
      }
    } catch (err) {
      let _err = err as BusinessError;
      Log.showError(TAG, `findWindow errCode: ${_err.code}, errMsg: ${_err.message}`);
    }
  }

  createRecentWindow(mode?: number) {
    Log.showDebug(TAG, 'createRecentWindow Begin, mode=' + mode);
    let setWinMode = (mode && this.isSplitWindowMode(mode)) ? (win) => {
      windowManager.recentMode = mode;
      win.setWindowMode(mode).then();
    } : (win) => {
      windowManager.minimizeAllApps();
      windowManager.recentMode = AbilityConstant.WindowMode.WINDOW_MODE_FULLSCREEN;
      win.setFullScreen(true).then(() => {
        Log.showDebug(TAG, `${this.RECENT_WINDOW_NAME} setFullScreen`);
      });
    };
    let registerWinEvent = (win: window.Window) => {
      Log.showDebug(TAG, 'registerWinEvent Begin');
      win.on('windowEvent', (stageEventType) => {
        Log.showDebug(TAG,`Recent lifeCycleEvent callback stageEventType=${stageEventType}`);
        if (stageEventType === window.WindowEventType.WINDOW_INACTIVE) {

          Log.showDebug(TAG,'Recent MainAbility onWindowStageInactive');
          try {
            let wins: window.Window = window.findWindow(windowManager.RECENT_WINDOW_NAME);
            Log.showDebug(TAG,'Hide recent on inactive');
            wins.hide();
          } catch (err) {
            let _err = err as BusinessError;
            Log.showError(TAG, `Recent lifeCycleEvent findWindow errCode: ${_err.code}, errMsg: ${_err.message}`);
          }
        }
      })
    };
    try {
      let win: window.Window = window.findWindow(windowManager.RECENT_WINDOW_NAME);
      setWinMode(win);
      win.showWindow()
        .then(() => {
          Log.showDebug(TAG, 'show launcher recent ability');
        });
    } catch (err) {
      Log.showDebug(TAG, `recent window is not created, because ${JSON.stringify(err)}`);
      let callback = (win) => {
        Log.showDebug(TAG, 'Post recent window created');
        registerWinEvent(win);
        setWinMode(win);
      }
      this.createWindow(globalThis.desktopContext, windowManager.RECENT_WINDOW_NAME, windowManager.RECENT_RANK,
        'pages/' + windowManager.RECENT_WINDOW_NAME, false, callback);
    }
  }

  destroyRecentWindow() {
    this.findWindow(windowManager.RECENT_WINDOW_NAME, win => {
      win.off('windowEvent', (win) => {
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
    const subscribeInfo: commonEventMgr.CommonEventSubscribeInfo = {
      events: [commonEventManager.RECENT_FULL_SCREEN, commonEventManager.RECENT_SPLIT_SCREEN]
    };
    commonEventMgr.createSubscriber(subscribeInfo).then((commonEventSubscriber: commonEventMgr.CommonEventSubscriber) => {
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
  private static async winEventCallback(error: BusinessError, data: commonEventMgr.CommonEventData) {
    Log.showDebug(TAG,`Launcher WindowManager winEventCallback receive data: ${JSON.stringify(data)}.`);
    if (data.code !== 0) {
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
          'Primary': AbilityConstant.WindowMode.WINDOW_MODE_SPLIT_PRIMARY,
          'Secondary': AbilityConstant.WindowMode.WINDOW_MODE_SPLIT_SECONDARY
        };
        if (data.parameters.windowMode !== 'Primary' && data.parameters.windowMode !== 'Secondary') {
          break;
        }
        windowManager.createRecentWindow(windowModeMap[data.parameters.windowMode]);
        globalThis.splitMissionId = data.parameters.missionId;
        await WindowManager.subscriber.setCode(0);
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
      AppStorage.setOrCreate('isPortrait', false);
    } else {
      Log.showInfo(TAG, 'screen change to portrait');
      AppStorage.setOrCreate('isPortrait', true);
    }
    try {
      let dis: display.Display = display.getDefaultDisplaySync();
      Log.showInfo(TAG, `change to display: ${JSON.stringify(dis)}`);
      AppStorage.setOrCreate('screenWidth', px2vp(dis.width));
      AppStorage.setOrCreate('screenHeight', px2vp(dis.height));
      Log.showDebug(TAG, `screenWidth and screenHeight: ${AppStorage.get('screenWidth')},${AppStorage.get('screenHeight')}`);
    } catch (err) {
      Log.showError(TAG, `onPortrait error: ${JSON.stringify(err)}`);
    }
  }

  createWindowWithName = ((windowName: string, windowRank: number): void => {
    Log.showInfo(TAG, `createWindowWithName begin windowName: ${windowName}`);
    if (windowName === windowManager.RECENT_WINDOW_NAME) {
      windowManager.createRecentWindow();
    } else {
      windowManager.createWindowIfAbsent(globalThis.desktopContext, windowName, windowRank, 'pages/' + windowName);
    }
  })

}

export const windowManager = WindowManager.getInstance();