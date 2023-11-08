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

import { Log , CheckEmptyUtils, AppItemInfo, FolderItemInfo, CardItemInfo } from '@ohos/common';
import { Trace } from '@ohos/common';
import { EventConstants } from '@ohos/common';
import { StyleConstants } from '@ohos/common';
import { CommonConstants } from '@ohos/common';
import { PresetStyleConstants } from '@ohos/common';
import { AppName } from '@ohos/common/component';
import { AppBubble } from '@ohos/common/component';
import { UninstallDialog } from '@ohos/common/component';
import { FormManagerDialog } from '@ohos/common/component';
import { ResourceManager } from '@ohos/common';
import { localEventManager } from '@ohos/common';
import { InputMethodManager } from '@ohos/common';
import { BigFolderModel } from '../model/BigFolderModel';
import { BigFolderViewModel } from '../viewmodel/BigFolderViewModel';
import { BigFolderStyleConfig } from '../common/BigFolderStyleConfig';
import { BigFolderConstants } from '../common/constants/BigFolderConstants';
import { BigFolderStyleConstants } from '../common/constants/BigFolderStyleConstants';
import FolderAppListDialog from '../common/uicomponents/FolderAppListDialog';
import BigFolderStartAppHandler from '../common/BigFolderStartAppHandler';
import { PageDesktopViewModel } from '../../../../../../pagedesktop/src/main/ets/default/viewmodel/PageDesktopViewModel';

const TAG = 'FolderOpenComponent';
const DOUBLE_CLICK_COUNT = 2;

interface FolderOpenLayoutTable {
  id: number;
  layout: string;
  name: string;
  row: number;
  column: number;
  checked: boolean;
}

interface FolderInfo {
  layoutInfo: AppItemInfo[][];
  enterEditing: boolean;
  folderName: string;
  folderId: string;
}

const FOLDER_CLOSE_DELAY = 500;
let mBigFolderViewModel: BigFolderViewModel;
let mBigFolderStyleConfig: BigFolderStyleConfig;
let mFolderModel: BigFolderModel;
let mAppNameHeight = BigFolderStyleConstants.DEFAULT_APP_NAME_HEIGHT;
let mAppItemWidth = BigFolderStyleConstants.DEFAULT_APP_ITEM_WIDTH;
let mAppNameSize = BigFolderStyleConstants.DEFAULT_APP_NAME_SIZE;
let mAppIconSize = BigFolderStyleConstants.DEFAULT_APP_ITEM_WIDTH;
let mAddIconSize = BigFolderStyleConstants.DEFAULT_ADD_APP_SIZE;
let mNameLines = PresetStyleConstants.DEFAULT_APP_NAME_LINES;
let mIconNameMargin = PresetStyleConstants.DEFAULT_ICON_NAME_GAP;
let mSwiperHeight = 0;
let mGridWidth = 0;
let mGridHeight = 0;
let mGridPadding = 0;
let mGridMarginTop = 0;
let mFolderOpenTitle = 0;
let mGridIconTopPadding = 0;
let isPad = false;
let mBigFolderStartAppHandler: BigFolderStartAppHandler;

@Component
export struct FolderOpenComponent {
  @State withBlur: boolean = true;
  @StorageLink('openFolderPageIndex') PageIndex: number = 0;
  @StorageLink('openFolderStatus') @Watch('updateFolderData') openFolderStatus: number = BigFolderConstants.OPEN_FOLDER_STATUS_CLOSE;
  @State overLayAlpha: number = 0.3;
  @State isRenaming: boolean = false;
  @StorageLink('openFolderData') mFolderInfo: FolderInfo = { layoutInfo: [], enterEditing: false, folderName: '', folderId: '' };
  @State newFolderName: string = '';

  aboutToAppear(): void {
    Log.showInfo(TAG, `aboutToAppear start`);
    mBigFolderViewModel = BigFolderViewModel.getInstance();
    mBigFolderStartAppHandler = BigFolderStartAppHandler.getInstance();
    this.updateStyle();
    // Folder dialog data preloading
    mBigFolderViewModel.getFolderAddAppList(this.mFolderInfo.folderId);
    mBigFolderViewModel.getFolderAppList(this.mFolderInfo.folderId);
    this.newFolderName = this.mFolderInfo.folderName;
    Log.showInfo(TAG, `aboutToAppear end`);
  }

