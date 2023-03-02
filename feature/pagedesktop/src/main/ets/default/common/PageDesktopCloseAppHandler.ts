/**
 * Copyright (c) 2022-2022 Huawei Device Co., Ltd.
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
  BaseCloseAppHandler,
  CloseAppManager,
  CommonConstants,
  Log,
  CheckEmptyUtils,
  StyleConstants
} from '@ohos/common';
import { BigFolderViewModel } from '@ohos/bigfolder';
import PageDesktopViewModel from '../viewmodel/PageDesktopViewModel';

const TAG = 'PageDesktopCloseAppHandler';

/**
 * Desktop workspace start app processing class
 */
export class PageDesktopCloseAppHandler extends BaseCloseAppHandler {
  private mGridConfig;
  private mPageDesktopStyleConfig;
  private mFolderStyleConfig;
  private mAppItemBundleName: string;
  private mCloseAppType: boolean = true;
  private mFindPagedesktopPosition: boolean = true;
  private mFolderItem: any;

  constructor() {
    super();
    this.mGridConfig = PageDesktopViewModel.getInstance().getGridConfig();
    this.mPageDesktopStyleConfig = PageDesktopViewModel.getInstance().getPageDesktopStyleConfig();
    this.mFolderStyleConfig = BigFolderViewModel.getInstance().getFolderStyleConfig();
  }

  static getInstance(): PageDesktopCloseAppHandler {
    if (globalThis.PageDesktopCloseAppHandler == null) {
      globalThis.PageDesktopCloseAppHandler = new PageDesktopCloseAppHandler();
    }
    return globalThis.PageDesktopCloseAppHandler;
  }

  /**
   * get app icon info
   *
   * @param windowTarget close window target
   */
  public getAppIconInfo(windowTarget): void {
    this.mAppItemBundleName = windowTarget.bundleName;
    //        this.setAppIconInfo();
    this.calculateAppIconPosition();
    if (this.mFindPagedesktopPosition) {
      let appCloseIconInfo = {
        appIconSize: this.mCloseAppType ? StyleConstants.DEFAULT_ADD_APP_SIZE : StyleConstants.DEFAULT_FOLDER_APP_SIZE,
        appIconHeight: this.mCloseAppType ? StyleConstants.DEFAULT_ADD_APP_SIZE : StyleConstants.DEFAULT_FOLDER_APP_SIZE,
        appIconPositionX: this.mAppIconPositionX,
        appIconPositionY: this.mAppIconPositionY
      };
      let appItem: any = this.getCloseAppItemInfo();
      CloseAppManager.getInstance().addPagedesktopClosePosition(appCloseIconInfo, appItem);
    } else {
      CloseAppManager.getInstance().addPagedesktopClosePosition(null);
    }
  }

  protected calculateAppIconPosition(): void {
    if (CheckEmptyUtils.isEmpty(this.mGridConfig) || CheckEmptyUtils.isEmpty(this.mPageDesktopStyleConfig)) {
      Log.showError(TAG, `calculateAppIconPosition with invalid config`);
      return;
    }

    const gridWidth: number = this.mPageDesktopStyleConfig.mGridWidth;
    const gridHeight: number = this.mPageDesktopStyleConfig.mGridHeight;
    const column: number = this.mGridConfig.column;
    const row: number = this.mGridConfig.row;
    const columnsGap: number = this.mPageDesktopStyleConfig.mColumnsGap;
    const rowGap: number = this.mPageDesktopStyleConfig.mRowsGap;
    const gridItemHeight: number = row > 0 ? (gridHeight + rowGap) / row : 0;
    const gridItemWidth: number = column > 0 ? (gridWidth + columnsGap) / column : 0;
    const paddingTop: number = this.mPageDesktopStyleConfig.mPaddingTop;
    let appItem: any = this.getCloseAppItemInfo();
    if (CheckEmptyUtils.isEmpty(appItem)) {
      Log.showError(TAG, `calculateAppIconPosition pagedesktop not has close app`);
      this.mFindPagedesktopPosition = false;
      return;
    }
    if (this.mCloseAppType) {
      this.mAppIconPositionY = this.mPageDesktopStyleConfig.mDesktopMarginTop + paddingTop + appItem.row * gridItemHeight + 0.96;
      let columnSize: number = (this.mPageDesktopStyleConfig.mGridWidth - (column - 1) * columnsGap) / column;
      let iconLeftMargin: number = (columnSize - this.mPageDesktopStyleConfig.mIconSize) / 2;
      this.mAppIconPositionX = this.mPageDesktopStyleConfig.mMargin + iconLeftMargin + appItem.column * (gridItemWidth);

      if (CommonConstants.OVERLAY_TYPE_CARD !== AppStorage.Get('startAppTypeFromPageDesktop') && appItem.page != AppStorage.Get('pageIndex')) {
        AppStorage.SetOrCreate('pageIndex', appItem.page);
      }
    } else {
      let folderItem: any = this.mFolderItem;
      const folderGridSize: number = this.mFolderStyleConfig.mGridSize;
      const folderGridGap: number = this.mFolderStyleConfig.mFolderGridGap;
      const folderAppSize: number = this.mFolderStyleConfig.mFolderAppSize;
      let folderLeftMargin: number = (gridItemWidth * folderItem.area[0] - folderGridSize - columnsGap) / 2;
      let folderRow: number = Math.floor((folderGridSize) / (folderGridGap + folderAppSize));
      let folderColumn: number = folderRow;
      let folderLeftPadding: number = (folderGridSize - folderColumn * (folderGridGap + folderAppSize) + folderGridGap) / 2;
      let folderTopPadding: number = (folderGridSize - folderRow * (folderGridGap + folderAppSize) + folderGridGap) / 2;

      let index: number = this.getIndexInFolderAppList(appItem, folderItem);
      if (index >= folderRow * folderColumn) {
        index = 9;
      }
      let row: number = Math.floor(index / folderColumn);
      let column: number = index % folderColumn;
      if (column != 0) {
        row += 1;
      } else {
        column = folderColumn;
      }
      Log.showDebug(TAG, `calculateAppIconPosition index ${index} row ${row} column ${column}`);
      this.mAppIconPositionY = this.mPageDesktopStyleConfig.mDesktopMarginTop + folderItem.row * (gridItemHeight) + paddingTop
      + this.mPageDesktopStyleConfig.mIconMarginVertical + folderTopPadding + (row - 1) * (folderGridGap + folderAppSize);

      this.mAppIconPositionX = this.mPageDesktopStyleConfig.mMargin + folderItem.column * (gridItemWidth) + folderLeftMargin
      + folderLeftPadding + (column - 1) * (folderGridGap + folderAppSize);

      if (folderItem.page != AppStorage.Get('pageIndex')) {
        AppStorage.SetOrCreate('pageIndex', folderItem.page);
      }
    }
    this.mFindPagedesktopPosition = true;
  }

