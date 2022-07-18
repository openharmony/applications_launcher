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

import { BaseModulePreLoader } from '@ohos/common';
import { layoutConfigManager } from '@ohos/common';
import { PageDesktopLayoutConfig } from '@ohos/common';
import { PageDesktopModeConfig } from '@ohos/common';
import { PageDesktopAppModeConfig } from '@ohos/common';
import { PageDesktopGridStyleConfig } from './PageDesktopGridStyleConfig';

/**
 * public layer initialization loader
 */
class PageDesktopPreLoader extends BaseModulePreLoader {
  protected loadConfig(): void {
    layoutConfigManager.addConfigToManager(PageDesktopLayoutConfig.getInstance());
    layoutConfigManager.addConfigToManager(PageDesktopModeConfig.getInstance());
    layoutConfigManager.addConfigToManager(PageDesktopAppModeConfig.getInstance());
    layoutConfigManager.addConfigToManager(PageDesktopGridStyleConfig.getInstance());
  }

  protected loadData(): void {
  }

  releaseConfigAndData(): void {
    layoutConfigManager.removeConfigFromManager();
  }
}

export const pageDesktopPreLoader: BaseModulePreLoader = new PageDesktopPreLoader();