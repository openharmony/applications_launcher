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
import AppGridStyleConfig from '../../../../../../../../common/src/main/ets/default/layoutconfig/AppGridStyleConfig';
import AppCenterGridStyleConfig from '../AppCenterGridStyleConfig';
import LayoutConfigManager from '../../../../../../../../common/src/main/ets/default/layoutconfig/LayoutConfigManager';
import FeatureConstants from '../constants/FeatureConstants';

export default class AppCenterViewModel {
  private mAppGridStyleConfig: AppCenterGridStyleConfig;

  private constructor() {
    this.mAppGridStyleConfig = LayoutConfigManager.getStyleConfig(AppCenterGridStyleConfig.APP_GRID_STYLE_CONFIG, FeatureConstants.FEATURE_NAME);
  }

  /**
    * Obtains the AppCenterViewModel instance.
    *
    * @return AppCenterViewModel
   */
  public static getInstance(): AppCenterViewModel {
    if (globalThis.AppCenterViewModelInstance == null) {
      globalThis.AppCenterViewModelInstance = new AppCenterViewModel();
    }
    return globalThis.AppCenterViewModelInstance;
  }

  public getAppGridStyleConfig(): AppCenterGridStyleConfig {
    return this.mAppGridStyleConfig;
  }
}