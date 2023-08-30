/**
 * Copyright (c) 2021-2022 Huawei Device Co., Ltd.
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  LauncherDragItemInfo,
  Log,
  CommonConstants,
  PresetStyleConstants,
  localEventManager,
  EventConstants
} from '@ohos/common';
import AppItem from './AppItem';
import FormItem from './FormItem';
import FolderItem from './FolderItem';
import { PageDesktopGridStyleConfig } from '../PageDesktopGridStyleConfig';

const TAG = "SwiperPage";
const APP_INFO_REFRESH_DELAY = 1000;

@Component
export default struct SwiperPage {
  @StorageLink('workSpaceWidth') @Watch('updateDeskTopScreen') workSpaceWidth: number = 0;
  @StorageLink('formRefresh') formRefresh: string = '';
  @State ColumnsTemplate: string = '';
  @State RowsTemplate: string = ''
  @Prop @Watch('changeColumnAndRow') gridConfig: string;
  @State mMargin: number = 0;
  @State mColumnsGap: number = 0;
  @State mRowsGap: number = 0;
  @State mPaddingTop: number = 0;
  @State mNameLines: number = PresetStyleConstants.DEFAULT_APP_NAME_LINES;
  @State mMarginTop: number = 0;
  @Link @Watch('updateAppListInfo') appListInfo: {
    appGridInfo: [[]]
  };
  @Prop swiperPage: number;
  @State mAppListInfo: LauncherDragItemInfo[] = this.appListInfo.appGridInfo[this.swiperPage];
  private mPageDesktopViewModel;
  private mPageDesktopStyleConfig:PageDesktopGridStyleConfig;
  private mGridWidth : number;
  private mGridHeight: number;
  private mIconSize: number;
  private mGridSpaceWidth : number;
  private mGridSpaceHeight: number;

  private updateAppListInfo(): void {
    this.mAppListInfo = this.appListInfo.appGridInfo[this.swiperPage];
  }

  aboutToAppear(): void {
    Log.showInfo(TAG, 'aboutToAppear');
    this.updateDeskTopScreen();
  }

  updateDeskTopScreen(): void {
    Log.showInfo(TAG, 'updateDeskTopScreen');
    this.mPageDesktopStyleConfig = this.mPageDesktopViewModel.getPageDesktopStyleConfig();
    this.mMargin = this.mPageDesktopStyleConfig.mMargin;
    this.mColumnsGap = this.mPageDesktopStyleConfig.mColumnsGap;
    this.mRowsGap = this.mPageDesktopStyleConfig.mRowsGap;
    this.mPaddingTop = this.mPageDesktopStyleConfig.mPaddingTop;
    this.mNameLines = this.mPageDesktopStyleConfig.mNameLines;
    this.mMarginTop = this.mPageDesktopStyleConfig.mDesktopMarginTop;
    this.mGridWidth = this.mPageDesktopStyleConfig.mGridWidth;
    this.mGridHeight = this.mPageDesktopStyleConfig.mGridHeight;
    this.mIconSize = this.mPageDesktopStyleConfig.mIconSize;
    this.mGridSpaceWidth = Number(this.mPageDesktopViewModel.getWorkSpaceWidth()) - this.mMargin;
    this.mGridSpaceHeight = Number(this.mPageDesktopViewModel.getWorkSpaceHeight());
    this.changeConfig();
    localEventManager.sendLocalEventSticky(EventConstants.EVENT_REQUEST_PAGEDESK_ITEM_UPDATE, null);
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

  itemMove(moveX: number, moveY: number): void {
    const isSwappingPage: boolean = AppStorage.get('isSwappingPage');
    if (isSwappingPage) {
      return;
    }
    let curPageIndex: number = AppStorage.get('pageIndex');
    if ((moveX - this.mIconSize / 2) < this.mMargin && curPageIndex > 0 && moveY < this.mGridSpaceHeight) {
      this.mPageDesktopViewModel.showPrevious();
      this.movingIconSwapPageDelay();
    } else if ((moveX + this.mIconSize / 2) > this.mGridSpaceWidth && moveY < this.mGridSpaceHeight) {
      let cachePageIndex = this.mPageDesktopViewModel.getGridPageCount();
      if (curPageIndex === cachePageIndex - 1 && !this.mPageDesktopViewModel.isBlankPage()) {
        this.mPageDesktopViewModel.addBlankPage(true);
      } else if(curPageIndex < cachePageIndex - 1) {
        this.mPageDesktopViewModel.showNext();
      }
      this.movingIconSwapPageDelay();
    }
  }

  /**
   * Increase delay when dragging app to other page.
   */
  movingIconSwapPageDelay() {
    AppStorage.setOrCreate('isSwappingPage', true);
    setTimeout(() => {
      AppStorage.setOrCreate('isSwappingPage', false);
    }, APP_INFO_REFRESH_DELAY);
  }

  private buildLog(item): boolean {
    return true;
  }

  build() {
    Grid() {
      ForEach(this.mAppListInfo, (item: LauncherDragItemInfo, index: number) => {
        GridItem() {
          if (this.buildLog(item)) {
          }
          if (item.typeId === CommonConstants.TYPE_APP) {
            AppItem({
              item: item,
              mPageDesktopViewModel: this.mPageDesktopViewModel,
              mNameLines: this.mNameLines
            }).id(`${TAG}_AppItem_${index}`)
          } else if (item.typeId === CommonConstants.TYPE_FOLDER) {
            FolderItem({
              folderItem: item,
              mNameLines: this.mNameLines
            }).id(`${TAG}_FolderItem_${index}`)
          } else if (item.typeId === CommonConstants.TYPE_CARD) {
            FormItem({
              formItem: item
            }).id(`${TAG}_FormItem_${index}`)
          }
        }
        .id(`${TAG}_GridItem_${index}`)
        .padding({ top: this.mPaddingTop })
        .rowStart(item.row)
        .columnStart(item.column)
        .rowEnd(item.row + item.area[1] - 1)
        .columnEnd(item.column + item.area[0] - 1)
      }, (item: LauncherDragItemInfo, index: number) => {
        if (item.typeId === CommonConstants.TYPE_FOLDER) {
          return JSON.stringify(item);
        } else if (item.typeId === CommonConstants.TYPE_CARD) {
          return JSON.stringify(item) + this.formRefresh;
        } else if (item.typeId === CommonConstants.TYPE_APP) {
          return JSON.stringify(item);
        }
      })
    }
    .id(`${TAG}_Grid_${this.swiperPage}`)
    .columnsTemplate(this.ColumnsTemplate)
    .rowsTemplate(this.RowsTemplate)
    .columnsGap(this.mColumnsGap)
    .rowsGap(this.mRowsGap)
    .width(this.mGridWidth)
    .height(this.mGridHeight)
    .margin({
      right: this.mMargin,
      left: this.mMargin
    })
    .onMouse((event: MouseEvent) => {
      if (event.button == MouseButton.Right) {
        AppStorage.setOrCreate('selectDesktopAppItem', '');
      }
    })
    .onClick(() => {
      AppStorage.setOrCreate('selectDesktopAppItem', '')
    })
    .onDragEnter((event: DragEvent, extraParams: string) => {
      Log.showInfo(TAG, `onDragEnter extraParams: ${extraParams}, event: [${event.getWindowX()}, ${event.getWindowY()}]`);
    })
    .onDragMove((event: DragEvent, extraParams: string) => {
      Log.showInfo(TAG, `onDragMove event: [${event.getWindowX()}, ${event.getWindowY()}]`);
      const dragItemInfo: LauncherDragItemInfo = AppStorage.get<LauncherDragItemInfo>('dragItemInfo');
      if (!dragItemInfo.isDragging) return;
      if (AppStorage.get('deviceType') === CommonConstants.DEFAULT_DEVICE_TYPE
      || (AppStorage.get('deviceType') !== CommonConstants.DEFAULT_DEVICE_TYPE
      && AppStorage.get('dragItemType') === CommonConstants.DRAG_FROM_DESKTOP)) {
        this.itemMove(event.getWindowX(), event.getWindowY());
      }
    })
    .onDragLeave((event: DragEvent, extraParams: string) => {
      Log.showInfo(TAG, `onDragLeave event: [${event.getWindowX()}, ${event.getWindowY()}]`);
    })
    .onDrop((event: DragEvent, extraParams: string) => {
      const dragItemType: number = AppStorage.get('dragItemType');
      Log.showInfo(TAG, `onDrop event: [${event.getWindowX()}, ${event.getWindowY()}]`);
      if (dragItemType === CommonConstants.DRAG_FROM_DESKTOP
      || (dragItemType === CommonConstants.DRAG_FROM_DOCK && AppStorage.get('deviceType') === CommonConstants.DEFAULT_DEVICE_TYPE)) {
        const dragResult = globalThis.PageDesktopDragHandler.onDragDrop(event.getWindowX(), event.getWindowY());
        Log.showInfo(TAG, `onDrop dragResult: ${dragResult}`);
        AppStorage.setOrCreate('selectAppIndex', null);
        if (!dragResult) {
          AppStorage.setOrCreate<LauncherDragItemInfo>('dragItemInfo', new LauncherDragItemInfo());
        } else {
          // Wait for the UI rendering to end.
          setTimeout(() => {
            AppStorage.setOrCreate<LauncherDragItemInfo>('dragItemInfo', new LauncherDragItemInfo());
          }, 50);
        }
      }
    })
  }
}