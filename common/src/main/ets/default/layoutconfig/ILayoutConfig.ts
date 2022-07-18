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

import FileUtils from '../utils/FileUtils';

/**
 * Layout configuration base class,
 * which defines the interfaces that all configuration objects need to implement.
 */
export abstract class ILayoutConfig {

  private static readonly COMMON_FEATURE_NAME = 'featureCommon';

  protected constructor() {
  }

  /**
   * Initialize the configuration,
   * each configuration must recreate this function.
   */
  abstract initConfig(): void;

  /**
   * The current configuration level,
   * each configuration must reset this function.
   */
  abstract getConfigLevel(): string;

  /**
   * The current configuration type,
   * each configuration must recreate this function.
   */
  abstract getConfigType(): number;

  /**
   * The current configuration name,
   * each configuration must recreate this function.
   */
  abstract getConfigName(): string;

  /**
   * The JSON string corresponding to the current configuration.
   */
  protected abstract getPersistConfigJson(): string;

  /**
   * load configuration.
   */
  protected loadPersistConfig(): any {
    let defaultConfig = this.getPersistConfigJson();
    return JSON.parse(defaultConfig);
  }

  /**
   * load configuration from file.
   */
  loadPersistConfigFromFile(): any {
    const configFromFile = FileUtils.readStringFromFile(this.getConfigFileAbsPath());
    return configFromFile;
  }

  /**
   * Check if the current property already exists.
   */
  isConfigExist(): boolean {
    return FileUtils.isExist(this.getConfigFileAbsPath());
  }

  /**
   * Force reload of configuration values.
   */
  forceReloadConfig(): void {
    this.initConfig();
  }

  /**
   * Persistent configuration values.
   */
  persistConfig(): void {
    FileUtils.writeStringToFile(this.getPersistConfigJson(), this.getConfigFileAbsPath());
  }

  /**
   * delete configuration value.
   */
  deleteConfig(): void {
    FileUtils.deleteConfigFile(this.getConfigFileAbsPath());
  }

  /**
   * Get the current configuration name.
   */
  getFeatureName(): string {
    return ILayoutConfig.COMMON_FEATURE_NAME;
  }

  /**
   * Get the absolute path of the current configuration file.
   */
  getConfigFileAbsPath(): string {
    let filesDir = globalThis.desktopContext.filesDir + '/'
    return filesDir + this.getConfigName() + '.json';
  }
}