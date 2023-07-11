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

import {
  Log,
  Trace,
  StyleConstants,
  CommonConstants,
  CloseAppManager } from '@ohos/common';
import GridSwiper from '../common/components/GridSwiper';
import { PageDesktopDragHandler } from '../common/PageDesktopDragHandler';
import PageDesktopViewModel from '../viewmodel/PageDesktopViewModel';
import { PageDesktopCloseAppHandler } from '../common/PageDesktopCloseAppHandler';

let mPageDesktopViewModel: PageDesktopViewModel = null;
const TAG = "PageDesktopLayout";

@Component
export struct PageDesktopLayout {
  @StorageLink('workSpaceWidth') @Watch('updateDeskTopParams') workSpaceWidth: number = 0;
  @StorageLink('workSpaceHeight') @Watch('updateDeskTopParams') workSpaceHeight: number = 0;
  @State @Watch('updateDeskTopParams') mMargin: number = 0;
  @State mTop: number = 0;
  @State @Watch('changeGridConfig') gridConfig: string = '';
  @StorageLink('menuId') menuId: number = 0;
  private mPageDesktopDragHandler: PageDesktopDragHandler = null;
  private isPad: boolean = false;
  private deviceType: string = CommonConstants.DEFAULT_DEVICE_TYPE;
  dialogController: CustomDialogController = new CustomDialogController({
    builder: settingDialog({ cancel: this.onCancel, confirm: this.confirm, onAccept: this.onAccept }),
    cancel: this.onCancel,
    autoCancel: true,
    alignment: DialogAlignment.Bottom,
    customStyle: true
  })

  onCancel() {
  }

  onAccept() {
    mPageDesktopViewModel.addOrDeleteBlankPage();
  }

  confirm() {
    Trace.start(Trace.CORE_METHOD_START_SETTINGS);
    mPageDesktopViewModel.intoSetting();
  }

  aboutToAppear(): void  {
    this.deviceType = AppStorage.Get('deviceType');
    this.mPageDesktopDragHandler = PageDesktopDragHandler.getInstance();
    mPageDesktopViewModel = PageDesktopViewModel.getInstance();
    this.gridConfig = mPageDesktopViewModel.getGridConfig().layout;
    this.updateStyle();
    if (this.deviceType != CommonConstants.PAD_DEVICE_TYPE) {
      mPageDesktopViewModel.registerAppListChangeCallback();
    }
    CloseAppManager.getInstance().registerCloseAppHandler(new PageDesktopCloseAppHandler());
  }

  aboutToDisappear(): void {
    delete this.dialogController;
    this.dialogController = null;
  }

  private updateStyle() {
    mPageDesktopViewModel.setDevice(this.deviceType);
    this.isPad = mPageDesktopViewModel.getDevice();
    Log.showDebug(TAG, `updateStyle isPad: ${this.isPad}`);
  }

  private updateDeskTopParams() {
    this.mMargin = PageDesktopViewModel.getInstance().getPageDesktopStyleConfig().mMargin;
    this.mTop = PageDesktopViewModel.getInstance().getPageDesktopStyleConfig().mDesktopMarginTop;
    Log.showDebug(TAG, `updateDeskTopParams mMargin: ${this.mMargin}, this.mTop: ${this.mTop}`);
    if (this.mPageDesktopDragHandler != null) {
      this.mPageDesktopDragHandler.setDragEffectArea({
        left: this.mMargin,
        top: this.mTop,
        right: this.workSpaceWidth - this.mMargin,
        bottom: PageDesktopViewModel.getInstance().getPageDesktopStyleConfig().mGridHeight + this.mTop
      });
    }
  }

  private changeGridConfig(): void {
    Log.showDebug(TAG, `changeGridConfig GridConfig: ${this.gridConfig}`);
    this.updateDeskTopParams();
  }

  private buildLog(): boolean {
    Log.showDebug(TAG, 'build start');
    return true;
  }

