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

import storage from '@ohos.data.storage';

/**
 * 布局配置基类，定义所有配置对象需要实现的接口
 */
export default abstract class ILayoutConfig {
  private static readonly PREFERENCES_PATH = globalThis.desktopContext.databaseDir + '/LauncherPreference';

  private static readonly COMMON_FEATURE_NAME = 'featureCommon';

  protected mPreferences = null;

  protected constructor() {
    this.mPreferences = storage.getStorageSync(ILayoutConfig.PREFERENCES_PATH);
  }

  /**
   * 初始化配置，每个配置必须重新此函数
   */
  abstract initConfig(): void;

  /**
   * 当前配置级别，每个配置必须重新此函数
   */
  abstract getConfigLevel(): string;

  /**
   * 当前配置类型，每个配置必须重新此函数
   */
  abstract getConfigType(): number;

  /**
   * 当前配置名，每个配置必须重新此函数
   */
  abstract getConfigName(): string;

  /**
   * 当前配置对应的JSON字串
   */
  protected abstract getPersistConfigJson(): string;

  /**
   * 当前配置名，每个配置必须重新此函数
   */
  protected loadPersistConfig(): any {
    const defaultConfig = this.getPersistConfigJson();
    const config = this.mPreferences.getSync(this.getConfigName(), defaultConfig);
    return JSON.parse(config);
  }

  /**
   * 强制重新加载配置值
   */
  forceReloadConfig() {
    this.initConfig();
  }

  /**
   * 持久化配置值
   */
  persistConfig(): void {
    const currentConfig = this.getPersistConfigJson();
    this.mPreferences.putSync(this.getConfigName(), currentConfig);
    this.mPreferences.flushSync();
  }

  /**
   * 删除配置值
   */
  deleteConfig() {
    this.mPreferences.deleteSync(this.getConfigName());
  }

  /**
   * 获取当前配置名
   */
  getFeatureName() {
    return ILayoutConfig.COMMON_FEATURE_NAME;
  }
}