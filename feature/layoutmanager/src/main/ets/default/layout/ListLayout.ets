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

import AppListPresenter from '../common/presenter/AppListPresenter.ets'
import ListName from '../../../../../../../common/src/main/ets/default/uicomponents/ListName.ets'
import AppIcon from '../../../../../../../common/src/main/ets/default/uicomponents/AppIcon.ets'
import StyleConstants from '../common/constants/StyleConstants.ets'

let mAppListPresenter: AppListPresenter;

@Component
export default struct ListLayout {
  @StorageLink('listInfo') AppListInfo: [] = [];

  private aboutToAppear(): void  {
    mAppListPresenter = AppListPresenter.getInstance();
    mAppListPresenter.getAppList();
    mAppListPresenter.registerAppListChangeCallback()
  }

  dialogController: CustomDialogController = new CustomDialogController({
    builder: ShowDialog({ action: this.openUninstallDialog }),
    cancel: this.cancelDialog,
    autoCancel: true
  });
  uninstallDialogController: CustomDialogController = new CustomDialogController({
    builder: UninstallDialog(),
    cancel: this.cancelDialog,
    autoCancel: true
  });

  openUninstallDialog() {
    this.dialogController.close();
    this.uninstallDialogController.open();
  }

  cancelDialog() {
    console.info('Launcher Grid Cancel Dialog');
  }

  build() {
    List({ space: 5, initialIndex: 1 }) {
      ForEach(this.AppListInfo, (item) => {
        ListItem() {
          Row() {
            AppIcon({
              iconSize: StyleConstants.DEFAULT_APP_ITEM_WIDTH,
              appIcon: item.appIconId,
              bundleName: item.bundleName,
              labelId: item.appLabelId
            })
            ListName({
              appName: item.appName,
              nameSize: StyleConstants.DEFAULT_APP_NAME_SIZE,
              bundleName: item.bundleName,
              labelId: item.appLabelId
            })
          }
          .gesture(
            LongPressGesture({ repeat: false })
              .onAction((event: GestureEvent) => {
              AppStorage.SetOrCreate('uninstallAppInfo', item);
              this.dialogController.open();
            })
          )
          .onClick(() => {
            mAppListPresenter.openApplication(item.abilityName, item.bundleName);
          })
          .width(StyleConstants.PERCENTAGE_100)
          .height(StyleConstants.DEFAULT_80)
          .backgroundColor(StyleConstants.LIGHT_BLACK)
          .borderRadius(StyleConstants.DEFAULT_20)
          .padding({ left: StyleConstants.DEFAULT_5 })
          .margin({
            top: StyleConstants.DEFAULT_5,
            left: StyleConstants.DEFAULT_30,
            bottom: StyleConstants.DEFAULT_5,
            right: StyleConstants.DEFAULT_30
          })
        }
      },(item) => JSON.stringify(item))
    }
    .gesture(
      LongPressGesture({ repeat: false })
        .onAction((event: GestureEvent) => {
        mAppListPresenter.intoSetting();
      })
    )
    .width(StyleConstants.PERCENTAGE_100)
    .height(StyleConstants.PERCENTAGE_100)
  }
}

@CustomDialog
struct ShowDialog {
  @StorageLink('uninstallAppInfo') appInfo: any = {};
  controller: CustomDialogController;
  cancel: () => void;
  action: () => void;

  build() {
    Column() {
      Row() {
        Text($r('app.string.launcherEdit'))
      }
      Row() {
        Button() {
          Text($r('app.string.intoSettings'))
            .height(StyleConstants.PERCENTAGE_100)
            .fontColor(Color.Blue)
            .fontSize(StyleConstants.DEFAULT_BUTTON_TEXT_SIZE)
        }
        .width(StyleConstants.PIXEL_200)
        .height(StyleConstants.PIXEL_50)
        .backgroundColor(Color.White)
        .onClick(() => {
          mAppListPresenter.intoSetting();
          this.controller.close();
        })

        Divider()
          .vertical(true)
          .color(StyleConstants.DEFAULT_DIVIDER_COLOR)
          .height(StyleConstants.DEFAULT_40)
          .margin({top: StyleConstants.DEFAULT_0, right: StyleConstants.DEFAULT_10, bottom: StyleConstants.DEFAULT_0, left: StyleConstants.DEFAULT_10})

        Button() {
          Text($r('app.string.uninstall'))
            .height(StyleConstants.PERCENTAGE_100)
            .fontColor(Color.Red)
            .fontSize(StyleConstants.DEFAULT_BUTTON_TEXT_SIZE)
        }
        .width(StyleConstants.PIXEL_200)
        .height(StyleConstants.PIXEL_50)
        .backgroundColor(Color.White)
        .onClick(() => {
          mAppListPresenter.uninstallApp(this.appInfo.bundleName, this.appInfo.isSystemApp);
          this.controller.close();
        })
      }.padding(StyleConstants.DEFAULT_20)
    }
    .padding({top: StyleConstants.DEFAULT_25, right: StyleConstants.DEFAULT_5, bottom: StyleConstants.DEFAULT_15, left: StyleConstants.DEFAULT_5})
  }
}

@CustomDialog
struct UninstallDialog {
  controller: CustomDialogController;
  cancel: () => void;
  action: () => void;
  @StorageLink('uninstallAppInfo') appInfo: any = {};

  build() {
    Column() {
      Row() {
        Text($r('app.string.uninstall'))
        Text(this.appInfo.appName + ' ?')
      }

      Row() {
        Button() {
          Text($r('app.string.uninstall'))
            .fontColor(Color.White)
            .fontSize(StyleConstants.DEFAULT_APP_NAME_SIZE)
        }
        .margin({ right: StyleConstants.DEFAULT_20 })
        .width(StyleConstants.PIXEL_150)
        .height(StyleConstants.PIXEL_50)
        .backgroundColor(Color.Blue)
        .onClick(() => {
          mAppListPresenter.uninstallApp(this.appInfo.bundleName, this.appInfo.isSystemApp);
          this.controller.close();
        })

        Button() {
          Text($r('app.string.cancel'))
            .fontColor(Color.White)
            .fontSize(StyleConstants.DEFAULT_APP_NAME_SIZE)
        }
        .margin({ left: StyleConstants.DEFAULT_20 })
        .width(StyleConstants.PIXEL_150)
        .height(StyleConstants.PIXEL_50)
        .backgroundColor(Color.Blue)
        .onClick(() => {
          this.controller.close();
        })
      }
      .margin({ top: StyleConstants.DEFAULT_20 })
      .padding(StyleConstants.DEFAULT_20)
    }.padding(StyleConstants.DEFAULT_20)
  }
}