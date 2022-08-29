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

import { StyleConstants } from '@ohos/common';
import { CommonConstants } from '@ohos/common';
import { LayoutViewModel } from '@ohos/common';
import { AppListStyleConfig } from '@ohos/common';
import { PresetStyleConstants } from '@ohos/common';
import { BigFolderModel } from '../model/BigFolderModel';
import { BigFolderConstants } from './constants/BigFolderConstants';
import { BigFolderStyleConstants } from './constants/BigFolderStyleConstants';

/**
 * folder style config
 */
export class BigFolderStyleConfig extends AppListStyleConfig {
  /**
   * folder grid size
   */
  mGridSize = StyleConstants.DEFAULT_FOLDER_GRID_SIZE;

  /**
   * folder app size
   */
  mFolderAppSize = StyleConstants.DEFAULT_FOLDER_APP_SIZE;

  /**
   * folder grid margin side
   */
  mGridMargin = StyleConstants.DEFAULT_FOLDER_GRID_MARGIN;

  /**
   * folder grid gap
   */
  mFolderGridGap = StyleConstants.DEFAULT_FOLDER_GRID_GAP;

  /**
   * margin of folder open
   */
  mFolderOpenMargin = StyleConstants.DEFAULT_OPEN_FOLDER_TITLE_HEIGHT;
  mFolderOpenTitle = StyleConstants.DEFAULT_OPEN_FOLDER_TITLE_TOP;

  /**
   * open folder grid row
   */
  mOpenFolderGridRow = StyleConstants.DEFAULT_OPEN_FOLDER_GRID_ROW;

  /**
   * open folder grid column
   */
  mOpenFolderGridColumn = StyleConstants.DEFAULT_OPEN_FOLDER_GRID_COLUMN;

  /**
   * open folder app size
   */
  mOpenFolderAppSize = StyleConstants.DEFAULT_OPEN_FOLDER_APP_SIZE;

  /**
   * icon size of open folder
   */
  mOpenFolderIconSize = StyleConstants.DEFAULT_OPEN_FOLDER_APP_SIZE;

  /**
   * add icon size of open folder
   */
  mOpenFolderAddIconSize = StyleConstants.DEFAULT_ADD_APP_SIZE;

  /**
   * open folder app size
   */
  mOpenFolderAppNameSize = StyleConstants.DEFAULT_OPEN_FOLDER_APP_NAME_SIZE;

  /**
   * open folder app name height
   */
  mOpenFolderAppNameHeight = StyleConstants.DEFAULT_OPEN_FOLDER_APP_NAME_HEIGHT;

  /**
   * open folder grid width
   */
  mOpenFolderGridWidth = StyleConstants.DEFAULT_OPEN_FOLDER_GRID_WIDTH;

  /**
   * open folder grid height
   */
  mOpenFolderGridHeight = StyleConstants.DEFAULT_OPEN_FOLDER_GRID_HEIGHT;

  /**
   * open folder swiper height
   */
  mOpenFolderSwiperHeight = StyleConstants.DEFAULT_OPEN_FOLDER_SWIPER_HEIGHT;

  /**
   * open folder grid gap
   */
  mOpenFolderGridGap = StyleConstants.DEFAULT_OPEN_FOLDER_GRID_GAP;

  /**
   * padding of open folder layout
   */
  mOpenFolderGridPadding = PresetStyleConstants.DEFAULT_OPEN_FOLDER_PADDING;

  /**
   * padding of open folder icon
   */
  mOpenFolderGridIconTopPadding = PresetStyleConstants.DEFAULT_ICON_PADDING_TOP;
  /**
   * width of add app dialog
   */
  mAddFolderDialogWidth: number = BigFolderStyleConstants.DEFAULT_APP_ADD_DIALOG_WIDTH;

  /**
   * height of add app dialog
   */
  mAddFolderDialogHeight: number = BigFolderStyleConstants.DEFAULT_APP_ADD_DIALOG_HEIGHT;

  /**
   * width of add app container
   */
  mAddFolderGridWidth: number = BigFolderStyleConstants.DEFAULT_FOLDER_APP_GRID_LIST;

  /**
   * gap of add app container
   */
  mAddFolderGridGap: number = PresetStyleConstants.DEFAULT_FOLDER_ADD_GAP;

  /**
   * margin of add app container
   */
  mAddFolderGridMargin: number = PresetStyleConstants.DEFAULT_FOLDER_ADD_MARGIN;

  /**
   * maxHeight of add app container
   */
  mAddFolderMaxHeight: number = PresetStyleConstants.DEFAULT_FOLDER_ADD_MAX_HEIGHT;

  /**
   * size of add app toggle
   */
  mFolderToggleSize: number = PresetStyleConstants.DEFAULT_APP_GRID_TOGGLE_SIZE;

  /**
   * title size of add app
   */
  mAddFolderTitleSize: number = PresetStyleConstants.DEFAULT_FOLDER_ADD_TITLE_TEXT_SIZE;

  /**
   * text size of add app item
   */
  mAddFolderTextSize: number = PresetStyleConstants.DEFAULT_FOLDER_ADD_GRID_TEXT_SIZE;

  /**
   * name lines of add app item
   */
  mAddFolderTextLines: number = PresetStyleConstants.DEFAULT_FOLDER_ADD_TEXT_LINES;

