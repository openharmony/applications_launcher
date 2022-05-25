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

import AppBubble from '../../../../../../../../common/src/main/ets/default/uicomponents/AppBubble.ets';
import CommonConstants from '../../../../../../../../common/src/main/ets/default/constants/CommonConstants';
import PresetStyleConstants from '../../../../../../../../common/src/main/ets/default/constants/PresetStyleConstants';
import CommonStyleConstants from '../../../../../../../../common/src/main/ets/default/constants/StyleConstants';
import ResourceManager from '../../../../../../../../common/src/main/ets/default/manager/ResourceManager';
import Log from '../../../../../../../../common/src/main/ets/default/utils/Log';
import FolderStyleConstants from '../constants/FolderStyleConstants';
import FolderViewModel from '../../viewmodel/FolderViewModel';
import TitleDescriptionComponent from './TitleDescriptionComponent.ets';
import BigFolderStyleConfig from '../BigFolderStyleConfig';

const TAG = 'FolderAppListDialog';
const FOLDER_ADD_APP_LIST_LENGTH = 16;

let folderViewModel: FolderViewModel;

@CustomDialog
export default struct FolderAppListDialog {
  @StorageLink('NavigationBarStatusValue') navigationBarStatusValue: boolean = false;
  @StorageLink('isPad') isPad: boolean = false;
  @StorageLink('allAppListForFolder') allAppInfoList: [] = [];
  @StorageLink('folderAppList') folderAppList: [] = [];
  @StorageLink('appListChecked') @Watch('onAppListChecked') appListChecked: any = [];
  @StorageLink('titleDescription') titleDescription: any = '';
  @State mNameFontColor: string = FolderStyleConstants.FOLDER_ADD_APP_FONT_COLOR;
  private mFolderStyleConfig: BigFolderStyleConfig;
  private mColumnsTemplate: string;
  private mDialogHeight: number = 0;
  private mGridHeight: number = 0;
  controller: CustomDialogController;
  cancel: () => void;
  confirm: (isDestory) => void;
  folderItem: any;
  addToString: string = '';

  private aboutToAppear(): void  {
    Log.showInfo(TAG, `aboutToAppear`);
    folderViewModel = FolderViewModel.getInstance();
    this.mFolderStyleConfig = folderViewModel.getFolderStyleConfig();
    folderViewModel.getFolderAddAppList(this.folderItem.folderId);
    folderViewModel.getFolderAppList(this.folderItem.folderId);
    this.appListChecked = this.folderAppList;
    ResourceManager.getInstance().getStringById($r('app.string.add_to').id, this.updateTitleDes.bind(this));
    this.mDialogHeight = folderViewModel.getDialogHeight(this.allAppInfoList);
    this.mGridHeight = this.mDialogHeight - FolderStyleConstants.DEFAULT_APP_ADD_TITLE_SIZE -
    FolderStyleConstants.DEFAULT_BUTTON_HEIGHT - FolderStyleConstants.DEFAULT_DIALOG_BOTTOM_MARGIN;
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
    for (let index = 0; index < folderViewModel.getAddListColumn(); index++) {
      columnsTemplate += '1fr ';
    }
    return columnsTemplate;
  }

