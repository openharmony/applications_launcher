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

import launcherAbilityManager from '../manager/LauncherAbilityManager.ets';
import AppModel from '../model/AppModel.ets';
import AppListInfoCacheManager from '../cache/AppListInfoCacheManager.ets';
import ResourceManager from '../manager/ResourceManager.ets';
import CommonConstants from '../constants/CommonConstants.ets';

const KEY_NAME = "name";

/**
 * 应用列表管理基类
 */
export default class BaseAppPresenter {
  protected mAppModel: AppModel;
  protected mAppListInfoCacheManager: AppListInfoCacheManager;
  protected mResourceManager: ResourceManager;

  protected constructor() {
    this.mAppModel = AppModel.getInstance();
    this.mAppListInfoCacheManager = new AppListInfoCacheManager();
    this.mResourceManager = ResourceManager.getInstance();
  }


  /**
   * 启动应用
   *
   * @param bundleName 应用包名
   * @param abilityName ability名
   */
  public jumpTo(abilityName, bundleName) {
    launcherAbilityManager.startLauncherAbility(abilityName, bundleName);
  }

  /**
   * 启动桌面设置
   */
  public jumpToSetting() {
    this.jumpTo(CommonConstants.SETTING_ABILITY, CommonConstants.LAUNCHER_BUNDLE);
  }

  /**
   * 卸载应用
   *
   * @params uninstallBundleName 卸载应用的包名
   * @params ifSystem 是否系统应用
   */
  public uninstallApp(uninstallBundleName, ifSystem) {
    if (ifSystem) {
      this.informUninstallResult(CommonConstants.UNINSTALL_FORBID);
    } else {
      launcherAbilityManager.uninstallLauncherAbility(uninstallBundleName, this.uninstallAppCallback.bind(this));
    }
  }

  private uninstallAppCallback(resultData) {
    this.informUninstallResult(resultData.code);
  }

  public registerAppListChangeCallback() {
    this.mAppModel.registerStateChangeListener(this.appListChangeListener.bind(this));
  }

  public unregisterAppListChangeCallback() {
    console.info("Launcher appPresenter unregisterAppListChangeCallback");
    this.mAppModel.unregisterAppStateChangeListener(this.appListChangeListener.bind(this));
  }

  public appListChangeListener(appList) {
    this.regroupDataAppListChange(appList);
  }

  public regroupDataAppListChange(callbackList) {
  }

  public informUninstallResult(resultCode) {
  }

  public getAppName(keyName) {
    return this.mResourceManager.getAppResourceCache(keyName, KEY_NAME)
  }
}
