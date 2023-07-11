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
import { AppIcon } from '@ohos/common';
import { AppName } from '@ohos/common';
import { CommonConstants } from '@ohos/common';
import { StyleConstants } from '@ohos/common';
import { ResourceManager } from '@ohos/common';
import { BigFolderStyleConfig } from '../BigFolderStyleConfig';
import TitleDescriptionComponent from './TitleDescriptionComponent';
import { BigFolderViewModel } from '../../viewmodel/BigFolderViewModel';
import { BigFolderStyleConstants } from '../constants/BigFolderStyleConstants';

const TAG = 'FolderAppListDialog';

@CustomDialog
export default struct FolderAppListDialog {
  @StorageLink('NavigationBarStatusValue') navigationBarStatusValue: boolean = false;
  @StorageLink('isPad') isPad: boolean = false;
  @StorageLink('allAppListForFolder') allAppInfoList: [] = [];
  @StorageLink('folderAppList') folderAppList: [] = [];
  @StorageLink('appListChecked') @Watch('onAppListChecked') appListChecked: any = [];
  @StorageLink('titleDescription') titleDescription: any = '';
  @State mNameFontColor: string = BigFolderStyleConstants.FOLDER_ADD_APP_FONT_COLOR;
  private mBigFolderViewModel: BigFolderViewModel;
  private mFolderStyleConfig: BigFolderStyleConfig;
  private mColumnsTemplate: string;
  private mDialogHeight: number = 0;
  private mGridHeight: number = 0;
  controller: CustomDialogController;
  cancel: () => void;
  confirm: (isDestory) => void;
  folderItem: any;
  addToString: string = '';

  aboutToAppear(): void  {
    Log.showInfo(TAG, `aboutToAppear`);
    this.mBigFolderViewModel = BigFolderViewModel.getInstance();
    this.mFolderStyleConfig = this.mBigFolderViewModel.getFolderStyleConfig();
    this.mBigFolderViewModel.getFolderAddAppList(this.folderItem.folderId);
    this.mBigFolderViewModel.getFolderAppList(this.folderItem.folderId);
    this.appListChecked = this.folderAppList;
    ResourceManager.getInstance().getStringById($r('app.string.add_to').id, this.updateTitleDes.bind(this));
    this.mDialogHeight = this.mBigFolderViewModel.getDialogHeight(this.allAppInfoList);
    this.mGridHeight = this.mDialogHeight - BigFolderStyleConstants.DEFAULT_APP_ADD_TITLE_SIZE -
    BigFolderStyleConstants.DEFAULT_BUTTON_HEIGHT - BigFolderStyleConstants.DEFAULT_DIALOG_BOTTOM_MARGIN;
  }

  aboutToDisappear(): void {
    this.controller = null;
    this.cancel = null;
    this.confirm = null;
  }

  private updateTitleDes(value: string) {
    this.addToString = value;
    this.onAppListChecked();
  }

  private onAppListChecked() {
    this.titleDescription = `${this.addToString}${this.folderItem.folderName}(${this.appListChecked.length}/${this.allAppInfoList.length})`;
    AppStorage.SetOrCreate('titleDescription', this.titleDescription);
  }

  private getColumnsTemplate() {
    let columnsTemplate = '';
    for (let index = 0; index < this.mBigFolderViewModel.getAddListColumn(); index++) {
      columnsTemplate += '1fr ';
    }
    return columnsTemplate;
  }

