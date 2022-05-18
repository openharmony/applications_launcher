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

export default class FeatureConstants {
  static readonly FEATURE_NAME = 'featureBigFolder';

  /**
   * folder static status
   */
  static readonly OPEN_FOLDER_STATUS_STATIC = -1;

  /**
   * folder close status
   */
  static readonly OPEN_FOLDER_STATUS_CLOSE = 0;

  /**
   * folder open status
   */
  static readonly OPEN_FOLDER_STATUS_OPEN = 1;

  /**
   * folder refresh status
   */
  static readonly OPEN_FOLDER_STATUS_REFRESH = 2;
}