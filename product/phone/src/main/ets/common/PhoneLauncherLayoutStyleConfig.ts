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

import { CommonConstants } from '@ohos/common';
import { PresetStyleConstants } from '@ohos/common';
import { LauncherLayoutStyleConfig } from '@ohos/common';
import PhonePresetStyleConstants from './constants/PhonePresetStyleConstants';

/**
 * Phone launcher config
 */
export default class PhoneLauncherLayoutStyleConfig extends LauncherLayoutStyleConfig {

  /**
   * CommonDialog width
   */
  mCommonDialogWidth = PhonePresetStyleConstants.DEFAULT_COMMONDIALOG_WIDTH;

  /**
   * systemUI top height
   */
  mSysTopHeight = PhonePresetStyleConstants.DEFAULT_SYS_TOP_HEIGHT;

  /**
   * systemUI bottom height
   */
  mSysBottomHeight = PhonePresetStyleConstants.DEFAULT_SYS_BOTTOM_HEIGHT;

  /**
   * systemUI height (top + bottom)
   */
  mSystemUIHeight = PresetStyleConstants.DEFAULT_PHONE_SYSTEM_UI;

  /**
   * indicator height
   */
  mIndicatorHeight = PresetStyleConstants.DEFAULT_PHONE_INDICATOR_HEIGHT;

  /**
   * desktop item Size
   */
  mAppItemSize = PhonePresetStyleConstants.DEFAULT_APP_LAYOUT_SIZE;

  /**
   * desktop space margin
   */
  mMargin = PhonePresetStyleConstants.DEFAULT_LAYOUT_MARGIN;

  /**
   * desktop grid gap
   */
  mGridGutter = PhonePresetStyleConstants.DEFAULT_APP_LAYOUT_MIN_GUTTER;

  /**
   * icon name lines
   */
  mNameLines: number = PhonePresetStyleConstants.DEFAULT_APP_NAME_LINES;

  /**
   * icon ratio
   */
  mIconRatio: number = PhonePresetStyleConstants.DEFAULT_APP_TOP_RATIO;

  /**
   * icon name margin
   */
  mIconNameGap: number = PhonePresetStyleConstants.DEFAULT_ICON_NAME_GAP;

  /**
   * icon name text size
   */
  mNameSize: number = PhonePresetStyleConstants.DEFAULT_APP_NAME_TEXT_SIZE;

  /**
   * name height
   */
  mNameHeight: number = PhonePresetStyleConstants.DEFAULT_DESKTOP_NAME_HEIGHT;

  //folder
  /**
   * ratio of gutter with folder
   */
  mFolderGutterRatio: number = PhonePresetStyleConstants.DEFAULT_FOLDER_GUTTER_RATIO;

  /**
   * ratio of margin with folder
   */
  mFolderMarginRatio: number = PhonePresetStyleConstants.DEFAULT_FOLDER_PADDING_RATIO;

  /**
   * gutter of open folder
   */
  mFolderOpenGutter: number = PhonePresetStyleConstants.DEFAULT_OPEN_FOLDER_GUTTER;

  /**
   * padding of open folder
   */
  mFolderOpenPADDING: number = PhonePresetStyleConstants.DEFAULT_OPEN_FOLDER_PADDING;

  /**
   * margin of open folder
   */
  mFolderOpenMargin: number = PhonePresetStyleConstants.DEFAULT_OPEN_FOLDER_MARGIN_TOP;

  /**
  * margin top of open folder
  */
  mFolderOpenTitle: number = PhonePresetStyleConstants.DEFAULT_OPEN_FOLDER_TITLE_TOP;

  /**
   * gutter of add app
   */
  mFolderAddGridGap: number = PhonePresetStyleConstants.DEFAULT_FOLDER_ADD_GAP;

  /**
   * margin of add app and padding of add app
   */
  mFolderAddGridMargin: number = PhonePresetStyleConstants.DEFAULT_FOLDER_ADD_MARGIN;

  /**
   * max height of add app
   */
  mFolderAddMaxHeight: number = PhonePresetStyleConstants.DEFAULT_FOLDER_ADD_MAX_HEIGHT;

  /**
   * toggle size of add app
   */
  mFolderToggleSize: number = PhonePresetStyleConstants.DEFAULT_APP_GRID_TOGGLE_SIZE;

