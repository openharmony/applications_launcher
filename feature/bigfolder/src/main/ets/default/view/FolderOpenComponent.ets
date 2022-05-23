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

import windowManager from '../../../../../../../common/src/main/ets/default/manager/WindowManager';
import ResourceManager from '../../../../../../../common/src/main/ets/default/manager/ResourceManager';
import AppBubble from '../../../../../../../common/src/main/ets/default/uicomponents/AppBubble.ets';
import AppName from '../../../../../../../common/src/main/ets/default/uicomponents/AppName.ets';
import CommonConstants from '../../../../../../../common/src/main/ets/default/constants/CommonConstants';
import StyleConstants from '../../../../../../../common/src/main/ets/default/constants/StyleConstants';
import UninstallDialog from '../../../../../../../common/src/main/ets/default/uicomponents/UninstallDialog.ets';
import Trace from '../../../../../../../common/src/main/ets/default/utils/Trace';
import Log from '../../../../../../../common/src/main/ets/default/utils/Log';
import PresetStyleConstants from '../../../../../../../common/src/main/ets/default/constants/PresetStyleConstants';
import InputMethodManager from '../../../../../../../common/src/main/ets/default/manager/InputMethodManager';
import PageDesktopViewModel from '../../../../../../pagedesktop/src/main/ets/default/common/viewmodel/PageDesktopViewModel';
import FormManagerDialog from '../../../../../../../feature/form/src/main/ets/default/common/uicomponents/FormManagerDialog.ets';
import FolderViewModel from '../viewmodel/FolderViewModel';
import BigFolderModel from '../common/BigFolderModel';
import FolderAppListDialog from '../common/uicomponents/FolderAppListDialog.ets';
import FolderStyleConstants from '../common/constants/FolderStyleConstants';
import FeatureConstants from '../common/constants/FeatureConstants';
import BigFolderDragHandler from '../common/BigFolderDragHandler';
import BigFolderStyleConfig from '../common/BigFolderStyleConfig';

const TAG = 'FolderOpenComponent';
const DOUBLE_CLICK_COUNT = 2;

const APP_INFO_REFRESH_DELAY = 500;
const FOLDER_CLOSE_DELAY = 500;
let mFolderViewModel: FolderViewModel;
let mPageDesktopViewModel: PageDesktopViewModel;
let mBigFolderDragHandler: BigFolderDragHandler;
let mBigFolderStyleConfig: BigFolderStyleConfig;
let mFolderModel: BigFolderModel;
let isOpenFolderDialog: boolean = false;
let mAppNameHeight = FolderStyleConstants.DEFAULT_APP_NAME_HEIGHT;
let mAppItemWidth = FolderStyleConstants.DEFAULT_APP_ITEM_WIDTH;
let mAppNameSize = FolderStyleConstants.DEFAULT_APP_NAME_SIZE;
let mAppIconSize = FolderStyleConstants.DEFAULT_APP_ITEM_WIDTH;
let mAddIconSize = FolderStyleConstants.DEFAULT_ADD_APP_SIZE;
let mNameLines = PresetStyleConstants.DEFAULT_APP_NAME_LINES;
let mIconNameMargin = PresetStyleConstants.DEFAULT_ICON_NAME_GAP;
let mSwiperHeight;
let mGridWidth;
let mGridHeight;
let mGridPadding;
let mGridMarginTop;
let mFolderOpenTitle;
let mGridIconTopPadding;
let isPad = false;

@Component
export default struct FolderOpenComponent {
  @State withBlur: boolean = true;
//  @StorageLink('isDraging') isDraging: boolean = false;
  @State @Watch('showStateChange') showState: boolean = false;
  @StorageLink('openFolderPageIndex') PageIndex: number = 0;
  @StorageLink('openFolderStatus') @Watch('updateFolderData') openFolderStatus: number = FeatureConstants.OPEN_FOLDER_STATUS_CLOSE;
  @State overLayAlpha: number = 0.3;
  @State isRenaming: boolean = false;
  @StorageLink('openFolderData') mFolderInfo: {
    layoutInfo: [],
    enterEditing: boolean,
    folderName: string,
    folderId: string
  } = { layoutInfo: [], enterEditing: false, folderName: '', folderId: '' };
  private newFolderName: string;

