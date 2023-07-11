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

import { Log } from '../utils/Log';
import { SettingsModel } from '../model/SettingsModel';
import { StyleConstants } from '../constants/StyleConstants';
import { CommonConstants } from '../constants/CommonConstants';
import { ResourceManager } from '../manager/ResourceManager';
import { PresetStyleConstants } from '../constants/PresetStyleConstants';
import { AppIcon } from './AppIcon';
import { AppName } from './AppName';
import { AppMenu } from './AppMenu';

const TAG = 'FolderComponent';

@Component
export struct FolderComponent {
  @StorageLink('openFolderStatus') @Watch('updateFolderAnimate') openFolderStatus: number = 1;
  @State folderAnimateData: {
    folderId: string,
    isOpenFolder: boolean,
  } = { folderId: '', isOpenFolder: false };
  @State folderPositionX: number = 0;
  @State folderPositionY: number = 0;
  @State folderItemPositionX: number = 0;
  @State folderItemPositionY: number = 0;
  @State animateFolderPositionX: number = 0;
  @State animateFolderPositionY: number = 0;
  @State animateOpacity: number = 1.0;
  @State animateScale: number = 1.0;
  @State showFolderName: boolean = true;
  @State folderNameHeight: number = 0;
  @State folderNameSize: number = 0;
  @State nameFontColor: string = '';
  @State appIconSize: number = 0;
  @State superposeIconVisible: boolean = false;
  @State isHover: boolean = false;
  mPaddingTop: number = StyleConstants.DEFAULT_10;
  folderGridSize: number = StyleConstants.DEFAULT_FOLDER_GRID_SIZE;
  gridMargin: number = StyleConstants.DEFAULT_FOLDER_GRID_MARGIN;
  gridGap: number = StyleConstants.DEFAULT_FOLDER_GRID_GAP;
  badgeNumber: number = 0;
  private mSettingsModel: SettingsModel;
  private isPad: boolean = false;
  private mFolderItem: any;
  private mShowAppList: any = [];
  private mSuperposeAppList: any = [];
  onAppIconClick?: Function = null;
  onOpenFolderClick?: Function = null;
  onFolderTouch?: Function = null;
  onGetPosition?: Function = null;
  buildMenu: Function = null;
  folderNameLines: number = PresetStyleConstants.DEFAULT_APP_NAME_LINES;
  iconNameMargin: number = PresetStyleConstants.DEFAULT_ICON_NAME_GAP;
  isSelect?: boolean;
  dragStart: Function;

  aboutToAppear(): void  {
    Log.showInfo(TAG, `aboutToAppear start`);
    this.updateShowList();
    this.mSettingsModel = SettingsModel.getInstance();
    if (this.mSettingsModel.getDevice() != "phone") {
      this.isPad = true;
    }
  }

  aboutToDisappear(): void {
    this.onAppIconClick = null;
    this.onOpenFolderClick = null;
    this.onFolderTouch = null;
    this.onGetPosition = null;
    this.buildMenu = null;
    this.dragStart = null;
  }

  updateShowList(): void {
    if (this.mFolderItem.layoutInfo[0].length > CommonConstants.FOLDER_STATIC_SHOW_LENGTH) {
      this.mShowAppList = this.mFolderItem.layoutInfo[0].slice(0, CommonConstants.FOLDER_STATIC_SHOW_LENGTH);
    } else {
      this.mShowAppList = this.mFolderItem.layoutInfo[0];
    }

    let showLength = CommonConstants.FOLDER_STATIC_SHOW_LENGTH - CommonConstants.FOLDER_STATIC_SUPERPOSEAPP_LENGTH;
    if (this.mShowAppList.length > showLength) {
      this.mSuperposeAppList = this.mShowAppList.slice(showLength);
      this.mShowAppList = this.mShowAppList.slice(0, showLength);
      this.superposeIconVisible = true;
    }

    let length = this.mSuperposeAppList.length;
    if (length > CommonConstants.FOLDER_STATIC_SUPERPOSEAPP_LENGTH) {
      this.mSuperposeAppList = this.mSuperposeAppList.slice(0, CommonConstants.FOLDER_STATIC_SUPERPOSEAPP_LENGTH);
    } else {
      for (let i = 0; i < (CommonConstants.FOLDER_STATIC_SUPERPOSEAPP_LENGTH - length); i++) {
        this.mSuperposeAppList.push({ 'isEmpty': true });
      }
    }
    this.mSuperposeAppList = this.mSuperposeAppList.reverse();
    this.mSuperposeAppList[0].alignContent = Alignment.TopStart;
    this.mSuperposeAppList[1].alignContent = Alignment.Center;
    this.mSuperposeAppList[2].alignContent = Alignment.BottomEnd;

    Log.showInfo(TAG, `superposeIconVisible:${this.superposeIconVisible}`);
    Log.showInfo(TAG, `FolderItem.layoutInfo[0].length:${this.mFolderItem.layoutInfo[0].length}`);
    Log.showInfo(TAG, `SuperposeAppList length:${this.mSuperposeAppList.length}`);
  }

