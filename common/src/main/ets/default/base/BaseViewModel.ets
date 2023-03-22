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

import Prompt from '@ohos.promptAction';
import { Log } from '../utils/Log';
import { AppModel } from '../model/AppModel';
import { ResourceManager } from '../manager/ResourceManager';
import { CommonConstants } from '../constants/CommonConstants';
import { launcherAbilityManager } from '../manager/LauncherAbilityManager';

const TAG = 'BaseViewModel';

const KEY_NAME = 'name';

/**
 * Base class for view models.
 */
 export class BaseViewModel {
  protected mAppModel: AppModel;
  protected mResourceManager: ResourceManager;
  private readonly listener;

  protected constructor() {
    this.mAppModel = AppModel.getInstance();
    this.mResourceManager = ResourceManager.getInstance();
    this.listener = this.appListChangeListener.bind(this);
  }


  /**
   * Start target ability
   *
   * @param bundleName target bundle name
   * @param abilityName target ability name
   */
  jumpTo(abilityName: string, bundleName: string, moduleName: string): void {
    launcherAbilityManager.startLauncherAbility(abilityName, bundleName, moduleName);
  }

  /**
   * start form config ability.
   *
   * @param bundleName
   * @param abilityName
   */
  jumpToForm(abilityName: string, bundleName: string, moduleName: string, cardId: number): void {
    launcherAbilityManager.startAbilityFormEdit(abilityName, bundleName, moduleName, cardId);
  }

  /**
   * Start launcher settings page.
   */
  jumpToSetting(): void {
    this.jumpTo(CommonConstants.SETTING_ABILITY, CommonConstants.LAUNCHER_BUNDLE, CommonConstants.SETTING_MODULE);
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

  private uninstallAppCallback(resultData: {code: number}): void {
    this.informUninstallResult(resultData.code);
  }

  registerAppListChangeCallback(): void {
    this.mAppModel.registerStateChangeListener(this.listener);
  }

  unregisterAppListChangeCallback(): void {
    Log.showInfo(TAG, 'unregisterAppListChangeCallback');
    this.mAppModel.unregisterAppStateChangeListener(this.listener);
  }

  appListChangeListener(appList: []): void {
    this.regroupDataAppListChange(appList);
  }

  regroupDataAppListChange(callbackList: []): void {
  }

  informUninstallResult(resultCode: number): void {
      Log.showDebug(TAG, `Launcher AppListView getUninstallApp uninstallationResult: ${resultCode}`);
    if (resultCode === CommonConstants.UNINSTALL_FORBID) {
      Prompt.showToast({
        message: $r("app.string.disable_uninstall")
      });
    } else if (resultCode === CommonConstants.UNINSTALL_SUCCESS) {
      Prompt.showToast({
        message: $r("app.string.uninstall_success")
      });
    } else {
      Prompt.showToast({
        message: $r("app.string.uninstall_failed")
      });
    }
  }

  getAppName(cacheKey: string): string {
    return this.mResourceManager.getAppResourceCache(cacheKey, KEY_NAME);
  }
}
