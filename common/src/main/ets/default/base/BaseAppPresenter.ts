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

import launcherAbilityManager from '../manager/LauncherAbilityManager';
import AppModel from '../model/AppModel';
import AppListInfoCacheManager from '../cache/AppListInfoCacheManager';
import ResourceManager from '../manager/ResourceManager';
import CommonConstants from '../constants/CommonConstants';

const KEY_NAME = 'name';

/**
 * 应用列表管理基类
 */
export default class BaseAppPresenter {
  protected mAppModel: AppModel;
  protected mAppListInfoCacheManager: AppListInfoCacheManager;
  protected mResourceManager: ResourceManager;
  private readonly listener;

  protected constructor() {
    this.mAppModel = AppModel.getInstance();
    this.mAppListInfoCacheManager = new AppListInfoCacheManager();
    this.mResourceManager = ResourceManager.getInstance();
    this.listener = this.appListChangeListener.bind(this);
  }


  /**
   * 启动应用.
   *
   * @param bundleName 应用包名
   * @param abilityName ability名
   */
  jumpTo(abilityName: string, bundleName: string) {
    launcherAbilityManager.startLauncherAbility(abilityName, bundleName);
  }

  /**
   * start form config ability.
   *
   * @param bundleName
   * @param abilityName
   */
  jumpToForm(abilityName: string, bundleName: string, cardId: number) {
    launcherAbilityManager.startAbilityForResult(abilityName, bundleName , cardId);
  }

  /**
   * 启动桌面设置.
   */
  jumpToSetting() {
    this.jumpTo(CommonConstants.SETTING_ABILITY, CommonConstants.LAUNCHER_BUNDLE);
  }

  /**
   * 卸载应用.
   *
   * @params uninstallBundleName 卸载应用的包名
   * @params isUninstallAble 是否允许卸载
   */
  uninstallApp(uninstallBundleName: string, isUninstallAble: boolean) {
    if (!isUninstallAble) {
      this.informUninstallResult(CommonConstants.UNINSTALL_FORBID);
    } else {
      launcherAbilityManager.uninstallLauncherAbility(uninstallBundleName, this.uninstallAppCallback.bind(this));
    }
  }

  private uninstallAppCallback(resultData) {
    this.informUninstallResult(resultData.code);
  }

  registerAppListChangeCallback() {
    this.mAppModel.registerStateChangeListener(this.listener);
  }

  unregisterAppListChangeCallback() {
    console.info('Launcher appPresenter unregisterAppListChangeCallback');
    this.mAppModel.unregisterAppStateChangeListener(this.listener);
  }

  appListChangeListener(appList) {
    this.regroupDataAppListChange(appList);
  }

  regroupDataAppListChange(callbackList) {
  }

  informUninstallResult(resultCode) {
  }

  getAppName(cacheKey) {
    return this.mResourceManager.getAppResourceCache(cacheKey, KEY_NAME);
  }
}
