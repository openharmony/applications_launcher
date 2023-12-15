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
import { BusinessError } from '@ohos.base';

const TAG = 'SettingsDataManager'
/**
 * Wrapper class for settings interfaces.
 */
class SettingsDataManager {
  private readonly uriShare: string = 'datashare:///com.ohos.settingsdata/entry/settingsdata/SETTINGSDATA?Proxy=true&key=';
  private dataShareHelper: dataShare.DataShareHelper | null = null;
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

  public createDataShareHelper() {
    Log.showInfo(TAG, 'createDataShareHelper context:' + globalThis.desktopContext);
    const UPDATE_INTERVAL = 30;
    const timer = setInterval(() => {
      dataShare.createDataShareHelper(globalThis.desktopContext, this.uriShare)
        .then((dataHelper) => {
          Log.showInfo(TAG, `createDataShareHelper success.`);
          this.dataShareHelper = dataHelper;
          globalThis.sGestureNavigationManager.getGestureNavigationStatus();
          clearInterval(timer);
        })
        .catch((err: BusinessError) => {
          Log.showError(TAG, `createDataShareHelper fail. ${JSON.stringify(err)}`);
        });
    }, UPDATE_INTERVAL);
  }

  /**
   * Update settingData by settingDataKey.
   */
  setValue(helper: dataShare.DataShareHelper | null, settingDataKey: string, value: string): void {
    Log.showInfo(TAG, "setValue:" + value)
    if (typeof globalThis.desktopContext === 'undefined') {
      settings.setValueSync(globalThis.settingsContext as Context, settingDataKey, value);
    } else {
      settings.setValueSync(globalThis.desktopContext as Context, settingDataKey, value);
    }
  }

  /**
   * get settingDataValue by settingDataKey.
   *
   * @return settingsDataValue by settingDataKey.
   */
  getValue(helper: dataShare.DataShareHelper | null, settingDataKey: string, defaultValue: string): string {
    let value: string = '1';
    if (typeof globalThis.desktopContext === 'undefined') {
      value = settings.getValueSync(globalThis.settingsContext as Context, settingDataKey, defaultValue);
    } else {
      value = settings.getValueSync(globalThis.desktopContext as Context, settingDataKey, defaultValue);
    }
    Log.showInfo(TAG, "getValue:" + value);
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