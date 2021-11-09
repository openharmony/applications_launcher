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

import StyleConstants from '../common/constants/StyleConstants.ets'
import SettingsPresenter from '../common/presenter/SettingsPresenter.ets'

let mSettingsPresenter: SettingsPresenter;

@Entry
@Component
struct Index {
  private aboutToAppear(): void  {
    mSettingsPresenter = SettingsPresenter.getInstance();
  }

  build() {
    Flex({ alignItems: ItemAlign.Center, direction: FlexDirection.Column }) {
      Row() {
        top_bar()
      }

      Column() {
        Text($r('app.string.layout'))
          .fontSize(StyleConstants.DEFAULT_PIXEL_25)
          .fontColor(StyleConstants.DEFAULT_LAYOUT_FONT_COLOR)
          .margin({ right: StyleConstants.DEFAULT_PIXEL_340 })
      }

      Column() {
        SettingPage()
      }
    }.width(StyleConstants.PERCENTAGE_100)
    .height(StyleConstants.PERCENTAGE_100)
    .backgroundColor(StyleConstants.DEFAULT_BACKGROUND_COLOR)
  }
}

@Component
struct top_bar {
  build() {
    Flex({ justifyContent: FlexAlign.Start, alignItems: ItemAlign.Center }) {
      Image($r('app.media.ic_back'))
        .margin({ right: StyleConstants.DEFAULT_PIXEL_20,
        left: StyleConstants.DEFAULT_PIXEL_20 })
        .width(StyleConstants.DEFAULT_PIXEL_75)
        .height(StyleConstants.DEFAULT_PIXEL_75)
        .objectFit(ImageFit.Contain)
        .onClick(() => {
        mSettingsPresenter.backToTheDesktop();
      })
      Text($r('app.string.intoSettings'))
        .fontSize(StyleConstants.DEFAULT_PIXEL_35)
    }
    .margin({ top: StyleConstants.DEFAULT_PIXEL_10 })
    .height(StyleConstants.DEFAULT_PIXEL_80)
    .width(StyleConstants.PERCENTAGE_90)
    .backgroundColor(StyleConstants.DEFAULT_BACKGROUND_COLOR)
    .padding({ bottom: StyleConstants.DEFAULT_PIXEL_10 })
  }
}

@Component
struct SettingPage {
  @State SettingList: any = [];

  private aboutToAppear(): void  {
    this.SettingList = mSettingsPresenter.getSettingList();
  }

  private onPageShow(): void {
    this.SettingList = mSettingsPresenter.getSettingList();
  }

  build() {
    Column() {
      ForEach(this.SettingList, (item: any) => {
        SettingItem({
          ida: item.ida,
          settingName: item.settingName,
          settingValue: item.settingValue,
          valueList: item.valueList,
        })
      },(item: any) => JSON.stringify(item))
    }
    .margin({ top: StyleConstants.DEFAULT_PIXEL_10,
      bottom: StyleConstants.DEFAULT_PIXEL_10,
      left: StyleConstants.DEFAULT_PIXEL_30,
      right: StyleConstants.DEFAULT_PIXEL_30 })
    .padding(StyleConstants.DEFAULT_PIXEL_20)
    .borderRadius(StyleConstants.DEFAULT_PIXEL_30)
    .backgroundColor(StyleConstants.DEFAULT_SETTING_PAGE_COLOR)
  }
}

@Component
struct SettingItem {
  @State ida: number = 0;
  @State settingValue: string = ' ';
  @State settingName: string = ' ';
  private valueList: any;
  dialogController: CustomDialogController = new CustomDialogController({
    builder: SettingsDialog(),
    cancel: this.cancelDialog,
    autoCancel: true
  });

  cancelDialog() {
    console.info('cancelDialog');
  }

  private aboutToAppear(): void  {
    mSettingsPresenter.registerValueCallback(this.ida, this.callback.bind(this));
  }

  callback(data) {
    this.settingValue = data;
  }

  build() {
    Column() {
      Row() {
        Text(this.settingName)
          .lineHeight(StyleConstants.DEFAULT_PIXEL_60)
          .height(StyleConstants.DEFAULT_PIXEL_60)
          .fontSize(StyleConstants.DEFAULT_PIXEL_30)
          .width(StyleConstants.PERCENTAGE_60)
          .align(Alignment.Start)
        Text(this.settingValue)
          .lineHeight(StyleConstants.DEFAULT_PIXEL_60)
          .height(StyleConstants.DEFAULT_PIXEL_60)
          .fontSize(StyleConstants.DEFAULT_PIXEL_30)
          .width(StyleConstants.DEFAULT_PIXEL_60)
          .align(Alignment.Start)
        Image($r('app.media.ic_settings_arrow'))
          .margin({ left: StyleConstants.DEFAULT_PIXEL_80 })
          .height(StyleConstants.DEFAULT_PIXEL_120)
          .width(StyleConstants.DEFAULT_PIXEL_100)
          .align(Alignment.End)
      }.onClick(() => {
        AppStorage.SetOrCreate('ida', this.ida);
        AppStorage.SetOrCreate('valueList', this.valueList);
        this.dialogController.open();
      }).margin({ top: StyleConstants.DEFAULT_PIXEL_10,
        bottom: StyleConstants.DEFAULT_PIXEL_10 })
      .width(StyleConstants.PERCENTAGE_100)
      .height(StyleConstants.DEFAULT_PIXEL_75)
    }
  }
}

@CustomDialog
@Component
struct SettingsDialog {
  controller: CustomDialogController;
  action: () => void;
  cancel: () => void;
  @StorageLink('valueList') valueList: any = [];
  @StorageLink('ida') ida: number = 0;

  build() {
    Column() {
      ForEach(this.valueList, (item: any) => {
        Row() {
          Text(item.name)
            .margin({ left: StyleConstants.DEFAULT_PIXEL_10 })
            .align(Alignment.Start)
            .width(StyleConstants.PERCENTAGE_85)
            .fontSize(StyleConstants.DEFAULT_PIXEL_30)
            .fontColor(StyleConstants.DEFAULT_DIALOG_FONT_COLOR)
          Radio({ value: item.value })
            .enabled(false)
            .checked(item.checked)
            .width(StyleConstants.DEFAULT_PIXEL_30)
            .height(StyleConstants.DEFAULT_PIXEL_30)
            .onChange((isChecked) => {})
        }.width(StyleConstants.PERCENTAGE_100)
        .height(StyleConstants.DEFAULT_PIXEL_80)
        .onClick(() => {
          mSettingsPresenter.changeSettingValue(this.ida, item.name);
          mSettingsPresenter.setSettingsValue(this.ida, item.value);
          this.controller.close();
          this.action();
        })
      },(item: any) => JSON.stringify(item))
      Text($r('app.string.cancel'))
        .textAlign(TextAlign.Center)
        .height(StyleConstants.DEFAULT_PIXEL_80)
        .width(StyleConstants.PERCENTAGE_100)
        .fontSize(StyleConstants.DEFAULT_PIXEL_30)
        .fontColor(Color.Blue)
        .onClick(() => {
        this.controller.close();
        this.action();
      })
    }.padding(StyleConstants.DEFAULT_PIXEL_20)
    .backgroundColor(StyleConstants.DEFAULT_SETTING_PAGE_COLOR)
    .borderRadius(StyleConstants.DEFAULT_PIXEL_30)
  }
}