  private updateStyle() {
    isPad = mBigFolderViewModel.getIsPad();
    mBigFolderStyleConfig = mBigFolderViewModel.getFolderStyleConfig();
    mAppItemWidth = mBigFolderStyleConfig.mOpenFolderAppSize;
    mAppIconSize = mBigFolderStyleConfig.mOpenFolderIconSize;
    mAddIconSize = mBigFolderStyleConfig.mOpenFolderAddIconSize;
    mAppNameSize = mBigFolderStyleConfig.mOpenFolderAppNameSize;
    mAppNameHeight = mBigFolderStyleConfig.mOpenFolderAppNameHeight;
    mGridWidth = mBigFolderStyleConfig.mOpenFolderGridWidth;
    mGridHeight = mBigFolderStyleConfig.mOpenFolderGridHeight;
    mSwiperHeight = mBigFolderStyleConfig.mOpenFolderSwiperHeight;
    mGridPadding = mBigFolderStyleConfig.mOpenFolderGridPadding;
    mNameLines = mBigFolderStyleConfig.mNameLines;
    mIconNameMargin = mBigFolderStyleConfig.mIconNameMargin;
    mGridMarginTop = mBigFolderStyleConfig.mFolderOpenMargin;
    mFolderOpenTitle = mBigFolderStyleConfig.mFolderOpenTitle;
    mGridIconTopPadding = mBigFolderStyleConfig.mOpenFolderGridIconTopPadding;
  }

  private updateFolderData() {
    Log.showDebug(TAG, `updateFolderData start`);
    if (this.openFolderStatus == BigFolderConstants.OPEN_FOLDER_STATUS_STATIC) {
      return;
    }
    if (this.openFolderStatus == BigFolderConstants.OPEN_FOLDER_STATUS_CLOSE) {
      this.hideOpenFolder();
      mBigFolderViewModel.delAddIcon(this.mFolderInfo);
      PageDesktopViewModel.getInstance().pagingFiltering();
      this.newFolderName = '';
      return;
    } else {
      this.isRenaming = this.mFolderInfo.enterEditing;
      this.newFolderName = this.mFolderInfo.folderName;
      this.mFolderInfo = mBigFolderViewModel.addAddIcon(this.mFolderInfo);
      this.showOpenFolder();
    }
    AppStorage.setOrCreate('openFolderStatus', BigFolderConstants.OPEN_FOLDER_STATUS_STATIC);
    AppStorage.setOrCreate('isDraging', false);
    Log.showDebug(TAG, `updateFolderData end`);
  }

  private hideOpenFolder() {
    Log.showDebug(TAG, `hideOpenFolder start`);
    this.isRenaming = false;
    this.withBlur = false;
    this.openFolderStatus = BigFolderConstants.OPEN_FOLDER_STATUS_CLOSE;
    this.showAnimate(0.3, Curve.EaseOut);
    Log.showDebug(TAG, `hideOpenFolder end`);
  }

  private showOpenFolder() {
    this.updateStyle();
    this.withBlur = true;
    this.showAnimate(1, Curve.EaseIn);
  }

  private showAnimate(overLayAlpha: number, curveValue: Curve) {
    animateTo({
      duration: 250,
      tempo: 0.5,
      curve: curveValue,
      delay: 0,
      iterations: 1,
      playMode: PlayMode.Normal,
    }, () => {
      this.overLayAlpha = overLayAlpha;
      Trace.end(Trace.CORE_METHOD_OPEN_FOLDER);
    })
  }

