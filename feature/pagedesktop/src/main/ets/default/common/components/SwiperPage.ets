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
  EventConstants,
  CardItemInfo,
  FolderData,
  BadgeManager,
  CheckEmptyUtils
} from '@ohos/common';
import AppItem from './AppItem';
import FormItem from './FormItem';
import FolderItem from './FolderItem';
import { PageDesktopGridStyleConfig } from '../PageDesktopGridStyleConfig';
import { PageDesktopDragHandler } from '../PageDesktopDragHandler';
import { PageDesktopViewModel } from '../../viewmodel/PageDesktopViewModel';

const TAG = 'SwiperPage';

interface AppListInfo {
  appGridInfo: LauncherDragItemInfo[][]
}

interface GridLayout {
  id: number;
  layout: string;
  name: string;
  value: number;
  row: number;
  column: number;
  checked: boolean;
}

@Component
export default struct SwiperPage {
  @StorageLink('workSpaceWidth') @Watch('updateDeskTopScreen') workSpaceWidth: number = 0;
  @StorageLink('formRefresh') formRefresh: string = '';
  @State columnsTemplate: string = '';
  @State rowsTemplate: string = ''
  @Prop @Watch('changeColumnAndRow') gridConfig: string;
  @State mMargin: number = 0;
  @State mColumnsGap: number = 0;
  @State mRowsGap: number = 0;
  @State mPaddingTop: number = 0;
  @State mNameLines: number = PresetStyleConstants.DEFAULT_APP_NAME_LINES;
  @State mMarginTop: number = 0;
  @Link @Watch('updateAppListInfo') appListInfo: AppListInfo;
  @Prop swiperPage: number;
  @State mAppListInfo: LauncherDragItemInfo[] = this.appListInfo.appGridInfo[this.swiperPage];
  private mPageDesktopViewModel?: PageDesktopViewModel;
  private mPageDesktopStyleConfig = PageDesktopViewModel.getInstance().getPageDesktopStyleConfig();
  private mGridWidth: number = 0;
  private mGridHeight: number = 0;
  private mIconSize: number = 0;
  private mGridSpaceWidth: number = 0;
  private mGridSpaceHeight: number = 0;
  private APP_INFO_REFRESH_DELAY: number = 1000;

  private updateAppListInfo(): void {
    this.mAppListInfo = this.appListInfo.appGridInfo[this.swiperPage];
    this.updateOpenFolderData();
  }

  /**
   * 监听桌面元素变化时，更新打开的大文件的数据。
   * eg：应用角标更新时，大文件内的应用角标同步更新。
   */
  updateOpenFolderData() {
    const openFolderData = AppStorage.get('openFolderData') as FolderData;
    if (CheckEmptyUtils.isEmptyArr(this.mAppListInfo)) {
      Log.showError(TAG, 'mAppListInfo is empty');
      return;
    }
    if (openFolderData?.folderId && this.mAppListInfo?.length) {
      let temp = this.mAppListInfo.find((item: LauncherDragItemInfo) => item?.folderId === openFolderData.folderId);
      AppStorage.setOrCreate('openFolderData', temp as FolderData);
    }
  }

  aboutToAppear(): void {
    Log.showInfo(TAG, 'aboutToAppear');
    this.mPageDesktopViewModel = PageDesktopViewModel.getInstance();
    this.updateDeskTopScreen();
  }

  updateDeskTopScreen(): void {
    Log.showInfo(TAG, 'updateDeskTopScreen');
    this.mPageDesktopStyleConfig =
      this.mPageDesktopViewModel?.getPageDesktopStyleConfig() as PageDesktopGridStyleConfig;
    this.mMargin = this.mPageDesktopStyleConfig.mMargin;
    this.mColumnsGap = this.mPageDesktopStyleConfig.mColumnsGap;
    this.mRowsGap = this.mPageDesktopStyleConfig.mRowsGap;
    this.mPaddingTop = this.mPageDesktopStyleConfig.mPaddingTop;
    this.mNameLines = this.mPageDesktopStyleConfig.mNameLines;
    this.mMarginTop = this.mPageDesktopStyleConfig.mDesktopMarginTop;
    this.mGridWidth = this.mPageDesktopStyleConfig.mGridWidth;
    this.mGridHeight = this.mPageDesktopStyleConfig.mGridHeight;
    this.mIconSize = this.mPageDesktopStyleConfig.mIconSize;
    this.mGridSpaceWidth = Number(this.mPageDesktopViewModel?.getWorkSpaceWidth()) - this.mMargin;
    this.mGridSpaceHeight = Number(this.mPageDesktopViewModel?.getWorkSpaceHeight());
    this.changeConfig();
    localEventManager.sendLocalEventSticky(EventConstants.EVENT_REQUEST_PAGEDESK_ITEM_UPDATE, null);
  }

  private changeColumnAndRow(): void {
    this.changeConfig();
  }

  private changeConfig(): void {
    let mGridConfig = this.mPageDesktopViewModel?.getGridConfig() as GridLayout;
    let column = mGridConfig.column as number;
    let row = mGridConfig.row as number;
    this.columnsTemplate = '';
    this.rowsTemplate = '';
    for (let i = 0; i < column; i++) {
      this.columnsTemplate += '1fr '
    }
    for (let i = 0; i < row; i++) {
      this.rowsTemplate += '1fr '
    }
  }

