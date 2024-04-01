/**
 * Copyright (c) 2024 Huawei Device Co., Ltd.
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

import window from '@ohos.window';
import display from '@ohos.display';
import { Log } from '../utils/Log';

const TAG = 'DisplayManager: ';

export class DisplayManager {
  private readonly MAIN_WINDOW_PREFIX = 'customMainWindow_'
  private readonly DEFAULT_MAIN_WINDOW_PAGE = 'pages/SubDisplayWallpaperPage'

  public defaultDisplay: display.Display = undefined
  private displayDevices: Array<display.Display> = []

  private constructor() {
    Log.showInfo(TAG, 'constructor called.')
    this.loadDefaultDisplay()
    this.loadAllDisplays()

    this.initDisplayChangeListener()
  }

  public static getInstance(): DisplayManager {
    return globalThis.DisplayManager ??= new DisplayManager()
  }

  private loadDefaultDisplay() {
    try {
      this.defaultDisplay = display.getDefaultDisplaySync()
      Log.showInfo(TAG, 'loadDefaultDisplay. defaultDisplay id: ' + this.defaultDisplay?.id)
    } catch (err) {
      Log.showError(TAG, 'loadDefaultDisplay occur error. errInfo: ' + JSON.stringify(err))
    }
  }

  private async loadAllDisplays() {
    let displays: Array<display.Display> = await display.getAllDisplays()
    for (let display of displays) {
      if (this.displayDevices.findIndex(item => item.id === display.id) < 0) {
        Log.showInfo(TAG, 'new display added. detail: ' + JSON.stringify(display))
        this.displayDevices.push(display)
        this.createMainWindow(display)
      }
    }
  }

  private initDisplayChangeListener() {
    display.on('add', displayId => {
      Log.showInfo(TAG, 'add new display. id: ' + JSON.stringify(displayId))
      this.loadAllDisplays()
    })

    display.on('remove', displayId => {
      Log.showInfo(TAG, 'remove display. id: ' + JSON.stringify(displayId))
      let delIndex: number = this.displayDevices.findIndex(item => item.id === displayId)
      if (delIndex > 0) {
        this.destroyMainWindow(displayId)
        this.displayDevices.splice(delIndex, 1)
      }
    })
  }

  /**
   * 在指定屏幕上创建主window(新屏幕插入时，默认桌面窗口，不支持隐藏;屏幕拔出时，隐藏销毁本窗口)
   * @param display
   */
  private createMainWindow(display: display.Display) {
    if (display.id === this.defaultDisplay?.id) {
      //主屏不需要创建主窗口
      return
    }
    window.createWindow({
      ctx: globalThis.desktopContext,
      name: this.MAIN_WINDOW_PREFIX + display.id,
      windowType: window.WindowType.TYPE_DESKTOP,
      displayId: display.id
    }).then((resultWindow: window.Window) => {
      resultWindow.resize(display.width, display.height)
      resultWindow.setWindowMode(window.WindowMode.FULLSCREEN)
      resultWindow.setUIContent(this.DEFAULT_MAIN_WINDOW_PAGE)
      Log.showInfo(TAG, `create main window ${display.id} success.`)

      resultWindow.showWithAnimation()
    }).catch(err => {
      Log.showError(TAG, 'create main window failed. reason: ' + JSON.stringify(err))
    })
  }

  private findWindow(displayId: number): window.Window {
    let resultWindow = undefined
    try {
      resultWindow = window.findWindow(this.MAIN_WINDOW_PREFIX + displayId)
    } catch (err) {
      Log.showError(TAG, 'findWindow occur err. errInfo: ' + JSON.stringify(err))
    }
    return resultWindow
  }


  private destroyMainWindow(displayId: number) {
    if (displayId === this.defaultDisplay?.id) {
      return
    }
    let resultWindow = this.findWindow(displayId)
    if (resultWindow?.isWindowShowing()) {
      resultWindow.hideWithAnimation()
    }
    resultWindow?.destroyWindow()
    Log.showInfo(TAG, `destroy main window ${displayId} success.`)
  }

  public destroySubDisplayWindow() {
    for (let display of this.displayDevices) {
      this.destroyMainWindow(display.id)
    }
    display.off('add')
    display.off('remove')
  }
}