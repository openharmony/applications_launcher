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

import BaseColumns from './BaseColumns';

/**
 * GridLayoutInfo  Columns
 */
export default class DesktopApplicationColumns extends BaseColumns {
    static readonly APP_NAME: string = "app_name";
    static readonly IS_SYSTEM_APP: string = "is_system_app";
    static readonly IS_UNINSTALLABLE: string = "is_uninstallAble";
    static readonly BADGE_NUMBER: string = "badge_number";
    static readonly APPICON_ID: string = "appIcon_id";
    static readonly APPLABEL_ID: string = "appLabel_id";
    static readonly BUNDLE_NAME: string = "bundle_name";
    static readonly MODULE_NAME: string = "module_name";
    static readonly ABILITY_NAME: string = "ability_name";
    static readonly KEY_NAME: string = "key_name";
    static readonly INSTALL_TIME: string = "install_time";
    static readonly EXTEND1: string = "extend1";
    static readonly EXTEND2: string = "extend2";
    static readonly EXTEND3: string = "extend3";
}