  private getIndexInFolderAppList(appItem, folderItem): number {
    let index: number = 0;
    if (CheckEmptyUtils.isEmpty(appItem) || CheckEmptyUtils.isEmpty(folderItem)
    || CheckEmptyUtils.isEmpty(folderItem.layoutInfo[0])) {
      Log.showError(TAG, `getIndexInFolderAppList with invalid appItem or folderItem`);
    }

    for (var i = 0; i < folderItem.layoutInfo[0].length; i++) {
      if (folderItem.layoutInfo[0][i]?.bundleName === appItem.bundleName) {
        index = i;
        break;
      }
    }

    return index + 1;
  }

  private getCloseAppItemInfo(): any {
    Log.showDebug(TAG, `getCloseAppItemInfo called!`);
    let appListInfo: {
      appGridInfo: [[]]
    } = AppStorage.Get('appListInfo')
    let appGridInfo = appListInfo.appGridInfo;
    if (CheckEmptyUtils.isEmptyArr(appGridInfo)) {
      Log.showError(TAG, `getCloseAppItemInfo appGridInfo is null`);
      return null;
    } else {
      for (var i = 0; i < appGridInfo.length; i++) {
        let swipeGridInfo: any[] = appGridInfo[i];
        if (!CheckEmptyUtils.isEmptyArr(swipeGridInfo)) {
          for (var j = 0; j < swipeGridInfo.length; j++) {
            let item = swipeGridInfo[j];
            switch (item.typeId) {
              case CommonConstants.TYPE_APP:
                if (this.mAppItemBundleName === item.bundleName) {
                  this.mCloseAppType = true;
                  const appInfo = {
                    bundleName: item.bundleName,
                    abilityName: item.abilityName,
                    moduleName: item.moduleName,
                    appIconSize: this.mCloseAppType ? StyleConstants.DEFAULT_ADD_APP_SIZE : StyleConstants.DEFAULT_FOLDER_APP_SIZE,
                    appIconId: item.appIconId,
                    icon: globalThis.ResourceManager
                      .getCachedAppIcon(item.appIconId, item.bundleName, item.moduleName),
                    row: item.row,
                    column: item.column,
                    page: item.page
                  }
                  return appInfo;
                }
                break;
              case CommonConstants.TYPE_FOLDER:
                Log.showDebug(TAG, `getCloseAppItemInfo foldItem case ${item.layoutInfo}`);
                let foldItem = this.getFolderItem(item.layoutInfo);
                if (CheckEmptyUtils.isEmpty(foldItem)) {
                  Log.showError(TAG, `getCloseAppItemInfo foldItem is null`);
                  break;
                } else {
                  this.mCloseAppType = false;
                  this.mFolderItem = item;
                  return foldItem;
                }
              default:
                break;
            }
          }
        }
      }
      return null;
    }
  }

  private getFolderItem(layoutInfo: [[]]): any{
    if (CheckEmptyUtils.isEmptyArr(layoutInfo)) {
      Log.showError(TAG, `getFolderItem layoutInfo is null`);
      return null;
    } else {
      let foldPage: [] = layoutInfo[0];
      if (!CheckEmptyUtils.isEmptyArr(foldPage)) {
        for (var j = 0; j < foldPage.length; j++) {
          let appItem: any = foldPage[j];
          Log.showDebug(TAG, `getFolderItem appItem is ${JSON.stringify(appItem)}`);
          if (!CheckEmptyUtils.isEmpty(appItem) && this.mAppItemBundleName == appItem.bundleName) {
            Log.showDebug(TAG, `getFolderItem return item is ${JSON.stringify(appItem)}`);
            return appItem;
          }
        }
      }
      return null;
    }
  }
}
