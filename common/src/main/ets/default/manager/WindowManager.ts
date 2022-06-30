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

import CommonEvent from '@ohos.commonevent';
import display from '@ohos.display';
import Window from '@ohos.window';
import featureAbility from '@ohos.ability.featureAbility';
import Log from '../utils/Log';
import StyleConstants from '../constants/StyleConstants';
import ServiceExtensionContext from 'application/ServiceExtensionContext';

const TAG = 'WindowManager';

/**
 * Wrapper class for window interfaces.
 */
class WindowManager {
  private mDisplayData = null;

  private subscriber = null;

  RECENT_WINDOW_NAME = 'RecentView';

  DESKTOP_WINDOW_NAME = 'EntryView';

  APP_CENTER_WINDOW_NAME = 'AppCenterView';

  FORM_MANAGER_WINDOW_NAME = 'FormManagerView';

  DESKTOP_RANK = 2001;

  FORM_MANAGER_RANK = 2100;

  RECENT_RANK = 2115;

  DOCK_RANK = 2116;

  /**
   * 获取窗口管理类对象
   *
   * @return 窗口管理类对象单一实例
   */
  static getInstance(): WindowManager {
    if (globalThis.WindowManager == null) {
      globalThis.WindowManager = new WindowManager();
    }
    return globalThis.WindowManager;
  }

  /**
   * 获取窗口宽度
   *
   * @return 窗口宽度
   */
  async getWindowWidth() {
    if (this.mDisplayData == null) {
      this.mDisplayData = await this.getWindowDisplayData();
    }
    return px2vp(this.mDisplayData.width);
  }

  /**
   * 获取窗口高度
   *
   * @return 窗口高度
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
   * 设置窗口大小
   *
   * @param width 窗口宽度
   * @param width 窗口高度
   */
  async setWindowSize(width: number, height: number): Promise<void> {
    const abilityWindow = await Window.getTopWindow();
    void abilityWindow.resetSize(width, height);
  }

  /**
   * 设置窗口位置
   *
   * @param x 窗口横坐标
   * @param y 窗口纵坐标
   */
  async setWindowPosition(x: number, y: number): Promise<void> {
    const abilityWindow = await Window.getTopWindow();
    void abilityWindow.moveTo(x, y);
  }

  createWindow(context: ServiceExtensionContext, name: string, windowType: number, loadContent: string, isShow: boolean = true, callback?: Function) {
    display.getDefaultDisplay().then((dis: { id: number, width: number, height: number, refreshRate: number }) => {
      Log.showInfo(TAG, `createWindow, name: ${name} windowType: ${windowType}  loadContent: ${loadContent}`);
      Window.create(context, name, windowType).then((win) => {
        Log.showInfo(TAG, `createWindow, resetSize then name: ${name}`);
        void win.resetSize(dis.width, dis.height).then(() => {
          Log.showInfo(TAG, `${name} window reset size finish`);
          void win.loadContent(loadContent).then(() => {
            Log.showInfo(TAG, `then begin ${name} window loadContent in then!`);
            void win.setSystemBarProperties({
              navigationBarColor: StyleConstants.DEFAULT_SYSTEM_UI_COLOR,
              statusBarColor: StyleConstants.DEFAULT_SYSTEM_UI_COLOR
            }).then(() => {
              if (name !== this.RECENT_WINDOW_NAME) {
                void win.setLayoutFullScreen(true).then(() => {
                  Log.showInfo(TAG, `${name} setLayoutFullScreen`);
                });
              }
              if (callback) {
                callback(win);
              }
              isShow && this.showWindow(name);
            });
          });
        });
      }, (error) => {
        Log.showError(TAG, `createWindow, create error: ${JSON.stringify(error)}`);
      });
    });
  }

  createWindowIfAbsent(context: ServiceExtensionContext, name: string, windowType: number, loadContent: string): void {
    Log.showInfo(TAG, `create, name ${name}`);
    Window.find(name).then(win => {
      void win.show().then(() => {
        Log.showDebug(TAG, `show launcher ${name}`);
      });
    }).catch(error => {
      Log.showError(TAG, `${name} ability is not created, because ${error}`);
      this.createWindow(context, name, windowType, loadContent);
    });
  }

  resetSizeWindow(name: string, rect: {
    width: number,
    height: number
  }, callback?: Function): void {
    Log.showInfo(TAG, `resetSizeWindow, name ${name} rect: ${JSON.stringify(rect)}`);
    this.findWindow(name, (win) => {
      Log.showInfo(TAG, `resetSizeWindow, findWindow callback name: ${name}`);
      win.resetSize(rect.width, rect.height).then(() => {
        Log.showInfo(TAG, `resetSizeWindow, resetSize then name: ${name}`);
        if (callback) {
          callback(win);
        }
      });
    });
  }

