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

import { Log } from '../utils/Log';
import { SettingsModel } from '../model/SettingsModel';
import { StyleConstants } from '../constants/StyleConstants';
import { CommonConstants } from '../constants/CommonConstants';
import { PresetStyleConstants } from '../constants/PresetStyleConstants';
import { layoutConfigManager } from '../layoutconfig/LayoutConfigManager';
import { LauncherLayoutStyleConfig } from '../layoutconfig/LauncherLayoutStyleConfig';

const TAG = 'LayoutViewModel';

/**
 * layout viewmodel
 */
export class LayoutViewModel {
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
  private mCommonDialogWidth = '';

  private constructor() {
    this.mLauncherLayoutStyleConfig = layoutConfigManager.getStyleConfig(
      LauncherLayoutStyleConfig.LAUNCHER_COMMON_STYLE_CONFIG, LauncherLayoutStyleConfig.LAUNCHER_PRODUCT_STYLE_CONFIG);
  }

  /**
   * get the LayoutViewModel instance
   *
   * @return LayoutViewModel
   */
  static getInstance(): LayoutViewModel {
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
    this.mScreenWidth = AppStorage.Get('screenWidth');
    this.mScreenHeight = AppStorage.Get('screenHeight');
    Log.showDebug(TAG, `initScreen screenWidth: ${this.mScreenWidth}, screenHeight: ${this.mScreenHeight}`);
    this.mSysUITopHeight = this.mLauncherLayoutStyleConfig.mSysTopHeight;
    this.mNavigationBarStatus = navigationBarStatus === '0' ? true : false;

    if (!this.mNavigationBarStatus) {
      if (this.mScreenWidth > this.mScreenHeight) {
        this.mSysUIBottomHeight = this.mLauncherLayoutStyleConfig.mSysBottomHeight * this.mScreenWidth / 1280;
      } else {
        this.mSysUIBottomHeight = this.mLauncherLayoutStyleConfig.mSysBottomHeight * this.mScreenWidth / 360;
      }
    } else {
      this.mSysUIBottomHeight = 0;
    }
    AppStorage.SetOrCreate('sysUIBottomHeight', this.mSysUIBottomHeight);
    this.mIndicatorHeight = this.mLauncherLayoutStyleConfig.mIndicatorHeight;
    Log.showDebug(TAG, `initScreen SysUIBottomHeight: ${this.mSysUIBottomHeight},
      IndicatorHeight: ${this.mIndicatorHeight}, SysUITopHeight: ${this.mSysUITopHeight},
      SysUIBottomHeight: ${this.mSysUIBottomHeight}`);
    this.mCommonDialogWidth = this.mLauncherLayoutStyleConfig.mCommonDialogWidth;
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
    return this.mWorkSpaceHeight;
  }

  /**
   * get dockHeight
   */
  getDockHeight(): number {
    return this.mDockHeight;
  }

  /**
   * get UninstallDialogWidth
   */
  getCommonDialogWidth(): string {
    return this.mCommonDialogWidth;
  }

  /**
   * get indicatorHeight
   */
  getIndicator(): number {
    return this.mIndicatorHeight;
  }

