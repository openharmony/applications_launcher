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

import GridLayoutItemBuilder from './GridLayoutItemBuilder';

/**
 * Item info of GridLayoutInfo item.
 */
export default class GridLayoutItemInfo {
    /**
     * GridLayoutItemInfo: id
     */
    readonly id: number | undefined;

    /**
     * GridLayoutItemInfo: cardId
     */
    cardId: number | undefined;

    /**
     * GridLayoutItemInfo: ID of the bigfolder.
     */
    folderId: string | undefined;

    /**
     * GridLayoutItemInfo: bigfolder id
     * Not in bigfolder: - 100
     * In a bigfolder: ID of the bigfolder.
     */
    container: number | undefined;

    /**
     * GridLayoutItemInfo: bigfolder Name
     */
    folderName: string | undefined;

    /**
     * GridLayoutItemInfo: badgeNumber
     */
    badgeNumber: number | undefined;

    /**
     * GridLayoutItemInfo: type  0:app  1:card  3:bigfolder
     */
    typeId: number | undefined;

    /**
     * GridLayoutItemInfo: area
     */
    area: number[] | undefined;

    /**
     * GridLayoutItemInfo: page
     */
    page: number | undefined;

    /**
     * GridLayoutItemInfo: column of positions
     */
    column: number | undefined;

    /**
     * GridLayoutItemInfo: row of positions
     */
    row: number | undefined;

    /**
     * Indicates bundleName.
     */
    bundleName: string | undefined;

    /**
     * Indicates abilityName.
     */
    abilityName: string | undefined;

    moduleName: string | undefined;

    /**
     * Indicates keyName.
     */
    keyName: string | undefined;

    /**
     * GridLayoutItemInfo: bigFolder apps info
     */
    layoutInfo: any | undefined;

    /**
     * GridLayoutItemInfo: extend1
     */
    extend1: string | undefined;

    /**
     * GridLayoutItemInfo: extend2
     */
    extend2: string | undefined;

    /**
     * GridLayoutItemInfo: extend3
     */
    extend3: number | undefined;

    constructor(gridLayoutItemBuilder: GridLayoutItemBuilder) {
        this.id = gridLayoutItemBuilder.id;
        this.cardId = gridLayoutItemBuilder.cardId;
        this.folderId = gridLayoutItemBuilder.folderId;
        this.container = gridLayoutItemBuilder.container;
        this.folderName = gridLayoutItemBuilder.folderName;
        this.badgeNumber = gridLayoutItemBuilder.badgeNumber;
        this.typeId = gridLayoutItemBuilder.typeId;
        this.area = gridLayoutItemBuilder.area;
        this.page = gridLayoutItemBuilder.page;
        this.column = gridLayoutItemBuilder.column;
        this.row = gridLayoutItemBuilder.row;
        this.bundleName = gridLayoutItemBuilder.bundleName;
        this.abilityName = gridLayoutItemBuilder.abilityName;
        this.moduleName = gridLayoutItemBuilder.moduleName;
        this.keyName = gridLayoutItemBuilder.keyName;
        this.layoutInfo = [gridLayoutItemBuilder.layoutInfo];
        this.extend1 = gridLayoutItemBuilder.extend1;
        this.extend2 = gridLayoutItemBuilder.extend2;
        this.extend3 = gridLayoutItemBuilder.extend3;
    }
}
