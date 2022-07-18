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

import { ILayoutConfig } from './ILayoutConfig';
import { CommonConstants } from '../constants/CommonConstants';
import { StyleConstants } from '../constants/StyleConstants';
import { PresetStyleConstants } from '../constants/PresetStyleConstants';

/**
 * list style config
 */
export class AppListStyleConfig extends ILayoutConfig {
  /**
   * list style config
   */
  static APP_LIST_STYLE_CONFIG = 'AppListStyleConfig';

  /**
   * width of item
   */
  mListItemWidth: any = StyleConstants.DEFAULT_APP_LIST_ITEM_WIDTH;

  /**
   * height of item
   */
  mListItemHeight: any = StyleConstants.DEFAULT_APP_LIST_ITEM_HEIGHT;

  /**
   * gap of item
   */
  mListItemGap = 0;

  /**
   * direction of list
   */
  mListDirection: Axis = Axis.Vertical;

  /**
   * isShow name
   */
  mNameDisplaySide = false;

  /**
   * isShow app name
   */
  mWithAppName = true;

  /**
   * icon size
   */
  mIconSize: number = StyleConstants.DEFAULT_APP_ICON_SIZE_WIDTH;

  /**
   * name size
   */
  mNameSize: number = StyleConstants.DEFAULT_APP_NAME_SIZE;

  /**
   * name color
   */
  mNameFontColor: string = StyleConstants.DEFAULT_FONT_COLOR;

  /**
   * height of name
   */
  mNameHeight: number = StyleConstants.DEFAULT_APP_NAME_HEIGHT;

  /**
   * name gap icon
   */
  mNameIconGap = 0;

  /**
   * padding of item
   */
  mItemPadding = 0;

  /**
   * background color of item
   */
  mItemBackgroundColor: string = StyleConstants.DEFAULT_BG_COLOR;

  /**
   * border radius of item
   */
  mItemBorderRadius = 0;

  /**
   * lines of name
   */
  mNameLines: number = PresetStyleConstants.DEFAULT_APP_NAME_LINES;

  /**
   * icon name margin
   */
  mIconNameMargin: number = PresetStyleConstants.DEFAULT_ICON_NAME_GAP;

  /**
  * list item offset
  */
  mItemOffset: {x: number, y: number} = {x: 0, y: 0};

  constructor() {
    super();
  }

  /**
   * get instance of list Style config
   */
  static getInstance(): AppListStyleConfig {
    if (globalThis.AppListStyleConfig == null) {
      globalThis.AppListStyleConfig = new AppListStyleConfig();
      globalThis.AppListStyleConfig.initConfig();
    }
    return globalThis.AppListStyleConfig;
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
    return AppListStyleConfig.APP_LIST_STYLE_CONFIG;
  }

  getPersistConfigJson(): string {
    const persistConfig = {
    };
    return JSON.stringify(persistConfig);
  }
}
