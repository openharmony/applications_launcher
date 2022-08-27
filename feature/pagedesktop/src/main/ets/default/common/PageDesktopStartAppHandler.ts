/**
 * Copyright (c) 2022-2022 Huawei Device Co., Ltd.
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

import { BaseStartAppHandler } from '@ohos/common';
import { CommonConstants } from '@ohos/common';
import { BigFolderViewModel } from '@ohos/bigfolder';
import PageDesktopViewModel from '../viewmodel/PageDesktopViewModel';
import { Log } from '@ohos/common';
import { CheckEmptyUtils } from '@ohos/common';

const TAG = 'PageDesktopStartAppHandler';

/**
 * Desktop workspace start app processing class
 */
export class PageDesktopStartAppHandler extends BaseStartAppHandler {
    private mGridConfig;
    private mPageDesktopStyleConfig;
    private mFolderStyleConfig;

    private constructor() {
        super();
        this.mGridConfig = PageDesktopViewModel.getInstance().getGridConfig();
        this.mPageDesktopStyleConfig = PageDesktopViewModel.getInstance().getPageDesktopStyleConfig();
        this.mFolderStyleConfig = BigFolderViewModel.getInstance().getFolderStyleConfig();
    }

    static getInstance(): PageDesktopStartAppHandler {
        Log.showInfo(TAG, `PageDesktopStartAppHandler getInstance called!`);
        if (globalThis.PageDesktopStartAppHandler == null) {
        Log.showInfo(TAG, `PageDesktopStartAppHandler constructor`);
            globalThis.PageDesktopStartAppHandler = new PageDesktopStartAppHandler();
        }
        return globalThis.PageDesktopStartAppHandler;
    }

    protected calculateAppIconPosition(): void {
        Log.showInfo(TAG, `calculateAppIconPosition called!!`);
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
        let appItem: any = AppStorage.Get('startAppItemInfo');
        const startAppTypeFromPageDesktop: number = AppStorage.Get('startAppTypeFromPageDesktop');
        if (startAppTypeFromPageDesktop === CommonConstants.OVERLAY_TYPE_APP_ICON) {
            let paddingTop = Math.floor(gridHeight / row) - this.mPageDesktopStyleConfig.mAppItemSize;
            this.mAppIconPositionY = this.mPageDesktopStyleConfig.mDesktopMarginTop + paddingTop + appItem.row * (gridItemHeight);

            let columnSize: number = (this.mPageDesktopStyleConfig.mGridWidth - (column - 1) * columnsGap) / column;
            let iconLeftMargin: number = (columnSize - this.mPageDesktopStyleConfig.mIconSize) / 2;
            this.mAppIconPositionX = this.mPageDesktopStyleConfig.mMargin + iconLeftMargin + appItem.column * (gridItemWidth);

        } else if (startAppTypeFromPageDesktop === CommonConstants.OVERLAY_TYPE_CARD) {
            this.mAppIconPositionY = this.mPageDesktopStyleConfig.mDesktopMarginTop + this.mPageDesktopStyleConfig.mPaddingTop
            + this.mPageDesktopStyleConfig.mIconMarginVertical + appItem.row * (gridItemHeight);

            let columnSize: number = (this.mPageDesktopStyleConfig.mGridWidth - (column - 1) * columnsGap) / column;
            let cardSize = this.mFolderStyleConfig.mGridSize;
            let iconLeftMargin: number = (columnSize * 2 + columnsGap - cardSize) / 2
            this.mAppIconPositionX = this.mPageDesktopStyleConfig.mMargin + iconLeftMargin + appItem.column * (gridItemWidth);

        } else if (startAppTypeFromPageDesktop === CommonConstants.OVERLAY_TYPE_FOLDER) {
            let folderItem: any = AppStorage.Get('startAppFromFolderItemInfo');
            const folderGridSize: number = this.mFolderStyleConfig.mGridSize;
            const folderGridGap: number = this.mFolderStyleConfig.mFolderGridGap;
            const folderAppSize: number = this.mFolderStyleConfig.mFolderAppSize;
            let folderLeftMargin: number = (gridItemWidth * folderItem.area[0] - folderGridSize - columnsGap) / 2;
            let folderRow: number = Math.floor((folderGridSize) / (folderGridGap + folderAppSize));
            let folderColumn: number = folderRow;
            let folderLeftPadding: number = (folderGridSize - folderRow * (folderGridGap + folderAppSize) + folderGridGap) / 2;
            let folderTopPadding: number = (folderGridSize - folderColumn * (folderGridGap + folderAppSize) + folderGridGap) / 2;

            let index: number = this.getIndexInFolderAppList(appItem, folderItem);
            if (index >= folderRow * folderColumn) {
                index = 1;
            }
            let row: number = Math.floor(index / folderColumn);
            let column: number = index % folderColumn;
            if (column != 0) {
                row += 1;
            } else {
                column = folderColumn;
            }
            Log.showInfo(TAG, `calculateAppIconPosition index ${index} row ${row} column ${column}`);
            this.mAppIconPositionY = this.mPageDesktopStyleConfig.mDesktopMarginTop + folderItem.row * (gridItemHeight) + this.mPageDesktopStyleConfig.mPaddingTop
            + this.mPageDesktopStyleConfig.mIconMarginVertical + folderTopPadding + (row - 1) * (folderGridGap + folderAppSize);

            this.mAppIconPositionX = this.mPageDesktopStyleConfig.mMargin + folderItem.column * (gridItemWidth) + folderLeftMargin
            + folderLeftPadding + (column - 1) * (folderGridGap + folderAppSize);
        }
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
}
