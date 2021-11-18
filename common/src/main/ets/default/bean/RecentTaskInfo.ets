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
 * 最近任务信息
 */
export default class RecentTaskInfo {
  /**
   * 当前任务id
   */
  public missionId: string;

  /**
   * 应用名
   */
  public appName: string;

  /**
   * 应用图标资源id
   */
  public appIconId: string;

  /**
   * 应用名称资源id
   */
  public appLabelId: string;

  /**
   * 应用包名
   */
  public bundleName: string;

  /**
   * ability组件名
   */
  public abilityName: string;
}