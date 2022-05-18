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

import Log from '../utils/Log';
import LayoutConfigManager from '../layoutconfig/LayoutConfigManager';
import PresetStyleConstants from '../constants/PresetStyleConstants';
import StyleConstants from '../constants/StyleConstants';
import CommonConstants from '../constants/CommonConstants';
import LauncherLayoutStyleConfig from '../layoutconfig/LauncherLayoutStyleConfig';
import SettingsModel from '../model/SettingsModel';

const TAG = 'LayoutViewModel';

/**
 * layout viewmodel
 */
export default class LayoutViewModel {
  private mIsPad = true;
  private mScreenHeight: number | undefined;
  private mScreenWidth: number | undefined;
  private mWorkSpaceHeight: number | undefined;
  private mDockHeight: number | undefined;
  private mSysUITopHeight: number | undefined;
  private mSysUIBottomHeight: number | undefined;
  private mIndicatorHeight: number | undefined;
  private readonly mLauncherLayoutStyleConfig: LauncherLayoutStyleConfig;
  private mNavigationBarStatus = false;
  private mDesktopGap: number | undefined;
  private mDesktopIconMarginLeft: number | undefined;
  private mDesktopIconMarginTop: number | undefined;
  private mDesktopNameHeight: number | undefined;
  private mDesktopNameLines: number | undefined;
  private mDesktopIconNameMargin: number | undefined;
  private mDesktopIconSize: number | undefined;
  private mDesktopItemSize: number | undefined;
  private mDesktopNameSize: number | undefined;
  private mDesktopFolderSize: number | undefined;
  private mGridRealHeight: number | undefined;

  private constructor() {
    Log.showInfo(TAG, 'constructor');
    this.mLauncherLayoutStyleConfig = LayoutConfigManager.getStyleConfig(
      LauncherLayoutStyleConfig.LAUNCHER_COMMON_STYLE_CONFIG, LauncherLayoutStyleConfig.LAUNCHER_PRODUCT_STYLE_CONFIG);
  }

  /**
    * get the LayoutViewModel instance
    *
    * @return LayoutViewModel
   */
  static getInstance(): LayoutViewModel {
    Log.showInfo(TAG, 'getInstance');
    if (globalThis.LayoutViewModelInstance == null) {
      globalThis.LayoutViewModelInstance = new LayoutViewModel();
      globalThis.LayoutViewModelInstance.initScreen();
    }
    return globalThis.LayoutViewModelInstance;
  }

  /**
   * init screen info
   *
   * @param navigationBarStatus
   */
  initScreen(navigationBarStatus?: string): void {
    Log.showInfo(TAG, 'initScreen');
    this.mScreenWidth = AppStorage.Get('screenWidth');
    this.mScreenHeight = AppStorage.Get('screenHeight');
    Log.showInfo(TAG, `initScreen screenWidth ${this.mScreenWidth}`);
    Log.showInfo(TAG, `initScreen screenHeight ${this.mScreenHeight}`);
    this.mSysUITopHeight = this.mLauncherLayoutStyleConfig.mSysTopHeight;
    this.mNavigationBarStatus = navigationBarStatus === '0' ? true : false;
    Log.showInfo(TAG, `initScreen navigationBarStatus: ${this.mNavigationBarStatus}`);
    if (!this.mNavigationBarStatus) {
      this.mSysUIBottomHeight = this.mLauncherLayoutStyleConfig.mSysBottomHeight;
    } else {
      this.mSysUIBottomHeight = 0;
    }
    Log.showInfo(TAG, `mSysUIBottomHeight: ${this.mSysUIBottomHeight}`);
    AppStorage.SetOrCreate('sysUIBottomHeight', this.mSysUIBottomHeight);
    Log.showInfo(TAG, `this.mSysUITopHeight ${this.mSysUITopHeight}`);
    Log.showInfo(TAG, `this.mSysUIBottomHeight ${this.mSysUIBottomHeight}`);
    this.mIndicatorHeight = this.mLauncherLayoutStyleConfig.mIndicatorHeight;
    Log.showInfo(TAG, `initScreen mIndicatorHeight ${this.mIndicatorHeight}`);
  }

  /**
   * set device type
   *
   * @param deviceType: Device type
   */
  setDevice(deviceType: string): void {
    this.mIsPad = deviceType === CommonConstants.PAD_DEVICE_TYPE;
    AppStorage.SetOrCreate('isPad', this.mIsPad);
  }