  build() {
    Stack() {
      if (this.withBlur) {
        Column()
          .blur(CommonConstants.OVERLAY_BLUR_RADIUS)
          .width(BigFolderStyleConstants.PERCENTAGE_100)
          .height(BigFolderStyleConstants.PERCENTAGE_100)
      }

      Flex({ direction: FlexDirection.Column, alignItems: ItemAlign.Center }) {
        Stack({ alignContent: Alignment.Center }) {
          if (this.isRenaming) {
            Row() {
              TextInput({ text: this.newFolderName })
                .maxLength(CommonConstants.FOLDER_NAME_MAX_LENGTH)
                .caretColor(Color.White)
                .fontColor(Color.White)
                .fontSize(BigFolderStyleConstants.DEFAULT_OPEN_FOLDER_NAME_SIZE)
                .fontWeight(FontWeight.Normal)
                .layoutWeight(1)
                .backgroundColor('rgba(255,255,255,0)')
                .enterKeyType(EnterKeyType.Done)
                .onSubmit((enterKey: EnterKeyType) => {
                  Log.showDebug(TAG, `textinput done: ${enterKey} `)
                  this.isRenaming = true;
                  this.saveText();
                })
                .onChange((text: string) => {
                  Log.showDebug(TAG, `textinput: ` + text);
                  this.newFolderName = text;
                })
              Image(BigFolderStyleConstants.DEFAULT_CANCEL_APP_IMAGE)
                .width(BigFolderStyleConstants.DEFAULT_OPEN_FOLDER_CANCEL_SIZE)
                .height(BigFolderStyleConstants.DEFAULT_OPEN_FOLDER_CANCEL_SIZE)
                .onClick(() => {
                  this.newFolderName = ''
                })
            }
            .height(BigFolderStyleConstants.DEFAULT_OPEN_FOLDER_TEXTAREA_HEIGHT)
            .width(BigFolderStyleConstants.PERCENTAGE_100)
            .borderRadius(BigFolderStyleConstants.DEFAULT_OPEN_FOLDER_CANCEL_SIZE)
            .padding({
              left: BigFolderStyleConstants.DEFAULT_BUTTON_HEIGHT,
              right: BigFolderStyleConstants.DEFAULT_DIALOG_BOTTOM_MARGIN
            })
            .backgroundColor('rgba(255,255,255,0.3)')
          } else {
            Text(this.mFolderInfo.folderName) {
            }
            .fontSize(BigFolderStyleConstants.DEFAULT_OPEN_FOLDER_NAME_SIZE)
            .fontColor(Color.White)
            .textAlign(TextAlign.Center)
            .maxLines(1)
            .width(BigFolderStyleConstants.PERCENTAGE_100)
            .onClick(() => {
              Log.showDebug(TAG, 'title click');
              this.isRenaming = true;
              this.newFolderName = this.mFolderInfo.folderName
            })
          }
        }
        .margin({ top: mFolderOpenTitle })
        .width(mGridWidth)
        .height(mGridMarginTop)

        Stack() {
          Swiper() {
            ForEach(this.mFolderInfo.layoutInfo, (item: AppItemInfo[]) => {
              FolderSwiperPage({
                mAppInfo: item,
                isRenaming: $isRenaming,
                newFolderName: this.newFolderName,
                mFolderInfo: this.mFolderInfo
              })
            }, (item: AppItemInfo[]) => JSON.stringify(item))
          }
          .indicator(Indicator.dot().selectedColor(StyleConstants.DEFAULT_FONT_COLOR))
          .onClick(() => {
            Log.showDebug(TAG, `Swiper click`);
            this.saveText();
          })
          .height(mSwiperHeight)
          .width(mGridWidth)
          .duration(80)
          .index(this.PageIndex)
          .loop(false)
          .onChange((index) => {
            Log.showDebug(TAG, `onChange :${index}`);
            if (this.PageIndex !== index) {
              this.mFolderInfo = mBigFolderViewModel.addAddIcon(this.mFolderInfo);
              this.PageIndex = index;
            }
          })
        }
      }
      .width(mGridWidth)
    }
    .width(BigFolderStyleConstants.PERCENTAGE_100)
    .height(BigFolderStyleConstants.PERCENTAGE_100)
    .visibility(this.openFolderStatus == BigFolderConstants.OPEN_FOLDER_STATUS_CLOSE ? Visibility.Hidden : Visibility.Visible)
    .opacity(this.overLayAlpha)
    .backgroundColor('rgba(0,0,0,0.25)')
    .onClick(() => {
      Log.showDebug(TAG, 'blank click');
      this.saveText();
    })
    .onMouse((event: MouseEvent) => {
      if (event.button == MouseButton.Right) {
        event.stopPropagation();
        Log.showDebug(TAG, 'onMouse MouseButton Right');
      }
    })
  }