  showWindow(name: string, callback?: Function): void {
    Log.showInfo(TAG, `showWindow, name ${name}`);
    this.findWindow(name, (win) => {
      Log.showInfo(TAG, `showWindow, findWindow callback name: ${name}`);
      win.show().then(() => {
        Log.showInfo(TAG, `showWindow, show then name: ${name}`);
        if (callback) {
          callback(win);
        }
      });
    });
  }

  hideWindow(name: string, callback?: Function): void {
    Log.showInfo(TAG, `hideWindow, name ${name}`);
    this.findWindow(name, (win) => {
      Log.showInfo(TAG, `hideWindow, findWindow callback name: ${name}`);
      win.hide().then(() => {
        Log.showInfo(TAG, `hideWindow, hide then name: ${name}`);
        if (callback) {
          callback(win);
        }
      });
    });
  }

  minimizeAllApps(): void {
    display.getDefaultDisplay().then(dis => {
      Window.minimizeAll(dis.id).then(() => {
        Log.showInfo(TAG, 'Launcher minimizeAll');
      });
    });
    this.destroyWindow(this.FORM_MANAGER_WINDOW_NAME);
  }

  destroyWindow(name: string, callback?: Function): void {
    Log.showInfo(TAG, `destroyWindow, name ${name}`);
    this.findWindow(name, (win) => {
      Log.showInfo(TAG, `hideWindow, findWindow callback name: ${name}`);
      win.destroy().then(() => {
        Log.showInfo(TAG, `destroyWindow, destroy then name: ${name}`);
        if (callback) {
          callback(win);
        }
      });
    });
  }

  findWindow(name: string, callback?: Function): void {
    Log.showInfo(TAG, `findWindow, name ${name}`);
    void Window.find(name)
      .then((win) => {
        Log.showInfo(TAG, `findWindow, find then name: ${name}`);
        if (callback) {
          callback(win);
        }
      });
  }

  createRecentWindow(mode?: number) {
    Log.showInfo(TAG, 'createRecentWindow Begin, mode=' + mode);
    let setWinMode = (mode && this.isSplitWindowMode(mode)) ? (win) => {
      globalThis.recentMode = mode;
      win.setWindowMode(mode).then();
    } : (win) => {
      globalThis.recentMode = featureAbility.AbilityWindowConfiguration.WINDOW_MODE_FULLSCREEN;
      win.setFullScreen(true).then(() => {
        Log.showInfo(TAG, `${this.RECENT_WINDOW_NAME} setFullScreen`);
      });
    };
    let registerWinEvent = (win) => {
      Log.showInfo(TAG, 'registerWinEvent Begin');
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
        Log.showInfo(TAG, 'show launcher recent ability');
      });
    }).catch(error => {
      Log.showInfo(TAG, `recent window is not created, because ${error}`);
      let callback = (win) => {
        Log.showInfo(TAG, 'Post recent window created');
        registerWinEvent(win);
        setWinMode(win);
      }
      this.createWindow(globalThis.desktopContext, windowManager.RECENT_WINDOW_NAME, windowManager.RECENT_RANK,
        "pages/" + windowManager.RECENT_WINDOW_NAME, false, callback);
    });
  }

  destroyRecentWindow() {
    this.findWindow(windowManager.RECENT_WINDOW_NAME, win => {
      win.off('lifeCycleEvent', (win) => {
        win.destroy().then(() => {
          Log.showInfo(TAG, `destroyRecentWindow`);
        });
      })
    });
  }

  /**
   * Register window event listener.
   */
  public registerWindowEvent() {
    if (this.subscriber != null) {
      return
    }
    var subscribeInfo = {
      events: ["common.event.SPLIT_SCREEN"]
    };
    CommonEvent.createSubscriber(subscribeInfo).then((data) => {
      Log.showDebug(TAG, "Launcher createSubscriber callback");
      this.subscriber = data;
      CommonEvent.subscribe(this.subscriber, this.winEventCallback.bind(this));
    }, (err) => {
      Log.showError(TAG, `Failed to createSubscriber ${err}`)
    })
  }

  /**
   * Unregister window event listener.
   */
  public unregisterWindowEvent() {
    if (this.subscriber == null) {
      return
    }
    CommonEvent.unsubscribe(this.subscriber, null);
  }

  /**
   * Window event handler.
   */
  private async winEventCallback(err, data) {
    Log.showDebug(TAG,`Launcher AppModel subscribeCallBack receive event. data: ${JSON.stringify(data)}`);
    var windowModeMap = {
      'Primary': featureAbility.AbilityWindowConfiguration.WINDOW_MODE_SPLIT_PRIMARY,
      'Secondary': featureAbility.AbilityWindowConfiguration.WINDOW_MODE_SPLIT_SECONDARY
    }
    windowManager.createRecentWindow(windowModeMap[data.parameters.windowMode]);
    globalThis.splitMissionId = data.parameters.missionId

    await this.subscriber.setCode(0, null)
    await this.subscriber.finishCommonEvent(null);
  }
}

const windowManager = WindowManager.getInstance();
export default windowManager;
