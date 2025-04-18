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

import DesktopApplicationColumns from './DesktopApplicationColumns';

/**
 * GridLayoutInfo  Columns
 */
export default class GridLayoutInfoColumns extends DesktopApplicationColumns {
    static readonly CARD_ID: string = 'card_id';
    static readonly FOLDER_ID: string = 'folder_id';
    static readonly CONTAINER: string = 'container';
    static readonly FOLDER_NAME: string = 'folder_name';
    static readonly TYPE_ID: string = 'type_id';
    static readonly AREA: string = 'area';
    static readonly PAGE: string = 'page';
    static readonly COLUMN: string = 'column';
    static readonly ROW: string = 'row';
}