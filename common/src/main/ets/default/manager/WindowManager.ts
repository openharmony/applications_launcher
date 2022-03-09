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

import display from '@ohos.display';
import Window from '@ohos.window';
import Log from '../utils/Log';
import StyleConstants from '../constants/StyleConstants';
import ServiceExtensionContext from "application/ServiceExtensionContext";

const TAG = 'WindowManager';

/**
 * 窗口管理类
 */
class WindowManager {
  private static sInstance: WindowManager | undefined = undefined;

  private mDisplayData = null;

  RECENT_WINDOW_NAME = 'recentsWindow';

  DESKTOP_WINDOW_NAME = 'LauncherWindow';

  /**
   * 获取窗口管理类对象
   *
   * @return 窗口管理类对象单一实例
   */
  static getInstance(): WindowManager {
    if (WindowManager.sInstance == undefined) {
      WindowManager.sInstance = new WindowManager();
    }
    return WindowManager.sInstance;
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

  createWindow(context: ServiceExtensionContext, name: string, windowType: number, loadContent: string, callback?: Function) {
    display.getDefaultDisplay().then((dis: { id: number, width: number, height: number, refreshRate: number }) => {
      Log.showInfo(TAG, `createWindow, name: ${name} windowType: ${windowType}  loadContent: ${loadContent}`);
      Window.create(context, name, windowType).then((win) => {
        Log.showInfo(TAG, `createWindow, resetSize then name: ${name}`);
        void win.resetSize(dis.width, dis.height).then(() => {
          Log.showInfo(TAG, `${name} window reset size finish`);
          void win.loadContent(loadContent).then(() => {
            Log.showInfo(TAG, `then begin ${name} window loadContent in then!`);
            void win.show().then(() => {
              void win.setLayoutFullScreen(true).then(() => {
                void win.setSystemBarProperties({
                  navigationBarColor: StyleConstants.DEFAULT_SYSTEM_UI_COLOR,
                  statusBarColor: StyleConstants.DEFAULT_SYSTEM_UI_COLOR
                }).then(() => {
                  Log.showInfo(TAG, name + `${name} setSystemBarProperties`);
                });
              });
              if (callback) {
                callback(win);
              }
              Log.showInfo(TAG, `${name} window createSuccess!`);
            });
          });
        });
      }, (error) => {
        Log.showInfo(TAG, `createWindow, create error: ${JSON.stringify(error)} `);
      });
    });
  }

  createWindowIfAbsent(context: ServiceExtensionContext, name: string, windowType: number, loadContent: string): void {
    Log.showInfo(TAG, `create, name ${name}`);
    Window.find(name).then(win => {
      void win.show().then(() => {
        Log.showInfo(TAG, 'show launcher recent ability');
      });
    }).catch(error => {
      Log.showInfo(TAG, `${name} ability is not created, because ${error}`);
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
}

const windowManager = WindowManager.getInstance();
export default windowManager;
