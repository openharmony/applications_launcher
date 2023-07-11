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

import { StyleConstants } from '../constants/StyleConstants';
import { CheckEmptyUtils } from '../utils/CheckEmptyUtils';
import { ResourceManager } from '../manager/ResourceManager';
import { LayoutViewModel } from '../viewmodel/LayoutViewModel';


@CustomDialog
export struct UninstallDialog {
  @StorageLink('uninstallAppInfo') appInfo: any = {};
  @StorageLink('isPad') isPad: boolean = false;
  @StorageLink('NavigationBarStatusValue') navigationBarStatusValue: boolean = false;
  controller: CustomDialogController;
  cancel: () => void
  confirm: () => void
  dialogName: string
  dialogContent: string
  @State icon: string = '';
  appIcon: string;
  bundleName: string;
  moduleName: string;
  mUninstallDialogWidth: string;
  private mLayoutViewModel: LayoutViewModel;

  private async updateScreenSize() {
    this.mUninstallDialogWidth = this.mLayoutViewModel.getCommonDialogWidth();
  }

  private mResourceManager;
  private mDefaultAppIcon;

  aboutToAppear(): void  {
    this.mLayoutViewModel = LayoutViewModel.getInstance();
    this.updateScreenSize();
    this.mResourceManager = ResourceManager.getInstance();

    this.appIcon = this.appInfo.appIconId;
    this.bundleName = this.appInfo.bundleName;
    this.moduleName = this.appInfo.moduleName;

    if (CheckEmptyUtils.isEmpty(this.icon)) {
      this.updateIcon();
    }
  }

  aboutToDisappear(): void {
    this.controller = null;
    this.cancel = null;
    this.confirm = null;
  }

  public iconLoadCallback(image) {
    this.icon = image;
  }

  public updateIcon() {
    this.mResourceManager.getAppIconWithCache(this.appIcon, this.bundleName, this.moduleName,
      this.iconLoadCallback.bind(this), this.mDefaultAppIcon);
  }

  build() {
    Flex({ direction: FlexDirection.Column, justifyContent: this.isPad ? FlexAlign.Center : FlexAlign.End }) {
        Column() {
          Image(this.icon).width(StyleConstants.DEFAULT_APP_ITEM_HEIGHT).height(StyleConstants.DEFAULT_APP_ITEM_HEIGHT)

          Row() {
            Text(this.dialogName)
              .fontSize(StyleConstants.DEFAULT_BADGE_FONT_SIZE)
              .fontColor(StyleConstants.TEXT_COLOR_PRIMARY)
            Text(this.dialogContent)
              .fontSize(StyleConstants.DEFAULT_BADGE_FONT_SIZE)
              .fontColor(StyleConstants.TEXT_COLOR_PRIMARY)
          }.margin({ top: StyleConstants.DEFAULT_DIALOG_RADIUS, bottom: StyleConstants.DEFAULT_DIALOG_BOTTOM_MARGIN })

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
              this.controller.close();
              this.cancel()
            })

            Divider()
              .vertical(true)
              .color(StyleConstants.DEFAULT_DIVIDER_COLOR)
              .height(StyleConstants.DEFAULT_DIVIDER_HEIGHT)

            Button() {
              Text(this.isPad && this.dialogName == '是否卸载' ? $r('app.string.uninstall') : $r('app.string.submit'))
                .fontSize(StyleConstants.DEFAULT_BADGE_FONT_SIZE)
                .fontColor(StyleConstants.DEFAULT_COLOR_ERROR)
            }
            .backgroundColor(StyleConstants.DEFAULT_BG_COLOR)
            .height(StyleConstants.DEFAULT_BUTTON_HEIGHT)
            .width(StyleConstants.DEFAULT_BUTTON_WIDTH)
            .onClick(() => {
              this.controller.close();
              this.confirm()
            })
          }
        }
        .backgroundColor($r("app.color.default_dialog_background"))
        .backgroundBlurStyle(BlurStyle.Regular)
        .padding({
          top: StyleConstants.DEFAULT_24,
          bottom: StyleConstants.DEFAULT_DIALOG_BOTTOM_MARGIN
        })
        .border({
          radius: StyleConstants.DEFAULT_DIALOG_RADIUS
        })
        .width(this.mUninstallDialogWidth)
      }
    .margin({ bottom: this.navigationBarStatusValue ? StyleConstants.DEFAULT_12 : StyleConstants.DEFAULT_40 })
    .padding({ left: StyleConstants.DEFAULT_12, right: StyleConstants.DEFAULT_12 })
  }
}