  @Builder MenuBuilder() {
    Column() {
      AppMenu({
        menuInfoList: this.buildMenu(this.mFolderItem),
      })
    }
    .alignItems(HorizontalAlign.Center)
    .justifyContent(FlexAlign.Center)
    .width(StyleConstants.CONTEXT_MENU_WIDTH)
  }

  private updateFolderAnimate() {
    Log.showInfo(TAG, `updateFolderAnimate start`);
    if (this.openFolderStatus == 0) {
      this.folderAnimateData = AppStorage.Get('folderAnimateData');
      if (this.mFolderItem.folderId === this.folderAnimateData.folderId &&
      this.folderAnimateData.isOpenFolder &&
      this.folderAnimateData.folderId != '' &&
      this.animateOpacity != 1.0 &&
      this.animateScale != 1.0) {
        this.folderAnimateData.isOpenFolder = false;
        AppStorage.SetOrCreate('folderAnimateData', this.folderAnimateData);
        Log.showInfo(TAG, `updateFolderAnimate show`);
        this.showAnimate(1.0, 1.0, false);
      }
    }
  }

  private showAnimate(animateScale: number, animateOpacity: number, isMoveFolder: boolean) {
    let positionX = 0;
    let positionY = 0;
    if (this.onGetPosition) {
      this.onGetPosition(this.getPosition.bind(this));
      if (isMoveFolder) {
        positionX = this.animateFolderPositionX;
        positionY = this.animateFolderPositionY;
      }
    }
    animateTo({
      duration: 250,
      tempo: 0.5,
      curve: Curve.Friction,
      delay: 0,
      iterations: 1,
      playMode: PlayMode.Normal,
      onFinish: () => {
        Log.showInfo(TAG, ` onFinish x: ${this.folderPositionX}, y: ${this.folderPositionY}`);
      }
    }, () => {
      this.animateScale = animateScale;
      this.animateOpacity = animateOpacity;
      this.folderPositionX = positionX;
      this.folderPositionY = positionY;
    })
  }

  public getPosition(x: number, y: number): void  {
    this.folderItemPositionX = x;
    this.folderItemPositionY = y;
    let screenWidth: number = AppStorage.Get('screenWidth');
    let screenHeight: number = AppStorage.Get('screenHeight');
    this.animateFolderPositionX = (screenWidth - this.folderGridSize * 1.5) / 2 - this.folderItemPositionX;
    this.animateFolderPositionY = (screenHeight - this.folderGridSize * 1.5) / 2 - this.folderItemPositionY;
    Log.showInfo(TAG, `getPosition animatePosition x: ${this.animateFolderPositionX}, y: ${this.animateFolderPositionY}`);
  }