  /**
   * get workSpaceHeight
   */
  getWorkSpaceHeight(): number {
    Log.showInfo(TAG, `initScreen mWorkSpaceHeight ${this.mWorkSpaceHeight}`);
    return this.mWorkSpaceHeight;
  }

  /**
   * get dockHeight
   */
  getDockHeight(): number {
    Log.showInfo(TAG, `initScreen mDockHeight ${this.mDockHeight}`);
    return this.mDockHeight;
  }

  /**
   * get indicatorHeight
   */
  getIndicator(): number {
    Log.showInfo(TAG, `initScreen mIndicatorHeight ${this.mIndicatorHeight}`);
    return this.mIndicatorHeight;
  }

  /**
   * calculate dock
   */
  calculateDock(): any {
    Log.showInfo(TAG, 'calculateDock');
    let margin = this.mLauncherLayoutStyleConfig.mDockSaveMargin;
    let dockGap = this.mLauncherLayoutStyleConfig.mDockGutter;
    let iconSize = this.mLauncherLayoutStyleConfig.mDockIconSize;
    let listItemGap = this.mLauncherLayoutStyleConfig.mDockItemGap;
    let dockPadding = this.mLauncherLayoutStyleConfig.mDockPadding;
    Log.showInfo(TAG, `calculateDock navigationBarStatus: ${this.mNavigationBarStatus}`);
    let marginBottom = this.mLauncherLayoutStyleConfig.mDockMarginBottomHideBar;
    if (!this.mNavigationBarStatus) {
      marginBottom = this.mLauncherLayoutStyleConfig.mDockMarginBottom;
    }
    Log.showInfo(TAG, 'calculateDock iconSize ${iconSize}');
    let maxDockNum = 0;
    let dockSpaceWidth = this.mScreenWidth - 2 * margin;
    let maxRecentNum = 3;
    if (this.mScreenWidth < PresetStyleConstants.DEFAULT_DOCK_RECENT_WIDTH || !this.mIsPad) {
      maxRecentNum = 0;
      maxDockNum = ~~((dockSpaceWidth - 2 * dockPadding + listItemGap) / (iconSize + listItemGap));
    } else {
      let maxNum = ~~((dockSpaceWidth - dockGap - 4 * dockPadding + 2 * listItemGap) / (iconSize + listItemGap));
      maxDockNum = maxNum - maxRecentNum;
    }
    this.mDockHeight = iconSize + 2 * dockPadding + marginBottom;
    this.mWorkSpaceHeight = this.mScreenHeight - this.mSysUIBottomHeight - this.mDockHeight;
    Log.showInfo(TAG, `calculate Dock mDockHeight ${this.mDockHeight}`);
    let result = {
      mDockGap: dockGap,
      mIconSize: iconSize,
      mListItemWidth: iconSize,
      mListItemHeight: iconSize,
      mListItemGap: listItemGap,
      mDockPadding: dockPadding,
      mMaxRecentNum: maxRecentNum,
      mMaxDockNum: maxDockNum,
      mDockHeight: iconSize + 2 * dockPadding,
      mMarginBottom: marginBottom
    };
    return result;
  }

