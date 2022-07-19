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

import { AppItemInfo } from './AppItemInfo';
import GridLayoutInfoColumns from './GridLayoutInfoColumns';
import GridLayoutItemInfo from './GridLayoutItemInfo';
import { CheckEmptyUtils } from '../utils/CheckEmptyUtils';

/**
 * Item info of GridLayoutInfo item.
 */
export default class GridLayoutItemBuilder {
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
     * GridLayoutItemInfo: column of positons
     */
    column: number | undefined;

    /**
     * GridLayoutItemInfo: row of positons
     */
    row: number | undefined;

    /**
     * GridLayoutItemInfo: bigfolder apps info
     */
    layoutInfo: AppItemInfo[] | undefined;

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

    constructor(id: number) {
        this.id = id;
    }

    static fromResultSet(resultSet: any): GridLayoutItemBuilder {
        let gridlayoutItemBuilder = new GridLayoutItemBuilder(resultSet.getLong(resultSet.getColumnIndex(GridLayoutInfoColumns.ID)));
        gridlayoutItemBuilder.setCardId(resultSet.getLong(resultSet.getColumnIndex(GridLayoutInfoColumns.CARD_ID)));
        gridlayoutItemBuilder.setFolderId(resultSet.getString(resultSet.getColumnIndex(GridLayoutInfoColumns.FOLDER_ID)));
        gridlayoutItemBuilder.setContainer(resultSet.getLong(resultSet.getColumnIndex(GridLayoutInfoColumns.CONTAINER)));
        gridlayoutItemBuilder.setFolderName(resultSet.getString(resultSet.getColumnIndex(GridLayoutInfoColumns.FOLDER_NAME)));
        gridlayoutItemBuilder.setBadgeNumber(resultSet.getLong(resultSet.getColumnIndex(GridLayoutInfoColumns.BADGE_NUMBER)));
        gridlayoutItemBuilder.setTypeId(resultSet.getLong(resultSet.getColumnIndex(GridLayoutInfoColumns.TYPE_ID)));
        gridlayoutItemBuilder.setArea(resultSet.getString(resultSet.getColumnIndex(GridLayoutInfoColumns.AREA)));
        gridlayoutItemBuilder.setPage(resultSet.getLong(resultSet.getColumnIndex(GridLayoutInfoColumns.PAGE)));
        gridlayoutItemBuilder.setColumn(resultSet.getLong(resultSet.getColumnIndex(GridLayoutInfoColumns.COLUMN)));
        gridlayoutItemBuilder.setRow(resultSet.getLong(resultSet.getColumnIndex(GridLayoutInfoColumns.ROW)));
        gridlayoutItemBuilder.setBundleName(resultSet.getString(resultSet.getColumnIndex(GridLayoutInfoColumns.BUNDLE_NAME)));
        gridlayoutItemBuilder.setAbilityName(resultSet.getString(resultSet.getColumnIndex(GridLayoutInfoColumns.ABILITY_NAME)));
        gridlayoutItemBuilder.setModuleName(resultSet.getString(resultSet.getColumnIndex(GridLayoutInfoColumns.MODULE_NAME)));
        gridlayoutItemBuilder.setKeyName(resultSet.getString(resultSet.getColumnIndex(GridLayoutInfoColumns.KEY_NAME)));
        gridlayoutItemBuilder.setExtend1(resultSet.getString(resultSet.getColumnIndex(GridLayoutInfoColumns.EXTEND1)));
        gridlayoutItemBuilder.setExtend2(resultSet.getString(resultSet.getColumnIndex(GridLayoutInfoColumns.EXTEND2)));
        gridlayoutItemBuilder.setExtend3(resultSet.getLong(resultSet.getColumnIndex(GridLayoutInfoColumns.EXTEND3)));
        return gridlayoutItemBuilder;
    }

