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
import { AppItemInfo } from '@ohos/common';
import { layoutConfigManager } from '@ohos/common';
import { Log } from '@ohos/common';
import { CheckEmptyUtils } from '@ohos/common';
import { BigFolderConstants } from '../common/constants/BigFolderConstants';
import { BigFolderStyleConfig } from './BigFolderStyleConfig';

const TAG = 'BigFolderStartAppHandler';

/**
 * open big folder start app processing class
 */
export default class BigFolderStartAppHandler extends BaseStartAppHandler {
    private mBigFolderStyleConfig;

    private constructor() {
        super();
        this.mBigFolderStyleConfig = layoutConfigManager.getStyleConfig(BigFolderStyleConfig.APP_LIST_STYLE_CONFIG,
            BigFolderConstants.FEATURE_NAME);
    }

    static getInstance(): BigFolderStartAppHandler {
        Log.showInfo(TAG, `BigFolderStartAppHandler getInstance called!!`);
        if (globalThis.BigFolderStartAppHandler == null) {
            Log.showInfo(TAG, `BigFolderStartAppHandler constructor`);
            globalThis.BigFolderStartAppHandler = new BigFolderStartAppHandler();
        }
        return globalThis.BigFolderStartAppHandler;
    }

    protected calculateAppIconPosition(): void {
        Log.showInfo(TAG, `calculateAppIconPosition called`);
        if (CheckEmptyUtils.isEmpty(this.mBigFolderStyleConfig)) {
            Log.showError(TAG, `calculateAppIconPosition with invalid config`);
            return;
        }

        const appItemInfo = AppStorage.Get('startAppItemInfo');
        const screenWidth: number = AppStorage.Get('screenWidth');
        const screenHeight: number = AppStorage.Get('screenHeight');
        const appGridWidth: number = this.mBigFolderStyleConfig.mOpenFolderGridWidth;
        const appGridHeight: number = this.mBigFolderStyleConfig.mOpenFolderGridHeight;
        const swiperHeight: number = this.mBigFolderStyleConfig.mOpenFolderSwiperHeight;
        const appGridPadding: number = this.mBigFolderStyleConfig.mOpenFolderGridPadding;
        const titleHeight: number = this.mBigFolderStyleConfig.mFolderOpenMargin;
        const titleTopMargin = this.mBigFolderStyleConfig.mFolderOpenTitle;
        const appItemSize: number = this.mBigFolderStyleConfig.mOpenFolderAppSize;
        const appIconSize: number = this.mBigFolderStyleConfig.mOpenFolderIconSize;
        const bigFolderColumns: number = this.mBigFolderStyleConfig.mOpenFolderGridColumn;
        const bigFolderRows: number = this.mBigFolderStyleConfig.mOpenFolderGridRow

        let startPositionX: number = (screenWidth - appGridWidth) / 2;
        let startPositionY: number = titleTopMargin + titleHeight + appGridPadding;
        const index: number = this.getIndexInAppList(appItemInfo);
        let row: number = Math.floor(index / bigFolderColumns);
        let column: number = index % bigFolderColumns;
        if (column != 0) {
            row += 1;
        } else {
            column = bigFolderColumns;
        }
        Log.showInfo(TAG, `calculateAppIconPosition index ${index} row ${row} column ${column}`);
        let columnsGap = this.mBigFolderStyleConfig.mOpenFolderGridGap;
        let rowsGap = this.mBigFolderStyleConfig.mOpenFolderGridGap - this.mBigFolderStyleConfig.mOpenFolderGridIconTopPadding;
        let appItemWidth = (appGridWidth - columnsGap * (bigFolderColumns - 1)) / bigFolderColumns;
        let appItemHeight = (appGridHeight - rowsGap * (bigFolderRows - 1)) / bigFolderRows;
        let itemLeftMargin = (appItemWidth - appIconSize) / 2;
        this.mAppIconPositionX = startPositionX + (column - 1) * (appItemWidth + columnsGap) + itemLeftMargin;
        this.mAppIconPositionY = startPositionY + (row - 1) * (appItemHeight + rowsGap)
        + this.mBigFolderStyleConfig.mOpenFolderGridIconTopPadding;
    }

    private getIndexInAppList(appItemInfo): number {
        let index: number = 0;
        let folderInfo: {
            layoutInfo: AppItemInfo[][],
            enterEditing: boolean,
            folderName: string,
            folderId: string
        } = AppStorage.Get('openFolderData');
        for (var i = 0; i < folderInfo.layoutInfo.length; i++) {
            for (var j = 0; j < folderInfo.layoutInfo[i].length; j++) {
                if (appItemInfo.bundleName === folderInfo.layoutInfo[i][j]?.bundleName) {
                    index = j;
                    break;
                }
            }
        }

        return index + 1;
    }
}