  build() {
    GridSwiper({
      gridConfig: this.gridConfig,
      mPageDesktopViewModel: mPageDesktopViewModel,
      dialogController: this.deviceType == CommonConstants.PAD_DEVICE_TYPE ? null : this.dialogController
    })
      .width(StyleConstants.PERCENTAGE_100)
      .height(StyleConstants.PERCENTAGE_100)
  }
}

@CustomDialog
struct settingDialog {
  @StorageLink('NavigationBarStatusValue') navigationBarStatusValue: boolean = false;
  controller: CustomDialogController
  cancel: () => void
  confirm: () => void
  onAccept: () => void

  aboutToDisappear(): void {
    this.controller = null;
    this.cancel = null;
    this.confirm = null;
    this.onAccept = null;
  }

  build() {
    Stack() {
      Column() {

      }
      .blur(40)
      .width('100%')
      .height(120)
      .border({
        radius: StyleConstants.DEFAULT_24
      })

      Column() {
        Row() {
          Text($r('app.string.into_settings'))
            .fontSize(StyleConstants.DEFAULT_BADGE_FONT_SIZE)
            .fontColor(StyleConstants.TEXT_COLOR_PRIMARY)
        }.margin({ top: StyleConstants.DEFAULT_24, bottom: StyleConstants.DEFAULT_16 })

        Flex({ alignItems: ItemAlign.Center, justifyContent: FlexAlign.SpaceEvenly }) {
          Button() {
            Text($r('app.string.cancel'))
              .fontSize(StyleConstants.DEFAULT_BADGE_FONT_SIZE)
              .fontColor(StyleConstants.BUTTON_FONT_COLOR)
          }
          .backgroundColor(StyleConstants.DEFAULT_BG_COLOR)
          .height(StyleConstants.DEFAULT_BUTTON_HEIGHT)
          .width(StyleConstants.DEFAULT_BUTTON_WIDTH)
          .onClick(() => {
            this.cancel()
            this.controller.close();
          })

          Divider()
            .width(5)
            .vertical(true)
            .color(StyleConstants.DEFAULT_DIVIDER_COLOR)
            .height(StyleConstants.DEFAULT_DIVIDER_HEIGHT)

          Button() {
            Text(mPageDesktopViewModel.isBlankPage() ? $r('app.string.delete_blank_page') : $r('app.string.add_blank_page'))
              .fontSize(StyleConstants.DEFAULT_BADGE_FONT_SIZE)
              .fontColor(StyleConstants.BUTTON_FONT_COLOR)
          }
          .backgroundColor(StyleConstants.DEFAULT_BG_COLOR)
          .height(StyleConstants.DEFAULT_BUTTON_HEIGHT)
          .width(StyleConstants.DEFAULT_BUTTON_WIDTH)
          .onClick(() => {
            this.controller.close();
            this.onAccept()
          })

          Divider()
            .width(5)
            .vertical(true)
            .color(StyleConstants.DEFAULT_DIVIDER_COLOR)
            .height(StyleConstants.DEFAULT_DIVIDER_HEIGHT)

          Button() {
            Text($r('app.string.launcher_edit'))
              .fontSize(StyleConstants.DEFAULT_BADGE_FONT_SIZE)
              .fontColor(StyleConstants.BUTTON_FONT_COLOR)
          }
          .backgroundColor(StyleConstants.DEFAULT_BG_COLOR)
          .height(StyleConstants.DEFAULT_BUTTON_HEIGHT)
          .width(StyleConstants.DEFAULT_BUTTON_WIDTH)
          .onClick(() => {
            this.confirm()
            this.controller.close();

          })
        }
      }
      .backgroundColor(Color.White)
      .opacity(0.85)
      .width('100%')
      .padding({
        bottom: StyleConstants.DEFAULT_24
      })
      .border({
        radius: StyleConstants.DEFAULT_24
      })
    }
    .margin({ right: StyleConstants.DEFAULT_12, left: StyleConstants.DEFAULT_12,
      bottom: this.navigationBarStatusValue ? StyleConstants.DEFAULT_12 : StyleConstants.DEFAULT_40 })
  }
}