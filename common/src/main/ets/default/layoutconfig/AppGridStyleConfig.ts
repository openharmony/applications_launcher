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

import ILayoutConfig from './ILayoutConfig';
import CommonConstants from '../constants/CommonConstants';
import StyleConstants from '../constants/StyleConstants';
import PresetStyleConstants from '../constants/PresetStyleConstants';

/**
 * 应用网格显示样式配置
 */
export default class AppGridStyleConfig extends ILayoutConfig {
  /**
   * 应用网格显示样式索引
   */
  static APP_GRID_STYLE_CONFIG = 'AppGridStyleConfig';

  /**
   * 列数
   */
  mColumns = StyleConstants.DEFAULT_APP_GRID_COLUMN;

  /**
   * 行数
   */
  mRows = StyleConstants.DEFAULT_APP_GRID_ROW;

  /**
   * 类间隙
   */
  mColumnsGap = StyleConstants.DEFAULT_APP_GRID_COLUMN_GAP;

  /**
   * 行间隙
   */
  mRowsGap = StyleConstants.DEFAULT_APP_GRID_ROW_GAP;

  /**
   * grid margin
   */
  mMargin = PresetStyleConstants.DEFAULT_LAYOUT_MARGIN;

  /**
   * grid minimum gutter
   */
  mGridGutter = PresetStyleConstants.DEFAULT_APP_LAYOUT_MIN_GUTTER;

  /**
   * grid width
   */
  mGridWidth: number;

  /**
   * grid height
   */
  mGridHeight: number;

  /**
   * app width
   */
  mAppItemSize: number;

  /**
   * 图标大小
   */
  mIconSize = StyleConstants.DEFAULT_APP_ICON_SIZE_WIDTH;

  /**
   * 名称大小
   */
  mNameSize = StyleConstants.DEFAULT_APP_NAME_SIZE;

  /**
   * 名称颜色
   */
  mNameFontColor = StyleConstants.DEFAULT_FONT_COLOR;

  /**
   * 名称高度
   */
  mNameHeight = StyleConstants.DEFAULT_APP_NAME_HEIGHT;

  /**
   * app name lines
   */
  mNameLines = PresetStyleConstants.DEFAULT_APP_NAME_LINES;

  /**
   * app icon margin top
   */
  mIconMarginVertical: number = PresetStyleConstants.DEFAULT_ICON_PADDING_TOP;

  /**
   * app icon margin horizontal
   */
  mIconMarginHorizontal: number = PresetStyleConstants.DEFAULT_ICON_PADDING_LEFT;

  /**
   * icon name margin
   */
  mIconNameMargin: number = PresetStyleConstants.DEFAULT_ICON_NAME_GAP;

  protected constructor() {
    super();
  }

  /**
   * 获取应用网格显示样式配置实例
   */
  static getInstance() {
    if (globalThis.AppGridStyleConfig == null) {
      globalThis.AppGridStyleConfig = new AppGridStyleConfig();
      globalThis.AppGridStyleConfig.initConfig();
    }
    return globalThis.AppGridStyleConfig;
  }

  initConfig(): void {
  }

  getConfigLevel(): string {
    return CommonConstants.LAYOUT_CONFIG_LEVEL_COMMON;
  }

  getConfigType(): number {
    return CommonConstants.LAYOUT_CONFIG_TYPE_STYLE;
  }

  getConfigName(): string {
    return AppGridStyleConfig.APP_GRID_STYLE_CONFIG;
  }

  protected getPersistConfigJson(): string {
    const persistConfig = {
    };
    return JSON.stringify(persistConfig);
  }
}
