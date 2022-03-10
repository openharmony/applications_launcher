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
import BaseModulePreLoader from '../../../../../../../common/src/main/ets/default/base/BaseModulePreLoader';
import LayoutConfigManager from '../../../../../../../common/src/main/ets/default/layoutconfig/LayoutConfigManager';
import PageDesktopLayoutConfig from '../../../../../../../common/src/main/ets/default/layoutconfig/PageDesktopLayoutConfig';
import FormStyleConfig from '../../../../../../form/src/main/ets/default/common/FormStyleConfig';
import PageDesktopModeConfig from '../../../../../../../common/src/main/ets/default/layoutconfig/PageDesktopModeConfig';
import PageDesktopAppModeConfig from '../../../../../../../common/src/main/ets/default/layoutconfig/PageDesktopAppModeConfig';
import LauncherLayoutStyleConfig from './LauncherLayoutStyleConfig';
import LayoutViewModel from './viewmodel/LayoutViewModel';

/**
 * LauncherLayoutPreLoader
 */
class LauncherLayoutPreLoader extends BaseModulePreLoader {

  protected loadConfig(): void {
    LayoutConfigManager.addConfigToManager(LauncherLayoutStyleConfig.getInstance());
    LayoutConfigManager.addConfigToManager(FormStyleConfig.getInstance());
    LayoutConfigManager.addConfigToManager(PageDesktopLayoutConfig.getInstance());
    LayoutConfigManager.addConfigToManager(PageDesktopModeConfig.getInstance());
    LayoutConfigManager.addConfigToManager(PageDesktopAppModeConfig.getInstance());
  }

  protected loadData(): void {
  }

  releaseConfigAndData(): void {
    LayoutConfigManager.removeConfigFromManager();
  }
}

const launcherLayoutPreLoader = new LauncherLayoutPreLoader();
export default launcherLayoutPreLoader;
