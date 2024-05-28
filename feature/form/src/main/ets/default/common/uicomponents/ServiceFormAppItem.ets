/**
 * Copyright (c) 2023-2023 Huawei Device Co., Ltd.
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
import {
  CommonConstants,
  SettingsModel,
  StyleConstants,
  CheckEmptyUtils,
  ResourceManager,
  AppItemInfo,
  Log
} from '@ohos/common';
import ThisStyleConstants from '../../common/constants/StyleConstants';
import { PageDesktopViewModel } from '../../../../../../../pagedesktop/src/main/ets/default/viewmodel/PageDesktopViewModel';

const TAG = 'ServiceFormAppItem';

@Component
export default struct ServiceFormAppItem {
  @State icon: string = '';
  rightArrowIconWidth?: number = ThisStyleConstants.SERVICE_FORM_APP_ITEM_RIGHT_ARROW_WIDTH;
  rightArrowIconHeight?: number = ThisStyleConstants.SERVICE_FORM_APP_ITEM_RIGHT_ARROW_HEIGHT;
  bundleName: string = '';
  abilityName: string = '';
  moduleName: string = '';
  appLabelId: number = 0;
  iconId: number = 0;
  @State appName: string = '';
  mDefaultAppIcon: string = '';
  clickApp?: Function | null = null;
  private item: AppItemInfo = new AppItemInfo();
  private mResourceManager: ResourceManager = ResourceManager.getInstance();
  private mIconSize: number = ThisStyleConstants.FORM_SERVICE_APP_ICON_SIZE_WIDTH;
  private mNameLines: number = PageDesktopViewModel.getInstance().getPageDesktopStyleConfig().mNameLines;
  private mNameMarginLeft: number = ThisStyleConstants.FORM_SERVICE_APP_NAME_MARGIN_LEFT;
  private mAppItemHeight: number = ThisStyleConstants.FORM_SERVICE_APP_ITEM_HEIGHT;
  private idIndex: number = 0;

  aboutToAppear(): void {
    this.mResourceManager = ResourceManager.getInstance();
    this.updateIcon();
    this.updateName();
  }

  private updateIcon(): void {
    this.mResourceManager.getAppIconWithCache(this.iconId, this.bundleName, this.moduleName,
    this.iconLoadCallback, this.mDefaultAppIcon);
  }

  private iconLoadCallback = (image: string): void => {
    Log.showInfo(TAG, `iconLoadCallback  ${this.bundleName}   ${this.abilityName}`);
    if (SettingsModel.getInstance().getDevice() ==
    CommonConstants.PAD_DEVICE_TYPE && this.bundleName == CommonConstants.LAUNCHER_BUNDLE) {
      this.icon = this.getDefaultAppIcon();
    } else {
      this.icon = image;
    }
  }

  private updateName(): void {
    if (CheckEmptyUtils.isEmpty(this.appName)) {
      this.mResourceManager.getAppNameWithCache(this.appLabelId, this.bundleName, this.moduleName,
      this.appName, this.appNameLoadCallback);
      return;
    }
  }

  private appNameLoadCallback = (name: string): void => {
    this.appName = name;
  }

  private getDefaultAppIcon() {
    return this.mDefaultAppIcon;
  }

  build() {
    Row() {
      Image(this.icon)
        .id(`${TAG}_Image_icon_${this.bundleName}_${this.idIndex}`)
        .width(this.mIconSize)
        .height(this.mIconSize)

      Text(this.appName)
      .id(`${TAG}_Text_appName_${this.bundleName}_${this.idIndex}`)
      .fontSize($r('sys.float.ohos_id_text_size_body1'))
      .fontColor($r('sys.color.ohos_id_color_text_primary_contrary'))
      .fontWeight(ResourceManager.getInstance().getFontWeightMedium())
      .lineHeight(ThisStyleConstants.FORM_SERVICE_APP_NAME_LINE_HEIGHT)
      .textOverflow({overflow: TextOverflow.Ellipsis})
      .maxLines(this.mNameLines)
      .margin({left: this.mNameMarginLeft})
      .layoutWeight(1)

      Image(StyleConstants.DEFAULT_ARROW_RIGHT_IMAGE)
        .id(`${TAG}_Image_arrowRight_${this.idIndex}`)
        .width(this.rightArrowIconWidth)
        .height(this.rightArrowIconHeight)
    }
    .alignItems(VerticalAlign.Center)
    .width(StyleConstants.PERCENTAGE_100)
    .height(this.mAppItemHeight)
    .onClick((event) => {
      if (this.clickApp) {
        this.clickApp(event, this.item);
      }
    })
  }
}