  itemMove(moveX: number, moveY: number): void {
    const isSwappingPage: boolean = AppStorage.get('isSwappingPage') as boolean;
    if (isSwappingPage) {
      return;
    }
    let curPageIndex: number = AppStorage.get('pageIndex') as number;
    if ((moveX - this.mIconSize / 2) < this.mMargin && curPageIndex > 0 && moveY < this.mGridSpaceHeight) {
      this.mPageDesktopViewModel?.showPrevious();
      this.movingIconSwapPageDelay();
    } else if ((moveX + this.mIconSize / 2) > this.mGridSpaceWidth && moveY < this.mGridSpaceHeight) {
      let cachePageIndex = this.mPageDesktopViewModel?.getGridPageCount() as number;
      if (curPageIndex === cachePageIndex - 1 && !this.mPageDesktopViewModel?.isBlankPage()) {
        this.mPageDesktopViewModel?.addBlankPage(true);
      } else if (curPageIndex < cachePageIndex - 1) {
        this.mPageDesktopViewModel?.showNext();
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
    }, this.APP_INFO_REFRESH_DELAY);
  }

  private buildLog(item: LauncherDragItemInfo): boolean {
    return true;
  }

  getRowEnd(item: LauncherDragItemInfo): number {
    let result = 0;
    if (typeof item.row !== 'undefined' && item.area?.length) {
      result = item.row + item.area[1] - 1;
    }
    return result;
  }

  getColumnEnd(item: LauncherDragItemInfo): number {
    let result = 0;
    if (typeof item.column !== 'undefined' && item.area?.length) {
      result = item.column + item.area[0] - 1;
    }
    return result;
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
              mPageDesktopViewModel: this.mPageDesktopViewModel,
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
        .rowEnd(this.getRowEnd(item))
        .columnEnd(this.getColumnEnd(item))
        .zIndex(10)
      }, (item: LauncherDragItemInfo, index: number) => {
        if (item.typeId === CommonConstants.TYPE_FOLDER) {
          return JSON.stringify(item);
        } else if (item.typeId === CommonConstants.TYPE_CARD) {
          return JSON.stringify(item) + this.formRefresh;
        } else if (item.typeId === CommonConstants.TYPE_APP) {
          return JSON.stringify(item);
        } else {
          return '';
        }
      })
    }
    .id(`${TAG}_Grid_${this.swiperPage}`)
    .columnsTemplate(this.columnsTemplate)
    .rowsTemplate(this.rowsTemplate)
    .columnsGap(this.mColumnsGap)
    .rowsGap(this.mRowsGap)
    .width(this.mGridWidth)
    .height(this.mGridHeight)
    .margin({
      right: this.mMargin,
      left: this.mMargin
    })
    .onMouse((event: MouseEvent) => {
      if (event.button === MouseButton.Right || event.button === MouseButton.Left) {
        AppStorage.setOrCreate('selectDesktopAppItem', '');
      }
    })
    .onDragEnter((event: DragEvent, extraParams: string) => {
      Log.showInfo(TAG, `onDragEnter extraParams: ${extraParams}, event: [${event.getWindowX()}, ${event.getWindowY()}]`);
    })
    .onDragMove((event: DragEvent, extraParams: string) => {
      Log.showInfo(TAG, `onDragMove event: [${event.getWindowX()}, ${event.getWindowY()}]`);
      const dragItemInfo: LauncherDragItemInfo = AppStorage.get<LauncherDragItemInfo>('dragItemInfo') as LauncherDragItemInfo;
      if (!dragItemInfo.isDragging) {
        return;
      }
      if (AppStorage.get('deviceType') === CommonConstants.DEFAULT_DEVICE_TYPE ||
        (AppStorage.get('deviceType') !== CommonConstants.DEFAULT_DEVICE_TYPE &&
          AppStorage.get('dragItemType') === CommonConstants.DRAG_FROM_DESKTOP)) {
        this.itemMove(event.getWindowX(), event.getWindowY());
      }
    })
    .onDragLeave((event: DragEvent, extraParams: string) => {
      Log.showInfo(TAG, `onDragLeave event: [${event.getWindowX()}, ${event.getWindowY()}]`);
    })
    .onDrop((event: DragEvent, extraParams: string) => {
      const dragItemType: number = AppStorage.get('dragItemType') as number;
      Log.showInfo(TAG, `onDrop event: [${event.getWindowX()}, ${event.getWindowY()}]`);
      if (dragItemType === CommonConstants.DRAG_FROM_DESKTOP ||
        (dragItemType === CommonConstants.DRAG_FROM_DOCK &&
          AppStorage.get('deviceType') === CommonConstants.DEFAULT_DEVICE_TYPE)) {
        const dragResult = PageDesktopDragHandler.getInstance().onDragDrop(event.getWindowX(), event.getWindowY());
        Log.showInfo(TAG, `onDrop dragResult: ${dragResult}`);
        AppStorage.setOrCreate('selectAppIndex', null);
        const dragItemInfo: LauncherDragItemInfo = AppStorage.get('dragItemInfo') as LauncherDragItemInfo;
        if (dragItemInfo.bundleName) {
          BadgeManager.getInstance().updateBadgeNumber(dragItemInfo.bundleName, dragItemInfo.badgeNumber);
        }
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