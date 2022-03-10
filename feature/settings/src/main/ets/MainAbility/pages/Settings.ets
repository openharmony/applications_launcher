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

import StyleConstants from '../common/constants/StyleConstants';
import SettingsPresenter from '../common/presenter/SettingsPresenter';
import SettingsStage from '../common/SettingsStage';
import SettingItemInfo from '../../../../../../../common/src/main/ets/default/bean/SettingItemInfo';
import Trace from '../../../../../../../common/src/main/ets/default/utils/Trace';

let mSettingsPresenter: SettingsPresenter;

@Entry
@Component
struct Index {
  private mSettingsStage = new SettingsStage();

  onPageShow(): void {
    Trace.end(Trace.CORE_METHOD_START_SETTINGS)
  }

  aboutToAppear(): void  {
    this.mSettingsStage.onCreate();
    mSettingsPresenter = SettingsPresenter.getInstance();
  }

  aboutToDisappear() {
    this.mSettingsStage.onDestroy();
  }

  build() {
    Flex({ direction: FlexDirection.Column, alignItems: ItemAlign.Center }) {
      Row() {
        top_bar()
      }

      Column() {
        Text($r('app.string.layout'))
          .fontSize($r("app.float.layout_title_font_size"))
          .fontColor(StyleConstants.DEFAULT_LAYOUT_FONT_COLOR)
          .height(StyleConstants.DEFAULT_VP_48)
          .width($r("app.float.layout_title_width"))
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
      Column(){
        Image($r('app.media.ic_back'))
          .margin({ right: StyleConstants.DEFAULT_VP_20 })
          .width($r("app.float.top_bar_icon_size"))
          .height($r("app.float.top_bar_icon_size"))
          .objectFit(ImageFit.Contain)
      }
      .onClick(() => {
        mSettingsPresenter.backToTheDesktop();
      })
      Text($r('app.string.into_settings'))
        .fontSize($r("app.float.top_bar_font_size"))
    }
    .margin({ top: StyleConstants.DEFAULT_VP_24 })
    .height(StyleConstants.DEFAULT_VP_56)
    .width($r("app.float.top_bar_width"))
  }
}

@Component
struct SettingPage {
  @State SettingList: SettingItemInfo[] = [];

  private aboutToAppear(): void  {
    this.SettingList = mSettingsPresenter.getSettingList();
    console.info('Launcher SettingPage aboutToAppear SettingList ' + JSON.stringify(this.SettingList));
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
          settingType: item.settingType
        })
      },(item: any) => JSON.stringify(item))
    }
    .padding(StyleConstants.DEFAULT_VP_20)
    .borderRadius(StyleConstants.DEFAULT_VP_30)
    .backgroundColor(StyleConstants.DEFAULT_SETTING_PAGE_COLOR)
    .align(Alignment.Center)
  }
}

@Component
struct SettingItem {
  @State ida: number = 0;
  @State settingValue: string = ' ';
  @State settingName: string = ' ';
  @StorageLink('NavigationBarStatusValue') navigationBarStatusValue: boolean = false;
  private settingType: number;
  private valueList: SettingItemInfo[] = [];
  dialogController: CustomDialogController = new CustomDialogController({
    builder: SettingsDialog(),
    cancel: this.cancelDialog,
    autoCancel: true
  });

  cancelDialog() {
    console.info('cancelDialog');
  }

  private aboutToAppear(): void  {
    mSettingsPresenter.initNavigationBarStatusValue();
    if (this.settingType == 1) {
      mSettingsPresenter.registerValueCallback(this.ida, this.callback.bind(this));
    }
  }

  callback(data) {
    this.settingValue = data;
  }

  build() {
    Flex({
      direction: FlexDirection.Row,
      alignItems: ItemAlign.Center,
      justifyContent: FlexAlign.SpaceBetween
    }) {
      Column() {
        Text(this.settingName)
          .lineHeight(StyleConstants.DEFAULT_VP_48)
          .height(StyleConstants.DEFAULT_VP_48)
          .width($r("app.float.setting_item_title_width"))
          .fontSize($r("app.float.setting_item_title_font_size"))
          .align(Alignment.Start)
      }

      if (this.settingType == 1) {
        Column() {
          Row (){
            Text(this.settingValue)
              .lineHeight(StyleConstants.DEFAULT_VP_48)
              .height(StyleConstants.DEFAULT_VP_48)
              .width(StyleConstants.DEFAULT_VP_60)
              .fontSize(StyleConstants.DEFAULT_VP_16)
              .align(Alignment.End)
            Image($r('app.media.ic_settings_arrow'))
              .margin({ top: StyleConstants.DEFAULT_VP_16 })
              .height(StyleConstants.DEFAULT_VP_16)
              .width(StyleConstants.DEFAULT_VP_20)
              .align(Alignment.End)
          }
        }
        .onClick(() => {
          AppStorage.SetOrCreate('ida', this.ida);
          AppStorage.SetOrCreate('valueList', this.valueList);
          AppStorage.SetOrCreate('settingValue', this.settingValue);
          this.dialogController.open();
        })
      } else {
        Toggle({ type: ToggleType.Switch, isOn: this.navigationBarStatusValue })
          .width(50)
          .height(40)
          .onChange((isOn: boolean) => {
            console.info('Launcher SettingItemToggle onChange for Wlan Enable:' + isOn);
            mSettingsPresenter.setValue(isOn ? "0" : "1");
          })
      }
    }

    .width($r("app.float.setting_item_width"))
    .height(StyleConstants.DEFAULT_VP_48)
  }
}

@CustomDialog
@Component
struct SettingsDialog {
  controller: CustomDialogController;
  action: () => void;
  cancel: () => void;
  @StorageLink('valueList') valueList: SettingItemInfo[] = [];
  @StorageLink('ida') ida: number = 0;
  @StorageLink('settingValue') settingValue: String = '';

  build() {
    Column() {
      ForEach(this.valueList, (item: any) => {
        Row() {
          Text(item.name)
            .margin({ left: StyleConstants.DEFAULT_VP_10 })
            .align(Alignment.Start)
            .width(StyleConstants.PERCENTAGE_85)
            .fontSize(StyleConstants.DEFAULT_VP_30)
            .fontColor(StyleConstants.DEFAULT_DIALOG_FONT_COLOR)
          Radio({ value: item.value, group: ("" + this.ida) })
            .enabled(false)
            .checked(item.name === this.settingValue)
            .width(StyleConstants.DEFAULT_VP_30)
            .height(StyleConstants.DEFAULT_VP_30)
            .onChange((isChecked) => {})
        }.width(StyleConstants.PERCENTAGE_100)
        .height(StyleConstants.DEFAULT_VP_80)
        .onClick(() => {
          mSettingsPresenter.changeSettingValue(this.ida, item.name);
          mSettingsPresenter.setSettingsValue(this.ida, item.value);
          this.controller.close();
          this.action();
        })
      },(item: any) => JSON.stringify(item))
      Text($r('app.string.cancel'))
        .textAlign(TextAlign.Center)
        .height(StyleConstants.DEFAULT_VP_80)
        .width(StyleConstants.PERCENTAGE_100)
        .fontSize(StyleConstants.DEFAULT_VP_30)
        .fontColor(Color.Blue)
        .onClick(() => {
        this.controller.close();
        this.action();
      })
    }.padding(StyleConstants.DEFAULT_VP_20)
    .backgroundColor(StyleConstants.DEFAULT_SETTING_PAGE_COLOR)
    .borderRadius(StyleConstants.DEFAULT_VP_30)
  }
}
