/*
 * Copyright (c) 2021 Huawei Device Co., Ltd.
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

import CommonConstants from '../../../../../../../common/src/main/ets/default/constants/CommonConstants';
import phoneFolderLayoutInfo from './configs/PhoneFolderLayoutInfo';
import FolderLayoutConfig from '../../../../../../../common/src/main/ets/default/layoutconfig/FolderLayoutConfig';

/**
 * Phone Folder layout configuration
 */
export default class PhoneFolderLayoutConfig extends FolderLayoutConfig {

  private static sProductInstance: PhoneFolderLayoutConfig | undefined;

  protected constructor() {
    super();
    this.mFolderLayoutInfo = phoneFolderLayoutInfo;
  }

  /**
   * Get folder layout configuration instance
   */
  static getInstance(): PhoneFolderLayoutConfig {
    if (PhoneFolderLayoutConfig.sProductInstance == undefined) {
      PhoneFolderLayoutConfig.sProductInstance = new PhoneFolderLayoutConfig();
      PhoneFolderLayoutConfig.sProductInstance.initConfig();
    }
    return PhoneFolderLayoutConfig.sProductInstance;
  }

  getConfigLevel(): string {
    return CommonConstants.LAYOUT_CONFIG_LEVEL_PRODUCT;
  }
}
