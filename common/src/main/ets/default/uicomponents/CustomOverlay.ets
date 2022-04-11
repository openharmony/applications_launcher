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

import CommonConstants from '../constants/CommonConstants';
import StyleConstants from '../constants/StyleConstants';
import ResourceManager from '../manager/ResourceManager';
import OverlayAppIcon from './OverlayAppIcon.ets';
import AppIcon from './AppIcon.ets';
import FolderComponent from './FolderComponent.ets';
import MenuInfo from '../bean/MenuInfo'
import FormItemComponent from './FormItemComponent.ets';

@Component
export default struct CustomOverlay {
  @State @Watch('showStateChange') overLayShow: boolean = false;
  @State overLayAlpha: number = 0;
  @StorageLink('withBlur') withBlur: boolean = true;
  @StorageLink('overlayPositionX') overlayPositionX: number = 0;
  @StorageLink('overlayPositionY') overlayPositionY: number = 0;
  @StorageLink('overlayMode') @Watch('updateOverlayData') overlayMode: number = CommonConstants.OVERLAY_TYPE_HIDE;
  overlayData: any = null;

  private updateOverlayData() {
    this.overlayData = AppStorage.Get('overlayData');
    if (this.overlayMode == CommonConstants.OVERLAY_TYPE_HIDE) {
      this.overLayShow = false;
    } else {
      this.overLayShow = true;
    }
  }

  private showStateChange() {
    if (this.overLayShow) {
      this.showOverLay();
    } else {
      this.hideOverLay();
    }
  }

  private hideOverLay() {
    this.overlayMode = CommonConstants.OVERLAY_TYPE_HIDE;
    this.overLayAlpha = 0;
    this.overlayPositionX = 0;
    this.overlayPositionY = 0;
    this.withBlur = true;
  }

  private showOverLay() {
    animateTo({
      duration: 150,
      curve: Curve.EaseIn
    }, () => {
      this.overLayAlpha = 1;
    })
  }

  build() {
    Stack() {
      if (this.withBlur) {
        Column()
          .blur(CommonConstants.OVERLAY_BLUR_RADIUS)
          .width("100%")
          .height("100%")
      }
      if (this.overlayMode == CommonConstants.OVERLAY_TYPE_APP_ICON) {
        Column() {
          OverlayAppIcon({
            iconSize: this.overlayData.iconSize,
            appIcon: this.overlayData.appInfo.appIconId,
            icon: ResourceManager.getInstance()
              .getCachedAppIcon(this.overlayData.appInfo.appIconId, this.overlayData.appInfo.bundleName),
            bundleName: this.overlayData.appInfo.bundleName,
            badgeNumber: CommonConstants.BADGE_DISPLAY_HIDE
          })
        }
        .position({
          x: this.overlayPositionX,
          y: this.overlayPositionY,
        })
      } else if (this.overlayMode == CommonConstants.OVERLAY_TYPE_FOLDER) {
        Column() {
          FolderComponent({
            showFolderName: false,
            nameFontColor: this.overlayData.nameFontColor,
            folderNameHeight: 0,
            folderNameSize: 0,
            mFolderItem: this.overlayData.folderInfo,
            folderGridSize:this.overlayData.folderGridSize,
            appIconSize: this.overlayData.appIconSize,
            gridMargin: this.overlayData.gridMargin,
            gridGap: this.overlayData.gridGap,
            buildMenu: (folderItem) => {
              return new Array<MenuInfo>();
            }
          })
        }
        .position({
          x: this.overlayPositionX,
          y: this.overlayPositionY,
        })
        .height(this.overlayData.folderGridSize)
        .width(this.overlayData.folderGridSize)
      } else if (this.overlayMode == CommonConstants.OVERLAY_TYPE_CARD) {
        Column() {
          FormItemComponent({
            formItem: this.overlayData.formInfo,
            formItemWidth: this.overlayData.formWidth,
            formItemHeight: this.overlayData.formHeight,
            formNameHeight: 0,
            formNameSize: 0
          })
        }
        .position({
          x: this.overlayPositionX,
          y: this.overlayPositionY,
        })
        .height(this.overlayData.formHeight)
        .width(this.overlayData.formWidth)
      }
    }
    .width(StyleConstants.PERCENTAGE_100)
    .height(StyleConstants.PERCENTAGE_100)
    .visibility(this.overLayShow ? Visibility.Visible : Visibility.None)
    .opacity(this.overLayAlpha)
    .onClick(() => {
      this.hideOverLay();
    })
  }
}