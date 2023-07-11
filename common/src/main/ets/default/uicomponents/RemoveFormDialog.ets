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
import { LayoutViewModel } from '../viewmodel/LayoutViewModel';

@CustomDialog
export struct RemoveFormDialog {
  @StorageLink('isPad') isPad: boolean = false;
  @StorageLink('NavigationBarStatusValue') navigationBarStatusValue: boolean = false;
  mRemoveFormDialogWidth: string;
  controller: CustomDialogController;
  cancel: () => void
  confirm: () => void
  dialogName: string;
  private mLayoutViewModel: LayoutViewModel;

  private async updateScreenSize() {
    this.mRemoveFormDialogWidth = this.mLayoutViewModel.getCommonDialogWidth();
  }

  aboutToAppear(): void  {
    this.mLayoutViewModel = LayoutViewModel.getInstance();
    this.updateScreenSize();
  }

  aboutToDisappear(): void {
    this.controller = null;
    this.confirm = null;
    this.cancel = null;
  }

  build() {
    Flex({ direction: FlexDirection.Column, justifyContent: this.isPad ? FlexAlign.Center : FlexAlign.End }) {
        Column() {
          Row() {
            Text(this.dialogName)
              .width(StyleConstants.PERCENTAGE_70)
              .fontSize(StyleConstants.DEFAULT_FORM_FONT_CONTENT_SIZE)
              .fontWeight(StyleConstants.DEFAULT_FORM_FONT_TITLE_WEIGHT)
          }
          .alignItems(VerticalAlign.Center)
          .margin({ top: StyleConstants.DEFAULT_20 })

          Row() {
            Text($r('app.string.remove_form_dialog_content'))
              .width(StyleConstants.PERCENTAGE_70)
              .fontSize(StyleConstants.DEFAULT_FORM_FONT_TITLE_SIZE)
              .fontWeight(StyleConstants.DEFAULT_FORM_FONT_CONTENT_WEIGHT)
          }
          .alignItems(VerticalAlign.Center)
          .margin({ top: StyleConstants.DEFAULT_20 })

          Flex({ justifyContent: FlexAlign.SpaceEvenly }) {
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
              .height(StyleConstants.DEFAULT_BUTTON_HEIGHT)

            Button() {
              Text($r('app.string.delete_form'))
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
          bottom: StyleConstants.DEFAULT_DIALOG_BOTTOM_MARGIN
        })
        .border({
          radius: StyleConstants.DEFAULT_DIALOG_RADIUS
        })
        .width(this.mRemoveFormDialogWidth)
      }
    .margin({ bottom: this.navigationBarStatusValue ? StyleConstants.DEFAULT_12 : StyleConstants.DEFAULT_40 })
    .padding({ left: StyleConstants.DEFAULT_12, right: StyleConstants.DEFAULT_12 })
  }
}