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

/**
 * Recent mission info
 */
export default class RecentMissionInfo {
  /**
   * Recent mission: mission id
   */
  missionId: number;

  /**
   * Recent mission: app name
   */
  appName: string;

  /**
   * Recent mission: app icon Id
   */
  appIconId: string;

  /**
   * Recent mission: app label Id
   */
  appLabelId: string;

  /**
   * Recent mission: bundle name
   */
  bundleName: string;

  /**
   * Recent mission: ability name
   */
  abilityName: string;

  /**
   * Recent mission: lock status
   */
  lockedState: boolean;
}