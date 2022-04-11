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

import FeatureConstants from './constants/FeatureConstants';
import StyleConstants from '../../../../../../../common/src/main/ets/default/constants/StyleConstants';
import CommonConstants from '../../../../../../../common/src/main/ets/default/constants/CommonConstants';
import AppListStyleConfig from '../../../../../../../common/src/main/ets/default/layoutconfig/AppListStyleConfig';

/**
 * 应用中心列表样式配置类
 */
export default class AppCenterListStyleConfig extends AppListStyleConfig {
  /**
   * 列表条目宽度
   */
  mListItemWidth: string | number = StyleConstants.PERCENTAGE_100;

  /**
   * 列表条目高度
   */
  mListItemHeight: string | number = StyleConstants.DEFAULT_80;

  /**
   * 列表条目间距
   */
  mListItemGap = 12;

  /**
   * 列表名称是否展示在旁边
   */
  mNameDisplaySide = true;

  /**
   * 列表图标大小
   */
  mIconSize: number = StyleConstants.DEFAULT_APP_ITEM_WIDTH;

  /**
   * 列表名称大小
   */
  mNameSize: number = StyleConstants.DEFAULT_APP_NAME_SIZE;

  /**
   * 列表图标和名称的间距
   */
  mNameIconGap: number = StyleConstants.DEFAULT_NUMBER;

  /**
   * 条目的内部边距
   */
  mItemPadding = 8;

  /**
   * 条目的背景色
   */
  mItemBackgroundColor: string = StyleConstants.LIGHT_BLACK;

  /**
   * 条目的圆角值
   */
  mItemBorderRadius: number = StyleConstants.DEFAULT_20;

  protected constructor() {
    super();
  }

  /**
   * 获取应用中心列表样式实例
   */
  static getInstance(): AppCenterListStyleConfig {
    if (globalThis.AppCenterListStyleConfig == null) {
      globalThis.AppCenterListStyleConfig = new AppCenterListStyleConfig();
      globalThis.AppCenterListStyleConfig.initConfig();
    }
    return globalThis.AppCenterListStyleConfig;
  }

  getConfigLevel(): string {
    return CommonConstants.LAYOUT_CONFIG_LEVEL_FEATURE;
  }

  getFeatureName(): string {
    return FeatureConstants.FEATURE_NAME;
  }
}