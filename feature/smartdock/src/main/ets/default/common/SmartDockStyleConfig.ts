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

import AppListStyleConfig from '../../../../../../../common/src/main/ets/default/layoutconfig/AppListStyleConfig';
import CommonConstants from '../../../../../../../common/src/main/ets/default/constants/CommonConstants';
import FeatureConstants from '../common/constants/FeatureConstants';

/**
 * Dock样式配置类
 */
export default class SmartDockStyleConfig extends AppListStyleConfig {
  private static sFeatureInstance: SmartDockStyleConfig;

  /**
   * dock列表高度
   */
  mDockHeight = 78;

  /**
   * dock列表背景色
   */
  mBackgroundColor = '#85FAFAFA';

  /**
   * dock列表圆角值
   */
  mDockRadius = 22;

  /**
   * dock列表背景模糊度
   */
  mBackdropBlur = 0;

  /**
   * dock列表padding
   */
  mDockPadding = 9;

  /**
   * dock列表margin
   */
  mDockMargin = 10;

  /**
   * 列表条目宽度
   */
  mListItemWidth = 60;

  /**
   * 列表条目高度
   */
  mListItemHeight = 60;

  /**
   * 列表条目间距
   */
  mListItemGap = 2;

  /**
   * 列表方向
   */
  mListDirection: Axis = Axis.Horizontal;

  /**
   * 列表名称是否展示在旁边
   */
  mNameDisplaySide = true;

  /**
   * 是否需要显示应用名称
   */
  mWithAppName = false;

  /**
   * 列表图标大小
   */
  mIconSize = 54;

  /**
   * 条目的内部边距
   */
  mItemPadding = 3;

  /**
   * 条目的背景色
   */
  mItemBackgroundColor = '';

  /**
   * 条目的圆角值
   */
  mItemBorderRadius = 0;

  /**
   * 常驻区与非常驻区间隙
   */
  mDockGap = 12;

  /**
   * 常驻区最大显示数量
   */
  mMaxDockNum = 16;

  /**
   * 非常驻区最大显示数量
   */
  mMaxRecentNum = 3;

  mMarginBottom = 24;

  protected constructor() {
    super();
  }

  /**
   * 获取dock样式实例
   */
  static getInstance() {
    if (typeof(SmartDockStyleConfig.sFeatureInstance) === 'undefined') {
      SmartDockStyleConfig.sFeatureInstance = new SmartDockStyleConfig();
      SmartDockStyleConfig.sFeatureInstance.initConfig();
      console.info('Launcher SmartDockStyleConfig getInstance end!');
    }
    return SmartDockStyleConfig.sFeatureInstance;
  }

  getConfigLevel(): string {
    return CommonConstants.LAYOUT_CONFIG_LEVEL_FEATURE;
  }

  getFeatureName() {
    return FeatureConstants.FEATURE_NAME;
  }
}