  private aboutToAppear(): void  {
    Log.showInfo(TAG, `aboutToAppear start`);
    mFolderViewModel = FolderViewModel.getInstance();
    mPageDesktopViewModel = PageDesktopViewModel.getInstance();
    this.updateStyle();
    // Folder dialog data preloading
    mFolderViewModel.getFolderAddAppList(this.mFolderInfo.folderId);
    mFolderViewModel.getFolderAppList(this.mFolderInfo.folderId);
    Log.showInfo(TAG, `aboutToAppear end`);
  }

  private updateStyle() {
    isPad = mFolderViewModel.getIsPad();
    mBigFolderStyleConfig = mFolderViewModel.getFolderStyleConfig();
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

  private showStateChange() {
    Log.showInfo(TAG, `showStateChange start`);
    if (this.showState) {
      this.showOpenFolder();
    } else {
      this.hideOpenFolder();
    }
    Log.showInfo(TAG, `showStateChange end`);
  }

  private updateFolderData() {
    Log.showInfo(TAG, `updateFolderData start`);
    if (this.openFolderStatus == FeatureConstants.OPEN_FOLDER_STATUS_STATIC) {
      return;
    }
    if (this.openFolderStatus == FeatureConstants.OPEN_FOLDER_STATUS_CLOSE) {
      this.showState = false;
      mFolderViewModel.delAddIcon(this.mFolderInfo);
      mPageDesktopViewModel.pagingFiltering();
      this.newFolderName = '';
      return;
    } else {
      this.isRenaming = this.mFolderInfo.enterEditing;
      this.mFolderInfo = mFolderViewModel.addAddIcon(this.mFolderInfo);
      this.showState = true;
    }
    AppStorage.SetOrCreate('openFolderStatus', FeatureConstants.OPEN_FOLDER_STATUS_STATIC);
    AppStorage.SetOrCreate('isDraging', false);
    Log.showInfo(TAG, `updateFolderData end`);
  }

  private hideOpenFolder() {
    Log.showInfo(TAG, `hideOpenFolder start`);
    this.isRenaming = false;
    this.withBlur = false;
    this.openFolderStatus = FeatureConstants.OPEN_FOLDER_STATUS_CLOSE;
    this.showAnimate(0.3, Curve.EaseOut);
    Log.showInfo(TAG, `hideOpenFolder end`);
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
          .width(FolderStyleConstants.PERCENTAGE_100)
          .height(FolderStyleConstants.PERCENTAGE_100)
      }

      Flex({ direction: FlexDirection.Column, alignItems: ItemAlign.Center }) {
        Stack({ alignContent: Alignment.Center }) {
          Text(this.mFolderInfo.folderName) {
          }
          .fontSize(FolderStyleConstants.DEFAULT_OPEN_FOLDER_NAME_SIZE)
          .fontColor(Color.White)
          .textAlign(TextAlign.Center)
          .width(FolderStyleConstants.PERCENTAGE_100)
          .visibility(this.isRenaming ? Visibility.Hidden : Visibility.Visible)
          .onClick(() => {
            Log.showInfo(TAG, 'title click');
            this.isRenaming = true;
          })
          TextArea({ placeholder: this.mFolderInfo.folderName, text: this.newFolderName })
            .height(FolderStyleConstants.DEFAULT_OPEN_FOLDER_TEXTAREA_HEIGHT)
            .textAlign(TextAlign.Center)
            .fontColor(Color.White)
            .fontSize(FolderStyleConstants.DEFAULT_OPEN_FOLDER_NAME_SIZE)
            .fontWeight(FontWeight.Normal)
            .fontFamily("sans-serif")
            .fontStyle(FontStyle.Normal)
            .placeholderColor(Color.White)
            .caretColor(Color.White)
            .placeholderFont({
              size: FolderStyleConstants.DEFAULT_OPEN_FOLDER_NAME_SIZE,
              weight: FontWeight.Normal,
              family: "sans-serif"
            })
            .backgroundColor('rgba(255,255,255,0.3)')
            .clip(new Rect({
              width:FolderStyleConstants.PERCENTAGE_100,
              height:FolderStyleConstants.DEFAULT_OPEN_FOLDER_TEXTAREA_HEIGHT,
              radius:[[FolderStyleConstants.DEFAULT_OPEN_FOLDER_CANCEL_SIZE,FolderStyleConstants.DEFAULT_OPEN_FOLDER_CANCEL_SIZE],
              [FolderStyleConstants.DEFAULT_OPEN_FOLDER_CANCEL_SIZE,FolderStyleConstants.DEFAULT_OPEN_FOLDER_CANCEL_SIZE],
              [FolderStyleConstants.DEFAULT_OPEN_FOLDER_CANCEL_SIZE,FolderStyleConstants.DEFAULT_OPEN_FOLDER_CANCEL_SIZE],
              [FolderStyleConstants.DEFAULT_OPEN_FOLDER_CANCEL_SIZE,FolderStyleConstants.DEFAULT_OPEN_FOLDER_CANCEL_SIZE]]}))
            .width(FolderStyleConstants.PERCENTAGE_100)
            .visibility(this.isRenaming ? Visibility.Visible : Visibility.Hidden)
            .onBlur(()=> {
              this.isRenaming = true;
              this.saveText();
            })
            .onChange((text: string) => {
              Log.showInfo(TAG, `textinput: ` + text);
              this.newFolderName  = text;
            })
          Image(FolderStyleConstants.DEFAULT_CANCEL_APP_IMAGE)
            .width(FolderStyleConstants.DEFAULT_OPEN_FOLDER_CANCEL_SIZE)
            .height(FolderStyleConstants.DEFAULT_OPEN_FOLDER_CANCEL_SIZE)
            .position({ x: FolderStyleConstants.DEFAULT_OPEN_FOLDER_CANCEL_WIDTH,
              y: FolderStyleConstants.DEFAULT_OPEN_FOLDER_CANCEL_HEIGHT})
            .visibility(this.isRenaming ? Visibility.Visible : Visibility.Hidden)
            .onClick(()=>{
              this.mFolderInfo.folderName = ''
              this.newFolderName = ''
            })
        }
        .margin({ top: mFolderOpenTitle })
        .width(mGridWidth)
        .height(mGridMarginTop)

        Stack() {
          Swiper() {
            ForEach(this.mFolderInfo.layoutInfo, (item) => {
                FolderSwiperPage({
                  mAppInfo: item
                })
            }, (item) => JSON.stringify(item))
          }
          .indicatorStyle({
            selectedColor: StyleConstants.DEFAULT_FONT_COLOR,
            bottom: FolderStyleConstants.DEFAULT_OPEN_FOLDER_INDICATOR
          })
          .onClick(() => {
            Log.showInfo(TAG, `Swiper click`);
            if (!isOpenFolderDialog) {
              mFolderViewModel.closeFolder();
            }
          })
          .height(mSwiperHeight)
          .width(mGridWidth)
          .index(this.PageIndex)
          .loop(false)
          .onChange((index) => {
            Log.showInfo(TAG, `mFolderViewModel.changeIndex(index):${index}`);
            mFolderViewModel.changeIndex(index);
          })
        }
      }
      .width(mGridWidth)
    }
    .width(FolderStyleConstants.PERCENTAGE_100)
    .height(FolderStyleConstants.PERCENTAGE_100)
    .visibility(this.showState ? Visibility.Visible : Visibility.None)
    .opacity(this.overLayAlpha)
    .backgroundColor('rgba(0,0,0,0.25)')
    .onClick(() => {
      Log.showInfo(TAG, 'blank click');
      this.saveText();
    })
    .onMouse((event: MouseEvent) => {
      if (event.button == MouseButton.Right) {
        event.stopPropagation();
        Log.showInfo(TAG, 'onMouse MouseButton Right');
      }
    })
  }

  private saveText() {
    if (this.isRenaming) {
      this.isRenaming = false;
      if (this.newFolderName && this.newFolderName != this.mFolderInfo.folderName) {
        this.mFolderInfo.folderName = this.newFolderName;
        mFolderViewModel.modifyFolderName(this.mFolderInfo)
      }
    } else {
      if (!isOpenFolderDialog) {
        mFolderViewModel.closeFolder();
      }
    }
    InputMethodManager.getInstance().stopInput();
  }
}

