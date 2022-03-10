/*
 * Copyright (c) 2021 Huawei Device Co., Ltd.
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

import AppListStyleConfig from '../../../../../../../common/src/main/ets/default/layoutconfig/AppListStyleConfig';
import CommonConstants from '../../../../../../../common/src/main/ets/default/constants/CommonConstants';
import PresetStyleConstants from '../../../../../../../common/src/main/ets/default/constants/PresetStyleConstants';
import StyleConstants from '../../../../../../../common/src/main/ets/default/constants/StyleConstants';
import FeatureConstants from './constants/FeatureConstants';
import FolderStyleConstants from './constants/FolderStyleConstants';

/**
 * folder style config
 */
export default class BigFolderStyleConfig extends AppListStyleConfig {
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

  /**
   * open folder app size
   */
  mOpenFolderAppSize = StyleConstants.DEFAULT_OPEN_FOLDER_APP_SIZE;

  /**
   * icon size of open folder
   */
  mOpenFolderIconSize = StyleConstants.DEFAULT_OPEN_FOLDER_APP_SIZE;

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
  mAddFolderDialogWidth: number = FolderStyleConstants.DEFAULT_APP_ADD_DIALOG_WIDTH;

  /**
   * height of add app dialog
   */
  mAddFolderDialogHeight: number = FolderStyleConstants.DEFAULT_APP_ADD_DIALOG_HEIGHT;

  /**
   * width of add app container
   */
  mAddFolderGridWidth: number = FolderStyleConstants.DEFAULT_FOLDER_APP_GRID_LIST;

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
  static getInstance() {
    if (globalThis.BigFolderStyleConfigInstance == null) {
      globalThis.BigFolderStyleConfigInstance = new BigFolderStyleConfig();
    }
    return globalThis.BigFolderStyleConfigInstance;
  }

  initConfig(): void {
  }

  getConfigLevel(): string {
    return CommonConstants.LAYOUT_CONFIG_LEVEL_FEATURE;
  }

  getFeatureName() {
    return FeatureConstants.FEATURE_NAME;
  }
}
