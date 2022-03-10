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
import StyleConstants from './constants/StyleConstants';
import PageDesktopGridStyleConfig from '../../../../../../../feature/pagedesktop/src/main/ets/default/common/PageDesktopGridStyleConfig';

/**
 * Pad定制网格样式配置类
 */
export default class PadPageDesktopGridStyleConfig extends PageDesktopGridStyleConfig {
  /**
   * 样式配置索引
   */
  private static sProductInstance: PadPageDesktopGridStyleConfig | undefined;

  /**
   * 图标大小
   */
  mIconSize = StyleConstants.DEFAULT_APP_ICON_SIZE_WIDTH;

  /**
   * 名称大小
   */
  mNameSize = StyleConstants.DEFAULT_APP_NAME_SIZE;

  /**
   * margin
   */
  mMargin = StyleConstants.DEFAULT_MARGIN_SIZE;

  /**
   * 名称高度
   */
  mNameHeight = StyleConstants.DEFAULT_APP_NAME_HEIGHT;

  protected constructor() {
    super();
  }

  /**
   * 获取工作空间样式实例
   */
  static getInstance(): PadPageDesktopGridStyleConfig {
    if (PadPageDesktopGridStyleConfig.sProductInstance == undefined) {
      PadPageDesktopGridStyleConfig.sProductInstance = new PadPageDesktopGridStyleConfig();
      PadPageDesktopGridStyleConfig.sProductInstance.initConfig();
    }
    return PadPageDesktopGridStyleConfig.sProductInstance;
  }

  getConfigLevel(): string {
    return CommonConstants.LAYOUT_CONFIG_LEVEL_PRODUCT;
  }
}