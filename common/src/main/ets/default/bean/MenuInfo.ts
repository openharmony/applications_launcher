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

import { CommonConstants } from '../constants/CommonConstants';

/**
 * Item info of long press menu.
 */
export class MenuInfo {
  /**
   * Item type. see CommonConstants.MENU_TYPE_FIXED and CommonConstants.MENU_TYPE_DYNAMIC.
   */
  menuType: number = CommonConstants.MENU_TYPE_FIXED;

  /**
   * Image source for this item.
   */
  menuImgSrc: any = null;

  /**
   * Menu text for this item.
   */
  menuText: any = null;

  /**
   * True if this item is enabled.
   */
  menuEnabled = true;

  /**
   * Callback when item is clicked.
   */
  onMenuClick: Function = () => [];

  /**
   * shortcut icon Id
   */
  shortcutIconId: number | undefined = CommonConstants.INVALID_VALUE;

  /**
   * shortcut label Id
   */
  shortcutLabelId: number | undefined = CommonConstants.INVALID_VALUE;

  /**
   * bundleName
   */
  bundleName: string | undefined;

  /**
  * moduleName
  */
  moduleName: string | undefined;
}
