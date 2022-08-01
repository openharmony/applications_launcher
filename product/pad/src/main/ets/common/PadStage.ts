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
import { appCenterPreLoader } from '@ohos/appcenter';
import { bigFolderPreLoader } from '@ohos/bigfolder';
import { formPreLoader } from '@ohos/form';
import { pageDesktopPreLoader } from '@ohos/pagedesktop';
import { smartDockPreLoader } from '@ohos/smartdock';
import { NumBadgeManager } from '@ohos/numbadge';
import launcherLayoutPreLoader from './LauncherLayoutPreLoader';
import PadFormLayoutConfig from './PadFormLayoutConfig';
import PadFolderLayoutConfig from './PadFolderLayoutConfig';
import PadSmartDockLayoutConfig from './PadSmartDockLayoutConfig';
import PadPageDesktopGridStyleConfig from './PadPageDesktopGridStyleConfig';

/**
 * pad product stage
 */
export default class PadStage extends BaseStage {
  /**
   * Stage onCreate callback
   */
  onCreate(): void {
    super.onCreate();
    this.initPadConfig();
    launcherLayoutPreLoader.load();
    smartDockPreLoader.load();
    pageDesktopPreLoader.load();
    layoutConfigManager.addConfigToManager(PadPageDesktopGridStyleConfig.getInstance());
    appCenterPreLoader.load();
    bigFolderPreLoader.load();
    formPreLoader.load();
    NumBadgeManager.getInstance().registerNumBadge();
  }

  /**
   * init pad layout config
   */
  private initPadConfig(): void {
    layoutConfigManager.addConfigToManager(PadSmartDockLayoutConfig.getInstance());
    layoutConfigManager.addConfigToManager(PadFolderLayoutConfig.getInstance());
    layoutConfigManager.addConfigToManager(PadFormLayoutConfig.getInstance());
  }

  /**
   * Stage onDestroy callback
   */
  onDestroy(): void {
    super.onDestroy();
    smartDockPreLoader.releaseConfigAndData();
    appCenterPreLoader.releaseConfigAndData();
    pageDesktopPreLoader.releaseConfigAndData();
    bigFolderPreLoader.releaseConfigAndData();
    formPreLoader.releaseConfigAndData();
    launcherLayoutPreLoader.releaseConfigAndData();
    NumBadgeManager.getInstance().unRegisterNumBadge();
  }
}