  /**
   * calculate dock
   */
  calculateDock(): any {
    Log.showInfo(TAG, 'calculateDock start');
    let margin = this.mLauncherLayoutStyleConfig.mDockSaveMargin;
    let dockGap = this.mLauncherLayoutStyleConfig.mDockGutter;
    let iconSize = this.mLauncherLayoutStyleConfig.mDockIconSize;
    let listItemGap = this.mLauncherLayoutStyleConfig.mDockItemGap;
    let dockPadding = this.mLauncherLayoutStyleConfig.mDockPadding;
    let marginBottom = this.mLauncherLayoutStyleConfig.mDockMarginBottomHideBar;
    if (!this.mNavigationBarStatus) {
      marginBottom = this.mLauncherLayoutStyleConfig.mDockMarginBottom;
    }
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
    Log.showInfo(TAG, 'calculateDesktop start');
    let margin = this.mLauncherLayoutStyleConfig.mMargin;
    let realWidth = this.mScreenWidth - 2 * margin;
    let realHeight = this.mWorkSpaceHeight - this.mIndicatorHeight - this.mSysUITopHeight;
    if (this.mNavigationBarStatus) {
      realHeight = realHeight - this.mLauncherLayoutStyleConfig.mSysBottomHeight;
    }
    let itemSize = this.mLauncherLayoutStyleConfig.mAppItemSize;
    let minGutter = this.mLauncherLayoutStyleConfig.mGridGutter;
    let column = ~~((realWidth + minGutter) / (itemSize + minGutter));
    let userWidth = (realWidth + minGutter - (itemSize + minGutter) * column);
    let gutter = (userWidth / (column - 1)) + minGutter;
    let row = ~~((realHeight + gutter) / (itemSize + gutter));
    let marginTop = ((realHeight + gutter - (itemSize + gutter) * row) / 2);
    if (!this.mIsPad) {
        if (row > 6) {
            row = 6;
        }

        if (this.mNavigationBarStatus) {
            realHeight = realHeight + this.mLauncherLayoutStyleConfig.mSysBottomHeight;
        }
        let remainHeight = (realHeight + gutter - (itemSize + gutter) * row)
        realHeight -= remainHeight
        marginTop = remainHeight / 2 + this.mSysUITopHeight
    }
    //set desktop icon
    let ratio = this.mLauncherLayoutStyleConfig.mIconRatio;
    let lines = this.mLauncherLayoutStyleConfig.mNameLines;
    let appTextSize = this.mLauncherLayoutStyleConfig.mNameSize;
    let nameHeight = this.mLauncherLayoutStyleConfig.mNameHeight;
    let iconNameMargin = this.mLauncherLayoutStyleConfig.mIconNameGap;
    let iconMarginVertical = ratio * itemSize;
    let iconHeight = itemSize - 2 * iconMarginVertical - nameHeight - iconNameMargin;
    let iconMarginHorizontal = (itemSize - iconHeight) / 2;
    if (AppStorage.Get('isPortrait') ) {
      row = 11;
      column = 5;
    }
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
    Log.showInfo(TAG, 'calculateFolder start');
    let itemSize = this.mLauncherLayoutStyleConfig.mAppItemSize;
    let gap = this.mDesktopGap;
    let iconMargin = this.mDesktopIconMarginLeft;
    let gridColumn = SettingsModel.getInstance().getGridConfig().row;
    let folderSize = this.mGridRealHeight / gridColumn + itemSize - iconMargin * 2;
    let folderGutter = this.mLauncherLayoutStyleConfig.mFolderGutterRatio * folderSize;
    let folderMargin = this.mLauncherLayoutStyleConfig.mFolderMarginRatio * folderSize;

    let column = layoutInfo.column;
    let iconSize = (folderSize - folderGutter * 2 - folderMargin * 2) / column;
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
    Log.showInfo(TAG, 'calculateOpenFolder start');
    let row = openFolderConfig.row;
    let column = openFolderConfig.column;
    let gutter = this.mLauncherLayoutStyleConfig.mFolderOpenGutter;
    let padding = this.mLauncherLayoutStyleConfig.mFolderOpenPADDING;
    let margin = this.mLauncherLayoutStyleConfig.mFolderOpenMargin;
    let title = this.mLauncherLayoutStyleConfig.mFolderOpenTitle;
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
      mOpenFolderGridRow: row,
      mOpenFolderGridColumn: column,
      mOpenFolderGridGap: gutter,
      mOpenFolderGridPadding: padding,
      mFolderOpenMargin: margin,
      mFolderOpenTitle: title,
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
    Log.showInfo(TAG, 'calculateFolderAddList start');
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
    let gridSize = layoutWidth - 2 * margin;
    let itemSize = (gridSize - (column - 1) * gap) / column;
    let layoutHeight = layoutWidth + StyleConstants.DEFAULT_APP_ADD_TITLE_SIZE +
    StyleConstants.DEFAULT_BUTTON_HEIGHT_NUMBER +
    StyleConstants.DEFAULT_DIALOG_BOTTOM_MARGIN_NUMBER;
    let iconSize = (1 - 2 * ratio) * itemSize - linesHeight - this.mDesktopIconNameMargin;

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
    Log.showInfo(TAG, 'calculateForm start');
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
    Log.showInfo(TAG, 'calculateAppCenter start');
    let appCenterMarginLeft: number = this.mLauncherLayoutStyleConfig.mAppCenterMarginLeft;
    let saveMargin: number = this.mLauncherLayoutStyleConfig.mAppCenterMargin;
    let gutter: number = this.mLauncherLayoutStyleConfig.mAppCenterGutter;
    let appItemSize = this.mLauncherLayoutStyleConfig.mAppCenterSize;
    let width = this.mScreenWidth - 2 * appCenterMarginLeft;
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
      mAppItemSize: appItemSize,
      mAppCenterMarginLeft:appCenterMarginLeft
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