    static buildLayout(resultSet: any): AppItemInfo {
        let appItemInfo = new AppItemInfo();
        appItemInfo.appName = resultSet.getString(resultSet.getColumnIndex(GridLayoutInfoColumns.APP_NAME));
        appItemInfo.isSystemApp = resultSet.getLong(resultSet.getColumnIndex(GridLayoutInfoColumns.IS_SYSTEM_APP)) > 0 ? true :false;
        appItemInfo.isUninstallAble = resultSet.getLong(resultSet.getColumnIndex(GridLayoutInfoColumns.IS_UNINSTALLABLE)) > 0 ? true :false;
        appItemInfo.appIconId = resultSet.getLong(resultSet.getColumnIndex(GridLayoutInfoColumns.APPICON_ID));
        appItemInfo.appLabelId = resultSet.getLong(resultSet.getColumnIndex(GridLayoutInfoColumns.APPLABEL_ID));
        appItemInfo.bundleName = resultSet.getString(resultSet.getColumnIndex(GridLayoutInfoColumns.BUNDLE_NAME));
        appItemInfo.abilityName = resultSet.getString(resultSet.getColumnIndex(GridLayoutInfoColumns.ABILITY_NAME));
        appItemInfo.moduleName = resultSet.getString(resultSet.getColumnIndex(GridLayoutInfoColumns.MODULE_NAME));
        appItemInfo.keyName = resultSet.getString(resultSet.getColumnIndex(GridLayoutInfoColumns.KEY_NAME));
        appItemInfo.installTime = resultSet.getString(resultSet.getColumnIndex(GridLayoutInfoColumns.INSTALL_TIME));
        appItemInfo.typeId = resultSet.getLong(resultSet.getColumnIndex(GridLayoutInfoColumns.TYPE_ID));
        appItemInfo.area = this.getArea(resultSet.getString(resultSet.getColumnIndex(GridLayoutInfoColumns.AREA)));
        appItemInfo.page = resultSet.getLong(resultSet.getColumnIndex(GridLayoutInfoColumns.PAGE));
        appItemInfo.column = resultSet.getLong(resultSet.getColumnIndex(GridLayoutInfoColumns.COLUMN));
        appItemInfo.row = resultSet.getLong(resultSet.getColumnIndex(GridLayoutInfoColumns.ROW));
        return appItemInfo;
    }

    private setCardId(cardId: number) {
        this.cardId = cardId;
        return this;
    }

    private setFolderId(folderId: string) {
        this.folderId = folderId;
        return this;
    }

    private setContainer(container: number) {
        this.container = container;
        return this;
    }

    private setFolderName(folderName: string) {
        this.folderName = folderName;
        return this;
    }

    private setBadgeNumber(badgeNumber: number) {
        this.badgeNumber = badgeNumber;
        return this;
    }

    private setTypeId(typeId: number) {
        this.typeId = typeId;
        return this;
    }

    private setArea(area: string) {
        let areaArray:number[] = [];
        let temp = area.split(",");
        if (!CheckEmptyUtils.isEmptyArr(temp) && temp.length === 2) {
            areaArray[0] = Number(temp[0]);
            areaArray[1] = Number(temp[1]);
        }
        this.area = areaArray;
        return this;
    }

    static getArea(area: string): number[] {
        let areaArray:number[] = [];
        let temp = area.split(",");
        if (!CheckEmptyUtils.isEmptyArr(temp) && temp.length === 2) {
            areaArray[0] = Number(temp[0]);
            areaArray[1] = Number(temp[1]);
        }
        return areaArray;
    }

    private setPage(page: number) {
        this.page = page;
        return this;
    }

    private setColumn(column: number) {
        this.column = column;
        return this;
    }

    private setRow(row: number) {
        this.row = row;
        return this;
    }

    private setBundleName(bundleName: string) {
        this.bundleName = bundleName;
        return this;
    }

    private setAbilityName(abilityName: string) {
        this.abilityName = abilityName;
        return this;
    }

    private setModuleName(moduleName: string) {
        this.moduleName = moduleName;
        return this;
    }

    private setKeyName(keyName: string) {
        this.keyName = keyName;
        return this;
    }

    setLayoutInfo(appItemInfos : AppItemInfo[]) {
        this.layoutInfo = appItemInfos;
        return this;
    }

    private setExtend1(extend1: string) {
        this.extend1 = extend1;
        return this;
    }

    private setExtend2(extend2: string) {
        this.extend2 = extend2;
        return this;
    }

    private setExtend3(extend3: number) {
        this.extend3 = extend3;
        return this;
    }

    buildGridLayoutItem(): GridLayoutItemInfo {
        return new GridLayoutItemInfo(this);
    }
}