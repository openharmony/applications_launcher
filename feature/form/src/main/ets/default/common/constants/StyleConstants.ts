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
  static readonly DEFAULT_FORM_MGR_BACK_IMAGE = '/common/pics/ic_form_mgr_back.png';

  // style
  static readonly DEFAULT_FORM_MARGIN = 10;
  static readonly FORM_MANAGER_VIEW_CARD_WIDTH = 300;
  static readonly FORM_MANAGER_VIEW_CARD_HEIGHT = 300;
  static readonly FORM_MANAGER_VIEW_WIDTH = 402;
  static readonly FORM_MANAGER_VIEW_HEIGHT = 528;
  static readonly FORM_MANAGER_VIEW_FORM_NAME_HEIGHT = 28;
  static readonly FORM_MANAGER_VIEW_FORM_SUB_NAME_HEIGHT = 22;

  // font resources
  static readonly DEFAULT_FORM_MGR_TEXT_FONT_SIZE = 20;
  static readonly DEFAULT_FORM_MGR_FONT_COLOR = '#e5ffffff';
  static readonly DEFAULT_FORM_DIALOG_BUTTON_COLOR = '#007dff';

  // layout percentage adaptation resources
  static readonly DEFAULT_LAYOUT_PERCENTAGE = '100%';
  static readonly FORM_MGR_BOTTOM_WIDTH_PERCENTAGE = '80%';
  static readonly FORM_MGR_BOTTOM_HEIGHT_PERCENTAGE = '10%';
  static readonly FORM_MGR_SWIPER_WIDTH_PERCENTAGE = '80%';
  static readonly FORM_MGR_SWIPER_HEIGHT_PERCENTAGE = '50%';
  static readonly FORM_MGR_TEXT_HEIGHT_PERCENTAGE = '20%';
  static readonly FORM_MGR_TOP_HEIGHT_PERCENTAGE = '10%';

  // parameters for form manager page in phone
  static readonly FORM_MGR_STATUS_BAR_HEIGHT = 24;
  static readonly FORM_MGR_APP_BAR_HEIGHT = 56;
  static readonly FORM_MGR_BACK_ICON_HEIGHT = 18;
  static readonly FORM_MGR_BACK_ICON_WIDTH = 20;
  static readonly FORM_MGR_BACK_ICON_LEFT_MARGIN = 26;
  static readonly FORM_MGR_ADD_TO_DESKTOP_BUTTON_HEIGHT = 40;
  static readonly FORM_MGR_ADD_TO_DESKTOP_BUTTON_WIDTH = 305;
  static readonly FORM_MGR_ADD_TO_DESKTOP_BUTTON_LEFT_MARGIN = 27;
  static readonly FORM_MGR_ADD_TO_DESKTOP_BUTTON_RIGHT_MARGIN = 27;
  static readonly FORM_MGR_ADD_TO_DESKTOP_BUTTON_BOTTOM_MARGIN = 48;
  static readonly FORM_MGR_FORM_SIZE = 270;
  static readonly FORM_MGR_ADD_TO_DESKTOP_TEXT_SIZE = 18;
  static readonly FORM_MGR_APP_LABEL_TEXT_SIZE = 20;
  static readonly FORM_MGR_DESCRIPTION_TEXT_SIZE = 16;


  // the dpi of phone should be 480, but it is 320 currently.
  // so all dimensions have to be multiplied by 1.5
  static readonly DPI_RATIO = 1.5;
}