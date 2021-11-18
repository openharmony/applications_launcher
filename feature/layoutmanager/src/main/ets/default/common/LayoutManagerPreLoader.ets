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

import BaseModulePreLoader from '../../../../../../../common/src/main/ets/default/base/BaseModulePreLoader.ets';
import LayoutConfigManager from '../../../../../../../common/src/main/ets/default/layoutconfig/LayoutConfigManager.ets';
import WorkSpaceLayoutConfig from '../../../../../../../common/src/main/ets/default/layoutconfig/WorkSpaceLayoutConfig.ets';
import WorkSpaceModeConfig from '../../../../../../../common/src/main/ets/default/layoutconfig/WorkSpaceModeConfig.ets';

/**
 * 公共层初始化加载器
 */
class LayoutManagerPreLoader extends BaseModulePreLoader {
  protected loadConfig(): void {
    LayoutConfigManager.addConfigToManager(WorkSpaceLayoutConfig.getInstance());
    LayoutConfigManager.addConfigToManager(WorkSpaceModeConfig.getInstance());
  }

  protected loadData(): void {
  }

  public releaseConfigAndData(): void {
    LayoutConfigManager.removeConfigFromManager();
  }
}

let layoutManagerPreLoader = new LayoutManagerPreLoader();
export default layoutManagerPreLoader;
