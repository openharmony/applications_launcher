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

import { Log } from '../utils/Log';
import { AppBubble } from './AppBubble';
import { AppItemInfo } from '../bean/AppItemInfo';
import { CommonConstants } from '../constants/CommonConstants';
import { AppGridStyleConfig } from '../layoutconfig/AppGridStyleConfig';

const TAG = 'AppGrid';

@Component
export struct AppGrid {
  @Link appGridList: Array<AppItemInfo>;
  @Link appGridStyleConfig: AppGridStyleConfig;
  onItemClick: Function = null;
  buildMenu: Function = null;
  @State isScroll: boolean = false;

  aboutToDisappear(): void {
    this.onItemClick = null;
    this.buildMenu = null;
  }

  private getColumnsTemplate() {
    let columnsTemplate = '';
    for (let i = 0; i < this.appGridStyleConfig.mColumns; i++) {
      columnsTemplate += ' 1fr';
    }
    return columnsTemplate;
  }

  private getRowsTemplate() {
    let rowsTemplate = '';
    if (this.isScroll) {
      return rowsTemplate;
    }
    for (let i = 0; i < this.appGridStyleConfig.mRows; i++) {
      rowsTemplate += ' 1fr';
    }
    return rowsTemplate;
  }

  build() {
    Grid() {
      ForEach(this.appGridList, (item) => {
        GridItem() {
          Column() {
            AppBubble({
              iconSize: this.appGridStyleConfig.mIconSize,
              nameSize: this.appGridStyleConfig.mNameSize,
              nameFontColor: this.appGridStyleConfig.mNameFontColor,
              nameHeight: this.appGridStyleConfig.mNameHeight,
              appName: item.appName,
              bundleName: item.bundleName,
              moduleName: item.moduleName,
              abilityName: item.abilityName,
              appIconId: item.appIconId,
              appLabelId: item.appLabelId,
              badgeNumber: item.badgeNumber,
              menuInfo: this.buildMenu(item),
              nameLines: this.appGridStyleConfig.mNameLines,
              mPaddingTop: this.appGridStyleConfig.mIconMarginVertical,
              dragStart: () => {}
            })
          }
          .onClick((event: ClickEvent) => {
            this.onItemClick(event, item);
          })
          .onMouse((event: MouseEvent) => {
            Log.showInfo(TAG, `onMouse MouseType: ${event.button}`);
            if (event.button == MouseButton.Right) {
              event.stopPropagation();
            }
          })
        }
        .width(this.appGridStyleConfig.mAppItemSize)
        .height(this.appGridStyleConfig.mAppItemSize)
        .transition({ scale: { x: 0.5, y: 0.5 } })
      }, (item) => JSON.stringify(item))
    }
    .columnsTemplate(this.getColumnsTemplate())
    .rowsTemplate(this.getRowsTemplate())
    .columnsGap(this.appGridStyleConfig.mColumnsGap)
    .rowsGap(this.appGridStyleConfig.mRowsGap)
  }
}