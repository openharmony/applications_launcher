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

import StyleConstants from '../../../../../../../common/src/main/ets/default/constants/StyleConstants';
import CommonConstants from '../../../../../../../common/src/main/ets/default/constants/CommonConstants';
import PageDesktopViewModel from '../common/viewmodel/PageDesktopViewModel';
import PageDesktopDragHandler from '../common/PageDesktopDragHandler';
import GridSwiper from '../common/components/GridSwiper.ets';
import FeatureConstants from '../common/constants/FeatureConstants';
import Trace from '../../../../../../../common/src/main/ets/default/utils/Trace';
import Log from '../../../../../../../common/src/main/ets/default/utils/Log';
import AppMenu from '../../../../../../../common/src/main/ets/default/uicomponents/AppMenu.ets';
import MenuInfo from '../../../../../../../common/src/main/ets/default/bean/MenuInfo';

let mPageDesktopViewModel: PageDesktopViewModel = null;
const TAG = "PageDesktopLayout";

@Component
export default struct PageDesktopLayout {
  @StorageLink('appListInfo') AppListInfo: {
    appGridInfo: [[]]
  } = { appGridInfo: [[]] };
  @StorageLink('dragLocation') @Watch('onTouchEventUpdate') dragLocation: string = '';
  @StorageLink('workSpaceWidth') @Watch('updateDeskTopParams') workSpaceWidth: number = 0;
  @StorageLink('workSpaceHeight') @Watch('updateDeskTopParams') workSpaceHeight: number = 0;
  @State device: string = 'phone';
  @State @Watch('updateDeskTopParams') mMargin: number = 0;
  @State mTop: number = 0;
  @State @Watch('changeGridConfig') gridConfig: string = '';
  @StorageLink('menuId') menuId: number = 0;
  private mPageDesktopDragHandler: PageDesktopDragHandler = null;
  private isPad: boolean = false;
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
    Log.showInfo(TAG, `updateStyle isPad: ${this.isPad}`);
  }

  private updateDeskTopParams() {
    this.mMargin = mPageDesktopViewModel.getPageDesktopStyleConfig().mMargin;
    this.mTop = mPageDesktopViewModel.getPageDesktopStyleConfig().mDesktopMarginTop;
    Log.showInfo(TAG, `updateDeskTopParams mMargin: ${this.mMargin}, this.mTop: ${this.mTop}`);
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
    if (AppStorage.Get('device') === 'phone' || AppStorage.Get('dragFocus') == FeatureConstants.FEATURE_NAME) {
      this.mPageDesktopDragHandler.onTouchEventUpdate(AppStorage.Get('dragEvent'));
    }
  }

  private changeGridConfig(): void {
    Log.showInfo(TAG, `changeGridConfig GridConfig: ${this.gridConfig}`);
    this.updateDeskTopParams();
    mPageDesktopViewModel.getGridList();
  }

  private buildLog(): boolean {
    Log.showInfo(TAG, 'build start');
    return true;
  }

  private getMenu() {
    let menuInfoList = new Array<MenuInfo>();
    let setting = new MenuInfo();
    setting.menuType = CommonConstants.MENU_TYPE_FIXED
    setting.menuImgSrc = "/common/pics/ic_public_settings.svg"
    setting.menuText = $r('app.string.into_settings')
    setting.onMenuClick = () => {
      Trace.start(Trace.CORE_METHOD_START_SETTINGS);
      mPageDesktopViewModel.intoSetting();
    }
    menuInfoList.push(setting);

    let addOrDeleteBlankPage = new MenuInfo();
    addOrDeleteBlankPage.menuType = CommonConstants.MENU_TYPE_FIXED
    addOrDeleteBlankPage.menuImgSrc = mPageDesktopViewModel.getBlankPageBtnIcon()
    addOrDeleteBlankPage.menuText = mPageDesktopViewModel.getBlankPageBtnStr()
    addOrDeleteBlankPage.onMenuClick = () => {
      mPageDesktopViewModel.addOrDeleteBlankPage();
    }
    menuInfoList.push(addOrDeleteBlankPage);
    return menuInfoList;
  }

  private logId() {
    Log.showInfo(TAG, `MenuBuilder build start ${this.menuId}`);
    return true;
  }

  @Builder MenuBuilder() {
    if (this.logId()) {
      Flex({ direction: FlexDirection.Column, justifyContent: FlexAlign.Center, alignItems: ItemAlign.Center }) {
        AppMenu({
          menuInfoList: this.getMenu()
        })
      }
      .width(StyleConstants.CONTEXT_MENU_WIDTH)
      .borderRadius(StyleConstants.DEFAULT_12)
    }
  }

  build() {
    if (this.device == 'phone') {
      Flex({ direction: FlexDirection.Column, alignItems: ItemAlign.Center, justifyContent: FlexAlign.Center }) {
        if (this.buildLog()) {
        }
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
      LongPressGesture({ repeat: true })
        .onAction((event: GestureEvent) => {
          this.dialogController.open()
        })
      )
      .bindContextMenu(this.MenuBuilder, ResponseType.RightClick)
      .width(StyleConstants.PERCENTAGE_100)
      .height(StyleConstants.PERCENTAGE_100)
      .onClick(() => {
        AppStorage.SetOrCreate('selectDesktopAppItem', null)
      })
    } else {
      Flex({ direction: FlexDirection.Column, alignItems: ItemAlign.Center, justifyContent: FlexAlign.Center }) {
        if (this.buildLog()) {
        }
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
      .bindContextMenu(this.MenuBuilder, ResponseType.LongPress)
      .bindContextMenu(this.MenuBuilder, ResponseType.RightClick)
      .width(StyleConstants.PERCENTAGE_100)
      .height(StyleConstants.PERCENTAGE_100)
      .onClick(() => {
        AppStorage.SetOrCreate('selectDesktopAppItem', null)
      })
    }
  }
}

@CustomDialog
struct settingDialog {
  @StorageLink('NavigationBarStatusValue') navigationBarStatusValue: boolean = false;
  controller: CustomDialogController
  cancel: () => void
  confirm: () => void
  onAccept: () => void

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