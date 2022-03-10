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
import CommonConstants from '../../../../../../../common/src/main/ets/default/constants/CommonConstants';
import FeatureConstants from './constants/FeatureConstants';
import AppGridStyleConfig from '../../../../../../../common/src/main/ets/default/layoutconfig/AppGridStyleConfig';
import PresetStyleConstants from '../../../../../../../common/src/main/ets/default/constants/PresetStyleConstants';

/**
 * Launcher_layout style
 */
export default class LauncherLayoutStyleConfig extends AppGridStyleConfig {

  mIndicatorHeight = PresetStyleConstants.DEFAULT_PAD_INDICATOR_HEIGHT;

  /**
   * desktop item Size
   */
  mAppItemSize = PresetStyleConstants.DEFAULT_APP_LAYOUT_SIZE;

  /**
   * desktop space margin
   */
  mMargin = PresetStyleConstants.DEFAULT_LAYOUT_MARGIN;

  /**
   * desktop grid gap
   */
  mGridGutter = PresetStyleConstants.DEFAULT_APP_LAYOUT_MIN_GUTTER;

  /**
   * icon name lines
   */
  mNameLines: number = PresetStyleConstants.DEFAULT_APP_NAME_LINES;
  /**
   * icon ratio
   */
  mIconRatio: number = PresetStyleConstants.DEFAULT_APP_TOP_RATIO;

  /**
   * icon name text size
   */
  mNameSize: number = PresetStyleConstants.DEFAULT_APP_NAME_TEXT_SIZE;

  /**
   * folder
   */
  mFolderGutterRatio: number = PresetStyleConstants.DEFAULT_FOLDER_GUTTER_RATIO;

  mFolderMarginRatio: number = PresetStyleConstants.DEFAULT_FOLDER_PADDING_RATIO;

  mFolderOpenGutter: number = PresetStyleConstants.DEFAULT_OPEN_FOLDER_GUTTER;

  mFolderOpenPADDING: number = PresetStyleConstants.DEFAULT_OPEN_FOLDER_PADDING;

  mFolderOpenMargin: number = PresetStyleConstants.DEFAULT_OPEN_FOLDER_MARGIN_TOP;

  mFolderAddGridGap: number = PresetStyleConstants.DEFAULT_FOLDER_ADD_GAP;

  mFolderAddGridMargin: number = PresetStyleConstants.DEFAULT_FOLDER_ADD_MARGIN;

  mFolderAddMaxHeight: number = PresetStyleConstants.DEFAULT_FOLDER_ADD_MAX_HEIGHT;

  mFolderToggleSize: number = PresetStyleConstants.DEFAULT_APP_GRID_TOGGLE_SIZE;

  mFolderAddTextLines: number = PresetStyleConstants.DEFAULT_FOLDER_ADD_TEXT_LINES;

  mFolderAddTextSize: number = PresetStyleConstants.DEFAULT_FOLDER_ADD_GRID_TEXT_SIZE;

  mFolderAddTitleSize: number = PresetStyleConstants.DEFAULT_FOLDER_ADD_TITLE_TEXT_SIZE;

  mFolderAddICONRATIO: number = PresetStyleConstants.DEFAULT_FOLDER_ADD_ICON_TOP_RATIO;
  /**
   * App Center
   */
  mAppCenterMargin: number = PresetStyleConstants.DEFAULT_APP_CENTER_MARGIN;

  mAppCenterGutter: number = PresetStyleConstants.DEFAULT_APP_CENTER_GUTTER;

  mAppCenterSize: number = PresetStyleConstants.DEFAULT_APP_CENTER_SIZE;

  mAppCenterRatio: number = PresetStyleConstants.DEFAULT_APP_CENTER_TOP_RATIO;

  mAppCenterNameLines: number = PresetStyleConstants.DEFAULT_APP_CENTER_NAME_LINES;

  mAppCenterNameSize: number = PresetStyleConstants.DEFAULT_APP_CENTER_NAME_TEXT_SIZE;

  /**
   * dock
   */

  mDockPadding: number = PresetStyleConstants.DEFAULT_DOCK_PADDING;

  mDockIconSize: number = PresetStyleConstants.DEFAULT_DOCK_ICON_SIZE;

  mDockItemGap: number = PresetStyleConstants.DEFAULT_DOCK_ITEM_GAP;

  mDockGutter: number = PresetStyleConstants.DEFAULT_DOCK_GUTTER;

  mDockSaveMargin: number = PresetStyleConstants.DEFAULT_DOCK_SAVE_MARGIN;

  mDockMarginBottom: number = PresetStyleConstants.DEFAULT_DOCK_MARGIN_BOTTOM;

  protected constructor() {
    super();
  }

  /**
   * LauncherLayoutStyleConfig of instance
   */
  static getInstance() {
    if (globalThis.LauncherLayoutStyleConfigInstance == null) {
      globalThis.LauncherLayoutStyleConfigInstance = new LauncherLayoutStyleConfig();
      globalThis.LauncherLayoutStyleConfigInstance.initConfig();
    }
    return globalThis.LauncherLayoutStyleConfigInstance;
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