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
import BaseAppPresenter from '../../../../../../../../common/src/main/ets/default/base/BaseAppPresenter.ets';
import PinyinSort from '../../../../../../../../common/src/main/ets/default/utils/PinyinSort.ets';
import CommonConstants from '../../../../../../../../common/src/main/ets/default/constants/CommonConstants.ets';

const PROHIBITED = '禁止卸载'
const UNINSTALL_SUCCEEDED = '卸载成功'
const UNINSTALL_DAILED = '卸载失败'
const KEY_APP_LIST = "appListInfo";
const UNINSTALL_SUCCESS = "UNINSTALL_SUCCESS";
const UNINSTALL_FAILED = "UNINSTALL_FAILED";
const UNINSTALL_PROHIBITED = "UNINSTALL_PROHIBITED";
const KEY_NAME = "name";

export default class AppListPresenter extends BaseAppPresenter {
  private static sAppListPresenter: AppListPresenter = null;
  private mPinyinSort: PinyinSort;

  private constructor() {
    super()
    this.mPinyinSort = new PinyinSort();
  }

  public static getInstance(): AppListPresenter {
    if (AppListPresenter.sAppListPresenter == null) {
      AppListPresenter.sAppListPresenter = new AppListPresenter();
    }
    return AppListPresenter.sAppListPresenter;
  }

  public async getAppList() {
    let list = await this.mAppModel.getAppList();
    let cached = true;
    for (let item of list) {
      let appName = this.mResourceManager.getAppResourceCache(item.bundleName, KEY_NAME);
      console.info("Launcher AppListPresenter regroupDataAppListChange + appName = " + appName);
      if (appName != null) {
        cached = false;
        item.appName = appName;
      }
    }
    if (cached) {
      list = this.mAppListInfoCacheManager.getCache(KEY_APP_LIST);
    } else {
      list.sort(this.mPinyinSort.sortByAppName.bind(this.mPinyinSort));
      this.mAppListInfoCacheManager.setCache(KEY_APP_LIST, list);
    }
    AppStorage.SetOrCreate('listInfo', list);
  }

  public regroupDataAppListChange(callbackList) {
    for (let item of callbackList) {
      let appName = this.mResourceManager.getAppResourceCache(item.bundleName, KEY_NAME);
      console.info("Launcher AppListPresenter regroupDataAppListChange + appName = " + appName);
      if (appName != null) {
        item.appName = appName;
      }
    }
    callbackList.sort(this.mPinyinSort.sortByAppName.bind(this.mPinyinSort));
    this.mAppListInfoCacheManager.setCache(KEY_APP_LIST, callbackList);
    AppStorage.SetOrCreate('listInfo', callbackList);
  }

  public informUninstallResult(resultCode) {
    console.info("Launcher AppGridView getUninstallApp informUninstallResult:" + resultCode);
    if (resultCode === CommonConstants.UNINSTALL_FORBID) {
      Prompt.showToast({
        message: PROHIBITED
      });
    } else if (resultCode === CommonConstants.UNINSTALL_SUCCESS) {
      Prompt.showToast({
        message: UNINSTALL_SUCCEEDED
      });
    } else {
      Prompt.showToast({
        message: UNINSTALL_DAILED
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