  private saveText() {
    if (this.isRenaming) {
      this.isRenaming = false;
      if (this.newFolderName.trim().length !=0 && this.newFolderName) {
        this.mFolderInfo.folderName = this.newFolderName;
        mBigFolderViewModel.modifyFolderName(this.mFolderInfo)
      }
    } else {
      const contextFlag: boolean = AppStorage.get('contextMenuState') as boolean;
      Log.showInfo(TAG, 'saveText contextFlag: ' + contextFlag);
      if (contextFlag) {
        AppStorage.setOrCreate('contextMenuState', false);
      } else {
        mBigFolderViewModel.closeFolder();
      }
    }
    InputMethodManager.getInstance().stopInput();
  }
}

@Component
struct FolderSwiperPage {
  @StorageLink('isDraging') isDraging: boolean = false;
  @Link isRenaming: boolean;
  @Prop newFolderName: string;
  private mFolderInfo: FolderInfo = { layoutInfo: [], enterEditing: false, folderName: '', folderId: '' };
  private mAppInfo: AppItemInfo[] = [];
  private ColumnsTemplate: string = '';
  private RowsTemplate: string = '';
  private mGridGap = BigFolderStyleConfig.getInstance().mOpenFolderGridGap;
  @State mBigFolderViewModel: BigFolderViewModel = mBigFolderViewModel;

  aboutToAppear(): void  {
    mFolderModel = BigFolderModel.getInstance();
    this.updateConfig();
  }

  aboutToDisappear(): void {
    this.folderDialogController = null;
  }

  private updateConfig() {
    let styleConfig = mBigFolderViewModel.getFolderStyleConfig();
    this.mGridGap = styleConfig.mOpenFolderGridGap;
    let openFolderConfig = mFolderModel.getFolderOpenLayout() as FolderOpenLayoutTable;

    let column = openFolderConfig.column as number;
    let row = openFolderConfig.row as number;
    this.ColumnsTemplate = '';
    this.RowsTemplate = '';
    for (let i = 0; i < column; i++) {
      this.ColumnsTemplate += '1fr '
    }
    for (let i = 0; i < row; i++) {
      this.RowsTemplate += '1fr '
    }
  }

  folderDialogController: CustomDialogController | null = new CustomDialogController({
    builder: FolderAppListDialog({
      cancel: () => {
      },
      confirm: (isDestory: boolean) => {
        if (isDestory) {
          mBigFolderViewModel.closeFolder();
        }
      },
      folderItem: AppStorage.get('openFolderData'),
      mBigFolderViewModel: $mBigFolderViewModel
    }),
    customStyle: true,
    alignment: DialogAlignment.Center,
    cancel: () => {
    },
    autoCancel: true
  })

  build() {
    Column() {
      Grid() {
        ForEach(this.mAppInfo, (item: AppItemInfo) => {
          GridItem() {
            if (item.typeId === CommonConstants.TYPE_ADD) {
              Column() {
                Stack({ alignContent: Alignment.Center }) {
                  Column()
                    .width(mAddIconSize)
                    .height(mAddIconSize)
                    .opacity(0.5)
                    .borderRadius(10)
                    .backgroundColor(Color.White)

                  Image(BigFolderStyleConstants.DEFAULT_ADD_FOLDER_APP_IMAGE)
                    .width(BigFolderStyleConstants.DEFAULT_ADD_APP_ICON_SIZE)
                    .height(BigFolderStyleConstants.DEFAULT_ADD_APP_ICON_SIZE)
                }.margin({ top: mGridIconTopPadding })

                AppName({
                  nameHeight: mAppNameHeight,
                  nameSize: mAppNameSize,
                  nameFontColor: BigFolderStyleConstants.DEFAULT_FONT_COLOR,
                  appName: item.appName,
                  useCache: false,
                  nameLines: mNameLines,
                  marginTop: mIconNameMargin
                })
              }
              .width(BigFolderStyleConstants.PERCENTAGE_100)
              .height(BigFolderStyleConstants.PERCENTAGE_100)
              .onClick(() => {
                Log.showDebug(TAG, `add app to this folder`);
                this.folderDialogController?.open();
              })
            } else {
              FolderAppItem({
                item: item,
              })
            }
          }
        }, (item: AppItemInfo) => JSON.stringify(item))
      }
      .margin(mGridPadding)
      .width(mGridWidth - 2 * mGridPadding)
      .height(mGridHeight - 2 * mGridPadding)
      .columnsGap(this.mGridGap)
      .rowsGap(this.mGridGap)
      .onClick(() => {
        Log.showDebug(TAG, 'Grid click');
        this.saveText();
      })
      .columnsTemplate(this.ColumnsTemplate)
      .rowsTemplate(this.RowsTemplate)
    }
    .width(mGridWidth)
    .height(mGridHeight)
    .borderRadius(32)
    .borderColor(this.isDraging ? 'rgba(255,255,255,0.25)' : 'rgba(0,0,0,0)')
    .borderWidth(2)
    .onMouse((event: MouseEvent) => {
      if (event.button == MouseButton.Right) {
        event.stopPropagation();
        Log.showDebug(TAG, 'Grid onMouse MouseButton Right');
      }
    })
  }

