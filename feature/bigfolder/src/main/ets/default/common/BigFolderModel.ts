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

import LayoutConfigManager from '../../../../../../../common/src/main/ets/default/layoutconfig/LayoutConfigManager';
import LocalEventManager from '../../../../../../../common/src/main/ets/default/manager/LocalEventManager';
import FolderLayoutConfig from '../../../../../../../common/src/main/ets/default/layoutconfig/FolderLayoutConfig';
import Log from '../../../../../../../common/src/main/ets/default/utils/Log';
import CommonConstants from '../../../../../../../common/src/main/ets/default/constants/CommonConstants';
import EventConstants from '../../../../../../../common/src/main/ets/default/constants/EventConstants';
import SettingsModel from '../../../../../../../common/src/main/ets/default/model/SettingsModel';

const TAG = 'BigFolderModel';

/**
 * Folder information data model
 */
export default class BigFolderModel {
  private readonly mFolderLayoutConfig: FolderLayoutConfig;
  private readonly mSettingsModel: SettingsModel;
  mFolderInfoList = [];

  private constructor() {
    this.mSettingsModel = SettingsModel.getInstance();
    this.mFolderLayoutConfig = LayoutConfigManager.getFunctionConfig(FolderLayoutConfig.FOLDER_GRID_LAYOUT_INFO);
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
    Log.showInfo(TAG, 'getFolderList');
    this.mFolderInfoList = [];
    let gridLayoutInfo = {
      layoutInfo: []
    };
    gridLayoutInfo = this.mSettingsModel.getLayoutInfo();
    const layoutInfo = gridLayoutInfo.layoutInfo;
    for (let i = 0; i < layoutInfo.length; i++) {
      if (layoutInfo[i].type == CommonConstants.TYPE_FOLDER) {
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
    LocalEventManager.registerEventListener(listener, [
      EventConstants.EVENT_BADGE_UPDATE,
      EventConstants.EVENT_FOLDER_PACKAGE_REMOVED
    ]);
  }
}