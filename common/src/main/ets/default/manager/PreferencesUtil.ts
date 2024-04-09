/**
 * Copyright (c) 2024-2024 Huawei Device Co., Ltd.
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


const TAG = 'PreferencesUtil';

export class PreferencesUtil {
  private static sInstance:PreferencesUtil | undefined = undefined;
  private preference:DataPreferences.Preferences;

  static getInstance(){
    if (!PreferencesUtil.sInstance) {
      PreferencesUtil.sInstance = new PreferencesUtil();
    }
    return PreferencesUtil.sInstance;
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
      return await this.preference?.get(key,defValue).then((data)=>{
        Log.showInfo(TAG, `The last value obtained data:${data}`);
        return data;
      })
    } catch (err) {
      Log.showError(TAG, `Failed to get getPreferences, Cause:${err.message || err?.code}`);
    }
    return defValue;
  }
}