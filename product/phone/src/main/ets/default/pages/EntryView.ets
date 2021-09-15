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
import DefaultConstants from '../common/constants/DefaultConstants.ets'
import GridLayout from '../../../../../../../feature/layoutmanager/src/main/ets/default/layout/GridLayout.ets'
import ListLayout from '../../../../../../../feature/layoutmanager/src/main/ets/default/layout/ListLayout.ets'
import AppModel from '../../../../../../../common/src/main/ets/default/common/model/AppModel.ets'
import SettingsModel from '../../../../../../../common/src/main/ets/default/common/model/SettingsModel.ets'

@Entry
@Component
struct LayoutManager {
  private mAppPageStartConfig;
  private mAppModel: AppModel;
  private mSettingsModel: SettingsModel;
  @State mScreenHeight: number = 0;
  @State mScreenWidth: number = 0;

  private aboutToAppear(): void  {
    this.mAppModel = AppModel.getInstance()
    this.mSettingsModel = new SettingsModel();
    this.mAppPageStartConfig = this.mSettingsModel.getAppPageStartConfig();
    this.mAppModel.registerAppListEvent();
    this.mScreenHeight = 1240;
    this.mScreenWidth = 720;
  }

  onPageShow() {
    this.mAppPageStartConfig = this.mSettingsModel.getAppPageStartConfig();
  }

  build() {
    Flex({ direction: FlexDirection.Column, alignItems: ItemAlign.Center, justifyContent: FlexAlign.Center }) {
      if (this.mAppPageStartConfig === 'Grid') {
        GridLayout({ mScreenHeight: this.mScreenHeight, mScreenWidth: this.mScreenWidth, ScreenMagnification: 1.5 });
      } else {
        ListLayout();
      }
    }
    .backgroundImage(DefaultConstants.DEFAULT_BACKGROUND_IMAGE)
    .backgroundImageSize(ImageSize.Cover)
  }
}