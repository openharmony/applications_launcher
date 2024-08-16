//@ts-nocheck
/*
 * Copyright (c) 2022 Huawei Device Co., Ltd.
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

import { Log } from '../utils/Log';
import settings from '@ohos.settings';
import dataShare from '@ohos.data.dataShare';
import common from '@ohos.app.ability.common';
import { Context } from '@ohos.abilityAccessCtrl';

const TAG = 'SettingsDataManager';
/**
 * Wrapper class for settings interfaces.
 */
class SettingsDataManager {
  private readonly uriShare: string = 'datashare:///com.ohos.settingsdata/entry/settingsdata/SETTINGSDATA?Proxy=true&key=';
  private dataShareHelper: dataShare.DataShareHelper | null = null;
  private RETRY_INTERVAL_MS = 2000;
  private MAX_RETRY_TIME = 10;
  private constructor() {
  }

  /**
   * settingsData manager instance
   *
   * @return settingsDataManager instance
   */
  static getInstance(): SettingsDataManager {
    if (globalThis.SettingsDataManagerInstance == null) {
      globalThis.SettingsDataManagerInstance = new SettingsDataManager();
    }
    return globalThis.SettingsDataManagerInstance;
  }

  private sleep(time: number) {
    return new Promise(resolve => {
      setTimeout(resolve, time);
    })
  }

  public async createDataShareHelper(retryTimes: number): Promise<void> {
    Log.showInfo(TAG, 'createDataShareHelper');
    if (retryTimes < 1) {
      Log.showError(TAG, 'createDataShareHelper, retry too many times');
      return;
    }
    Log.showInfo(TAG, 'createDataShareHelper in, retry times: %{public}d', this.MAX_RETRY_TIME - retryTimes + 1);
    try {
      this.dataShareHelper = await dataShare.createDataShareHelper(globalThis.desktopContext, this.uriShare);
      if (this.dataShareHelper) {
        Log.showInfo(TAG, 'createDataShareHelper success.');
        globalThis.sGestureNavigationManager.getGestureNavigationStatus();
      }
    } catch (err) {
      Log.showError(TAG, 'createDataShareHelper error, code: ' + err?.code + ', message: ' + err?.message);
      await this.sleep(this.RETRY_INTERVAL_MS);
      this.createDataShareHelper(retryTimes - 1);
    }
  }

  /**
   * Update settingData by settingDataKey.
   */
  setValue(helper: dataShare.DataShareHelper | null, settingDataKey: string, value: string): void {
    Log.showInfo(TAG, 'setValue:' + value);
    try {
      settings.setValueSync(globalThis.desktopContext as Context, settingDataKey, value);
    } catch (err) {
      Log.showError(TAG, `Update settingData by settingDataKey err: ${err.message || err?.code}`);
    }
  }

  /**
   * get settingDataValue by settingDataKey.
   *
   * @return settingsDataValue by settingDataKey.
   */
  getValue(helper: dataShare.DataShareHelper | null, settingDataKey: string, defaultValue: string): string {
    let value: string = '1';
    try {
      value = settings.getValueSync(globalThis.desktopContext as Context, settingDataKey, defaultValue);
    } catch (err) {
      Log.showError(TAG, `get settingDataValue by settingDataKey err: ${err.message || err?.code}`);
    }
    Log.showInfo(TAG, 'getValue:' + value);
    return value;
  }

  /**
   * get settingDataUri by settingDataKey.
   *
   * @return settingDataUri by settingDataKey.
   */
  getUri(settingDataKey: string): string {
    return this.uriShare + settingDataKey;
  }

  /**
   * get settingDataHelper by settingDataKey.
   *
   * @return settingDataHelper by settingDataUri.
   */
  getHelper(context: common.Context, uri: string): dataShare.DataShareHelper | null {
    return this.dataShareHelper;
  }
}

export const settingsDataManager = SettingsDataManager.getInstance();