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

import { SettingsModel } from '@ohos/common';
import { BaseModulePreLoader } from '@ohos/common';
import { layoutConfigManager } from '@ohos/common';
import { PageDesktopModeConfig } from '@ohos/common';
import RecentModePadConfig from './layoutconfig/RecentModePadConfig';
import RecentModeFeatureConfig from './layoutconfig/RecentModeFeatureConfig';

/**
 * Common layer initialization loader.
 */
class RecentMissionsPreLoader extends BaseModulePreLoader {
  private mSettingsModel: SettingsModel | undefined = undefined;

  /**
   * Add configuration objects to layout configuration management class.
   */
  protected loadConfig(): void {
    layoutConfigManager.addConfigToManager(PageDesktopModeConfig.getInstance());
    this.mSettingsModel = SettingsModel.getInstance();
    if (this.mSettingsModel.getDevice() === 'phone') {
      layoutConfigManager.addConfigToManager(RecentModeFeatureConfig.getInstance());
    } else {
      layoutConfigManager.addConfigToManager(RecentModePadConfig.getInstance());
    }
  }

  /**
   * Initialize load data.
   */
  protected loadData(): void {
  }

  /**
   * Release module config and data.
   */
  releaseConfigAndData(): void {
  }
}

const recentMissionsPreLoader = new RecentMissionsPreLoader();
export default recentMissionsPreLoader;
