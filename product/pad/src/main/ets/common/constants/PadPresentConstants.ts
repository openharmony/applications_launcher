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

export default class PadPresetStyleConstants {
  //----------- desktop layout-------------

  /**
   * CommonDialog width
   */
  static readonly DEFAULT_COMMONDIALOG_WIDTH = '395vp';

  /**
   * systemUI top height
   */
  static readonly DEFAULT_SYS_TOP_HEIGHT = 44;

  /**
   * systemUI bottom height
   */
  static readonly DEFAULT_SYS_BOTTOM_HEIGHT = 44;

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
  static readonly DEFAULT_APP_TOP_RATIO = 0.01;

  /**
   * desktop item name lines
   */
  static readonly DEFAULT_APP_NAME_LINES = 2;

  /**
   * desktop item name size
   */
  static readonly DEFAULT_APP_NAME_TEXT_SIZE  = 14;

  /**
   * desktop item icon and name gap
   */
  static readonly DEFAULT_ICON_NAME_GAP = 4;

  /**
   * desktop icon name height
   */
  static readonly DEFAULT_DESKTOP_NAME_HEIGHT = 36;

  //----------- desktop folder-----------
  /**
   * folder gutter with container size
   */
  static readonly DEFAULT_FOLDER_GUTTER_RATIO = 0.038;

  /**
   * folder padding with container size
   */
  static readonly DEFAULT_FOLDER_PADDING_RATIO = 0.077;

  //----------- desktop open --------------
  /**
   * gutter of open folder
   */
  static readonly DEFAULT_OPEN_FOLDER_GUTTER = 12;

  /**
   * padding of open folder
   */
  static readonly DEFAULT_OPEN_FOLDER_PADDING = 12;

  /**
   * margin top of open folder
   */
  static readonly DEFAULT_OPEN_FOLDER_MARGIN_TOP = 166;

  /**
  * margin top of open folder top
  */
  static readonly DEFAULT_OPEN_FOLDER_TITLE_TOP = 40;

  //----------- folder add list ------------------
  /**
   * max height of container
   */
  static readonly DEFAULT_FOLDER_ADD_MAX_HEIGHT = 0.8;

  /**
   * margin of container
   */
  static readonly DEFAULT_FOLDER_ADD_MARGIN = 12;

  /**
   * gutter of container
   */
  static readonly DEFAULT_FOLDER_ADD_GAP = 24;

  /**
   * toggle of item
   */
  static readonly DEFAULT_APP_GRID_TOGGLE_SIZE = 20;

  /**
   * icon padding of item with item size
   */
  static readonly DEFAULT_FOLDER_ADD_ICON_TOP_RATIO = 0.075;

  /**
   * name size of container
   */
  static readonly DEFAULT_FOLDER_ADD_GRID_TEXT_SIZE = 12;

  /**
   * title size of container
   */
  static readonly DEFAULT_FOLDER_ADD_TITLE_TEXT_SIZE = 20;

  /**
   * name lines of item
   */
  static readonly DEFAULT_FOLDER_ADD_TEXT_LINES = 1;

  /**
   * button size of container
   */
  static readonly DEFAULT_FOLDER_ADD_BUTTON_SIZE = 16;

  //----------- app center--------------
  /**
   * margin left of app center
   */
  static readonly DEFAULT_APP_CENTER_MARGIN = 215;

  /**
   * gutter of app center
   */
  static readonly DEFAULT_APP_CENTER_GUTTER = 18;

  /**
   * item size of app center
   */
  static readonly DEFAULT_APP_CENTER_SIZE = 106;

  /**
   * icon padding top with item size
   */
  static readonly DEFAULT_APP_CENTER_TOP_RATIO = 0.01;

  /**
   * name lines of app center
   */
  static readonly DEFAULT_APP_CENTER_NAME_LINES = 2;

  /**
   * name size of app center
   */
  static readonly DEFAULT_APP_CENTER_NAME_TEXT_SIZE  = 12;

  /**
   * name height of app center
   */
  static readonly DEFAULT_APP_CENTER_NAME_HEIGHT  = 32;

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
