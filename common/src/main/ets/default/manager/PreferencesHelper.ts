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

import DataPreferences from '@ohos.data.preferences';
import { Log } from '../utils/Log';
import { Context } from '@ohos.abilityAccessCtrl';


const TAG = 'PreferencesHelper';

export class PreferencesHelper {
  private static PREFERENCE_NAME = 'launcher_pref';
  private static sInstance:PreferencesHelper | undefined = undefined;
  private preference:DataPreferences.Preferences;

  static getInstance() {
    if (!PreferencesHelper.sInstance) {
      PreferencesHelper.sInstance = new PreferencesHelper();
    }
    return PreferencesHelper.sInstance;
  }

  async initPreference(context: Context): Promise<void> {
    if (this.preference) {
      Log.showInfo(TAG, `preference is inited`);
      return;
    }
    try {
      this.preference = await DataPreferences.getPreferences(context, PreferencesHelper.PREFERENCE_NAME);
    } catch (err) {
      Log.showError(TAG, `Failed to initPreference, Cause:${err.message || err?.code}`);
    }
  }

  async put(key:string, value):Promise<void>{
    try {
      await this.preference?.put(key,value);
    } catch (err) {
      Log.showError(TAG, `Failed to put value, Cause:${err.message || err?.code}`);
    }
    await this.preference?.flush();
  }

  async get(key:string, defValue):Promise<DataPreferences.ValueType>{
    try {
      let result = await this.preference?.get(key,defValue);
      return result;
    } catch (err) {
      Log.showError(TAG, `Failed to get initPreferences, Cause:${err.message || err?.code}`);
    }
    return defValue;
  }
}
