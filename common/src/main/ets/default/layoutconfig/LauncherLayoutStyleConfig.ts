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
import { ILayoutConfig } from './ILayoutConfig';
import { CommonConstants } from '../constants/CommonConstants';
import { PresetStyleConstants } from '../constants/PresetStyleConstants';

/**
 * Launcher_layout style
 */
export class LauncherLayoutStyleConfig extends ILayoutConfig {

  static LAUNCHER_COMMON_STYLE_CONFIG: string = 'launcherStyleCommon';

  static LAUNCHER_PRODUCT_STYLE_CONFIG: string = 'launcherStyleProduct';

  /**
     * CommonDialogWidth width
   */
  mCommonDialogWidth = PresetStyleConstants.DEFAULT_COMMONDIALOG_WIDTH;

  /**
   * systemUI top height
   */
  mSysTopHeight = PresetStyleConstants.DEFAULT_SYS_TOP_HEIGHT;

  /**
   * systemUI bottom height
   */
  mSysBottomHeight = PresetStyleConstants.DEFAULT_SYS_BOTTOM_HEIGHT;

  mSystemUIHeight = PresetStyleConstants.DEFAULT_PAD_SYSTEM_UI;

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
   * icon name margin
   */
  mIconNameGap: number = PresetStyleConstants.DEFAULT_ICON_NAME_GAP;

  /**
   * icon name text size
   */
  mNameSize: number = PresetStyleConstants.DEFAULT_APP_NAME_TEXT_SIZE;

  /**
   * name height
   */
  mNameHeight: number = PresetStyleConstants.DEFAULT_DESKTOP_NAME_HEIGHT;

  //folder
  /**
   * ratio of gutter with folder
   */
  mFolderGutterRatio: number = PresetStyleConstants.DEFAULT_FOLDER_GUTTER_RATIO;

  /**
   * ratio of margin with folder
   */
  mFolderMarginRatio: number = PresetStyleConstants.DEFAULT_FOLDER_PADDING_RATIO;

  /**
   * gutter of open folder
   */
  mFolderOpenGutter: number = PresetStyleConstants.DEFAULT_OPEN_FOLDER_GUTTER;

  /**
   * padding of open folder
   */
  mFolderOpenPADDING: number = PresetStyleConstants.DEFAULT_OPEN_FOLDER_PADDING;

  /**
   * margin of open folder
   */
  mFolderOpenMargin: number = PresetStyleConstants.DEFAULT_OPEN_FOLDER_MARGIN_TOP;

  /**
  * margin top of open folder
  */
  mFolderOpenTitle: number = PresetStyleConstants.DEFAULT_OPEN_FOLDER_TITLE_TOP;

  /**
   * gutter of add app
   */
  mFolderAddGridGap: number = PresetStyleConstants.DEFAULT_FOLDER_ADD_GAP;

  /**
   * margin of add app and padding of add app
   */
  mFolderAddGridMargin: number = PresetStyleConstants.DEFAULT_FOLDER_ADD_MARGIN;

  /**
   * max height of add app
   */
  mFolderAddMaxHeight: number = PresetStyleConstants.DEFAULT_FOLDER_ADD_MAX_HEIGHT;

  /**
   * toggle size of add app
   */
  mFolderToggleSize: number = PresetStyleConstants.DEFAULT_APP_GRID_TOGGLE_SIZE;

  /**
   * name lines of add app
   */
  mFolderAddTextLines: number = PresetStyleConstants.DEFAULT_FOLDER_ADD_TEXT_LINES;

  /**
   * text size of add app
   */
  mFolderAddTextSize: number = PresetStyleConstants.DEFAULT_FOLDER_ADD_GRID_TEXT_SIZE;

  /**
   * title size of add app
   */
  mFolderAddTitleSize: number = PresetStyleConstants.DEFAULT_FOLDER_ADD_TITLE_TEXT_SIZE;

  /**
   * ratio of padding top with icon in add app
   */
  mFolderAddIconRatio: number = PresetStyleConstants.DEFAULT_FOLDER_ADD_ICON_TOP_RATIO;

  /**
   * button size of add app
   */
  mFolderAddButtonSize: number = PresetStyleConstants.DEFAULT_FOLDER_ADD_BUTTON_SIZE;
  //App Center
  /**
   * left margin of app center
   */
  mAppCenterMarginLeft: number = PresetStyleConstants.DEFAULT_APP_CENTER_MARGIN;
  //App Center
  /**
   * margin of app center
   */
  mAppCenterMargin: number = PresetStyleConstants.DEFAULT_APP_CENTER_MARGIN;

  /**
   * gutter of app center
   */
  mAppCenterGutter: number = PresetStyleConstants.DEFAULT_APP_CENTER_GUTTER;

  /**
   * size of app center container
   */
  mAppCenterSize: number = PresetStyleConstants.DEFAULT_APP_CENTER_SIZE;

  /**
   * ratio of padding top with icon in app center
   */
  mAppCenterRatio: number = PresetStyleConstants.DEFAULT_APP_CENTER_TOP_RATIO;

  /**
   * name lines of app center
   */
  mAppCenterNameLines: number = PresetStyleConstants.DEFAULT_APP_CENTER_NAME_LINES;

  /**
   * name size of app center
   */
  mAppCenterNameSize: number = PresetStyleConstants.DEFAULT_APP_CENTER_NAME_TEXT_SIZE;

  //dock
  /**
   * padding of dock
   */
  mDockPadding: number = PresetStyleConstants.DEFAULT_DOCK_PADDING;

  /**
   * icon size of dock
   */
  mDockIconSize: number = PresetStyleConstants.DEFAULT_DOCK_ICON_SIZE;

  /**
   * gap of icon and icon
   */
  mDockItemGap: number = PresetStyleConstants.DEFAULT_DOCK_ITEM_GAP;

  /**
   * gap of dock and dock
   */
  mDockGutter: number = PresetStyleConstants.DEFAULT_DOCK_GUTTER;

  /**
   * save margin of dock
   */
  mDockSaveMargin: number = PresetStyleConstants.DEFAULT_DOCK_SAVE_MARGIN;

  /**
   * margin bottom of dock
   */
  mDockMarginBottom: number = PresetStyleConstants.DEFAULT_DOCK_MARGIN_BOTTOM;

  /**
   * margin bottom of dock (Immersive navigation bar)
   */
  mDockMarginBottomHideBar: number = PresetStyleConstants.DEFAULT_DOCK_MARGIN_BOTTOM_HIDE_BAR;

  protected constructor() {
    super();
  }

  /**
   * LauncherLayoutStyleConfig of instance
   */
  static getInstance(): LauncherLayoutStyleConfig {
    if (globalThis.LauncherLayoutStyleConfigInstance == null) {
      globalThis.LauncherLayoutStyleConfigInstance = new LauncherLayoutStyleConfig();
    }
    return globalThis.LauncherLayoutStyleConfigInstance;
  }

  initConfig(): void {
  }

  getConfigLevel(): string {
    return CommonConstants.LAYOUT_CONFIG_LEVEL_COMMON;
  }

  getConfigType(): number {
    return CommonConstants.LAYOUT_CONFIG_TYPE_STYLE;
  }

  getConfigName(): string {
    return LauncherLayoutStyleConfig.LAUNCHER_COMMON_STYLE_CONFIG;
  }

  protected getPersistConfigJson(): string {
    let persistConfig = {
    };
    return JSON.stringify(persistConfig);
  }
}