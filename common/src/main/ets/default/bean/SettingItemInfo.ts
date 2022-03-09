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
import SettingItemOption from './SettingItemOption';

/**
 * 设置项信息
 */
export default class SettingItemInfo {
  /**
   * 索引值，设置项在设置项列表中的索引值
   */
  ida: number;

  /**
   * 设置项名称
   */
  settingName: string;

  /**
   * 设置项的值，为下面设置项选项列表中选中的选项的名称
   */
  settingValue: string;

  /**
   * 设置项选项列表
   */
  valueList: SettingItemOption[] = [];

  /**
   * settings option type.
   */
  settingType: number;
}