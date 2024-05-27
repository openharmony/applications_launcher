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
import SettingItemOption from '@ohos/common/src/main/ets/default/bean/SettingItemOption';

let mSettingsPresenter: SettingsPresenter;
const TAG = 'Settings';

@Entry
@Component
struct Index {
  private mSettingsStage: SettingsStage = new SettingsStage();
  private mDevice = SettingsStyleConstants.DEFAULT_DEVICE_TYPE_PHONE;
  @State mSettingsPresenter: SettingsPresenter | null = null;

  onPageShow(): void { }

  aboutToAppear(): void  {
    this.getDeviceType();
    this.mSettingsStage.onCreate();
    this.mSettingsPresenter = SettingsPresenter.getInstance();
  }

  aboutToDisappear(): void  {
    this.mSettingsStage.onDestroy();
  }

  async getDeviceType() {
    try {
      let sysWidth = px2vp(windowManager.getWindowWidth());
      let sysHeight = px2vp(windowManager.getWindowHeight());
      if (sysWidth > sysHeight) {
        this.mDevice = SettingsStyleConstants.DEFAULT_DEVICE_TYPE_PAD;
      }
    } catch (e) {
      Log.showError(TAG, `getWindowWidth or getWindowHeight error: ${JSON.stringify(e)}`);
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
          SettingsPresenter.getInstance().backToTheDesktop();
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
  @State settingList: SettingItemInfo[] = [];

  aboutToAppear(): void  {
    this.settingList = SettingsPresenter.getInstance().getSettingList();
    Log.showInfo(TAG, `aboutToAppear SettingList length: ${this.settingList.length}`);
  }

  build() {
    Column() {
      ForEach(this.settingList, (item: SettingItemInfo) => {
        SettingItem({
          ida: item.ida,
          settingName: item.settingName,
          settingValue: item.settingValue,
          valueList: item.valueList,
          settingType: item.settingType
        })
      }, (item: SettingItemInfo) => JSON.stringify(item))
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
  private settingType?: number;
  private valueList: SettingItemOption[] = [];
  dialogController: CustomDialogController | null = new CustomDialogController({
    builder: SettingsDialog(),
    cancel: this.cancelDialog,
    autoCancel: true
  });
  callback = (data: string) => {
    this.settingValue = data;
  }

  cancelDialog() {
    Log.showDebug(TAG, 'cancelDialog');
  }

  aboutToAppear(): void  {
    SettingsPresenter.getInstance().initNavigationBarStatusValue();
    if (this.settingType == 1) {
      SettingsPresenter.getInstance().registerValueCallback(this.ida, this.callback);
    }
  }

  aboutToDisappear(): void {
    this.dialogController = null;
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
          AppStorage.setOrCreate('ida', this.ida);
          AppStorage.setOrCreate('valueList', this.valueList);
          AppStorage.setOrCreate('settingValue', this.settingValue);
          if (this.dialogController) {
            this.dialogController.open();
          }
        })
      } else {
        Toggle({ type: ToggleType.Switch, isOn: this.navigationBarStatusValue })
          .width(50)
          .height(40)
          .onChange((isOn: boolean) => {
            Log.showDebug(TAG, `SettingItemToggle onChange for GestureNavigation Enable: ${isOn}`);
            SettingsPresenter.getInstance().sendLocalEvent(isOn ? '0' : '1');
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
  controller?: CustomDialogController;
  action: () => void = () => {
  };
  cancel: () => void = () => {
  };
  @StorageLink('valueList') valueList: SettingItemOption[] = [];
  @StorageLink('ida') ida: number = 0;
  @StorageLink('settingValue') settingValue: String = '';

  aboutToDisappear(): void {
  }

  build() {
    Column() {
      ForEach(this.valueList, (item: SettingItemOption) => {
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
            .onChange((isChecked: boolean) => {})
        }.width(SettingsStyleConstants.PERCENTAGE_100)
        .height(SettingsStyleConstants.DEFAULT_VP_80)
        .onClick(() => {
          SettingsPresenter.getInstance().changeSettingValue(this.ida, item.name);
          SettingsPresenter.getInstance().setSettingsValue(this.ida, item.value);
          if (this.controller) {
            this.controller.close();
          }
          this.action();
        })
      }, (item: SettingItemOption) => JSON.stringify(item))
      Text($r('app.string.cancel'))
        .textAlign(TextAlign.Center)
        .height(SettingsStyleConstants.DEFAULT_VP_80)
        .width(SettingsStyleConstants.PERCENTAGE_100)
        .fontSize(SettingsStyleConstants.DEFAULT_VP_30)
        .fontColor(Color.Blue)
        .onClick(() => {
          if (this.controller) {
            this.controller.close();
          }
          this.action();
        })
    }.padding(SettingsStyleConstants.DEFAULT_VP_20)
    .backgroundColor(SettingsStyleConstants.DEFAULT_SETTING_PAGE_COLOR)
    .borderRadius(SettingsStyleConstants.DEFAULT_VP_30)
  }
}