  build() {
    Column() {
      Column() {
        Badge({
          count: this.badgeNumber,
          maxCount: StyleConstants.MAX_BADGE_COUNT,
          style: {
            color: StyleConstants.DEFAULT_FONT_COLOR,
            fontSize: StyleConstants.DEFAULT_BADGE_FONT_SIZE,
            badgeSize: (this.badgeNumber > 0 ? StyleConstants.DEFAULT_BADGE_SIZE : 0),
            badgeColor: Color.Red,
          }
        }) {
          Stack() {
            Column() {
            }
            .backgroundColor(Color.White)
            .borderRadius(24)
            .opacity(0.5)
            .height(this.folderGridSize)
            .width(this.folderGridSize)

            Grid() {
              ForEach(this.mShowAppList, (item) => {
                GridItem() {
                  AppIcon({
                    iconSize: this.appIconSize,
                    iconId: item.appIconId,
                    icon: ResourceManager.getInstance().getCachedAppIcon(item.appIconId, item.bundleName, item.moduleName),
                    bundleName: item.bundleName,
                    moduleName: item.moduleName,
                    badgeNumber: item.badgeNumber
                  })
                }
                .height(StyleConstants.PERCENTAGE_100)
                .width(StyleConstants.PERCENTAGE_100)
                .onClick((event: ClickEvent) => {
                  if (this.onAppIconClick) {
                    this.onAppIconClick(event, item);
                  }
                })
              }, (item) => JSON.stringify(item))

              if (this.mSuperposeAppList.length > 0) {
                GridItem() {
                  Stack() {
                    ForEach(this.mSuperposeAppList, (item) => {
                      Stack({ alignContent: item.alignContent }) {
                        if (item.isEmpty) {
                          Column() {
                            Column() {
                            }
                            .backgroundColor(Color.White)
                            .borderRadius(10)
                            .opacity(0.5)
                            .width(StyleConstants.PERCENTAGE_100)
                            .height(StyleConstants.PERCENTAGE_100)
                          }
                          .alignItems(HorizontalAlign.Start)
                          .width(StyleConstants.PERCENTAGE_80)
                          .height(StyleConstants.PERCENTAGE_80)
                        } else {
                          Column() {
                            AppIcon({
                              iconSize: this.appIconSize * StyleConstants.PERCENTAGE_80_number,
                              iconId: item.appIconId,
                              icon: ResourceManager.getInstance().getCachedAppIcon(item.appIconId, item.bundleName, item.moduleName),
                              bundleName: item.bundleName,
                              moduleName: item.moduleName,
                              badgeNumber: item.badgeNumber
                            })
                          }
                          .width(StyleConstants.PERCENTAGE_80)
                          .height(StyleConstants.PERCENTAGE_80)
                          .alignItems(HorizontalAlign.Start)
                        }
                      }
                      .width(StyleConstants.PERCENTAGE_100)
                      .height(StyleConstants.PERCENTAGE_100)
                    }, (item) => JSON.stringify(item))
                  }
                  .width(this.isPad ?
                    StyleConstants.DEFAULT_FOLDER_APP_ITEM_WIDTH_SMALL :
                    StyleConstants.DEFAULT_FOLDER_APP_ITEM_WIDTH)
                  .height(this.isPad ?
                    StyleConstants.DEFAULT_FOLDER_APP_ITEM_WIDTH_SMALL :
                    StyleConstants.DEFAULT_FOLDER_APP_ITEM_WIDTH)
                }
                .visibility(this.superposeIconVisible ? Visibility.Visible : Visibility.Hidden)
                .width(StyleConstants.PERCENTAGE_100)
                .height(StyleConstants.PERCENTAGE_100)
                .onClick((event: ClickEvent) => {
                  Log.showInfo(TAG, `last item onClick`);
                  this.showAnimate(1.5, 0, true);
                  if (this.onOpenFolderClick) {
                    this.folderAnimateData.folderId = this.mFolderItem.folderId;
                    this.folderAnimateData.isOpenFolder = true;
                    AppStorage.SetOrCreate('folderAnimateData', this.folderAnimateData);
                    this.onOpenFolderClick(event, this.mFolderItem);
                  }
                })
              }
            }
            .onDragStart((event: DragEvent) => {
              return this.dragStart(event);
            })
            .bindContextMenu(this.MenuBuilder, ResponseType.LongPress)
            .bindContextMenu(this.MenuBuilder, ResponseType.RightClick)
            .padding(this.gridMargin)
            .columnsTemplate('1fr 1fr 1fr')
            .rowsTemplate('1fr 1fr 1fr')
            .columnsGap(this.gridGap)
            .rowsGap(this.gridGap)
            .onClick((event: ClickEvent) => {
              Log.showInfo(TAG, `grid onClick`);
              this.showAnimate(1.5, 0, true);
              if (this.onOpenFolderClick) {
                this.folderAnimateData.folderId = this.mFolderItem.folderId;
                this.folderAnimateData.isOpenFolder = true;
                AppStorage.SetOrCreate('folderAnimateData', this.folderAnimateData);
                this.onOpenFolderClick(event, this.mFolderItem);
              }
            })
            .onTouch((event: TouchEvent) => {
              Log.showInfo(TAG, "onTouch start");
              if (this.onFolderTouch) {
                this.onFolderTouch(event, this.mFolderItem);
              }
              Log.showInfo(TAG, "onTouch end");
            })
          }
          .height(StyleConstants.PERCENTAGE_100)
          .width(StyleConstants.PERCENTAGE_100)
          .onHover((isHover: boolean) => {
            Log.showInfo(TAG, `onHover isHover:${isHover}`);
            this.isHover = isHover;
          })
        }
        .height(this.folderGridSize)
        .width(this.folderGridSize)

        Column() {
          AppName({
            nameHeight: this.folderNameHeight,
            nameSize: this.folderNameSize,
            nameFontColor: this.nameFontColor,
            appName: this.mFolderItem.folderName,
            nameLines: this.folderNameLines,
            marginTop: this.iconNameMargin
          })
        }
        .visibility(this.showFolderName ? Visibility.Visible : Visibility.Hidden)
      }
      .width(StyleConstants.PERCENTAGE_100)
      .height(StyleConstants.PERCENTAGE_100)
      .offset({ x: this.folderPositionX, y: this.folderPositionY })
      .scale({ x: this.isHover ? 1.05 : this.animateScale, y: this.isHover ? 1.05 : this.animateScale })
      .opacity(this.animateOpacity)
    }
    .width(this.isSelect ? this.folderGridSize + StyleConstants.DEFAULT_40 : StyleConstants.PERCENTAGE_100)
    .height(this.isSelect ? this.folderGridSize + StyleConstants.DEFAULT_40 : StyleConstants.PERCENTAGE_100)
    .backgroundColor(this.isSelect ? StyleConstants.DEFAULT_BROAD_COLOR : StyleConstants.DEFAULT_TRANSPARENT_COLOR)
    .borderRadius(this.isSelect ? StyleConstants.DEFAULT_15 : StyleConstants.DEFAULT_0)
    .padding(this.isSelect ? { left: StyleConstants.DEFAULT_20,
                               right: StyleConstants.DEFAULT_20, top: this.mPaddingTop + StyleConstants.DEFAULT_10 } : { top: this.mPaddingTop })
  }
}