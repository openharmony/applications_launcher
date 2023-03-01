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
export class RecentsStyleConstants {

  // image resources
  static readonly DEFAULT_BG_COLOR = '#00000000';
  static readonly DEFAULT_APP_ICON_IMAGE: Resource = $r('app.media.icon');
  static readonly DEFAULT_APP_IMAGE: Resource = $r('app.media.img_app_default');
  static readonly DEFAULT_APP_IMAGE_PATH: string = '/common/pics/img_app_default.png';
  static readonly DEFAULT_DELETE_IMAGE = '/common/pics/ic_public_delete.svg';
  static readonly DEFAULT_DELETE_IMAGE_FULL = '/common/pics/ic_public_delete_full.svg';
  static readonly DEFAULT_RECENT_BACKGROUND_IMAGE = '/common/pics/ic_wallpaper_recent.jpg';
  static readonly DEFAULT_LOCKED_IMAGE = '/common/pics/ic_public_lock.svg';

  // font style resources
  static readonly DEFAULT_FONT_COLOR = '#ffffff';
  static readonly DEFAULT_FONT_SIZE = 20;
  static readonly DEFAULT_APP_NAME_SIZE = 16;
  static readonly SINGLE_LIST_DEFAULT_APP_ICON_SIZE = 28;
  static readonly DOUBLE_LIST_DEFAULT_APP_ICON_SIZE = 28;
  static readonly SINGLE_LIST_DEFAULT_APP_ICON_SIZE_NEW = 22;

  // layout percentage adaptation resources
  static readonly DEFAULT_LAYOUT_PERCENTAGE = '100%';
  static readonly RECENT_MISSION_CARD_IMAGE_HEIGHT_PERCENTAGE = '70%';
  static readonly RECENT_MISSION_CARD_MISSION_HEIGHT_PERCENTAGE = '75%';
  static readonly SINGLE_LIST_DELETE_HEIGHT_PERCENTAGE = '15%';
  static readonly SINGLE_LIST_SCROLL_HEIGHT_PERCENTAGE = '85%';
  static readonly DOUBLE_LIST_GRID_HEIGHT_PERCENTAGE = '80%';
  static readonly DOUBLE_LIST_DELETE_HEIGHT_PERCENTAGE = '10%';

  // layout size
  static readonly SINGLE_LIST_MIDDLE_AERA_HEIGHT: number = 604;

  // image size resources
  static readonly SINGLE_LIST_APP_IMAGE_WIDTH = 216;
  static readonly SINGLE_LIST_APP_IMAGE_HEIGHT = 453;
  static readonly SINGLE_LIST_MISSION_HEIGHT: number = 497;
  static readonly DOUBLE_LIST_APP_IMAGE_WIDTH = 282;
  static readonly DOUBLE_LIST_APP_IMAGE_HEIGHT = 176;
  static readonly DOUBLE_LIST_MISSION_HEIGHT = 214;

  // style resources
  static readonly APP_NAME_MARGIN = 5;
  static readonly DEFAULT_DELETE_IMAGE_OPACITY = 0.5;
  static readonly RECENT_IMAGE_RADIUS = 20;
  static readonly RECENT_DELETE_IMAGE_RADIUS = 24;
  static readonly RECENT_DELETE_IMAGE_SIZE = 24;
  static readonly RECENT_DELETE_IMAGE_COLUMN_SIZE = 48;
  static readonly SINGLE_LIST_APP_INFO_LAYOUT_WEIGHT: number = 1;
  static readonly SINGLE_LIST_LAYOUT_MARGIN = 10;
  static readonly DOUBLE_LIST_APP_INFO_LAYOUT_WEIGHT: number = 2;
  static readonly DOUBLE_LIST_LAYOUT_MARGIN = 20;
  static readonly DOUBLE_LIST_LAYOUT_COLUMNSGAP = 38;
  static readonly DOUBLE_LIST_LAYOUT_ROWSGAP = 40;
  static readonly DOUBLE_LIST_RIGHT_MARGIN = 72;
  static readonly DOUBLE_LIST_TOP_MARGIN = 54;
  static readonly SINGLE_LIST_LOCKED_IMAGE_RIGHT_MARGIN = 24;
  static readonly DOUBLE_LIST_LOCKED_IMAGE_RIGHT_MARGIN = 12;
  static readonly SINGLE_LIST_APP_INFO_TOP_MARGIN = 6;
  static readonly SINGLE_LIST_APP_INFO_BOTTOM_MARGIN = 10;
  static readonly DOUBLE_LIST_APP_INFO_BOTTOM_MARGIN = 8;
  static readonly SINGLE_LIST_MIDDLE_AREA_SPACE = 16;
  static readonly SINGLE_LIST_APP_INFO_LEFT_MARGIN = 8;
  static readonly SINGLE_LIST_MIDDLE_AREA_TOP_MARGIN = 107;
  static readonly SINGLE_LIST_DELETE_IMAGE_FULL_BOTTOM_MARGIN = 49;



  // the dpi of phone should be 480, but it is 320 currently.
  // so all dimensions have to be multiplied by 1.5
  static readonly DPI_RATIO = 1;
}