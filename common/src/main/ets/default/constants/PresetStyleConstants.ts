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
export class PresetStyleConstants {
  //----------- default constants----------

  /**
    * CommonDialog width
   */
  static readonly DEFAULT_COMMONDIALOG_WIDTH = '';

  /**
   * systemUI top height
   */
  static readonly DEFAULT_SYS_TOP_HEIGHT = 44;

  /**
   * systemUI bottom height
   */
  static readonly DEFAULT_SYS_BOTTOM_HEIGHT = 44;

  /**
   * pad system ui height
   */
  static readonly DEFAULT_PAD_SYSTEM_UI = 88;

  /**
   * phone system ui height
   */
  static readonly DEFAULT_PHONE_SYSTEM_UI = 132;

  /**
   * desktop indicator height
   */
  static readonly DEFAULT_PAD_INDICATOR_HEIGHT = 32;

  /**
   * desktop indicator height
   */
  static readonly DEFAULT_PHONE_INDICATOR_HEIGHT = 32;

  /**
   * columns of screen with phone
   */
  static readonly DEFAULT_PHONE_GRID_APP_COLUMNS = 4;

  /**
   * columns of screen with pad
   */
  static readonly DEFAULT_PAD_GRID_APP_COLUMNS = 12;

  /**
   * threshold value of dock isShow recent dock
   */
  static readonly DEFAULT_DOCK_RECENT_WIDTH = 520;

  /**
   * padding top of icon
   */
  static readonly DEFAULT_ICON_PADDING_TOP = 0;

  /**
   *  padding left of icon
   */
  static readonly DEFAULT_ICON_PADDING_LEFT = 21;

  /**
   * icon size
   */
  static readonly DEFAULT_ICON_SIZE = 54;

  /**
   * text lines height
   */
  static readonly DEFAULT_TEXT_LINES = 36;

  /**
   * padding of app center
   */
  static readonly DEFAULT_APP_CENTER_PADDING = 100;

  /**
   * screen grid margin and gap
   */
  static readonly DEFAULT_SCREEN_GRID_GAP_AND_MARGIN = 12;

  //----------- desktop layout-------------
  /**
   * desktop item size
   */
  static readonly DEFAULT_APP_LAYOUT_SIZE = 96;

  /**
   * desktop container margin
   */
  static readonly DEFAULT_LAYOUT_MARGIN = 82;

  /**
   * desktop container minimum gutter
   */
  static readonly DEFAULT_APP_LAYOUT_MIN_GUTTER = 6;

  //----------- desktop icon-------------
  /**
   * desktop item padding top
   */
  static readonly DEFAULT_APP_TOP_RATIO = 0;

  /**
   * desktop item name lines
   */
  static readonly DEFAULT_APP_NAME_LINES = 2;

  /**
   * desktop item name size
   */
  static readonly DEFAULT_APP_NAME_TEXT_SIZE  = 18;

  /**
   * desktop item icon and name gap
   */
  static readonly DEFAULT_ICON_NAME_GAP = 4;

  /**
   * desktop icon name height
   */
  static readonly DEFAULT_DESKTOP_NAME_HEIGHT = 36;

  /**
   * desktop icon name margin
   */
  static readonly DEFAULT_DESKTOP_NAME_MARGIN = 3;

  //----------- desktop folder-----------
  /**
   * folder gutter with container size
   */
  static readonly DEFAULT_FOLDER_GUTTER_RATIO = 0.06;

  /**
   * folder padding with container size
   */
  static readonly DEFAULT_FOLDER_PADDING_RATIO = 0.1;

  //----------- desktop open --------------
  /**
   * gutter of open folder
   */
  static readonly DEFAULT_OPEN_FOLDER_GUTTER = 12;

  /**
   * padding of open folder
   */
  static readonly DEFAULT_OPEN_FOLDER_PADDING = 16;

  /**
   * margin top of open folder
   */
  static readonly DEFAULT_OPEN_FOLDER_MARGIN_TOP = 188;

  /**
   * margin top of open folder
   */
  static readonly DEFAULT_OPEN_FOLDER_TITLE_TOP = 40;

  //----------- folder add list ------------------
  /**
   * max height of container
   */
  static readonly DEFAULT_FOLDER_ADD_MAX_HEIGHT = 0.6;

  /**
   * margin of container
   */
  static readonly DEFAULT_FOLDER_ADD_MARGIN = 12;

  /**
   * gutter of container
   */
  static readonly DEFAULT_FOLDER_ADD_GAP = 12;

  /**
   * toggle of item
   */
  static readonly DEFAULT_APP_GRID_TOGGLE_SIZE = 16;

  /**
   * icon padding of item with item size
   */
  static readonly DEFAULT_FOLDER_ADD_ICON_TOP_RATIO = 0.1;

  /**
   * name size of container
   */
  static readonly DEFAULT_FOLDER_ADD_GRID_TEXT_SIZE = 16;

  /**
   * title size of container
   */
  static readonly DEFAULT_FOLDER_ADD_TITLE_TEXT_SIZE = 20;

  /**
   * name lines of item
   */
  static readonly DEFAULT_FOLDER_ADD_TEXT_LINES = 2;

  /**
   * button size of container
   */
  static readonly DEFAULT_FOLDER_ADD_BUTTON_SIZE = 24;

  //----------- app center--------------
  /**
   * margin left of app center
   */
  static readonly DEFAULT_APP_CENTER_MARGIN = 218;

  /**
   * gutter of app center
   */
  static readonly DEFAULT_APP_CENTER_GUTTER = 12;

  /**
   * item size of app center
   */
  static readonly DEFAULT_APP_CENTER_SIZE = 112;

  /**
   * icon padding top with item size
   */
  static readonly DEFAULT_APP_CENTER_TOP_RATIO = 0;

  /**
   * name lines of app center
   */
  static readonly DEFAULT_APP_CENTER_NAME_LINES = 2;

  /**
   * name size of app center
   */
  static readonly DEFAULT_APP_CENTER_NAME_TEXT_SIZE = 18;

  //----------- dock----------------
  /**
   * icon size of dock
   */
  static readonly DEFAULT_DOCK_ICON_SIZE = 54;

  /**
   * padding of dock
   */
  static readonly DEFAULT_DOCK_PADDING = 12;

  /**
   * gap of dock container
   */
  static readonly DEFAULT_DOCK_ITEM_GAP = 8;

  /**
   * gap with resident and recent
   */
  static readonly DEFAULT_DOCK_GUTTER = 12;

  /**
   * save margin of dock
   */
  static readonly DEFAULT_DOCK_SAVE_MARGIN = 24;

  /**
   * margin bottom of dock
   */
  static readonly DEFAULT_DOCK_MARGIN_BOTTOM = 10;

  /**
   * margin bottom of dock(Immersive navigation bar)
   */
  static readonly DEFAULT_DOCK_MARGIN_BOTTOM_HIDE_BAR = 10;
}