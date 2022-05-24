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

import CommonConstants from '../../../../../../../../common/src/main/ets/default/constants/CommonConstants';
import PresetStyleConstants from '../../../../../../../../common/src/main/ets/default/constants/PresetStyleConstants';
import AppItem from './AppItem.ets';
import FolderItem from './FolderItem.ets';
import FormItem from './FormItem.ets';
import PageDesktopGridStyleConfig from '../PageDesktopGridStyleConfig';
import Log from '../../../../../../../../common/src/main/ets/default/utils/Log';

const TAG = "SwiperPage";

@Component
export default struct SwiperPage {
  @StorageLink('workSpaceWidth') workSpaceWidth: number = 0;
  @State ColumnsTemplate: string = '';
  @State RowsTemplate: string = ''
  @Prop @Watch('changeColumnAndRow') gridConfig: string;
  @State mMargin: number = 0;
  @State mColumnsGap: number = 0;
  @State mRowsGap: number = 0;
  @State mPaddingTop: number = 0;
  @State mNameLines: number = PresetStyleConstants.DEFAULT_APP_NAME_LINES;
  @State mMarginTop: number = 0;
  private mAppListInfo;
  private mPageDesktopViewModel;
  private mPageDesktopStyleConfig:PageDesktopGridStyleConfig;
  private mGridWidth : number;
  private mGridHeight: number;

  private aboutToAppear(): void  {
    this.mPageDesktopStyleConfig = this.mPageDesktopViewModel.getPageDesktopStyleConfig();
    this.mMargin = this.mPageDesktopStyleConfig.mMargin;
    this.mColumnsGap = this.mPageDesktopStyleConfig.mColumnsGap;
    this.mRowsGap = this.mPageDesktopStyleConfig.mRowsGap;
    this.mPaddingTop = this.mPageDesktopStyleConfig.mPaddingTop;
    this.mNameLines = this.mPageDesktopStyleConfig.mNameLines;
    this.mMarginTop = this.mPageDesktopStyleConfig.mDesktopMarginTop;
    this.mGridWidth = this.mPageDesktopStyleConfig.mGridWidth;
    this.mGridHeight = this.mPageDesktopStyleConfig.mGridHeight;
    this.changeConfig();
  }

  private changeColumnAndRow(): void {
    this.changeConfig();
  }

  private changeConfig(): void {
    let mGridConfig = this.mPageDesktopViewModel.getGridConfig();
    let column = mGridConfig.column;
    let row = mGridConfig.row;
    this.ColumnsTemplate = '';
    this.RowsTemplate = '';
    for (let i = 0;i < column; i++) {
      this.ColumnsTemplate += '1fr '
    }
    for (let i = 0;i < row; i++) {
      this.RowsTemplate += '1fr '
    }
  }

  private buildLog(item): boolean {
    Log.showInfo(TAG, `build item: ${JSON.stringify(item)}`);
    return true;
  }
  build() {
    Grid() {
      ForEach(this.mAppListInfo, (item) => {
        GridItem() {
          if(this.buildLog(item)){}
          if (item.type == CommonConstants.TYPE_APP) {
            AppItem({
              item: item,
              mPageDesktopViewModel: this.mPageDesktopViewModel,
              mNameLines: this.mNameLines
            })
          } else if (item.type == CommonConstants.TYPE_FOLDER) {
            FolderItem({
              folderItem: item,
              mNameLines: this.mNameLines
            })
          } else {
            FormItem({
              formItem: item
            })
          }
        }
        .padding({top:this.mPaddingTop})
        .rowStart(item.row)
        .columnStart(item.column)
        .rowEnd(item.row + item.area[1] - 1)
        .columnEnd(item.column + item.area[0] - 1)
      }, (item) => {
        if (item.type == CommonConstants.TYPE_FOLDER) {
          return JSON.stringify(item);
        } else {
          return `${item.type}${item.row}${item.column}`;
        }
      })
    }
    .columnsTemplate(this.ColumnsTemplate)
    .rowsTemplate(this.RowsTemplate)
    .columnsGap(this.mColumnsGap)
    .rowsGap(this.mRowsGap)
    .width(this.mGridWidth)
    .height(this.mGridHeight)
    .margin({ right: this.mMargin, left: this.mMargin, top: this.mMarginTop})
  }
}