@Component
struct FolderSwiperPage {
  @StorageLink('isDraging') isDraging: boolean = false;
  private mAppInfo: any = {};
  private ColumnsTemplate: string = '';
  private RowsTemplate: string = '';
  private mGridGap;

  private aboutToAppear(): void  {
    mFolderModel = BigFolderModel.getInstance();
    mBigFolderDragHandler = BigFolderDragHandler.getInstance();
    this.updateConfig();
    this.updateOpenFolderParams();
  }

  private updateConfig() {
    let styleConfig = mFolderViewModel.getFolderStyleConfig();
    this.mGridGap = styleConfig.mOpenFolderGridGap;
    let openFolderConfig = mFolderModel.getFolderOpenLayout();

    let column = openFolderConfig.column;
    let row = openFolderConfig.row;
    this.ColumnsTemplate = '';
    this.RowsTemplate = '';
    for (let i = 0; i < column; i++) {
      this.ColumnsTemplate += '1fr '
    }
    for (let i = 0; i < row; i++) {
      this.RowsTemplate += '1fr '
    }
  }

  private async updateOpenFolderParams() {
    let screenWidth = await windowManager.getWindowWidth();

    if (mBigFolderDragHandler != null) {
      mBigFolderDragHandler.setDragEffectArea({
        left: (screenWidth - mGridWidth) / 2,
        top: mGridMarginTop,
        right: (screenWidth - mGridWidth) / 2 + mGridWidth,
        bottom: mGridMarginTop + mGridHeight
      });
    }
  }

