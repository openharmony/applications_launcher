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

import Prompt from '@ohos.prompt';
import BaseAppPresenter from '../../../../../../../../common/src/main/ets/default/base/BaseAppPresenter';
import PinyinSort from '../../../../../../../../common/src/main/ets/default/utils/PinyinSort';
import CommonConstants from '../../../../../../../../common/src/main/ets/default/constants/CommonConstants';
import AppItemInfo from '../../../../../../../../common/src/main/ets/default/bean/AppItemInfo';

const KEY_APP_LIST = "appListInfo";
const KEY_NAME = "name";

export default class AppListPresenter extends BaseAppPresenter {
  private static sAppListPresenter: AppListPresenter = null;
  private mPinyinSort: PinyinSort;

  protected constructor() {
    super();
    this.mPinyinSort = new PinyinSort();
  }

  public static getInstance(): AppListPresenter {
    if (AppListPresenter.sAppListPresenter == null) {
      AppListPresenter.sAppListPresenter = new AppListPresenter();
    }
    return AppListPresenter.sAppListPresenter;
  }

  public async getAppList() {
    let list: Array<AppItemInfo> | number = this.mAppListInfoCacheManager.getCache(KEY_APP_LIST);
    if (list != CommonConstants.INVALID_VALUE) {
      return list;
    }

    list = await this.mAppModel.getAppList();
    for (let item of list) {
      let cacheKey = item.appLabelId + item.bundleName;
      let appName = this.mResourceManager.getAppResourceCache(cacheKey, KEY_NAME);
      if (appName != null) {
        item.appName = appName;
      } else {
        let loadAppName = await this.mResourceManager.getAppNameSync(item.appLabelId, item.bundleName, item.appName);
        console.info("Launcher AppListPresenter getAppList loadAppName:" + loadAppName);
        item.appName = loadAppName;
      }
    }

    list.sort(this.mPinyinSort.sortByAppName.bind(this.mPinyinSort));
    this.mAppListInfoCacheManager.setCache(KEY_APP_LIST, list);
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
      AppStorage.SetOrCreate('listInfo', list);
    })
    return list;
  }

  public async regroupDataAppListChange(callbackList) {
    for (let item of callbackList) {
      let cacheKey = item.appLabelId + item.bundleName;
      let appName = this.mResourceManager.getAppResourceCache(cacheKey, KEY_NAME);
      console.info("Launcher AppListPresenter regroupDataAppListChange + appName = " + appName);
      if (appName != null) {
        item.appName = appName;
      } else {
        let loadAppName = await this.mResourceManager.getAppNameSync(item.appLabelId, item.bundleName, item.appName);
        console.info("Launcher AppListPresenter regroupDataAppListChange loadAppName:" + loadAppName);
        item.appName = loadAppName;
      }
    }
    callbackList.sort(this.mPinyinSort.sortByAppName.bind(this.mPinyinSort));
    this.mAppListInfoCacheManager.setCache(KEY_APP_LIST, callbackList);
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
    console.info("Launcher AppListView getUninstallApp uninstallationResult:" + resultCode);
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
    console.info("Launcher AppListView intoSetting");
    this.jumpToSetting();
  }

  /**
   * Open application function.
   *
   * @param {string} abilityName - ability name of the application to be jump to.
   * @param {string} bundleName - bundle name of the application to be jump to.
   */
  public openApplication(abilityName, bundleName) {
    console.info("Launcher AppListView openApplication abilityName:" + abilityName);
    this.jumpTo(abilityName, bundleName);
  }
}