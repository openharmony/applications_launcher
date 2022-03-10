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
import SmartDockLayoutConfig from '../../../../../../../common/src/main/ets/default/layoutconfig/SmartDockLayoutConfig';
import SmartDockModeConfig from '../../../../../../../common/src/main/ets/default/layoutconfig/SmartDockModeConfig';
import SmartDockStyleConfig from './SmartDockStyleConfig';

/**
 * dock初始化加载器
 */
class SmartDockPreLoader extends BaseModulePreLoader {
  protected loadConfig(): void {
    LayoutConfigManager.addConfigToManager(SmartDockLayoutConfig.getInstance());
    LayoutConfigManager.addConfigToManager(SmartDockModeConfig.getInstance());
    LayoutConfigManager.addConfigToManager(SmartDockStyleConfig.getInstance());
  }

  protected loadData(): void {
  }

  releaseConfigAndData(): void {
    LayoutConfigManager.removeConfigFromManager();
  }
}

const smartDockPreLoader: BaseModulePreLoader = new SmartDockPreLoader();
export default smartDockPreLoader;