  /**
   * line height of add app item
   */
  mAddFolderLinesHeight: number = PresetStyleConstants.DEFAULT_TEXT_LINES;

  /**
   * icon size of add app
   */
  mAddFolderIconSize: number = PresetStyleConstants.DEFAULT_ICON_SIZE;

  /**
   * size of add app item
   */
  mAddFolderItemSize: number = PresetStyleConstants.DEFAULT_APP_LAYOUT_SIZE;

  /**
   * padding top of add app icon
   */
  mAddFolderIconPaddingTop: number = PresetStyleConstants.DEFAULT_ICON_PADDING_TOP;

  /**
   * button size of add app
   */
  mAddFolderButtonSize: number = PresetStyleConstants.DEFAULT_FOLDER_ADD_BUTTON_SIZE;

  /**
   * margin left of icon with add app item
   */
  mAddFolderIconMarginHorizontal = PresetStyleConstants.DEFAULT_ICON_PADDING_LEFT;
  /**
   * folder list blur
   */
  mBackdropBlur = 20;

  private constructor() {
    super();
  }

  /**
   * get folder style config instance
   */
  static getInstance(): BigFolderStyleConfig {
    if (globalThis.BigFolderStyleConfigInstance == null) {
      globalThis.BigFolderStyleConfigInstance = new BigFolderStyleConfig();
    }
    globalThis.BigFolderStyleConfigInstance.initConfig();
    return globalThis.BigFolderStyleConfigInstance;
  }

  initConfig(): void {
    const layoutViewModel = LayoutViewModel.getInstance();
    const desktopFolderLayoutInfo = BigFolderModel.getInstance().getFolderLayout();
    const folderResult = layoutViewModel.calculateFolder(desktopFolderLayoutInfo);
    const openFolderLayoutInfo = BigFolderModel.getInstance().getFolderOpenLayout();
    const openResult = layoutViewModel.calculateOpenFolder(openFolderLayoutInfo);
    const addAppLayoutInfo = BigFolderModel.getInstance().getFolderAddAppLayout();
    const addResult = layoutViewModel.calculateFolderAddList(addAppLayoutInfo);

    this.mGridSize = folderResult.mGridSize;
    this.mFolderAppSize = folderResult.mFolderAppSize;
    this.mFolderGridGap = folderResult.mFolderGridGap;
    this.mGridMargin = folderResult.mGridMargin;
    this.mNameHeight = folderResult.mNameHeight;
    this.mNameLines = folderResult.mNameLines;
    this.mIconNameMargin = folderResult.mIconNameMargin;
    this.mOpenFolderGridRow = openResult.mOpenFolderGridRow;
    this.mOpenFolderGridColumn = openResult.mOpenFolderGridColumn;
    this.mOpenFolderGridWidth = openResult.mOpenFolderGridWidth;
    this.mOpenFolderGridHeight = openResult.mOpenFolderGridHeight;
    this.mOpenFolderSwiperHeight = openResult.mOpenFolderSwiperHeight;
    this.mOpenFolderIconSize = openResult.mOpenFolderIconSize;
    this.mOpenFolderAddIconSize = openResult.mOpenFolderAddIconSize;
    this.mOpenFolderAppSize = openResult.mOpenFolderAppSize;
    this.mOpenFolderAppNameSize = openResult.mOpenFolderAppNameSize;
    this.mOpenFolderAppNameHeight = openResult.mOpenFolderAppNameHeight;
    this.mOpenFolderGridGap = openResult.mOpenFolderGridGap;
    this.mOpenFolderGridPadding = openResult.mOpenFolderGridPadding;
    this.mFolderOpenMargin = openResult.mFolderOpenMargin;
    this.mFolderOpenTitle = openResult.mFolderOpenTitle;
    this.mOpenFolderGridIconTopPadding = openResult.mOpenFolderGridIconTopPadding;

    this.mAddFolderGridWidth = addResult.mAddFolderGridWidth;
    this.mAddFolderDialogWidth = addResult.mAddFolderDialogWidth;
    this.mAddFolderDialogHeight = addResult.mAddFolderDialogHeight;
    this.mAddFolderGridGap = addResult.mAddFolderGridGap;
    this.mAddFolderGridMargin = addResult.mAddFolderGridMargin;
    this.mAddFolderMaxHeight = addResult.mAddFolderMaxHeight;
    this.mFolderToggleSize = addResult.mFolderToggleSize;
    this.mAddFolderTextSize = addResult.mAddFolderTextSize;
    this.mAddFolderTextLines = addResult.mAddFolderTextLines;
    this.mAddFolderLinesHeight = addResult.mAddFolderLinesHeight;
    this.mAddFolderItemSize = addResult.mAddFolderItemSize;
    this.mAddFolderIconPaddingTop = addResult.mAddFolderIconPaddingTop;
    this.mAddFolderIconMarginHorizontal = addResult.mAddFolderIconMarginHorizontal;
    this.mAddFolderIconSize = addResult.mAddFolderIconSize;
    this.mAddFolderTitleSize = addResult.mAddFolderTitleSize;
    this.mAddFolderButtonSize = addResult.mAddFolderButtonSize;
  }

  getConfigLevel(): string {
    return CommonConstants.LAYOUT_CONFIG_LEVEL_FEATURE;
  }

  getFeatureName(): string {
    return BigFolderConstants.FEATURE_NAME;
  }
}
