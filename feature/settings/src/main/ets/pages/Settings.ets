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

import { Log } from '@ohos/common';
import { Trace } from '@ohos/common';
import { windowManager } from '@ohos/common';
import { SettingItemInfo } from '@ohos/common';
import SettingsStage from '../common/SettingsStage';
import SettingsStyleConstants from '../common/constants/SettingsStyleConstants';
import SettingsPresenter from '../common/presenter/SettingsPresenter';

let mSettingsPresenter: SettingsPresenter;
const TAG = 'Settings';

@Entry
@Component
struct Index {
  private mSettingsStage = new SettingsStage();
  private mDevice = SettingsStyleConstants.DEFAULT_DEVICE_TYPE_PHONE;

  onPageShow(): void { }

  aboutToAppear(): void  {
    this.getDeviceType();
    this.mSettingsStage.onCreate();
    mSettingsPresenter = SettingsPresenter.getInstance();
  }

  aboutToDisappear(): void  {
    this.mSettingsStage.onDestroy();
  }

  async getDeviceType() {
    try {
      let sysWidth = await windowManager.getWindowWidth();
      let sysHeigh = await windowManager.getWindowHeight();
      if (sysWidth > sysHeigh) {
        this.mDevice = SettingsStyleConstants.DEFAULT_DEVICE_TYPE_PAD;
      }
    } catch (e) {
      Log.showError(TAG, 'getWindowWidth or getWindowHeight error:' + e);
    }
  }

  build() {
    Flex({ direction: FlexDirection.Column, alignItems: ItemAlign.Center }) {
      Column() {
        Column() {
          top_bar()
        }
        .alignItems(HorizontalAlign.Start)
        .width(SettingsStyleConstants.PERCENTAGE_100)
        .height(SettingsStyleConstants.DEFAULT_VP_56)

        Column() {
          Text($r('app.string.layout'))
            .fontSize($r('app.float.layout_title_font_size'))
            .fontColor(SettingsStyleConstants.DEFAULT_LAYOUT_FONT_COLOR)
            .width(SettingsStyleConstants.PERCENTAGE_100)
            .height(SettingsStyleConstants.PERCENTAGE_100)
            .align(Alignment.BottomStart)
        }
        .padding({ left: 24, bottom: 10 })
        .width(SettingsStyleConstants.PERCENTAGE_100)
        .height(SettingsStyleConstants.DEFAULT_VP_48)

        Column() {
          SettingPage()
        }
        .alignItems(HorizontalAlign.Center)
        .width(SettingsStyleConstants.PERCENTAGE_100)
      }
      .width(this.mDevice === SettingsStyleConstants.DEFAULT_DEVICE_TYPE_PHONE ? SettingsStyleConstants.PERCENTAGE_100 : 976)
      .height(SettingsStyleConstants.PERCENTAGE_100)

      if (this.traceBuildEnd()) { }
    }
    .backgroundColor(SettingsStyleConstants.DEFAULT_BACKGROUND_COLOR)
    .width(SettingsStyleConstants.PERCENTAGE_100)
    .height(SettingsStyleConstants.PERCENTAGE_100)
  }

  private traceBuildEnd(): boolean {
    Trace.end(Trace.CORE_METHOD_START_SETTINGS)
    return true;
  }
}

@Component
struct top_bar {
  build() {
    Row({ space: 16 }) {
      Image($r('app.media.ic_back'))
        .margin({ left: 24 })
        .objectFit(ImageFit.Contain)
        .width(SettingsStyleConstants.DEFAULT_VP_24)
        .height(SettingsStyleConstants.DEFAULT_VP_24)
        .onClick(() => {
          mSettingsPresenter.backToTheDesktop();
        })

      Text($r('app.string.into_settings'))
        .fontSize(SettingsStyleConstants.DEFAULT_VP_20)
        .fontWeight(FontWeight.Medium)
        .height(SettingsStyleConstants.DEFAULT_VP_28)
        .width(SettingsStyleConstants.DEFAULT_VP_296)
    }
    .width(SettingsStyleConstants.PERCENTAGE_100)
    .height(SettingsStyleConstants.PERCENTAGE_100)
  }
}

@Component
struct SettingPage {
  @State SettingList: SettingItemInfo[] = [];

