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
 * 布局配置基类，定义所有的配置对象需要实现的接口
 */
export default abstract class ILayoutConfig {
  private static PREFERENCES_PATH = '/data/accounts/account_0/appdata/com.ohos.launcher/sharedPreference/LauncherPreference';

  protected mPreferences = null;

  protected constructor() {
    this.mPreferences = storage.getStorageSync(ILayoutConfig.PREFERENCES_PATH);
  }

  /**
   * 初始化配置，每个配置必须重新此函数
   */
  public abstract initConfig(): void;

  /**
   * 当前配置级别，每个配置必须重新此函数
   */
  public abstract getConfigLevel(): string;

  /**
   * 当前配置类型，每个配置必须重新此函数
   */
  public abstract getConfigType(): number;

  /**
   * 当前配置名，每个配置必须重新此函数
   */
  public abstract getConfigName(): string;


  /**
   * 当前配置对应的JSON字串
   */
  protected abstract getPersistConfigJson(): string;

  /**
   * 从持久化文件里面配置加载配置
   */
  protected loadPresistConfig(): any {
    let defaultConfig = this.getPersistConfigJson();
    let config = this.mPreferences.getSync(this.getConfigName(), defaultConfig);
    return JSON.parse(config);
  }

  /**
   * 强制重新加载配置值
   */
  public forceReloadConfig() {
    this.initConfig();
  }

  /**
   * 持久化配置值
   */
  public persistConfig(): void {
    let currentConfig = this.getPersistConfigJson();
    this.mPreferences.putSync(this.getConfigName(), currentConfig);
    this.mPreferences.flushSync();
  }

  /**
   * 删除配置值
   */
  public deleteConfig() {
    this.mPreferences.deleteSync(this.getConfigName());
  }
}