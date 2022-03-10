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
import AppCenterListStyleConfig from './AppCenterListStyleConfig';
import AppCenterGridStyleConfig from './AppCenterGridStyleConfig';

/**
 * 公共层初始化加载器
 */
class AppCenterPreLoader extends BaseModulePreLoader {
  protected loadConfig(): void {
    LayoutConfigManager.addConfigToManager(AppCenterListStyleConfig.getInstance());
    LayoutConfigManager.addConfigToManager(AppCenterGridStyleConfig.getInstance());
  }

  protected loadData(): void {
  }

  releaseConfigAndData(): void {
    LayoutConfigManager.removeConfigFromManager();
  }
}

const appCenterPreLoader: BaseModulePreLoader = new AppCenterPreLoader();
export default appCenterPreLoader;
