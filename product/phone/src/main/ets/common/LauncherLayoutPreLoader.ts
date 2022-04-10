/*
 * Copyright (c) 2022 Huawei Device Co., Ltd.
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

import BaseModulePreLoader from '../../../../../../common/src/main/ets/default/base/BaseModulePreLoader';
import LayoutConfigManager from '../../../../../../common/src/main/ets/default/layoutconfig/LayoutConfigManager';
import LayoutViewModel from '../../../../../../common/src/main/ets/default/viewmodel/LayoutViewModel';
import CommonConstants from '../../../../../../common/src/main/ets/default/constants/CommonConstants';
import PhoneLauncherLayoutStyleConfig from './PhoneLauncherLayoutStyleConfig';

/**
 * LauncherLayoutPreLoader
 */
class LauncherLayoutPreLoader extends BaseModulePreLoader {
  protected loadConfig(): void {
    LayoutConfigManager.addConfigToManager(PhoneLauncherLayoutStyleConfig.getInstance());
  }

  protected loadData(): void {
    LayoutViewModel.getInstance().setDevice(CommonConstants.DEFAULT_DEVICE_TYPE);
  }

  public releaseConfigAndData(): void {
    LayoutConfigManager.removeConfigFromManager();
  }
}

let launcherLayoutPreLoader = new LauncherLayoutPreLoader();

export default launcherLayoutPreLoader;