  folderDialogController: CustomDialogController = new CustomDialogController({
    builder: FolderAppListDialog({
      cancel: () => {},
      confirm:  (isDestory) => {
        if (isDestory) {
          mFolderViewModel.closeFolder();
        }
      },
      folderItem:AppStorage.Get('openFolderData')
    }),
    customStyle: true,
    alignment: DialogAlignment.Center,
    cancel: () => {},
    autoCancel: true
  })

  build() {
    Column() {
      Grid() {
        ForEach(this.mAppInfo, (item) => {
          GridItem() {
            if (item.type === CommonConstants.TYPE_ADD) {
              Column() {
                Stack({ alignContent: Alignment.Center }) {
                  Column()
                    .width(mAddIconSize)
                    .height(mAddIconSize)
                    .opacity(0.5)
                    .borderRadius(10)
                    .backgroundColor(Color.White)

                  Image(FolderStyleConstants.DEFAULT_ADD_FOLDER_APP_IMAGE)
                    .width(FolderStyleConstants.DEFAULT_ADD_APP_ICON_SIZE)
                    .height(FolderStyleConstants.DEFAULT_ADD_APP_ICON_SIZE)
                }.margin({top: mGridIconTopPadding})

                AppName({
                  nameHeight: mAppNameHeight,
                  nameSize: mAppNameSize,
                  nameFontColor: FolderStyleConstants.DEFAULT_FONT_COLOR,
                  bundleName: '',
                  appName: item.appName,
                  labelId: '',
                  useCache: false,
                  nameLines: mNameLines,
                  marginTop: mIconNameMargin
                })
              }
              .width(FolderStyleConstants.PERCENTAGE_100)
              .height(FolderStyleConstants.PERCENTAGE_100)
              .onClick(() => {
                Log.showInfo(TAG, `add app to this folder`);
                this.folderDialogController.open();
              })
            } else {
              FolderAppItem({
                item: item,
              })
            }
          }
        }, (item) => JSON.stringify(item))
      }
      .margin(mGridPadding)
      .width(mGridWidth - 2 * mGridPadding)
      .height(mGridHeight - 2 * mGridPadding)
      .columnsGap(this.mGridGap)
      .rowsGap(this.mGridGap)
      .onClick(() => {
        Log.showInfo(TAG, 'Grid click');
        mFolderViewModel.closeFolder();
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
        Log.showInfo(TAG, 'Grid onMouse MouseButton Right');
      }
    })
  }
}

@Component
struct FolderAppItem {
  @StorageLink('uninstallAppInfo') appInfo: any = {};
//  @StorageLink('dragLocation') @Watch('onTouchEventUpdate') dragLocation: string = '';
  @State @Watch('onIsDraging') isDraging: boolean = false;
  @StorageLink('selectDesktopAppItem') selectDesktopAppItem: string = '';
  @State item: any = {};
  private ColumnsTemplate: string = '';
  private RowsTemplate: string = '';
  private isSwappingPage = false;
  private willCloseFolder: boolean = false;
  private mFolderInfo: any = {};
  private mouseClick: number = 0;
  private dialogName: string = "";
  private clearForm: Function = null;