  /**
   * calculate desktop
   */
  calculateDesktop(): any {
    Log.showInfo(TAG, 'calculateDesktop');
    let margin = this.mLauncherLayoutStyleConfig.mMargin;
    let realWidth = this.mScreenWidth - 2 * margin;
    let realHeight = this.mWorkSpaceHeight - this.mIndicatorHeight - this.mSysUITopHeight;
    if (this.mNavigationBarStatus) {
      realHeight = realHeight - this.mLauncherLayoutStyleConfig.mSysBottomHeight;
    }
    Log.showInfo(TAG, `realHeight ${realHeight}`);
    let itemSize = this.mLauncherLayoutStyleConfig.mAppItemSize;
    let minGutter = this.mLauncherLayoutStyleConfig.mGridGutter;
    let column = ~~((realWidth + minGutter) / (itemSize + minGutter));
    let userWidth = (realWidth + minGutter - (itemSize + minGutter) * column);
    let gutter = (userWidth / (column - 1)) + minGutter;
    Log.showInfo(TAG, `desktop gutter ${gutter}`);
    let row = ~~((realHeight + gutter) / (itemSize + gutter));
    let marginTop = ((realHeight + gutter - (itemSize + gutter) * row) / 2);
    Log.showInfo(TAG, `desktop marginTop ${marginTop}`);
    //set desktop icon
    let ratio = this.mLauncherLayoutStyleConfig.mIconRatio;
    let lines = this.mLauncherLayoutStyleConfig.mNameLines;
    let appTextSize = this.mLauncherLayoutStyleConfig.mNameSize;
    let nameHeight = this.mLauncherLayoutStyleConfig.mNameHeight;
    let iconNameMargin = this.mLauncherLayoutStyleConfig.mIconNameGap;
    let iconMarginVertical = ratio * itemSize;
    Log.showInfo(TAG, `desktopIcon iconMarginVertical ${iconMarginVertical}`);
    let iconHeight = itemSize - 2 * iconMarginVertical - nameHeight - iconNameMargin;
    Log.showInfo(TAG, `desktopIcon iconHeight ${iconHeight}`);
    let iconMarginHorizontal = (itemSize - iconHeight) / 2;
    Log.showInfo(TAG, `desktopIcon iconMarginHorizontal ${iconMarginHorizontal}`);
    this.updateGrid(row, column);

    this.mDesktopGap = gutter;
    this.mDesktopIconMarginLeft = iconMarginHorizontal;
    this.mDesktopIconMarginTop = iconMarginVertical;
    this.mDesktopNameLines = lines;
    this.mDesktopNameHeight = nameHeight;
    this.mDesktopIconNameMargin = iconNameMargin;
    this.mDesktopIconSize = iconHeight;
    this.mDesktopItemSize = itemSize;
    this.mDesktopNameSize = appTextSize;
    this.mGridRealHeight = realHeight;
    //set desktop config
    let result = {
      mMargin: margin,
      mColumnsGap: gutter,
      mRowsGap: gutter,
      mColumns: column,
      mRows: row,
      mDesktopMarginTop: marginTop,
      mGridWidth: realWidth,
      mGridHeight: realHeight,
      mAppItemSize: itemSize,
      mNameSize: appTextSize,
      mNameHeight: nameHeight,
      mIconNameMargin: iconNameMargin,
      mIconSize: iconHeight,
      mNameLines: lines,
      mIconMarginHorizontal: iconMarginHorizontal,
      mIconMarginVertical: iconMarginVertical
    };
    return result;
  }

  /**
   * calculate desktop folder
   *
   * @param layoutInfo folder layoutInfo
   */
  calculateFolder(layoutInfo: any): any {
    let itemSize = this.mLauncherLayoutStyleConfig.mAppItemSize;
    let gap = this.mDesktopGap;
    let iconMargin = this.mDesktopIconMarginLeft;
    let gridColumn = SettingsModel.getInstance().getGridConfig().row;
    Log.showInfo(TAG, `desktop folder itemSize ${itemSize} gridColumn ${gridColumn}`);
    let folderSize = this.mGridRealHeight / gridColumn + itemSize - iconMargin * 2;
    Log.showInfo(TAG, `desktop folder folderSize ${folderSize}`);
    let folderGutter = this.mLauncherLayoutStyleConfig.mFolderGutterRatio * folderSize;
    let folderMargin = this.mLauncherLayoutStyleConfig.mFolderMarginRatio * folderSize;
    Log.showInfo(TAG, `desktop folder folderGutter ${folderGutter}`);
    Log.showInfo(TAG, `desktop folder folderMargin ${folderMargin}`);
    let column = layoutInfo.column;
    let iconSize = (folderSize - folderGutter * 2 - folderMargin * 2) / column;
    Log.showInfo(TAG, `desktop folder iconSize ${iconSize}`);
    let nameHeight = this.mDesktopNameHeight;
    let nameLines = this.mDesktopNameLines;
    let iconNameMargin = this.mDesktopIconNameMargin;

    this.mDesktopFolderSize = folderSize;
    let result = {
      mGridSize: folderSize,
      mFolderAppSize: iconSize,
      mFolderGridGap: folderGutter,
      mGridMargin: folderMargin,
      mNameHeight: nameHeight,
      mNameLines: nameLines,
      mIconNameMargin: iconNameMargin
    };
    return result;
  }

