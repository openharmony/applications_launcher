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
import SettingItemOption from './SettingItemOption';

/**
 * Item info for launcher settings db data.
 */
export default class SettingDbInfo {
  /**
   * Index for setting db item.
   */
  id: number | undefined;

  /**
   * appStartPageType for setting db item.
   */
  appStartPageType: string | undefined;

  /**
   * gridConfig for setting db item.
   */
  gridConfig: number | undefined;

  /**
   * deviceType for setting db item.
   */
  deviceType: string | undefined;

  /**
   * pageCount for setting db item.
   */
  pageCount: number | undefined;

  /**
   * row for setting db item.
   */
  row: number | undefined;

  /**
   * column for setting db item.
   */
  column: number | undefined;
}