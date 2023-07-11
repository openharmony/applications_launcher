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
import { LayoutViewModel } from '@ohos/common';
import { Log } from '@ohos/common';
import { CheckEmptyUtils } from '@ohos/common';
import SmartDockConstants from '../common/constants/SmartDockConstants';
import { SmartDockStyleConfig } from '../config/SmartDockStyleConfig';

const TAG = 'SmartDockStartAppHandler';

/**
 * smartDock start app processing class
 */
export default class SmartDockStartAppHandler extends BaseStartAppHandler {
  private mSmartDockStyleConfig;

  private constructor() {
    super();
    this.mSmartDockStyleConfig = layoutConfigManager.getStyleConfig(SmartDockStyleConfig.APP_LIST_STYLE_CONFIG,
      SmartDockConstants.FEATURE_NAME);
  }

  static getInstance(): SmartDockStartAppHandler {
    if (globalThis.SmartDockStartAppHandler == null) {
      globalThis.SmartDockStartAppHandler = new SmartDockStartAppHandler();
    }
    return globalThis.SmartDockStartAppHandler;
  }

  protected calculateAppIconPosition(): void {
    if (CheckEmptyUtils.isEmpty(this.mSmartDockStyleConfig)) {
      Log.showError(TAG, `calculateAppIconPosition with invalid config`)
      return;
    }
    const appItemInfo = AppStorage.Get('startAppItemInfo');
    const residentList: AppItemInfo[] = AppStorage.Get('residentList');
    const recentList: AppItemInfo[] = AppStorage.Get('recentList');
    const screenWidth: number = AppStorage.Get('screenWidth');
    const workSpaceHeight: number = LayoutViewModel.getInstance().getWorkSpaceHeight();
    this.mAppIconPositionY = workSpaceHeight + this.mSmartDockStyleConfig.mListItemGap;
    const smartDockWidth: number = this.getListWidth(residentList) +
    (recentList.length > 0 ? this.mSmartDockStyleConfig.mDockGap + this.getListWidth(recentList) : 0);
    const smartDockStartPositionX: number = (screenWidth - smartDockWidth) / 2;
    const startAppTypeFromPageDesktop: number = AppStorage.Get('startAppTypeFromPageDesktop');
    // if (startAppTypeFromPageDesktop === CommonConstants.OVERLAY_TYPE_APP_RECENT) {
    //   const indexInRecentList: number = this.getIndexInList(appItemInfo, recentList);
    //   this.mAppIconPositionX = smartDockStartPositionX + this.getListWidth(residentList) + this.mSmartDockStyleConfig.mDockGap
    //   + this.mSmartDockStyleConfig.mDockPadding + indexInRecentList
    //   * (this.mSmartDockStyleConfig.mListItemWidth + this.mSmartDockStyleConfig.mListItemGap);
    //   return;
    // }else {
    //   const indexInResidentList: number = this.getIndexInList(appItemInfo, residentList);
    //   this.mAppIconPositionX = smartDockStartPositionX + this.mSmartDockStyleConfig.mDockPadding + indexInResidentList
    //   * (this.mSmartDockStyleConfig.mListItemWidth + this.mSmartDockStyleConfig.mListItemGap)
    //   - (recentList.length > 0 ? 0 : this.mSmartDockStyleConfig.mListItemGap / 2);
    //   return;
    // }
  }

  private getIndexInList(appItemInfo, list) : number {
    let index: number = CommonConstants.INVALID_VALUE;
    if (CheckEmptyUtils.isEmptyArr(list)) {
      Log.showError(TAG, `getIndexInRecentList with invalid list`)
      return index;
    }

    for (var i = 0; i < list.length; i++) {
      if (appItemInfo.bundleName === list[i].bundleName) {
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