  build() {
    Column(){
      Flex({direction: FlexDirection.Column, justifyContent: FlexAlign.Center}) {
        TitleDescriptionComponent({
          mTitleDescription: $titleDescription,
          mTextSize: this.mFolderStyleConfig.mAddFolderTitleSize})
        Column() {
          Grid() {
            ForEach(this.allAppInfoList, (item) => {
              GridItem() {
                Stack() {
                  Column() {
                    AppBubble({
                      iconSize: this.mFolderStyleConfig.mAddFolderIconSize,
                      nameSize: this.mFolderStyleConfig.mAddFolderTextSize,
                      nameFontColor: this.mNameFontColor,
                      nameHeight: this.mFolderStyleConfig.mAddFolderTextLines,
                      appName: item.appName,
                      bundleName: item.bundleName,
                      appIconId: item.appIconId,
                      appLabelId: item.appLabelId,
                      isSelect:false,
                      badgeNumber: CommonConstants.BADGE_DISPLAY_HIDE,
                      nameLines: this.mFolderStyleConfig.mAddFolderTextLines,
                      mPaddingTop: FolderStyleConstants.DEFAULT_APP_TITLE_MARGIN,
                      mIconNameMargin: this.mFolderStyleConfig.mIconNameMargin
                    })
                  }
                  Toggle({ type: ToggleType.Checkbox, isOn: item.checked })
                    .width(this.mFolderStyleConfig.mFolderToggleSize)
                    .height(this.mFolderStyleConfig.mFolderToggleSize)
                    .selectedColor(0x007DFF)
                    .position({x:-this.mFolderStyleConfig.mFolderToggleSize + this.mFolderStyleConfig.mAddFolderIconMarginHorizontal,
                      y:-this.mFolderStyleConfig.mFolderToggleSize/2})
                    .onChange((isOn: boolean) => {
                      Log.showDebug(TAG, `Toggle onChange this.isOn: ${isOn}`);
                      if (isOn) {
                        item.checked = true;
                        let appItem: any;
                        appItem = item;
                        appItem.area = [1, 1];
                        appItem.type = CommonConstants.TYPE_APP;
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
              .height(this.mFolderStyleConfig.mAddFolderItemSize)
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
              .fontColor(CommonStyleConstants.BUTTON_FONT_COLOR)
          }
          .flexGrow(1)
          .backgroundColor(CommonStyleConstants.DEFAULT_BG_COLOR)
          .width(FolderStyleConstants.DEFAULT_BUTTON_WIDTH)
          .height(FolderStyleConstants.DEFAULT_BUTTON_HEIGHT)
          .onClick(() => {
            this.controller.close();
            this.cancel()
          })

          Divider()
            .vertical(true)
            .color(CommonStyleConstants.DEFAULT_DIVIDER_COLOR)
            .height(FolderStyleConstants.DEFAULT_DIVIDER_HEIGHT)

          Button() {
            Text($r('app.string.confirm_dialog'))
              .fontSize(this.mFolderStyleConfig.mAddFolderButtonSize)
              .fontColor(CommonStyleConstants.BUTTON_FONT_COLOR)
          }
          .flexGrow(1)
          .backgroundColor(CommonStyleConstants.DEFAULT_BG_COLOR)
          .height(FolderStyleConstants.DEFAULT_BUTTON_HEIGHT)
          .width(FolderStyleConstants.DEFAULT_BUTTON_WIDTH)
          .onClick(() => {
            Log.showDebug(TAG, `Dialog confirm start`);
            folderViewModel.updateFolderAppList(this.appListChecked, this.folderItem);
            let isDestory = false;
            if (this.folderItem.layoutInfo[0].length < 2) {
              isDestory = true;
            } else {
              folderViewModel.refreshFolder(this.folderItem);
            }
            this.controller.close();
            this.confirm(isDestory);
            Log.showDebug(TAG, `Dialog confirm end`);
          })
        }
      }
      .backgroundColor(Color.White)
      .opacity(FolderStyleConstants.DEFAULT_DIALOG_OPACITY)
      .padding({
        bottom: FolderStyleConstants.DEFAULT_DIALOG_BOTTOM_MARGIN
      })
      .border({
        radius: CommonStyleConstants.DEFAULT_DIALOG_RADIUS
      })
      .margin({
        bottom: FolderStyleConstants.DEFAULT_DIALOG_BOTTOM_MARGIN
      })
      .width(this.mFolderStyleConfig.mAddFolderDialogWidth)
      .height(this.mDialogHeight)
      if (!this.navigationBarStatusValue){
        Stack().width(this.mFolderStyleConfig.mAddFolderDialogWidth).height(FolderStyleConstants.DEFAULT_APP_GRID_TOGGLE_SIZE)
      }
    }.width('100%').height('100%').justifyContent(this.isPad ? FlexAlign.Center : FlexAlign.End)
  }
}
