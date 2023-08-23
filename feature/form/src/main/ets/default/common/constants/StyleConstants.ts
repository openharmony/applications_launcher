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
export default class StyleConstants {
  //image resources
  static readonly DEFAULT_FORM_MGR_BACKGROUND_IMAGE = '/common/pics/ic_wallpaper_form_manager.jpg';

  static readonly FORM_SERVICE_MARGIN_HORIZONTAL = 24;

  static readonly FORM_SERVICE_BAR_HEIGHT = 56;
  static readonly FORM_SERVICE_BACK_IMAGE = '/common/pics/ic_public_back.svg';
  static readonly FORM_SERVICE_BACK_ICON_WIDTH = 24;
  static readonly FORM_SERVICE_BACK_ICON_HEIGHT = 24;
  static readonly FORM_SERVICE_BAR_TEXT_MARGIN_LEFT = 16;

  static readonly FORM_SERVICE_GRID_ROW_COLUMNS = 4;
  static readonly FORM_SERVICE_GRID_ROW_GUTTER_X = 24;
  static readonly FORM_SERVICE_FORM_NAME_LINE_HEIGHT = 19;
  static readonly FORM_SERVICE_FORM_NAME_NUM_LINE_HEIGHT = 16;
  static readonly FORM_SERVICE_FORM_ICON_NAME_MARGIN_TOP = 4;
  static readonly FORM_SERVICE_FROM_NAME_NUMBER_MARGIN = 4;

  static readonly FORM_SERVICE_APP_LIST_MARGIN_BOTTOM = 19;
  static readonly FORM_SERVICE_APP_LIST_PADDING_HORIZONTAL = 12;
  static readonly FORM_SERVICE_APP_LIST_PADDING_VERTICAL = 4;
  static readonly FORM_SERVICE_APP_LIST_DIVIDER_COLOR = 'rgba(255,255,255,0.05)';
  static readonly FORM_SERVICE_APP_LIST_BACKGROUND_COLOR = 'rgba(255,255,255,0.1)';
  static readonly FORM_SERVICE_APP_ITEM_HEIGHT = 64;
  static readonly FORM_SERVICE_APP_ICON_SIZE_WIDTH = 48;
  static readonly FORM_SERVICE_APP_NAME_LINE_HEIGHT = 21;
  static readonly FORM_SERVICE_APP_NAME_MARGIN_LEFT = 16;
  static readonly SERVICE_FORM_APP_ITEM_RIGHT_ARROW_WIDTH = 12;
  static readonly SERVICE_FORM_APP_ITEM_RIGHT_ARROW_HEIGHT = 24;
  static readonly SERVICE_FORM_APP_ITEM_GROUP_DIVIDER_MARGIN_LEFT =
    StyleConstants.FORM_SERVICE_APP_ICON_SIZE_WIDTH +
    StyleConstants.FORM_SERVICE_APP_NAME_MARGIN_LEFT;
  static readonly SERVICE_FORM_APP_ITEM_GROUP_DIVIDER_WIDTH = 0.5;
}