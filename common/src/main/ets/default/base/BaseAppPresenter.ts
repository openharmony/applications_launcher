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

import launcherAbilityManager from '../manager/LauncherAbilityManager';
import AppModel from '../model/AppModel';
import AppListInfoCacheManager from '../cache/AppListInfoCacheManager';
import ResourceManager from '../manager/ResourceManager';
import CommonConstants from '../constants/CommonConstants';
import { InstallStatus } from 'bundle/bundleinstaller';

const KEY_NAME = 'name';

/**
 * Base class for view models.
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
   * Start target ability
   *
   * @param bundleName target bundle name
   * @param abilityName target ability name
   */
  jumpTo(abilityName: string, bundleName: string): void {
    launcherAbilityManager.startLauncherAbility(abilityName, bundleName);
  }

  /**
   * start form config ability.
   *
   * @param bundleName
   * @param abilityName
   */
  jumpToForm(abilityName: string, bundleName: string, cardId: number): void {
    launcherAbilityManager.startAbilityFormEdit(abilityName, bundleName, cardId);
  }

  /**
   * Start launcher settings page.
   */
  jumpToSetting(): void {
    this.jumpTo(CommonConstants.SETTING_ABILITY, CommonConstants.LAUNCHER_BUNDLE);
  }

  /**
   * Uninstall target app by bundle name.
   *
   * @param uninstallBundleName bundle name to uninstall
   * @param isUninstallable true if target app is uninstallable.
   */
  uninstallApp(uninstallBundleName: string, isUninstallable: boolean): void {
    if (!isUninstallable) {
      this.informUninstallResult(CommonConstants.UNINSTALL_FORBID);
    } else {
      void launcherAbilityManager.uninstallLauncherAbility(uninstallBundleName, this.uninstallAppCallback.bind(this));
    }
  }

  private uninstallAppCallback(resultData: InstallStatus): void {
    this.informUninstallResult(resultData.status);
  }

  registerAppListChangeCallback(): void {
    this.mAppModel.registerStateChangeListener(this.listener);
  }

  unregisterAppListChangeCallback(): void {
    console.info('Launcher appPresenter unregisterAppListChangeCallback');
    this.mAppModel.unregisterAppStateChangeListener(this.listener);
  }

  appListChangeListener(appList: []): void {
    this.regroupDataAppListChange(appList);
  }

  regroupDataAppListChange(callbackList: []): void {
  }

  informUninstallResult(resultCode: number): void {
  }

  getAppName(cacheKey: string) {
    return this.mResourceManager.getAppResourceCache(cacheKey, KEY_NAME);
  }
}
