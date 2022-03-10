/*
 * Copyright (c) 2022 Huawei Device Co., Ltd.
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
import Log from '../../../../../../../../common/src/main/ets/default/utils/Log';
import PresetStyleConstants from '../../../../../../../../common/src/main/ets/default/constants/PresetStyleConstants';
import CommonConstants from '../../../../../../../../common/src/main/ets/default/constants/CommonConstants';
import FolderStyleConstants from '../../../../../../../bigfolder/src/main/ets/default/common/constants/FolderStyleConstants';
import SettingsModel from '../../../../../../../../common/src/main/ets/default/model/SettingsModel';
import LauncherLayoutStyleConfig from '../LauncherLayoutStyleConfig';
import LayoutConfigManager from '../../../../../../../../common/src/main/ets/default/layoutconfig/LayoutConfigManager';
import FeatureConstants from '../constants/FeatureConstants';
import PageDesktopGridStyleConfig from '../../../../../../../pagedesktop/src/main/ets/default/common/PageDesktopGridStyleConfig';
import PageDesktopViewModel from '../../../../../../../pagedesktop/src/main/ets/default/common/viewmodel/PageDesktopViewModel';
import BigFolderStyleConfig from '../../../../../../../bigfolder/src/main/ets/default/common/BigFolderStyleConfig';
import FolderViewModel from '../../../../../../../bigfolder/src/main/ets/default/viewmodel/FolderViewModel';
import FormStyleConfig from '../../../../../../../form/src/main/ets/default/common/FormStyleConfig';
import FormViewModel from '../../../../../../../form/src/main/ets/default/viewmodel/FormViewModel';
import AppCenterGridStyleConfig from '../../../../../../../appcenter/src/main/ets/default/common/AppCenterGridStyleConfig';
import AppCenterViewModel from '../../../../../../../appcenter/src/main/ets/default/common/viewmodel/AppCenterViewModel';
import SmartDockViewModel from '../../../../../../../smartdock/src/main/ets/default/viewmodel/SmartDockViewModel';
import SmartDockStyleConfig from '../../../../../../../smartdock/src/main/ets/default/common/SmartDockStyleConfig';
import BigFolderModel from '../../../../../../../bigfolder/src/main/ets/default/common/BigFolderModel';

const TAG = 'LayoutViewModel';

export default class LayoutViewModel {
  private readonly mSettingsModel: SettingsModel;
  private readonly mFolderModel: BigFolderModel;
  private readonly mLauncherLayoutStyleConfig: any = null;
  private mPageDesktopStyleConfig: PageDesktopGridStyleConfig;
  private mFolderStyleConfig: BigFolderStyleConfig;
  private mFormStyleConfig: FormStyleConfig;
  private mAppGridStyleConfig: AppCenterGridStyleConfig;
  private mSmartDockStyleConfig: SmartDockStyleConfig;
  private isPad = false;
  private mWorkSpaceWidth: number;
  private mWorkSpaceHeight: number;
  private mScreenHeight: number;
  private mDockHeight: number;
  private mIndicatorHeight: number;

  private constructor() {
    this.mSettingsModel = SettingsModel.getInstance();
    this.mLauncherLayoutStyleConfig = LayoutConfigManager.getStyleConfig(
      LauncherLayoutStyleConfig.APP_GRID_STYLE_CONFIG, FeatureConstants.FEATURE_NAME);
    this.mPageDesktopStyleConfig = PageDesktopViewModel.getInstance().getPageDesktopStyleConfig();
    this.mFolderStyleConfig = FolderViewModel.getInstance().getFolderStyleConfig();
    this.mFormStyleConfig = FormViewModel.getInstance().getFormStyleConfig();
    this.mAppGridStyleConfig = AppCenterViewModel.getInstance().getAppGridStyleConfig();
    this.mSmartDockStyleConfig = SmartDockViewModel.getInstance().getStyleConfig();
    this.mFolderModel = BigFolderModel.getInstance();
  }

  /**
    * Obtains the LayoutViewModel instance.
    *
    * @return LayoutViewModel
   */
  static getInstance(): LayoutViewModel {
    if (globalThis.LayoutViewModelInstance == null) {
      globalThis.LayoutViewModelInstance = new LayoutViewModel();
    }
    return globalThis.LayoutViewModelInstance;
  }

  /**
   * calculate
   * @param deviceType pad or phone
   */
  calculate(deviceType: string, screenWidth: number, screenHeight: number) {
    this.setDevice(deviceType);
    this.mWorkSpaceWidth = screenWidth;
    this.mScreenHeight = screenHeight;
    this.calculateDock();
    const systemUIHeight = this.mLauncherLayoutStyleConfig.mSystemUIHeight;
    this.mIndicatorHeight = this.mLauncherLayoutStyleConfig.mIndicatorHeight;
    this.mWorkSpaceHeight = this.mScreenHeight - systemUIHeight - this.mIndicatorHeight - this.mDockHeight;
    this.calculateDesktop();
    this.calculateOpenFolder();
    this.calculateFolderAddList();
    this.calculateAppCenter();
  }

  /**
   * calculate desktop
   */
  private calculateDesktop() {
    this.calculateDesktopLayout();
    this.calculateDesktopIcon();
    this.calculateFolder();
    this.calculateForm();
    this.updateDesktopGrid();
  }

  /**
   * calculate desktop layout
   */
  private calculateDesktopLayout() {
    Log.showInfo(TAG, `desktopIcon mWorkSpaceWidth ${this.mWorkSpaceWidth}`);
    Log.showInfo(TAG, `desktopIcon mWorkSpaceHeight ${this.mWorkSpaceHeight}`);
    const margin = this.mLauncherLayoutStyleConfig.mMargin;
    this.mPageDesktopStyleConfig.mMargin = margin;
    const realWidth = this.mWorkSpaceWidth - 2 * margin;
    const realHeight = this.mWorkSpaceHeight;
    const itemSize = this.mLauncherLayoutStyleConfig.mAppItemSize;
    const minGutter = this.mLauncherLayoutStyleConfig.mGridGutter;
    const column = ~~((realWidth + minGutter) / (itemSize + minGutter));
    const userWidth = (realWidth + minGutter - (itemSize + minGutter) * column);
    const gutter = ( userWidth/ (column - 1)) + minGutter;
    Log.showInfo(TAG, `desktop gutter ${gutter}`);
    const row = ~~((realHeight + gutter) / (itemSize + gutter));
    const marginTop = ((realHeight + gutter -  (itemSize + gutter) * row) / 2);
    Log.showInfo(TAG, `desktop marginTop ${marginTop}`);
    //set desktop config
    this.mPageDesktopStyleConfig.mColumnsGap = gutter;
    this.mPageDesktopStyleConfig.mRowsGap = gutter;
    this.mPageDesktopStyleConfig.mColumns = column;
    this.mPageDesktopStyleConfig.mRows = row;
    this.mPageDesktopStyleConfig.mDesktopMarginTop = marginTop;
    this.mPageDesktopStyleConfig.mGridWidth = realWidth;
    this.mPageDesktopStyleConfig.mGridHeight = realHeight - 2 * marginTop;
  }

  /**
   * calculate desktop app
   */
  private calculateDesktopIcon() {
    const itemSize = this.mLauncherLayoutStyleConfig.mAppItemSize;
    this.mPageDesktopStyleConfig.mAppItemSize = itemSize;
    const ratio = this.mLauncherLayoutStyleConfig.mIconRatio;
    const lines = this.mLauncherLayoutStyleConfig.mNameLines;
    const appTextSize = this.mLauncherLayoutStyleConfig.mNameSize;
    const nameHeight = this.mLauncherLayoutStyleConfig.mNameHeight;
    const iconNameMargin = this.mLauncherLayoutStyleConfig.mIconNameGap;
    this.mPageDesktopStyleConfig.mNameSize = appTextSize;
    this.mPageDesktopStyleConfig.mNameHeight = nameHeight;
    const iconMarginVertical = ratio * itemSize;
    Log.showInfo(TAG, `desktopIcon iconMarginVertical ${iconMarginVertical}`);
    const iconHeight = itemSize - 2 * iconMarginVertical - nameHeight - iconNameMargin;
    Log.showInfo(TAG, `desktopIcon iconHeight ${iconHeight}`);
    const iconMarginHorizontal = (itemSize - iconHeight) / 2;
    Log.showInfo(TAG, `desktopIcon iconMarginHorizontal ${iconMarginHorizontal}`);
    this.mPageDesktopStyleConfig.mIconNameMargin = iconNameMargin;
    this.mPageDesktopStyleConfig.mIconSize = iconHeight;
    this.mPageDesktopStyleConfig.mNameLines = lines;
    this.mPageDesktopStyleConfig.mIconMarginHorizontal = iconMarginHorizontal;
    this.mPageDesktopStyleConfig.mIconMarginVertical = iconMarginVertical;
  }

  /**
   * calculate folder
   */
  calculateFolder() {
    const itemSize = this.mLauncherLayoutStyleConfig.mAppItemSize;
    const gap = this.mPageDesktopStyleConfig.mColumnsGap;
    const iconMargin = this.mPageDesktopStyleConfig.mIconMarginHorizontal;
    const folderSize = itemSize * 2 + gap - iconMargin * 2;
    Log.showInfo(TAG, `desktopIcon folderSize ${folderSize}`);
    const folderGutter = this.mLauncherLayoutStyleConfig.mFolderGutterRatio * folderSize;
    const folderMargin = this.mLauncherLayoutStyleConfig.mFolderMarginRatio * folderSize;
    Log.showInfo(TAG, `desktopIcon folderGutter ${folderGutter}`);
    Log.showInfo(TAG, `desktopIcon folderMargin ${folderMargin}`);
    this.mFolderStyleConfig.mGridSize = folderSize;
    const column = this.mFolderModel.getFolderLayout().column;
    const iconSize = (folderSize - folderGutter * 2 - folderMargin * 2) / column;
    Log.showInfo(TAG, `desktopIcon folder iconSize ${iconSize}`);
    this.mFolderStyleConfig.mFolderAppSize = iconSize;
    this.mFolderStyleConfig.mFolderGridGap = folderGutter;
    this.mFolderStyleConfig.mGridMargin = folderMargin;
    this.mFolderStyleConfig.mNameHeight = this.mPageDesktopStyleConfig.mNameHeight;
    this.mFolderStyleConfig.mNameLines = this.mPageDesktopStyleConfig.mNameLines;
    this.mFolderStyleConfig.mIconNameMargin = this.mPageDesktopStyleConfig.mIconNameMargin;
  }

  calculateOpenFolder() {
    const openFolderConfig = this.mFolderModel.getFolderOpenLayout();
    const row = openFolderConfig.row;
    const column = openFolderConfig.column;
    const gutter = this.mLauncherLayoutStyleConfig.mFolderOpenGutter;
    const padding = this.mLauncherLayoutStyleConfig.mFolderOpenPADDING;
    const margin = this.mLauncherLayoutStyleConfig.mFolderOpenMargin;
    const itemSize = this.mPageDesktopStyleConfig.mAppItemSize;
    const layoutWidth = column * itemSize + (column - 1) * gutter + 2 * padding;
    const layoutHeight = row * itemSize + (row - 1) * gutter + 2 * padding;
    this.mFolderStyleConfig.mOpenFolderGridWidth = layoutWidth;
    this.mFolderStyleConfig.mOpenFolderGridHeight = layoutHeight;
    this.mFolderStyleConfig.mOpenFolderIconSize = this.mPageDesktopStyleConfig.mIconSize;
    this.mFolderStyleConfig.mOpenFolderAppSize = this.mPageDesktopStyleConfig.mAppItemSize;
    this.mFolderStyleConfig.mOpenFolderAppNameSize = this.mPageDesktopStyleConfig.mNameSize;
    this.mFolderStyleConfig.mOpenFolderAppNameHeight = this.mPageDesktopStyleConfig.mNameHeight;
    this.mFolderStyleConfig.mOpenFolderGridGap = gutter;
    this.mFolderStyleConfig.mOpenFolderGridPadding = padding;
    this.mFolderStyleConfig.mFolderOpenMargin = margin;
    this.mFolderStyleConfig.mOpenFolderGridIconTopPadding = this.mPageDesktopStyleConfig.mIconMarginVertical;
    this.mFolderStyleConfig.mNameLines = this.mPageDesktopStyleConfig.mNameLines;
    this.mFolderStyleConfig.mIconNameMargin = this.mPageDesktopStyleConfig.mIconNameMargin;
  }

  calculateFolderAddList() {
    const addFolderConfig = this.mFolderModel.getFolderAddAppLayout();
    const column: number = addFolderConfig.column;
    const margin: number = this.mLauncherLayoutStyleConfig.mFolderAddGridMargin;
    const saveMargin: number = PresetStyleConstants.DEFAULT_SCREEN_GRID_GAP_AND_MARGIN;
    const screenGap: number = PresetStyleConstants.DEFAULT_SCREEN_GRID_GAP_AND_MARGIN;
    const gap: number = this.mLauncherLayoutStyleConfig.mFolderAddGridGap;
    const maxHeight: number = this.mLauncherLayoutStyleConfig.mFolderAddMaxHeight *
    (this.mScreenHeight - this.mLauncherLayoutStyleConfig.mSystemUIHeight / 2);
    const toggleSize: number = this.mLauncherLayoutStyleConfig.mFolderToggleSize;
    let screenColumns: number = PresetStyleConstants.DEFAULT_PHONE_GRID_APP_COLUMNS;
    const textSize: number = this.mLauncherLayoutStyleConfig.mFolderAddTextSize;
    const textLines: number = this.mLauncherLayoutStyleConfig.mFolderAddTextLines;
    const titleSize: number = this.mLauncherLayoutStyleConfig.mFolderAddTitleSize;
    const linesHeight = textSize * textLines;
    const buttonSize: number = this.mLauncherLayoutStyleConfig.mFolderAddButtonSize;
    const ratio: number = this.mLauncherLayoutStyleConfig.mFolderAddICONRATIO;
    if (this.isPad) {
      screenColumns = PresetStyleConstants.DEFAULT_PAD_GRID_APP_COLUMNS;
    }
    const columnsWidth = this.mWorkSpaceWidth - 2 * saveMargin - (screenColumns - 1) * screenGap;
    const columnWidth = columnsWidth / screenColumns;
    const layoutWidth = columnWidth * column + (column - 1) * screenGap;
    Log.showInfo(TAG, `desktopIcon add app layoutWidth ${layoutWidth}`);
    const gridSize = layoutWidth - 2 * margin;
    const itemSize = (gridSize - (column - 1) * gap) / column;
    Log.showInfo(TAG, `desktopIcon add app itemSize ${itemSize}`);
    this.mFolderStyleConfig.mAddFolderGridWidth = gridSize;
    this.mFolderStyleConfig.mAddFolderDialogWidth = layoutWidth;
    const layoutHeight = layoutWidth + FolderStyleConstants.DEFAULT_APP_ADD_TITLE_SIZE + FolderStyleConstants.DEFAULT_BUTTON_HEIGHT +
    FolderStyleConstants.DEFAULT_DIALOG_BOTTOM_MARGIN;
    Log.showInfo(TAG, `desktopIcon add app layoutHeight ${layoutHeight}`);
    this.mFolderStyleConfig.mAddFolderDialogHeight = layoutHeight;
    this.mFolderStyleConfig.mAddFolderGridGap = gap;
    this.mFolderStyleConfig.mAddFolderGridMargin = margin;
    this.mFolderStyleConfig.mAddFolderMaxHeight = maxHeight;
    Log.showInfo(TAG, `desktopIcon add app maxHeight ${maxHeight}`);
    this.mFolderStyleConfig.mFolderToggleSize = toggleSize;
    this.mFolderStyleConfig.mAddFolderTextSize = textSize;
    this.mFolderStyleConfig.mAddFolderTextLines = textLines;
    this.mFolderStyleConfig.mAddFolderLinesHeight = linesHeight;
    this.mFolderStyleConfig.mAddFolderItemSize = itemSize;
    this.mFolderStyleConfig.mAddFolderIconPaddingTop = itemSize * ratio;
    const iconSize = (1 - 2 * ratio) * itemSize - linesHeight - this.mPageDesktopStyleConfig.mIconNameMargin;
    Log.showInfo(TAG, `desktopIcon add app iconSize ${iconSize}`);
    this.mFolderStyleConfig.mAddFolderIconMarginHorizontal = (itemSize - iconSize) / 2;
    this.mFolderStyleConfig.mAddFolderIconSize = iconSize;
    this.mFolderStyleConfig.mAddFolderTitleSize = titleSize;
    this.mFolderStyleConfig.mAddFolderButtonSize = buttonSize;
  }

  /**
   * calculate Form
   */
  calculateForm() {
    const iconSize = this.mPageDesktopStyleConfig.mIconSize;
    const folderSize = this.mFolderStyleConfig.mGridSize;
    const itemSize = this.mLauncherLayoutStyleConfig.mAppItemSize;
    const gap = this.mPageDesktopStyleConfig.mColumnsGap;
    const iconMarginHorizontal = this.mPageDesktopStyleConfig.mIconMarginHorizontal;
    const iconMarginVertical = this.mPageDesktopStyleConfig.mIconMarginVertical;
    const nameHeight = this.mPageDesktopStyleConfig.mNameHeight;
    const widthDimension1: number = folderSize;
    const heightDimension1: number = iconSize;
    this.mFormStyleConfig.mFormWidth.set(CommonConstants.CARD_DIMENSION_1x2.toString(), widthDimension1);
    this.mFormStyleConfig.mFormHeight.set(CommonConstants.CARD_DIMENSION_1x2.toString(),heightDimension1);
    const widthDimension2 = folderSize;
    const heightDimension2 = folderSize;
    this.mFormStyleConfig.mFormWidth.set(CommonConstants.CARD_DIMENSION_2x2.toString(),widthDimension2);
    this.mFormStyleConfig.mFormHeight.set(CommonConstants.CARD_DIMENSION_2x2.toString(),heightDimension2);
    const widthDimension3 = (itemSize + gap) * 4 - gap - iconMarginHorizontal * 2;
    const heightDimension3 = folderSize;
    this.mFormStyleConfig.mFormWidth.set(CommonConstants.CARD_DIMENSION_2x4.toString(),widthDimension3);
    this.mFormStyleConfig.mFormHeight.set(CommonConstants.CARD_DIMENSION_2x4.toString(),heightDimension3);
    const widthDimension4 = widthDimension3;
    const heightDimension4 = (itemSize + gap) * 4 - gap - 2 * iconMarginVertical
    - nameHeight - this.mPageDesktopStyleConfig.mIconNameMargin;
    this.mFormStyleConfig.mFormWidth.set(CommonConstants.CARD_DIMENSION_4x4.toString(),widthDimension4);
    this.mFormStyleConfig.mFormHeight.set(CommonConstants.CARD_DIMENSION_4x4.toString(),heightDimension4);
    this.mFormStyleConfig.mIconNameMargin = this.mPageDesktopStyleConfig.mIconNameMargin;
  }

  calculateDock() {
    const margin = this.mLauncherLayoutStyleConfig.mDockSaveMargin;
    const dockGap = this.mLauncherLayoutStyleConfig.mDockGutter;
    const iconSize = this.mLauncherLayoutStyleConfig.mDockIconSize;
    const listItemGap = this.mLauncherLayoutStyleConfig.mDockItemGap;
    const dockPadding = this.mLauncherLayoutStyleConfig.mDockPadding;
    this.mSmartDockStyleConfig.mDockGap = dockGap;
    this.mSmartDockStyleConfig.mIconSize = iconSize;
    this.mSmartDockStyleConfig.mListItemWidth = iconSize;
    this.mSmartDockStyleConfig.mListItemHeight = iconSize;
    this.mSmartDockStyleConfig.mListItemGap = listItemGap;
    this.mSmartDockStyleConfig.mDockPadding = dockPadding;
    let maxDockNum = 0;
    const dockSpaceWidth = this.mWorkSpaceWidth - 2 * margin;
    if (this.mWorkSpaceWidth < PresetStyleConstants.DEFAULT_DOCK_RECENT_WIDTH || !this.isPad) {
      this.mSmartDockStyleConfig.mMaxRecentNum = 0;
      this.mSmartDockStyleConfig.mDockGap = 0;
      maxDockNum = ~~((dockSpaceWidth - 2 * dockPadding + listItemGap) / (iconSize + listItemGap));
    } else {
      const maxNum = ~~((dockSpaceWidth - dockGap - 4 * dockPadding + 2 * listItemGap) / (iconSize + listItemGap));
      maxDockNum = maxNum - this.mSmartDockStyleConfig.mMaxRecentNum;
    }
    this.mSmartDockStyleConfig.mMaxDockNum = maxDockNum;
    this.mSmartDockStyleConfig.mDockHeight = iconSize + 2 * dockPadding;
    this.mSmartDockStyleConfig.mMarginBottom = this.mLauncherLayoutStyleConfig.mDockMarginBottom;
    this.mDockHeight = iconSize + 2 * dockPadding + this.mLauncherLayoutStyleConfig.mDockMarginBottom;
  }

  calculateAppCenter() {
    const saveMargin: number = this.mLauncherLayoutStyleConfig.mAppCenterMargin;
    const gutter: number = this.mLauncherLayoutStyleConfig.mAppCenterGutter;
    const appItemSize = this.mLauncherLayoutStyleConfig.mAppCenterSize;
    const width = this.mWorkSpaceWidth - 2 * saveMargin;
    const height = this.mWorkSpaceHeight;
    const column = ~~((width + gutter) / (appItemSize + gutter));
    const row = ~~((height + gutter) / (appItemSize + gutter));
    const padding = (height - row * (appItemSize + gutter) + gutter) / 2;
    this.mAppGridStyleConfig.mColumnsGap = gutter;
    this.mAppGridStyleConfig.mRowsGap = gutter;
    this.mAppGridStyleConfig.mColumns = column;
    this.mAppGridStyleConfig.mRows = row;
    this.mAppGridStyleConfig.mGridWidth = width;
    this.mAppGridStyleConfig.mGridHeight = height - 2 * padding;
    this.mAppGridStyleConfig.mPadding = padding;

    const ratio = this.mLauncherLayoutStyleConfig.mAppCenterRatio;
    const lines = this.mLauncherLayoutStyleConfig.mAppCenterNameLines;
    const appTextSize = this.mLauncherLayoutStyleConfig.mAppCenterNameSize;
    const nameHeight = lines * appTextSize;
    this.mAppGridStyleConfig.mNameSize = appTextSize;
    this.mAppGridStyleConfig.mNameHeight = nameHeight;
    const iconMarginVertical = ratio * appItemSize;
    const iconHeight = appItemSize - 2 * iconMarginVertical - nameHeight - this.mPageDesktopStyleConfig.mIconNameMargin;
    this.mAppGridStyleConfig.mIconSize = iconHeight;
    this.mAppGridStyleConfig.mNameLines = lines;
    this.mAppGridStyleConfig.mIconMarginVertical = iconMarginVertical;
    this.mAppGridStyleConfig.mAppItemSize = appItemSize;
  }

  /**
   * update desktop gridConfig
   */
  private updateDesktopGrid() {
    const gridConfig = this.mSettingsModel.getGridConfig();
    gridConfig.row = this.mPageDesktopStyleConfig.mRows;
    gridConfig.column = this.mPageDesktopStyleConfig.mColumns;
    gridConfig.layout = `${gridConfig.row}X${gridConfig.column}`;
    gridConfig.name = `${gridConfig.row}X${gridConfig.column}`;
  }

  getWorkSpaceHeight(): number {
    return this.mWorkSpaceHeight;
  }

  getDockHeight(): number {
    return this.mDockHeight;
  }

  getIndicator(): number {
    return this.mIndicatorHeight;
  }
  /**
   * Set device type.
   *
   * @param deviceType: Device type
   */
  setDevice(deviceType: string) {
    PageDesktopViewModel.getInstance().setDevice(deviceType);
    this.isPad = deviceType === CommonConstants.PAD_DEVICE_TYPE;
    AppStorage.SetOrCreate('isPad', this.isPad);
  }

  /**
   * Get device type.
   */
  getDevice() {
    return this.isPad;
  }
}