  /**
   * calculate open folder
   *
   * @param openFolderConfig layoutInfo
   */
  calculateOpenFolder(openFolderConfig: any): any {
    let row = openFolderConfig.row;
    let column = openFolderConfig.column;
    let gutter = this.mLauncherLayoutStyleConfig.mFolderOpenGutter;
    let padding = this.mLauncherLayoutStyleConfig.mFolderOpenPADDING;
    let margin = this.mLauncherLayoutStyleConfig.mFolderOpenMargin;
    let itemSize = this.mDesktopItemSize;
    let layoutWidth = column * itemSize + (column - 1) * gutter + 2 * padding;
    let layoutHeight = row * itemSize + (row - 1) * gutter + 2 * padding;
    let layoutSwiperHeight = row * itemSize + (row - 1) * gutter + 2 * padding + itemSize;
    let result = {
      mOpenFolderGridWidth: layoutWidth,
      mOpenFolderGridHeight: layoutHeight,
      mOpenFolderSwiperHeight: layoutSwiperHeight,
      mOpenFolderAddIconSize: this.mDesktopIconSize,
      mOpenFolderIconSize: this.mDesktopIconSize,
      mOpenFolderAppSize: this.mDesktopItemSize,
      mOpenFolderAppNameSize: this.mDesktopNameSize,
      mOpenFolderAppNameHeight: this.mDesktopNameHeight,
      mOpenFolderGridGap: gutter,
      mOpenFolderGridPadding: padding,
      mFolderOpenMargin: margin,
      mOpenFolderGridIconTopPadding: this.mDesktopIconMarginTop
    };
    return result;
  }

  /**
   * calculate add app
   *
   * @param addFolderConfig
   */
  calculateFolderAddList(addFolderConfig: any): any {
    let column: number = addFolderConfig.column;
    let margin: number = this.mLauncherLayoutStyleConfig.mFolderAddGridMargin;
    let saveMargin: number = PresetStyleConstants.DEFAULT_SCREEN_GRID_GAP_AND_MARGIN;
    let screenGap: number = PresetStyleConstants.DEFAULT_SCREEN_GRID_GAP_AND_MARGIN;
    let gap: number = this.mLauncherLayoutStyleConfig.mFolderAddGridGap;
    let maxHeight: number = this.mLauncherLayoutStyleConfig.mFolderAddMaxHeight *
      (this.mScreenHeight - this.mSysUITopHeight);
    let toggleSize: number = this.mLauncherLayoutStyleConfig.mFolderToggleSize;
    let screenColumns: number = PresetStyleConstants.DEFAULT_PHONE_GRID_APP_COLUMNS;
    let textSize: number = this.mLauncherLayoutStyleConfig.mFolderAddTextSize;
    let textLines: number = this.mLauncherLayoutStyleConfig.mFolderAddTextLines;
    let titleSize: number = this.mLauncherLayoutStyleConfig.mFolderAddTitleSize;
    let linesHeight = textSize * textLines;
    let buttonSize: number = this.mLauncherLayoutStyleConfig.mFolderAddButtonSize;
    let ratio: number = this.mLauncherLayoutStyleConfig.mFolderAddIconRatio;
    if (this.mIsPad) {
      screenColumns = PresetStyleConstants.DEFAULT_PAD_GRID_APP_COLUMNS;
    }
    let columnsWidth = this.mScreenWidth - 2 * saveMargin - (screenColumns - 1) * screenGap;
    let columnWidth = columnsWidth / screenColumns;
    let layoutWidth = columnWidth * column + (column - 1) * screenGap;
    Log.showInfo(TAG, `desktopIcon add app layoutWidth ${layoutWidth}`);
    let gridSize = layoutWidth - 2 * margin;
    let itemSize = (gridSize - (column - 1) * gap) / column;
    Log.showInfo(TAG, `desktopIcon add app itemSize ${itemSize}`);
    let layoutHeight = layoutWidth + StyleConstants.DEFAULT_APP_ADD_TITLE_SIZE +
      StyleConstants.DEFAULT_BUTTON_HEIGHT_NUMBER +
      StyleConstants.DEFAULT_DIALOG_BOTTOM_MARGIN_NUMBER;
    Log.showInfo(TAG, `desktopIcon add app layoutHeight ${layoutHeight}`);
    let iconSize = (1 - 2 * ratio) * itemSize - linesHeight - this.mDesktopIconNameMargin;
    Log.showInfo(TAG, `desktopIcon add app iconSize ${iconSize}`);
    Log.showInfo(TAG, `desktopIcon add app maxHeight ${maxHeight}`);

    let result = {
      mAddFolderGridWidth: gridSize,
      mAddFolderDialogWidth: layoutWidth,
      mAddFolderDialogHeight: layoutHeight,
      mAddFolderGridGap: gap,
      mAddFolderGridMargin: margin,
      mAddFolderMaxHeight: maxHeight,
      mFolderToggleSize: toggleSize,
      mAddFolderTextSize: textSize,
      mAddFolderTextLines: textLines,
      mAddFolderLinesHeight: linesHeight,
      mAddFolderItemSize: itemSize,
      mAddFolderIconPaddingTop: itemSize * ratio,
      mAddFolderIconMarginHorizontal: (itemSize - iconSize) / 2,
      mAddFolderIconSize: iconSize,
      mAddFolderTitleSize: titleSize,
      mAddFolderButtonSize: buttonSize
    };
    return result;
  }

