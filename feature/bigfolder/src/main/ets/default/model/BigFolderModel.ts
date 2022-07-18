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

import { Log } from '@ohos/common';
import { EventConstants } from '@ohos/common';
import { CommonConstants } from '@ohos/common';
import { SettingsModel } from '@ohos/common';
import { FolderLayoutConfig } from '@ohos/common';
import { localEventManager } from '@ohos/common';
import { layoutConfigManager } from '@ohos/common';

const TAG = 'BigFolderModel';

/**
 * Folder information data model
 */
export class BigFolderModel {
  private readonly mFolderLayoutConfig: FolderLayoutConfig;
  private readonly mSettingsModel: SettingsModel;
  mFolderInfoList = [];

  private constructor() {
    this.mSettingsModel = SettingsModel.getInstance();
    this.mFolderLayoutConfig = layoutConfigManager.getFunctionConfig(FolderLayoutConfig.FOLDER_GRID_LAYOUT_INFO);
  }

  /**
   * Get folder model object
   *
   * @return Single instance of folder data model
   */
  static getInstance(): BigFolderModel {
    if (globalThis.BigFolderModelInstance == null) {
      globalThis.BigFolderModelInstance = new BigFolderModel();
    }
    return globalThis.BigFolderModelInstance;
  }

  getFolderLayout(): any {
    return this.mFolderLayoutConfig.getFolderLayoutInfo().folderLayoutTable;
  }

  getFolderOpenLayout(): any {
    return this.mFolderLayoutConfig.getFolderLayoutInfo().folderOpenLayoutTable;
  }

  getFolderAddAppLayout(): any {
    return this.mFolderLayoutConfig.getFolderLayoutInfo().folderAddAppLayoutTable;
  }

  /**
   * Get folder list
   *
   * @return folder list
   */
  async getFolderList() {
    Log.showDebug(TAG, 'getFolderList');
    this.mFolderInfoList = [];
    let gridLayoutInfo = {
      layoutInfo: []
    };
    gridLayoutInfo = this.mSettingsModel.getLayoutInfo();
    const layoutInfo = gridLayoutInfo.layoutInfo;
    for (let i = 0; i < layoutInfo.length; i++) {
      if (layoutInfo[i].typeId == CommonConstants.TYPE_FOLDER) {
        this.mFolderInfoList.push(layoutInfo[i]);
      }
    }
    return this.mFolderInfoList;
  }

  /**
  * register folder update event.
  *
  * @param listener
   */
  registerFolderUpdateEvent(listener): void {
    localEventManager.registerEventListener(listener, [
      EventConstants.EVENT_BADGE_UPDATE,
      EventConstants.EVENT_FOLDER_PACKAGE_REMOVED
    ]);
  }
}