  private saveText() {
    if (this.isRenaming) {
      this.isRenaming = false;
      if (this.newFolderName && this.newFolderName != this.mFolderInfo.folderName) {
        this.mFolderInfo.folderName = this.newFolderName;
        mBigFolderViewModel.modifyFolderName(this.mFolderInfo);
      }
    } else {
      const contextFlag: boolean = AppStorage.get('contextMenuState') as boolean;
      Log.showInfo(TAG, 'saveText contextFlag: ' + contextFlag);
      if (contextFlag) {
        AppStorage.setOrCreate('contextMenuState', false);
      } else {
        mBigFolderViewModel.closeFolder();
      }
    }
    InputMethodManager.getInstance().stopInput();
  }
}

@Component
struct FolderAppItem {
  @StorageLink('uninstallAppInfo') appInfo: AppItemInfo = new AppItemInfo();
  @StorageLink('selectDesktopAppItem') selectDesktopAppItem: string = '';
  @State item: AppItemInfo = new AppItemInfo();
  private ColumnsTemplate: string = '';
  private RowsTemplate: string = '';
  private isSwappingPage = false;
  private willCloseFolder: boolean = false;
  private mFolderInfo: FolderItemInfo = new FolderItemInfo();
  private mouseClick: number = 0;
  private dialogName: string = "";
  private clearForm: Function = () => {};

  aboutToAppear(): void  {
    mFolderModel = BigFolderModel.getInstance();
    ResourceManager.getInstance().getStringByResource(isPad
      ? $r('app.string.is_delete_form') : $r('app.string.isUninstall')).then((resName) => {
      this.dialogName = resName;
    });
  }

  aboutToDisappear(): void {
    this.uninstallDialogController = null;
    this.formManagerDialogController = null;
  }

  uninstallDialogController: CustomDialogController | null = new CustomDialogController({
    builder: UninstallDialog({
      cancel: () => {
      },
      confirm: () => {
        if (isPad) {
          this.mFolderInfo = mBigFolderViewModel.deleteAppFromOpenFolder(this.appInfo);
        } else {
          mBigFolderViewModel.uninstallApp(this.appInfo.bundleName, this.appInfo.isUninstallAble);
          if (!this.appInfo.isUninstallAble) {
            return;
          }
          this.mFolderInfo = mBigFolderViewModel.deleteAppFromOpenFolder(this.appInfo);
        }
        mBigFolderViewModel.refreshFolder(this.mFolderInfo);
        localEventManager.sendLocalEventSticky(EventConstants.EVENT_REQUEST_PAGEDESK_ITEM_UPDATE, null);
      },
      dialogName: this.dialogName,
      dialogContent: this.appInfo.appName + ' ?',
    }),
    cancel: () => {
    },
    autoCancel: false,
    customStyle: true
  });

  concatCacheKey(item: AppItemInfo): string {
    if (item.appLabelId && item.bundleName && item.moduleName) {
      return `${item.appLabelId}${item.bundleName}${item.moduleName}`;
    }
    return '';
  }

  formManagerDialogController: CustomDialogController | null = new CustomDialogController({
    builder: FormManagerDialog({
      cancel: (callback?: () => void) => {
        // delete all form
        if (callback != undefined) {
          this.clearForm = callback;
        }
      },
      confirm: (formCardItem: CardItemInfo) => {
        // add form to desktop
        Log.showDebug(TAG, `createCardToDeskTop formCardItem: ${JSON.stringify(formCardItem)}`);
        localEventManager.sendLocalEventSticky(EventConstants.EVENT_REQUEST_PAGEDESK_FORM_ITEM_ADD, formCardItem);
      },
      bundleName: this.item.bundleName as string,
      appName: PageDesktopViewModel.getInstance().getAppName(this.concatCacheKey(this.item)),
      appLabelId: this.item.appLabelId as number
    }),
    cancel: this.cancelFormDialog,
    autoCancel: false,
    customStyle: true
  });

