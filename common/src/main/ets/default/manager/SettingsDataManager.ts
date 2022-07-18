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

import featureAbility from '@ohos.ability.featureAbility';
import settings from '@ohos.settings';

/**
 * Wrapper class for settings interfaces.
 */
class SettingsDataManager {
  private readonly uri = 'dataability:///com.ohos.settingsdata.DataAbility';

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

  /**
   * Update settingData by settingDataKey.
   */
  setValue(helper: any, settingDataKey: string, value: string): void {
    if (helper == null || helper == undefined) {
      return;
    }
    settings.setValueSync(helper, settingDataKey, value);
  }

  /**
   * get settingDataValue by settingDataKey.
   *
   * @return settingsDataValue by settingDataKey.
   */
  getValue(helper: any, settingDataKey: string, defaultValue: string): string {
    if (helper == null || helper == undefined) {
      return '';
    }
    return settings.getValueSync(helper, settingDataKey, defaultValue);
  }

  /**
   * get settingDataUri by settingDataKey.
   *
   * @return settingDataUri by settingDataKey.
   */
  getUri(settingDataKey: string): string {
    return settings.getUriSync(settingDataKey);
  }

  /**
   * get settingDataHelper by settingDataKey.
   *
   * @return settingDataHelper by settingDataUri.
   */
  getHelper(context: any, uri: string) {
// @ts-ignore
    return featureAbility.acquireDataAbilityHelper(context, this.uri);
  }
}

export const settingsDataManager = SettingsDataManager.getInstance();