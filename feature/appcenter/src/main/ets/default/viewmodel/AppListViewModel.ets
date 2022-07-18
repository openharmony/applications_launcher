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

import Prompt from '@ohos.prompt';
import { Log } from '@ohos/common';
import { PinyinSort } from '@ohos/common';
import { CommonConstants } from '@ohos/common';
import { BaseViewModel } from '@ohos/common';
import { layoutConfigManager } from '@ohos/common';
import AppcenterConstants from '../common/constants/AppcenterConstants';
import AppCenterGridStyleConfig from '../common/AppCenterGridStyleConfig';

const TAG = 'AppListViewModel';

const KEY_NAME = "name";

export class AppListViewModel extends BaseViewModel {
  private mPinyinSort: PinyinSort;
  private mAppGridStyleConfig: AppCenterGridStyleConfig;

  protected constructor() {
    super();
    this.mPinyinSort = new PinyinSort();
    this.mAppGridStyleConfig = layoutConfigManager.getStyleConfig(AppCenterGridStyleConfig.APP_GRID_STYLE_CONFIG, AppcenterConstants.FEATURE_NAME);
  }

  public static getInstance(): AppListViewModel {
    if (globalThis.AppListViewModel == null) {
      globalThis.AppListViewModel = new AppListViewModel();
    }
    return globalThis.AppListViewModel;
  }

  public async getAppList(): Promise<void> {
    let appList = await this.mAppModel.getAppList();
    appList.sort(this.mPinyinSort.sortByAppName.bind(this.mPinyinSort));
    AppStorage.SetOrCreate('listInfo', appList);
  }

  public async regroupDataAppListChange(callbackList) {
    for (let item of callbackList) {
      let cacheKey = item.appLabelId + item.bundleName + item.moduleName;
      let appName = this.mResourceManager.getAppResourceCache(cacheKey, KEY_NAME);
      Log.showDebug(TAG, `regroupDataAppListChange appName: ${appName}`);
      if (appName != null) {
        item.appName = appName;
      } else {
        let loadAppName = await this.mResourceManager.getAppNameSync(item.appLabelId, item.bundleName,
          item.moduleName, item.appName);
        Log.showDebug(TAG, `regroupDataAppListChange loadAppName: ${loadAppName}`);
        item.appName = loadAppName;
      }
    }
    callbackList.sort(this.mPinyinSort.sortByAppName.bind(this.mPinyinSort));
    animateTo({
      duration: 200,
      curve: Curve.EaseInOut,
      delay: 100,
      playMode: PlayMode.Normal,
      tempo: 0.5,
      iterations: 1,
      onFinish: () => {
      }
    }, () => {
      AppStorage.SetOrCreate('listInfo', callbackList);
    })
  }

  public informUninstallResult(resultCode) {
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

  public intoSetting() {
    Log.showDebug(TAG, 'intoSetting');
    this.jumpToSetting();
  }

  /**
   * Open application function.
   *
   * @param {string} abilityName - ability name of the application to be jump to.
   * @param {string} bundleName - bundle name of the application to be jump to.
   */
  public openApplication(abilityName: string, bundleName: string, moduleName: string) {
    Log.showDebug(TAG, `openApplication abilityName: ${abilityName}`);
    this.jumpTo(abilityName, bundleName, moduleName);
  }

  public getAppGridStyleConfig(): AppCenterGridStyleConfig {
    return this.mAppGridStyleConfig;
  }
}