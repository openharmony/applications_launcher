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

import { BaseStage } from '@ohos/common';
import { layoutConfigManager } from '@ohos/common';
import { bigFolderPreLoader } from '@ohos/bigfolder';
import { formPreLoader } from '@ohos/form';
import { pageDesktopPreLoader } from '@ohos/pagedesktop';
import { smartDockPreLoader } from '@ohos/smartdock';
import { NumBadgeManager } from '@ohos/numbadge';
import PhoneSmartDockLayoutConfig from './PhoneSmartDockLayoutConfig';
import PhonePageDesktopGridStyleConfig from './PhonePageDesktopGridStyleConfig';
import PhoneFolderLayoutConfig from './PhoneFolderLayoutConfig';
import launcherLayoutPreLoader from './LauncherLayoutPreLoader';
import PhoneFormLayoutConfig from './PhoneFormLayoutConfig';

/**
 * phone product stage
 */
export default class PhoneStage extends BaseStage {
  /**
   * Stage onCreate callback
   */
  onCreate(): void {
    super.onCreate();
    this.initPhoneConfig();
    launcherLayoutPreLoader.load();
    smartDockPreLoader.load();
    pageDesktopPreLoader.load();
    layoutConfigManager.addConfigToManager(PhonePageDesktopGridStyleConfig.getInstance());
    bigFolderPreLoader.load();
    formPreLoader.load();
    NumBadgeManager.getInstance().registerNumBadge();
  }

  /**
   * init phone layout config
   */
  private initPhoneConfig(): void {
    layoutConfigManager.addConfigToManager(PhoneSmartDockLayoutConfig.getInstance());
    layoutConfigManager.addConfigToManager(PhoneFolderLayoutConfig.getInstance());
    layoutConfigManager.addConfigToManager(PhoneFormLayoutConfig.getInstance());
  }

  /**
   * Stage onDestroy callback
   */
  onDestroy(): void {
    super.onDestroy();
    smartDockPreLoader.releaseConfigAndData();
    pageDesktopPreLoader.releaseConfigAndData();
    bigFolderPreLoader.releaseConfigAndData();
    formPreLoader.releaseConfigAndData();
    launcherLayoutPreLoader.releaseConfigAndData();
    NumBadgeManager.getInstance().unRegisterNumBadge();
  }
}