  build() {
    Column(){
      Flex({direction: FlexDirection.Column, justifyContent: FlexAlign.Center}) {
        TitleDescriptionComponent({
          mTextSize: this.mFolderStyleConfig.mAddFolderTitleSize})
        Column() {
          Grid() {
            ForEach(this.allAppInfoList, (item) => {
              GridItem() {
                Stack() {
                  Column() {
                    Column() {
                      AppIcon({
                        iconSize: this.mFolderStyleConfig.mAddFolderIconSize,
                        iconId: item.appIconId,
                        bundleName: item.bundleName,
                        moduleName: item.moduleName,
                        icon: ResourceManager.getInstance().getCachedAppIcon(item.appIconId, item.bundleName, item.moduleName),
                        badgeNumber: CommonConstants.BADGE_DISPLAY_HIDE,
                      })
                      AppName({
                        nameHeight: this.mFolderStyleConfig.mAddFolderTextLines,
                        nameSize: this.mFolderStyleConfig.mAddFolderTextSize,
                        nameFontColor: this.mNameFontColor,
                        bundleName: item.bundleName,
                        moduleName: item.moduleName,
                        appName: item.appName,
                        labelId: item.appLabelId,
                        nameLines: this.mFolderStyleConfig.mAddFolderTextLines,
                        marginTop: BigFolderStyleConstants.DEFAULT_APP_TITLE_MARGIN
                      })
                    }
                    .width(StyleConstants.PERCENTAGE_100)
                    .height(StyleConstants.PERCENTAGE_100)
                    .backgroundColor(StyleConstants.DEFAULT_TRANSPARENT_COLOR)
                    .borderRadius(StyleConstants.DEFAULT_0)
                    .padding({ top: BigFolderStyleConstants.DEFAULT_APP_TITLE_MARGIN })
                  }
                  Toggle({ type: ToggleType.Checkbox, isOn: item.checked })
                    .width(this.mFolderStyleConfig.mFolderToggleSize)
                    .height(this.mFolderStyleConfig.mFolderToggleSize)
                    .padding(0)
                    .selectedColor(0x007DFF)
                    .position({x: 0,
                      y: 0})
                    .onChange((isOn: boolean) => {
                      Log.showDebug(TAG, `Toggle onChange this.isOn: ${isOn}`);
                      if (isOn) {
                        item.checked = true;
                        let appItem: any;
                        appItem = item;
                        appItem.area = [1, 1];
                        appItem.typeId = CommonConstants.TYPE_APP;
                        this.appListChecked.push(appItem);
                      } else {
                        item.checked = false;
                        let index = this.appListChecked.indexOf(item);
                        this.appListChecked.splice(index, 1);
                      }
                      AppStorage.SetOrCreate('appListChecked', this.appListChecked);
                    })
                }
              }
              .width(this.mFolderStyleConfig.mAddFolderItemSize)
              .height(this.mFolderStyleConfig.mAddFolderIconSize + this.mFolderStyleConfig.mAddFolderTextLines + this.mFolderStyleConfig.mFolderToggleSize + this.mFolderStyleConfig.mAddFolderGridMargin)
            }, (item) => JSON.stringify(item))
          }
          .columnsTemplate(this.getColumnsTemplate())
          .columnsGap(this.mFolderStyleConfig.mAddFolderGridGap)
          .rowsGap(this.mFolderStyleConfig.mAddFolderGridGap)
          .margin( this.mFolderStyleConfig.mAddFolderGridMargin )
        }
        .width(this.mFolderStyleConfig.mAddFolderDialogWidth)
        .height(this.mGridHeight)

        Flex({ alignItems: ItemAlign.Center, justifyContent: FlexAlign.SpaceAround }) {
          Button() {
            Text($r('app.string.cancel_dialog'))
              .fontSize(this.mFolderStyleConfig.mAddFolderButtonSize)
              .fontColor(StyleConstants.BUTTON_FONT_COLOR)
          }
          .flexGrow(1)
          .backgroundColor(StyleConstants.DEFAULT_BG_COLOR)
          .width(BigFolderStyleConstants.DEFAULT_BUTTON_WIDTH)
          .height(BigFolderStyleConstants.DEFAULT_BUTTON_HEIGHT)
          .onClick(() => {
            this.controller.close();
            this.cancel()
          })

          Divider()
            .vertical(true)
            .color(StyleConstants.DEFAULT_DIVIDER_COLOR)
            .height(BigFolderStyleConstants.DEFAULT_DIVIDER_HEIGHT)

          Button() {
            Text($r('app.string.confirm_dialog'))
              .fontSize(this.mFolderStyleConfig.mAddFolderButtonSize)
              .fontColor(StyleConstants.BUTTON_FONT_COLOR)
          }
          .flexGrow(1)
          .backgroundColor(StyleConstants.DEFAULT_BG_COLOR)
          .height(BigFolderStyleConstants.DEFAULT_BUTTON_HEIGHT)
          .width(BigFolderStyleConstants.DEFAULT_BUTTON_WIDTH)
          .onClick(() => {
            Log.showDebug(TAG, `Dialog confirm start`);
            this.mBigFolderViewModel.updateFolderAppList(this.appListChecked, this.folderItem);
            let isDestory = false;
            if (this.folderItem.layoutInfo[0].length < 2) {
              isDestory = true;
            } else {
              this.mBigFolderViewModel.refreshFolder(this.folderItem);
            }
            this.controller.close();
            this.confirm(isDestory);
            Log.showDebug(TAG, `Dialog confirm end`);
          })
        }
      }
      .backgroundColor(Color.White)
      .opacity(BigFolderStyleConstants.DEFAULT_DIALOG_OPACITY)
      .padding({
        bottom: BigFolderStyleConstants.DEFAULT_DIALOG_BOTTOM_MARGIN
      })
      .border({
        radius: StyleConstants.DEFAULT_DIALOG_RADIUS
      })
      .margin({
        bottom: BigFolderStyleConstants.DEFAULT_DIALOG_BOTTOM_MARGIN
      })
      .width(this.mFolderStyleConfig.mAddFolderDialogWidth)
      .height(this.mDialogHeight)
      if (!this.navigationBarStatusValue){
        Stack().width(this.mFolderStyleConfig.mAddFolderDialogWidth).height(BigFolderStyleConstants.DEFAULT_APP_GRID_TOGGLE_SIZE)
      }
    }
    .width('100%')
    .height('100%')
    .justifyContent(this.isPad ? FlexAlign.Center : FlexAlign.End)
  }
}
