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

import StyleConstants from '../../../../../../../common/src/main/ets/default/constants/StyleConstants';
import CommonConstants from '../../../../../../../common/src/main/ets/default/constants/CommonConstants';
import PageDesktopViewModel from '../common/viewmodel/PageDesktopViewModel';
import PageDesktopDragHandler from '../common/PageDesktopDragHandler';
import GridSwiper from '../common/components/GridSwiper.ets';
import FeatureConstants from '../common/constants/FeatureConstants';
import Trace from '../../../../../../../common/src/main/ets/default/utils/Trace';

let mPageDesktopViewModel: PageDesktopViewModel = null;

@Component
export default struct PageDesktopLayout {
  @StorageLink('appListInfo') AppListInfo: {
    appGridInfo: [[]]
  } = { appGridInfo: [[]] };
  @StorageLink('dragLocation') @Watch('onTouchEventUpdate') dragLocation: string = '';
  @StorageLink('workSpaceWidth') @Watch('updateDeskTopParams') workSpaceWidth: number = 0;
  @StorageLink('workSpaceHeight') @Watch('updateDeskTopParams') workSpaceHeight: number = 0;
  @StorageLink('dialogControllerStatus') @Watch('updateDialogControllerStatus') dialogControllerStatus: boolean = false;
  @State device: string = 'phone';
  @State @Watch('updateDeskTopParams') mMargin: number = 0;
  @State mTop: number = 0;
  @State @Watch('changeGridConfig') gridConfig: string = '';
  private mPageDesktopDragHandler : PageDesktopDragHandler = null;
  private isPad: boolean = false;
  dialogController: CustomDialogController = new CustomDialogController({
    builder: ShowDialog(),
    cancel: this.cancelDialog,
    autoCancel: true,
    customStyle : true
  });

  updateDialogControllerStatus() {
    this.dialogController.close();
  }

  cancelDialog() {
    console.info('Launcher Grid Cancel Dialog');
  }

  private aboutToAppear(): void  {
    this.mPageDesktopDragHandler = PageDesktopDragHandler.getInstance();
    mPageDesktopViewModel = PageDesktopViewModel.getInstance();
    this.gridConfig = mPageDesktopViewModel.getGridConfig().layout;
    this.updateStyle();
    mPageDesktopViewModel.getGridList();
    if (this.device != CommonConstants.PAD_DEVICE_TYPE) {
      mPageDesktopViewModel.registerAppListChangeCallback();
    }
  }

  private updateStyle() {
    mPageDesktopViewModel.setDevice(this.device);
    this.isPad = mPageDesktopViewModel.getDevice();
    console.log("Launcher PageDesktopLayout updateStyle isPad:" + this.isPad);
  }

  private updateDeskTopParams() {
    this.mMargin = mPageDesktopViewModel.getPageDesktopStyleConfig().mMargin;
    this.mTop = mPageDesktopViewModel.getPageDesktopStyleConfig().mDesktopMarginTop;
    console.log("Launcher PageDesktopLayout updateDeskTopParams mMargin:" + this.mMargin + ", this.mTop: " + this.mTop);
    if (this.mPageDesktopDragHandler != null) {
      this.mPageDesktopDragHandler.setDragEffectArea({
        left: this.mMargin,
        top: this.mTop,
        right: this.workSpaceWidth - this.mMargin,
        bottom: this.workSpaceHeight
      });
    }
  }

  private onTouchEventUpdate() {
    if (AppStorage.Get('dragFocus') == FeatureConstants.FEATURE_NAME) {
      this.mPageDesktopDragHandler.onTouchEventUpdate(AppStorage.Get('dragEvent'));
    }
  }

  public changeGridConfig() {
    console.log("Launcher PageDesktopLayout changeGridConfig GridConfig:"+this.gridConfig)
    this.updateDeskTopParams();
    mPageDesktopViewModel.getGridList();
  }

  build() {
    Flex({ direction: FlexDirection.Column, alignItems: ItemAlign.Center, justifyContent: FlexAlign.Center }) {
      Column() {
        GridSwiper({
          mAppGridInfo: this.AppListInfo.appGridInfo,
          gridConfig: this.gridConfig,
          mPageDesktopViewModel: mPageDesktopViewModel
        })
      }
      .width(StyleConstants.PERCENTAGE_100)
      .height(StyleConstants.PERCENTAGE_100)
    }
    .gesture(
    LongPressGesture({ repeat: false })
      .onAction((event: GestureEvent) => {
        mPageDesktopViewModel.onPageLongPress();
        this.dialogController.open();
      })
    )
    .onMouse((event: MouseEvent) => {
      if (event.button == MouseButton.Right) {
        event.stopPropagation();
        console.info('Launcher PageDesktopLayout onMouse MouseButton Right');
        mPageDesktopViewModel.onPageLongPress();
        this.dialogController.open();
      }
    })
    .width(StyleConstants.PERCENTAGE_100)
    .height(StyleConstants.PERCENTAGE_100)
    .onClick(() => {
      AppStorage.SetOrCreate('selectDesktopAppItem', null)
    })
  }
}

@CustomDialog
struct ShowDialog {
  controller: CustomDialogController;
  cancel: () => void;
  action: () => void;
  @StorageLink('blankPageBtnText') buttonText: string = '';

  build() {
    Column() {
      Text($r('app.string.launcher_edit'))
        .fontSize(StyleConstants.DEFAULT_BADGE_FONT_SIZE)
        .fontColor(StyleConstants.TEXT_COLOR_PRIMARY)
        .margin({top : StyleConstants.DEFAULT_DIALOG_RADIUS, bottom: StyleConstants.DEFAULT_DIALOG_BOTTOM_MARGIN})

      Flex({justifyContent: FlexAlign.SpaceEvenly}) {
        Button() {
          Text($r('app.string.into_settings'))
            .fontSize(StyleConstants.DEFAULT_BADGE_FONT_SIZE)
            .fontColor(StyleConstants.BUTTON_FONT_COLOR)
        }
        .backgroundColor(StyleConstants.DEFAULT_BG_COLOR)
        .height(StyleConstants.DEFAULT_BUTTON_HEIGHT)
        .onClick(() => {
          Trace.start(Trace.CORE_METHOD_START_SETTINGS);
          mPageDesktopViewModel.intoSetting();
          this.controller.close();
        })

        Divider()
          .vertical(true)
          .color(StyleConstants.DEFAULT_DIVIDER_COLOR)
          .height(StyleConstants.DEFAULT_BUTTON_HEIGHT)

        Button() {
          Text(this.buttonText)
            .fontSize(StyleConstants.DEFAULT_BADGE_FONT_SIZE)
            .fontColor(StyleConstants.BUTTON_FONT_COLOR)
        }
        .backgroundColor(StyleConstants.DEFAULT_BG_COLOR)
        .height(StyleConstants.DEFAULT_BUTTON_HEIGHT)
        .onClick(() => {
          mPageDesktopViewModel.addOrDeleteBlankPage();
          this.controller.close();
        })
      }
    }
    .backgroundColor(Color.White)
    .padding({
      bottom: StyleConstants.DEFAULT_DIALOG_BOTTOM_MARGIN
    })
    .border({
      radius: StyleConstants.DEFAULT_DIALOG_RADIUS
    })
    .width(StyleConstants.DEFAULT_DIALOG_WIDTH)
  }
}