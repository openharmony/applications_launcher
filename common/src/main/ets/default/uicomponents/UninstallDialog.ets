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

import StyleConstants from '../constants/StyleConstants';


@CustomDialog
export default struct UninstallDialog {
  controller: CustomDialogController;
  cancel: () => void
  confirm: () => void
  dialogName: string
  dialogContent: string

  build() {
    Column() {
      Row() {
        Text(this.dialogName)
          .fontSize(StyleConstants.DEFAULT_BADGE_FONT_SIZE)
          .fontColor(StyleConstants.TEXT_COLOR_PRIMARY)
        Text(this.dialogContent)
          .fontSize(StyleConstants.DEFAULT_BADGE_FONT_SIZE)
          .fontColor(StyleConstants.TEXT_COLOR_PRIMARY)
      }.margin({top : StyleConstants.DEFAULT_DIALOG_RADIUS, bottom: StyleConstants.DEFAULT_DIALOG_BOTTOM_MARGIN})

      Flex({justifyContent: FlexAlign.SpaceEvenly}) {
        Button() {
          Text($r('app.string.cancel'))
            .fontSize(StyleConstants.DEFAULT_BADGE_FONT_SIZE)
            .fontColor(StyleConstants.BUTTON_FONT_COLOR)
        }
        .backgroundColor(StyleConstants.DEFAULT_BG_COLOR)
        .height(StyleConstants.DEFAULT_BUTTON_HEIGHT)
        .onClick(() => {
          this.controller.close();
          this.cancel()
        })

        Divider()
          .vertical(true)
          .color(StyleConstants.DEFAULT_DIVIDER_COLOR)
          .height(StyleConstants.DEFAULT_BUTTON_HEIGHT)

        Button() {
          Text($r('app.string.submit'))
            .fontSize(StyleConstants.DEFAULT_BADGE_FONT_SIZE)
            .fontColor(StyleConstants.DEFAULT_COLOR_ERROR)
        }
        .backgroundColor(StyleConstants.DEFAULT_BG_COLOR)
        .height(StyleConstants.DEFAULT_BUTTON_HEIGHT)
        .onClick(() => {
          this.controller.close();
          this.confirm()
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