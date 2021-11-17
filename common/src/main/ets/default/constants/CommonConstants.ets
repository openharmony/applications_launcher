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

/**
 * 通用固定常量定义
 */
export default class CommonConstants {
  /**
   * 桌面包名
   */
  public static LAUNCHER_BUNDLE: string = 'com.ohos.launcher';

  /**
   * 桌面设置Ability名
   */
  public static SETTING_ABILITY: string = 'com.ohos.launcher.settings.MainAbility';

  /**
   * 无效值定义
   */
  public static INVALID_VALUE: number = -1;

  /**
   * 卸载成功返回值
   */
  public static UNINSTALL_SUCCESS: number = 0;

  /**
   * 禁止卸载返回值
   */
  public static UNINSTALL_FORBID: number = 1;

  /**
   * 应用类型
   */
  public static TYPE_APP: number = 0;

  /**
   * 卡片类型
   */
  public static TYPE_CARD: number = 1;

  /**
   * 卡片尺寸1x2
   */
  public static CARD_DIMENSION_1x2: number = 1;

  /**
   * 卡片尺寸2x2
   */
  public static CARD_DIMENSION_2x2: number = 2;

  /**
   * 卡片尺寸2x4
   */
  public static CARD_DIMENSION_2x4: number = 3;

  /**
   * 卡片尺寸4x4
   */
  public static CARD_DIMENSION_4x4: number = 4;

  /**
   * 通用级布局配置
   */
  public static LAYOUT_CONFIG_LEVEL_COMMON: string = "common";

  /**
   * 特性级布局配置
   */
  public static LAYOUT_CONFIG_LEVEL_FEATURE: string = "feature";

  /**
   * 产品级布局配置
   */
  public static LAYOUT_CONFIG_LEVEL_PRODUCT: string = "product";

  /**
   * 布局模式配置
   */
  public static LAYOUT_CONFIG_TYPE_MODE: number = 0;

  /**
   * 布局样式配置
   */
  public static LAYOUT_CONFIG_TYPE_STYLE: number = 1;

  /**
   * 功能布局配置
   */
  public static LAYOUT_CONFIG_TYPE_FUNCTION: number = 2;

  /**
   * 默认设备类型
   */
  public static DEFAULT_EQUIPMENT_TYPE: string = "phone";
}