  aboutToAppear(): void  {
    this.SettingList = mSettingsPresenter.getSettingList();
    Log.showInfo(TAG, `aboutToAppear SettingList length: ${this.SettingList.length}`);
  }

  onPageShow(): void {
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
      }, (item: any) => JSON.stringify(item))
    }
    .width(SettingsStyleConstants.PERCENTAGE_100)
    .height(SettingsStyleConstants.DEFAULT_VP_56)
    .align(Alignment.Center)
    .padding({ left: 12, right: 12 })
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
    Log.showDebug(TAG, 'cancelDialog');
  }

  aboutToAppear(): void  {
    mSettingsPresenter.initNavigationBarStatusValue();
    if (this.settingType == 1) {
      mSettingsPresenter.registerValueCallback(this.ida, this.callback.bind(this));
    }
  }

  aboutToDisappear(): void {
    delete this.dialogController;
    this.dialogController = null;
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
          .lineHeight(SettingsStyleConstants.DEFAULT_VP_22)
          .height(SettingsStyleConstants.DEFAULT_VP_22)
          .width(SettingsStyleConstants.DEFAULT_VP_230)
          .fontSize(SettingsStyleConstants.DEFAULT_VP_16)
          .align(Alignment.Start)
      }

      if (this.settingType == 1) {
        Column() {
          Row() {
            Text(this.settingValue)
              .lineHeight(SettingsStyleConstants.DEFAULT_VP_48)
              .height(SettingsStyleConstants.DEFAULT_VP_48)
              .width(SettingsStyleConstants.DEFAULT_VP_60)
              .fontSize(SettingsStyleConstants.DEFAULT_VP_16)
              .align(Alignment.End)
            Image($r('app.media.ic_settings_arrow'))
              .margin({ top: SettingsStyleConstants.DEFAULT_VP_16 })
              .height(SettingsStyleConstants.DEFAULT_VP_16)
              .width(SettingsStyleConstants.DEFAULT_VP_20)
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
            Log.showDebug(TAG, `SettingItemToggle onChange for GestureNavigation Enable: ${isOn}`);
            mSettingsPresenter.sendLocalEvent(isOn ? '0' : '1');
          })
      }
    }
    .width(SettingsStyleConstants.PERCENTAGE_100)
    .height(SettingsStyleConstants.PERCENTAGE_100)
    .padding({ left: 12, right: 12 })
    .borderRadius(SettingsStyleConstants.DEFAULT_VP_16)
    .backgroundColor(SettingsStyleConstants.DEFAULT_SETTING_PAGE_COLOR)
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
            .margin({ left: SettingsStyleConstants.DEFAULT_VP_10 })
            .align(Alignment.Start)
            .width(SettingsStyleConstants.PERCENTAGE_85)
            .fontSize(SettingsStyleConstants.DEFAULT_VP_30)
            .fontColor(SettingsStyleConstants.DEFAULT_DIALOG_FONT_COLOR)
          Radio({ value: item.value, group: ('' + this.ida) })
            .enabled(false)
            .checked(item.name === this.settingValue)
            .width(SettingsStyleConstants.DEFAULT_VP_30)
            .height(SettingsStyleConstants.DEFAULT_VP_30)
            .onChange((isChecked) => {})
        }.width(SettingsStyleConstants.PERCENTAGE_100)
        .height(SettingsStyleConstants.DEFAULT_VP_80)
        .onClick(() => {
          mSettingsPresenter.changeSettingValue(this.ida, item.name);
          mSettingsPresenter.setSettingsValue(this.ida, item.value);
          this.controller.close();
          this.action();
        })
      }, (item: any) => JSON.stringify(item))
      Text($r('app.string.cancel'))
        .textAlign(TextAlign.Center)
        .height(SettingsStyleConstants.DEFAULT_VP_80)
        .width(SettingsStyleConstants.PERCENTAGE_100)
        .fontSize(SettingsStyleConstants.DEFAULT_VP_30)
        .fontColor(Color.Blue)
        .onClick(() => {
          this.controller.close();
          this.action();
        })
    }.padding(SettingsStyleConstants.DEFAULT_VP_20)
    .backgroundColor(SettingsStyleConstants.DEFAULT_SETTING_PAGE_COLOR)
    .borderRadius(SettingsStyleConstants.DEFAULT_VP_30)
  }
}