  private aboutToAppear(): void  {
    mFolderModel = BigFolderModel.getInstance();
    ResourceManager.getInstance().getStringByResource(isPad
      ? $r('app.string.delete_app') : $r('app.string.uninstall')).then((resName) => {
      this.dialogName = resName;
    });
  }

  private onTouchEventUpdate() {
    if (AppStorage.Get('dragFocus') == FeatureConstants.FEATURE_NAME) {
      mBigFolderDragHandler.onTouchEventUpdate(AppStorage.Get('dragEvent'));
    }
  }

  private onIsDraging() {
    AppStorage.SetOrCreate('isDraging', this.isDraging);
  }

  uninstallDialogController: CustomDialogController = new CustomDialogController({
    builder:  UninstallDialog({
      cancel: () => {},
      confirm: () => {
        if (isPad) {
          this.mFolderInfo = mFolderViewModel.deleteAppFromOpenFolder(this.appInfo);
        } else {
          mPageDesktopViewModel.uninstallApp(this.appInfo.bundleName, this.appInfo.isUninstallAble);
          if (this.appInfo.isUninstallAble) {
            this.mFolderInfo = mFolderViewModel.deleteAppFromOpenFolder(this.appInfo);
          }
        }
        mFolderViewModel.refreshFolder(this.mFolderInfo);
        mPageDesktopViewModel.getGridList();
      },
      dialogName: this.dialogName,
      dialogContent: this.appInfo.appName + ' ?',
    }),
    cancel: () => {},
    autoCancel: true,
    customStyle: true
  });

  formManagerDialogController: CustomDialogController = new CustomDialogController({
    builder: FormManagerDialog({
      cancel: (callback?) => {
        // delete all form
        if (callback != undefined) {
          this.clearForm = callback;
        }
      },
      confirm: (formCardItem) => {
        // add form to desktop
        Log.showInfo(TAG, `createCardToDeskTop formCardItem: ${JSON.stringify(formCardItem)}`);
        mPageDesktopViewModel.createCardToDeskTop(formCardItem);
      },
      bundleName: this.item.bundleName,
      appName: mPageDesktopViewModel.getAppName(this.item.appLabelId + this.item.bundleName),
      appLabelId: this.item.appLabelId
    }),
    cancel: this.cancelFormDialog,
    autoCancel: true,
    customStyle: true
  });

  cancelFormDialog() {
    Log.showInfo(TAG, 'form manager cancel dialog');
    this.clearForm();
  }

  private mDragStateListener = {
    onItemDragStart: (event: any, itemIndex: number) => {
      this.isDraging = true;
    },
    onItemDragMove: (event: any, insertIndex: number, itemIndex: number) => {
      Log.showInfo(TAG, "FolderOpenComponent onItemDragMove start");
      this.uninstallDialogController.close();

      if (this.isSwappingPage) {
        return;
      }

      let moveX = event.touches[0].screenX;
      let moveY = event.touches[0].screenY;
      let dragEffectArea = mBigFolderDragHandler.getEffectArea();

      this.mFolderInfo = AppStorage.Get('openFolderData');
      let pageCount = this.mFolderInfo.layoutInfo.length;

      let pageIndex: number = mFolderViewModel.getIndex();
      Log.showInfo(TAG, "FolderOpenComponent onItemDragMove pageIndex: " + pageIndex);

      Log.showInfo(TAG, `FolderOpenComponent onItemDragMove dragEffectArea.left: ${dragEffectArea.left}`);
      Log.showInfo(TAG, `FolderOpenComponent onItemDragMove dragEffectArea.bottom: ${dragEffectArea.bottom}`);
      Log.showInfo(TAG, `FolderOpenComponent onItemDragMove dragEffectArea.right: ${dragEffectArea.right}`);

      if ((moveX - mAppIconSize / 2) < dragEffectArea.left && moveY < dragEffectArea.bottom) {
        if (pageIndex > 0) {
          mFolderViewModel.changeIndex(pageIndex - 1);
          this.movingIconSwapPageDelay();
        } else if (this.willCloseFolder) {
          mFolderViewModel.closeFolder();
        } else {
          this.closeFolderDelay();
        }
      } else if ((moveX + mAppIconSize / 2) > dragEffectArea.right && moveY < dragEffectArea.bottom) {
        if (pageIndex < pageCount - 1) {
          mFolderViewModel.changeIndex(pageIndex + 1);
          this.movingIconSwapPageDelay();
        } else if (this.willCloseFolder) {
          mFolderViewModel.closeFolder();
        } else {
          this.closeFolderDelay();
        }
      }
    },
    onItemDragEnd: () => {
      this.isDraging = false;
    }
  };

