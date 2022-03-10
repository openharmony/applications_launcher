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

import CommonConstants from '../../../../../../../common/src/main/ets/default/constants/CommonConstants';
import PresetStyleConstants from '../../../../../../../common/src/main/ets/default/constants/PresetStyleConstants';
import FeatureConstants from './constants/FeatureConstants';
import AppGridStyleConfig from '../../../../../../../common/src/main/ets/default/layoutconfig/AppGridStyleConfig';

/**
 * 工作控件网格样式配置类
 */
export default class PageDesktopGridStyleConfig extends AppGridStyleConfig {
  /**
   * 样式配置索引
   */
  private static sFeatureInstance: PageDesktopGridStyleConfig = null;

  /**
   * margin
   */
  mMargin = PresetStyleConstants.DEFAULT_LAYOUT_MARGIN;

  mDesktopMarginTop = PresetStyleConstants.DEFAULT_ICON_PADDING_TOP;

  protected constructor() {
    super();
  }

  /**
   * 获取工作空间样式实例
   */
  static getInstance() {
    if (PageDesktopGridStyleConfig.sFeatureInstance == null) {
      PageDesktopGridStyleConfig.sFeatureInstance = new PageDesktopGridStyleConfig();
      PageDesktopGridStyleConfig.sFeatureInstance.initConfig();
    }
    return PageDesktopGridStyleConfig.sFeatureInstance;
  }

  initConfig(): void {
  }

  getConfigLevel(): string {
    return CommonConstants.LAYOUT_CONFIG_LEVEL_FEATURE;
  }

  getFeatureName() {
    return FeatureConstants.FEATURE_NAME;
  }
}