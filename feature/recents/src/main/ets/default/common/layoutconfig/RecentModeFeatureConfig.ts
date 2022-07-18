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
import { CommonConstants } from '@ohos/common';
import { RecentsModeConfig } from '@ohos/common';

/**
 * Recent missions layout mode configuration.
 */
export default class RecentModeFeatureConfig extends RecentsModeConfig {

  protected constructor() {
    super();
  }

  /**
   * The json string corresponding to the current configuration.
   */
  protected getPersistConfigJson(): string {
    const persistConfig = JSON.parse(super.getPersistConfigJson());
    return JSON.stringify(persistConfig);
  }

  /**
   * Get recent mode configuration instance.
   *
   * @return {object} RecentModeFeatureConfig singleton
   */
  static getInstance(): RecentModeFeatureConfig {
    if (globalThis.RecentModeFeatureConfigInstance == null) {
      globalThis.RecentModeFeatureConfigInstance = new RecentModeFeatureConfig();
      globalThis.RecentModeFeatureConfigInstance.initConfig();
    }
    return globalThis.RecentModeFeatureConfigInstance;
  }

  /**
   * Init recent mode configuration.
   */
  initConfig(): void {
    super.initConfig();
  }

  /**
   * Get recent mode configuration level.
   *
   * @return {string} feature-level layout configuration
   */
  getConfigLevel(): string {
    return CommonConstants.LAYOUT_CONFIG_LEVEL_FEATURE;
  }
}