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

import BaseModulePreLoader from '../../../../../../../common/src/main/ets/default/base/BaseModulePreLoader';
import LayoutConfigManager from '../../../../../../../common/src/main/ets/default/layoutconfig/LayoutConfigManager';
import RecentModeFeatureConfig from './layoutconfig/RecentModeFeatureConfig';
import RecentModePadConfig from './layoutconfig/RecentModePadConfig.ets';
import PageDesktopModeConfig from '../../../../../../../common/src/main/ets/default/layoutconfig/PageDesktopModeConfig';
import SettingsModel from '../../../../../../../common/src/main/ets/default/model/SettingsModel';

/**
 * Common layer initialization loader
 */
class RecentMissionsPreLoader extends BaseModulePreLoader {
  private mSettingsModel: SettingsModel = null;

  protected loadConfig(): void {
    LayoutConfigManager.addConfigToManager(PageDesktopModeConfig.getInstance());
    this.mSettingsModel = SettingsModel.getInstance();
    if (this.mSettingsModel.getDevice() === 'phone') {
      LayoutConfigManager.addConfigToManager(RecentModeFeatureConfig.getInstance());
    } else {
      LayoutConfigManager.addConfigToManager(RecentModePadConfig.getInstance());
    }
  }

  protected loadData(): void {
  }

  releaseConfigAndData(): void {
    LayoutConfigManager.removeConfigFromManager();
  }
}

const recentMissionsPreLoader = new RecentMissionsPreLoader();
export default recentMissionsPreLoader;
