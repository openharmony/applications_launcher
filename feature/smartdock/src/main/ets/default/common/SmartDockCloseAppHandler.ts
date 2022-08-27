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


import {
    CommonConstants,
    AppItemInfo,
    layoutConfigManager,
    LayoutViewModel,
    Log,
    CheckEmptyUtils,
    BaseCloseAppHandler,
    CloseAppManager
} from '@ohos/common';
import SmartDockConstants from '../common/constants/SmartDockConstants';
import { SmartDockStyleConfig } from '../config/SmartDockStyleConfig';

const TAG = 'SmartDockCloseAppHandler';

/**
 * smartDock close app processing class
 */
export default class SmartDockCloseAppHandler extends BaseCloseAppHandler {
    private mSmartDockStyleConfig;
    private mAppItemBundleName: string;

    constructor() {
        super();
        this.mSmartDockStyleConfig = layoutConfigManager.getStyleConfig(SmartDockStyleConfig.APP_LIST_STYLE_CONFIG,
            SmartDockConstants.FEATURE_NAME);
    }

    static getInstance(): SmartDockCloseAppHandler {
        Log.showInfo(TAG, `SmartDockCloseAppHandler getInstance called!`)
        if (globalThis.SmartDockCloseAppHandler == null) {
            globalThis.SmartDockCloseAppHandler = new SmartDockCloseAppHandler();
            Log.showInfo(TAG, `SmartDockCloseAppHandler getInstance constructor`);
        }
        return globalThis.SmartDockCloseAppHandler;
    }

    /**
     * get app icon info
     *
     * @param windowTarget close window target
     */
    public getAppIconInfo(windowTarget): void {
        Log.showInfo(TAG, `getAppIconInfo called and windowTarget is ${JSON.stringify(windowTarget)}`);
        this.mAppItemBundleName = windowTarget.bundleName;
        this.mAppIconSize = this.mSmartDockStyleConfig.mListItemWidth;
        //    this.setAppIconInfo();
        this.calculateAppIconPosition();
        let appCloseIconInfo = {
            appIconSize: this.mAppIconSize,
            appIconHeight: this.mAppIconSize,
            appIconPositionX: this.mAppIconPositionX,
            appIconPositionY: this.mAppIconPositionY
        };
        let recentList: AppItemInfo[] = AppStorage.Get('recentList');
        CloseAppManager.getInstance().addSmartDockClosePosition(appCloseIconInfo, recentList[0]);
        Log.showInfo(TAG, `getAppIconInfo addSmartDockClosePosition ${JSON.stringify(appCloseIconInfo)}`);

    }

    protected calculateAppIconPosition(): void {
        if (CheckEmptyUtils.isEmpty(this.mSmartDockStyleConfig)) {
            Log.showError(TAG, `calculateAppIconPosition with invalid config`)
            return;
        }

        this.mAppIconPositionX = 0;
        this.mAppIconPositionY = 0;
        const residentList: AppItemInfo[] = AppStorage.Get('residentList');
        const recentList: AppItemInfo[] = AppStorage.Get('recentList');
        const screenWidth: number = AppStorage.Get('screenWidth');
        const workSpaceHeight: number = LayoutViewModel.getInstance().getWorkSpaceHeight();
        this.mAppIconPositionY = workSpaceHeight + (this.mSmartDockStyleConfig.mDockHeight - this.mSmartDockStyleConfig.mIconSize) / 2;

        const smartDockWidth: number = this.getListWidth(residentList) +
        (recentList.length > 0 ? this.mSmartDockStyleConfig.mDockGap + this.getListWidth(recentList) : 0);
        const smartDockStartPositionX: number = (screenWidth - smartDockWidth) / 2;
        const startAppTypeFromPageDesktop: number = AppStorage.Get('startAppTypeFromPageDesktop');
        this.mAppIconPositionX = smartDockStartPositionX + this.getListWidth(residentList) + this.mSmartDockStyleConfig.mDockGap
        + this.mSmartDockStyleConfig.mDockPadding;
        //    if (startAppTypeFromPageDesktop === CommonConstants.OVERLAY_TYPE_APP_RECENT) {
        //      const indexInRecentList: number = this.getIndexInList(recentList);
        //      this.mAppIconPositionX = smartDockStartPositionX + this.getListWidth(residentList) + this.mSmartDockStyleConfig.mDockGap
        //      + this.mSmartDockStyleConfig.mDockPadding + indexInRecentList
        //      * (this.mSmartDockStyleConfig.mListItemWidth + this.mSmartDockStyleConfig.mListItemGap);
        //      return;
        //    }else{
        //      const indexInResidentList: number = this.getIndexInList(residentList);
        //      this.mAppIconPositionX = smartDockStartPositionX + this.mSmartDockStyleConfig.mDockPadding + indexInResidentList
        //      * (this.mSmartDockStyleConfig.mListItemWidth + this.mSmartDockStyleConfig.mListItemGap)
        //      - (recentList.length > 0 ? 0 : this.mSmartDockStyleConfig.mListItemGap / 2);
        //      return;
        //    }
    }

    private getIndexInList(list): number {
        let index: number = CommonConstants.INVALID_VALUE;
        if (CheckEmptyUtils.isEmptyArr(list)) {
            Log.showError(TAG, `getIndexInRecentList with invalid list`)
            return index;
        }

        for (var i = 0; i < list.length; i++) {
            if (this.mAppItemBundleName === list[i].bundleName) {
                AppStorage.SetOrCreate('closeAppItemInfo', list[i]);
                Log.showInfo(TAG, `getIndexInList  closeAppItemInfo ${JSON.stringify(list[i])} index ${index}`)
                index = i;
                break;
            }
        }

        return index;
    }

    private getListWidth(itemList): number {
        let width = 0;
        if (CheckEmptyUtils.isEmptyArr(itemList)) {
            return width;
        } else {
            let num = itemList.length;
            if (num > this.mSmartDockStyleConfig.mMaxDockNum) {
                num = this.mSmartDockStyleConfig.mMaxDockNum
            }
            width = this.mSmartDockStyleConfig.mDockPadding * 2 + num * (this.mSmartDockStyleConfig.mListItemWidth) + (num - 1)
            * (this.mSmartDockStyleConfig.mListItemGap);
        }
        return width;
    }
}