  cancelFormDialog() {
    Log.showDebug(TAG, 'form manager cancel dialog');
    this.clearForm();
  }

  closeFolderDelay() {
    this.willCloseFolder = false;
    setTimeout(() => {
      this.willCloseFolder = true;
    }, FOLDER_CLOSE_DELAY);
  }

  removeAppOutOfFolder = (appInfo: AppItemInfo) => {
    mBigFolderViewModel.removeAppOutOfFolder(appInfo);
  }

  private launchApp() {
    Trace.start(Trace.CORE_METHOD_START_APP_ANIMATION);
    this.setStartAppInfo();
    PageDesktopViewModel.getInstance().onAppDoubleClick(this.item.abilityName, this.item.bundleName, this.item.moduleName);
  }

  build() {
    Column() {
      Column() {
        AppBubble({
          iconSize: mAppIconSize,
          nameSize: mAppNameSize,
          nameHeight: mAppNameHeight,
          nameFontColor: BigFolderStyleConstants.DEFAULT_FONT_COLOR,
          appName: this.item.appName,
          bundleName: this.item.bundleName,
          abilityName: this.item.abilityName,
          moduleName: this.item.moduleName,
          appIconId: this.item.appIconId,
          appLabelId: this.item.appLabelId,
          badgeNumber: this.item.badgeNumber,
          isSelect: this.selectDesktopAppItem == this.item.keyName,
          mPaddingTop: mGridIconTopPadding,
          menuInfo: PageDesktopViewModel.getInstance().buildMenuInfoList(this.item, this.uninstallDialogController,
            this.formManagerDialogController, this.removeAppOutOfFolder, () => {
              this.setStartAppInfo();
            }),
          nameLines: mNameLines,
          mIconNameMargin: mIconNameMargin,
          dragStart: () => {}
        })
      }
      .width(mAppItemWidth)
      .height(mAppItemWidth)
      .onClick(() => {
        Log.showDebug(TAG, 'App click');
        this.setStartAppInfo();
        PageDesktopViewModel.getInstance().openApplication(this.item.abilityName, this.item.bundleName, this.item.moduleName);
      })
      .onMouse((event: MouseEvent) => {
        if (event.button == MouseButton.Right) {
          event.stopPropagation();
          Log.showDebug(TAG, `FolderAppItem onMouse MouseButton Right keyName: ${this.item.keyName}`);
          AppStorage.setOrCreate('selectDesktopAppItem', this.item.keyName);
        }
      })
      .gesture(
      GestureGroup(GestureMode.Exclusive,
      TapGesture()
        .onAction((event: GestureEvent) => {
          Log.showDebug(TAG, `tap action ${JSON.stringify(event)}`)
          if (event.source == SourceType.Mouse) {
            this.mouseClick++;
            if (this.mouseClick == DOUBLE_CLICK_COUNT) {
              Log.showDebug(TAG, 'mouse double click');
              this.mouseClick = 0;
              this.launchApp();
            } else {
              this.setStartAppInfo();
              PageDesktopViewModel.getInstance().onAppClick(this.item.abilityName, this.item.bundleName, this.item.moduleName);
              setTimeout(() => {
                this.mouseClick = 0;
              }, 300)
            }
          } else {
            Log.showDebug(TAG, 'tap click');
            this.launchApp();
          }
        })
      )
      )
    }
    .width(mAppItemWidth)
    .height(mAppItemWidth)
  }

  /**
   * set start app info
   */
  setStartAppInfo() {
    if (CheckEmptyUtils.isEmpty(this.item)) {
      Log.showError(TAG, `setStartAppInfo with item`)
      return;
    }
    Log.showInfo(TAG, `app setStartAppInfo`);
    if (AppStorage.get('deviceType') === CommonConstants.PAD_DEVICE_TYPE) {
      AppStorage.setOrCreate('openFolderStatus', BigFolderConstants.OPEN_FOLDER_STATUS_CLOSE);
    }
    AppStorage.setOrCreate('startAppItemInfo', this.item);
    mBigFolderStartAppHandler.setAppIconSize(mBigFolderStyleConfig.mOpenFolderIconSize);
    mBigFolderStartAppHandler.setAppIconInfo();
  }
}
