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
import type { Context } from '@ohos.abilityAccessCtrl';
import { Log } from '../utils/Log';


const TAG = 'PreferencesUtil';
let preference:DataPreferences.Preferences;

class PreferencesUtil {
  private static PREFERENCES_NAME = 'hicar';
  async getPreferencesFromStorage(context:Context):Promise<void>{
    try {
      preference = await DataPreferences.getPreferences(context, PreferencesUtil.PREFERENCES_NAME);
    } catch (err) {
      Log.showError(TAG, `Failed to get getPreferences, Cause:${err.message || err?.code}`);
    }
  }


  async put(key:string, value):Promise<void>{
    try {
      await preference?.put(key,value);
    } catch (err) {
      Log.showError(TAG, `Failed to put value, Cause:${err.message || err?.code}`);
    }
    await preference?.flush();
  }

  async get(key:string, defValue):Promise<DataPreferences.ValueType>{
    try {
      return await preference?.get(key,defValue).then((data)=>{
        Log.showInfo(TAG, `The last value obtained data:${data}`);
        return data;
      })
    } catch (err) {
      Log.showError(TAG, `Failed to get getPreferences, Cause:${err.message || err?.code}`);
    }
    return defValue;
  }
}


export default  new PreferencesUtil();