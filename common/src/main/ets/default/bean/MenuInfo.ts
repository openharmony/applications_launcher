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

import CommonConstants from '../constants/CommonConstants';

/**
 * 弹出框菜单信息
 */
export default class MenuInfo {
  /**
   * 菜单类型
   */
  menuType: number = CommonConstants.MENU_TYPE_FIXED;

  /**
   * 菜单图片信息
   */
  menuImgSrc: any = null;

  /**
   * 菜单文字信息
   */
  menuText: any = null;

  /**
   * 菜单当前是否可用
   */
  menuEnabled = true;

  /**
   * 菜单点击回调
   */
  onMenuClick: Function = null;

  /**
   * shortcut icon Id
   */
  shortcutIconId = CommonConstants.INVALID_VALUE;

  /**
   * shortcut label Id
   */
  shortcutLabelId = CommonConstants.INVALID_VALUE;

  /**
   * bundleName
   */
  bundleName: string = null;
}