  /**
   * calculate card form
   */
  calculateForm(): any {
    let iconSize = this.mDesktopIconSize;
    let folderSize = this.mDesktopFolderSize;
    let itemSize = this.mDesktopItemSize;
    let gap = this.mDesktopGap;
    let iconMarginHorizontal = this.mDesktopIconMarginLeft;
    let iconMarginVertical = this.mDesktopIconMarginTop;
    let nameHeight = this.mDesktopNameHeight;
    let widthDimension1: number = folderSize;
    let heightDimension1: number = iconSize;
    let widthDimension2 = folderSize;
    let heightDimension2 = folderSize;
    let widthDimension3 = (itemSize + gap) * 4 - gap - iconMarginHorizontal * 2;
    let heightDimension3 = folderSize;
    let widthDimension4 = widthDimension3;
    let heightDimension4 = (itemSize + gap) * 4 - gap - 2 * iconMarginVertical -
      nameHeight - this.mDesktopIconNameMargin;
    let result = {
      widthDimension1: widthDimension1,
      heightDimension1: heightDimension1,
      widthDimension2: widthDimension2,
      heightDimension2: heightDimension2,
      widthDimension3: widthDimension3,
      heightDimension3: heightDimension3,
      widthDimension4: widthDimension4,
      heightDimension4: heightDimension4,
      mIconNameMargin: this.mDesktopIconNameMargin
    };
    return result;
  }

  /**
   * calculate app center
   */
  calculateAppCenter(): any {
    let saveMargin: number = this.mLauncherLayoutStyleConfig.mAppCenterMargin;
    let gutter: number = this.mLauncherLayoutStyleConfig.mAppCenterGutter;
    let appItemSize = this.mLauncherLayoutStyleConfig.mAppCenterSize;
    let width = this.mScreenWidth - 2 * saveMargin;
    let height = this.mWorkSpaceHeight;
    let column = ~~((width + gutter) / (appItemSize + gutter));
    let row = ~~((height + gutter) / (appItemSize + gutter));
    let padding = (height - row * (appItemSize + gutter) + gutter) / 2;
    let ratio = this.mLauncherLayoutStyleConfig.mAppCenterRatio;
    let lines = this.mLauncherLayoutStyleConfig.mAppCenterNameLines;
    let appTextSize = this.mLauncherLayoutStyleConfig.mAppCenterNameSize;
    let nameHeight = lines * appTextSize;
    let iconMarginVertical = ratio * appItemSize;
    let iconHeight = appItemSize - 2 * iconMarginVertical - nameHeight - this.mDesktopIconNameMargin;
    let result = {
      mColumnsGap: gutter,
      mRowsGap: gutter,
      mColumns: column,
      mRows: row,
      mGridWidth: width,
      mGridHeight: height - 2 * padding,
      mPadding: padding,
      mNameSize: appTextSize,
      mNameHeight: nameHeight,
      mIconSize: iconHeight,
      mNameLines: lines,
      mIconMarginVertical: iconMarginVertical,
      mAppItemSize: appItemSize
    };
    return result;
  }

  /**
   * update gridConfig info
   *
   * @param {number} row row of grid
   * @param {number} column column of grid
   */
  private updateGrid(row: number, column: number): void {
    Log.showInfo(TAG, `updateGrid row ${row} column ${column}`);
    let settingsModel = SettingsModel.getInstance();
    let gridConfig = settingsModel.getGridConfig();
    gridConfig.row = row;
    gridConfig.column = column;
    const layoutDimension = `${row}X${column}`;
    gridConfig.layout = layoutDimension;
    gridConfig.name = layoutDimension;
  }
}