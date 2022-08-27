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
import { CommonConstants, StyleConstants } from '@ohos/common';
import { AppItemInfo } from '@ohos/common';
import { layoutConfigManager } from '@ohos/common';
import { Log } from '@ohos/common';
import { CheckEmptyUtils } from '@ohos/common';
import AppcenterConstants from '../common/constants/AppcenterConstants';

import AppCenterGridStyleConfig from './AppCenterGridStyleConfig';

const TAG = 'AppCenterStartAppHandler';

/**
 * app center start app processing class
 */
export default class AppCenterStartAppHandler extends BaseStartAppHandler {
    private mAppCenterGridStyleConfig;

    private constructor() {
        super();
        this.mAppCenterGridStyleConfig = layoutConfigManager.getStyleConfig(AppCenterGridStyleConfig.APP_GRID_STYLE_CONFIG,
            AppcenterConstants.FEATURE_NAME);
    }

    static getInstance(): AppCenterStartAppHandler {
        if (globalThis.AppCenterStartAppHandler == null) {
            globalThis.AppCenterStartAppHandler = new AppCenterStartAppHandler();
        }
        return globalThis.AppCenterStartAppHandler;
    }

    protected calculateAppIconPosition(): void {
        if (CheckEmptyUtils.isEmpty(this.mAppCenterGridStyleConfig)) {
            Log.showError(TAG, `calculateAppIconPosition with invalid config`)
            return;
        }

        const appItemInfo = AppStorage.Get('startAppItemInfo');
        const index: number = this.getIndexInAppList(appItemInfo);
        const appCenterMarginLeft = this.mAppCenterGridStyleConfig.mAppCenterMarginLeft;
        const appCenterMarginTop = this.mAppCenterGridStyleConfig.mIconMarginVertical;
        const appCenterWidth = this.mAppCenterGridStyleConfig.mGridWidth;
        const appCenterHeight = this.mAppCenterGridStyleConfig.mGridHeight;
        const appCenterItemWidth = this.mAppCenterGridStyleConfig.mAppItemSize;
        const appCenterItemHeight = this.mAppCenterGridStyleConfig.mAppItemSize;
        const appCenterSizeWidth = this.mAppCenterGridStyleConfig.mIconSize;
        const appCenterSizeHeight = this.mAppCenterGridStyleConfig.mIconSize;
        const appCenterColumns = this.mAppCenterGridStyleConfig.mColumns;
        const appCenterRows = this.mAppCenterGridStyleConfig.mRows;

        let row = Math.floor(index / appCenterColumns);
        let column = index % appCenterColumns;
        if (column != 0) {
            row += 1;
        } else {
            column = appCenterColumns;
        }
        Log.showInfo(TAG, `calculateAppIconPosition index ${index} row ${row} column ${column}`)

        const columnsGap = this.mAppCenterGridStyleConfig.mColumnsGap;
        let itemLeftPadding = (appCenterItemWidth - appCenterSizeWidth) / 2;
        let gapByFixed = (appCenterWidth - appCenterColumns * appCenterItemWidth - (appCenterColumns - 1) * columnsGap) / (2 * appCenterColumns);
        this.mAppIconPositionX = appCenterMarginLeft + gapByFixed + (column - 1) * (appCenterItemWidth + 2 * gapByFixed + columnsGap) + itemLeftPadding;

        const rowsGap = this.mAppCenterGridStyleConfig.mRowsGap;
        const appCenterPadding = this.mAppCenterGridStyleConfig.mPadding;
        this.mAppIconPositionY = StyleConstants.DEFAULT_28 + appCenterPadding + appCenterMarginTop + (row - 1) * (appCenterItemHeight + rowsGap);
    }

    private getIndexInAppList(appItemInfo): number {
        let index: number = 0;
        let listInfo: AppItemInfo[] = AppStorage.Get('listInfo');
        for (var i = 0; i < listInfo.length; i++) {
            if (typeof listInfo[i] !== 'undefined') {
                if (appItemInfo.bundleName === listInfo[i].bundleName) {
                    index = i;
                    break;
                }
            }
        }

        return index + 1;
    }
}