  closeFolderDelay() {
    this.willCloseFolder = false;
    setTimeout(() => {
      this.willCloseFolder = true;
    }, FOLDER_CLOSE_DELAY);
  }

  movingIconSwapPageDelay() {
    this.isSwappingPage = true;
    setTimeout(() => {
      this.isSwappingPage = false;
    }, APP_INFO_REFRESH_DELAY);
  }

  removeAppOutOfFolder(appInfo) {
    mFolderViewModel.removeAppOutOfFolder(appInfo);
  }

  private launchApp() {
    Trace.start(Trace.CORE_METHOD_LAUNCH_APP);
    mPageDesktopViewModel.onAppDoubleClick(this.item.abilityName, this.item.bundleName);
  }

  build() {
    Column() {
      Column() {
        AppBubble({
          iconSize: mAppIconSize,
          nameSize: mAppNameSize,
          nameHeight: mAppNameHeight,
          nameFontColor: FolderStyleConstants.DEFAULT_FONT_COLOR,
          appName: this.item.appName,
          bundleName: this.item.bundleName,
          appIconId: this.item.appIconId,
          appLabelId: this.item.appLabelId,
          badgeNumber: this.item.badgeNumber,
          isSelect: this.selectDesktopAppItem === this.item.bundleName,
          mPaddingTop: mGridIconTopPadding,
          menuInfo: mPageDesktopViewModel.buildMenuInfoList(this.item, this.uninstallDialogController,
            this.formManagerDialogController, this.removeAppOutOfFolder.bind(this)),
          nameLines: mNameLines,
          mIconNameMargin: mIconNameMargin
        })
      }
      .width(mAppItemWidth)
      .height(mAppItemWidth)
      .visibility(this.isDraging ? Visibility.Hidden : Visibility.Visible)
      .onClick(() => {
        Log.showInfo(TAG, 'App click');
        mPageDesktopViewModel.openApplication(this.item.abilityName, this.item.bundleName);
      })
      .onMouse((event: MouseEvent) => {
        if (event.button == MouseButton.Right) {
          event.stopPropagation();
          Log.showInfo(TAG, 'FolderAppItem onMouse MouseButton Right');
          AppStorage.SetOrCreate('selectDesktopAppItem', this.item.bundleName);
        }
      })
      .gesture(
      GestureGroup(GestureMode.Exclusive,
      TapGesture()
        .onAction((event: GestureEvent) => {
          Log.showInfo(TAG, `tap action ${JSON.stringify(event)}`)
          if (event.source == SourceType.Mouse) {
            this.mouseClick++;
            if (this.mouseClick == DOUBLE_CLICK_COUNT) {
              Log.showInfo(TAG, 'mouse double click');
              this.mouseClick = 0;
              this.launchApp();
            } else {
              mPageDesktopViewModel.onAppClick(this.item.abilityName, this.item.bundleName);
              setTimeout(() => {
                this.mouseClick = 0;
              }, 300)
            }
          } else {
            Log.showInfo(TAG, 'tap click');
            this.launchApp();
          }
        })
      )
      )
//      .onTouch((event: TouchEvent) => {
//        Log.showInfo(TAG, `onTouch`);
//        AppStorage.SetOrCreate('dragFocus', FeatureConstants.FEATURE_NAME);
//        mBigFolderDragHandler.setDragStateListener(this.mDragStateListener);
//        mBigFolderDragHandler.notifyTouchEventUpdate(event);
//      })
    }
    .width(mAppItemWidth)
    .height(mAppItemWidth)
  }
}