  /**
   * name lines of add app
   */
  mFolderAddTextLines: number = PhonePresetStyleConstants.DEFAULT_FOLDER_ADD_TEXT_LINES;

  /**
   * text size of add app
   */
  mFolderAddTextSize: number = PhonePresetStyleConstants.DEFAULT_FOLDER_ADD_GRID_TEXT_SIZE;

  /**
   * title size of add app
   */
  mFolderAddTitleSize: number = PhonePresetStyleConstants.DEFAULT_FOLDER_ADD_TITLE_TEXT_SIZE;

  /**
   * ratio of padding top with icon in add app
   */
  mFolderAddIconRatio: number = PhonePresetStyleConstants.DEFAULT_FOLDER_ADD_ICON_TOP_RATIO;

  /**
   * button size of add app
   */
  mFolderAddButtonSize: number = PhonePresetStyleConstants.DEFAULT_FOLDER_ADD_BUTTON_SIZE;

  //App Center
  /**
   * margin of app center
   */
  mAppCenterMargin: number = PhonePresetStyleConstants.DEFAULT_APP_CENTER_MARGIN;

  /**
   * gutter of app center
   */
  mAppCenterGutter: number = PhonePresetStyleConstants.DEFAULT_APP_CENTER_GUTTER;

  /**
   * size of app center container
   */
  mAppCenterSize: number = PhonePresetStyleConstants.DEFAULT_APP_CENTER_SIZE;

  /**
   * ratio of padding top with icon in app center
   */
  mAppCenterRatio: number = PhonePresetStyleConstants.DEFAULT_APP_CENTER_TOP_RATIO;

  /**
   * name lines of app center
   */
  mAppCenterNameLines: number = PhonePresetStyleConstants.DEFAULT_APP_CENTER_NAME_LINES;

  /**
   * name size of app center
   */
  mAppCenterNameSize: number = PhonePresetStyleConstants.DEFAULT_APP_CENTER_NAME_TEXT_SIZE;

  //dock
  /**
   * padding of dock
   */
  mDockPadding: number = PhonePresetStyleConstants.DEFAULT_DOCK_PADDING;

  /**
   * icon size of dock
   */
  mDockIconSize: number = PhonePresetStyleConstants.DEFAULT_DOCK_ICON_SIZE;

  /**
   * gap of icon and icon
   */
  mDockItemGap: number = PhonePresetStyleConstants.DEFAULT_DOCK_ITEM_GAP;

  /**
   * gap of dock and dock
   */
  mDockGutter: number = PhonePresetStyleConstants.DEFAULT_DOCK_GUTTER;

  /**
   * save margin of dock
   */
  mDockSaveMargin: number = PhonePresetStyleConstants.DEFAULT_DOCK_SAVE_MARGIN;

  /**
   * margin bottom of dock
   */
  mDockMarginBottom: number = PhonePresetStyleConstants.DEFAULT_DOCK_MARGIN_BOTTOM;

  /**
   * margin bottom of dock (Immersive navigation bar)
   */
  mDockMarginBottomHideBar: number = PhonePresetStyleConstants.DEFAULT_DOCK_MARGIN_BOTTOM_HIDE_BAR;

  /**
   * open folder grid height
   */
  mOpenFolderGridHeight: number = PhonePresetStyleConstants.DEFAULT_OPEN_FOLDER_GRID_HEIGHT;

  /**
   * open folder swiper height
   */
  mOpenFolderSwiperHeight: number = PhonePresetStyleConstants.DEFAULT_OPEN_FOLDER_SWIPER_HEIGHT;

  private constructor() {
    super();
  }

  /**
   * PhoneLauncherLayoutStyleConfig of instance
   */
  static getInstance(): PhoneLauncherLayoutStyleConfig {
    if (globalThis.PhoneLauncherLayoutStyleConfigInstance == null) {
      globalThis.PhoneLauncherLayoutStyleConfigInstance = new PhoneLauncherLayoutStyleConfig();
    }
    return globalThis.PhoneLauncherLayoutStyleConfigInstance;
  }

  getConfigLevel(): string {
    return CommonConstants.LAYOUT_CONFIG_LEVEL_PRODUCT;
  }

  getFeatureName(): string {
    return LauncherLayoutStyleConfig.LAUNCHER_PRODUCT_STYLE_CONFIG;
  }
}
