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

import BaseAppPresenter from './base/BaseAppPresenter.js';

const KEY_APP_LIST = "appListInfo";

let mGridConfig;
let mViewCallback;
let mBundleInfoList;
let mSettingsModel;

/**
 * Presenter of launcher grid view
 */
export default class AppGridPresenter extends BaseAppPresenter {

    constructor(AppModel, MMIModel, SettingsModel, AppListInfoCacheManager) {
        super(AppModel, MMIModel, SettingsModel, AppListInfoCacheManager);
        mSettingsModel = SettingsModel;
    }

    /**
     * Get application info list.
     *
     * @return {object} Application layout information.
     */
    getAppListInfo() {
        mBundleInfoList = this.appListInfoCacheManager.getCache(KEY_APP_LIST);
        return this.#pagingFiltering();
    }

    /**
     * Change the application position after move it.
     *
     * @param {object} startInfo - Starting position.
     * @param {object} endInfo - Ending posiition.
     * @return {object} Application layout information.
     */
    layoutAdjustment(startInfo, endInfo) {
        let info = mSettingsModel.getLayoutInfo();
        let layoutInfo = info.layoutInfo;
        mBundleInfoList = this.appListInfoCacheManager.getCache(KEY_APP_LIST);
        if (endInfo.row == -1) {
            this.#moveBottomLayout(startInfo, endInfo, layoutInfo);
            info.layoutInfo = layoutInfo;
            mSettingsModel.setLayoutInfo(info);
            return this.#pagingFiltering();
        }
        this.#moveLayout(startInfo, endInfo, layoutInfo, startInfo);
        info.layoutInfo = layoutInfo;
        mSettingsModel.setLayoutInfo(info);
        return this.#pagingFiltering();
    }

    /**
     * Get application list for grid layout.
     *
     * @param {array} callback - Application list.
     */
    getGridList(callback) {
        mViewCallback = callback;
        this.appModel.getAppList(this.getGridListCallback.bind(this));
    }

    /**
     * Get application info list and intergrate them.
     *
     * @param {array} list - Callback data(application info list).
     */
    getGridListCallback(list) {
        mBundleInfoList = list;
        this.appListInfoCacheManager.setCache(KEY_APP_LIST, mBundleInfoList);
        let callbackList = this.#pagingFiltering();
        mViewCallback(callbackList);
    }

    /**
     * Judge whether the current layout config and the setting layout config is consistent,and change the current layout config.
     *
     * @return {boolean} Verify result.
     */
    updateLayoutConfig() {
        let result = this.settingModel.getGridConfig();
        if(mGridConfig == result) {
            return false;
        } else {
            mGridConfig = result;
            return true;
        }
    }

    /**
     * Get the current layout config.
     *
     * @return {object} Layout config information.
     */
    getGridConfig() {
        return mSettingsModel.getGridConfig();
    }

    /**
     * Get pageCount.
     *
     * @return {number} PageCount.
     */
    getGridPageCount() {
        let layoutInfo = [];
        layoutInfo = mSettingsModel.getLayoutInfo();
        return layoutInfo.layoutDescription.pageCount;
    }

    /**
     * Set pageCount.
     *
     * @param {number} pageCount - PageCount.
     */
    setGridPageCount(pageCount) {
        let layoutInfo = [];
        layoutInfo = mSettingsModel.getLayoutInfo();
        layoutInfo.layoutDescription.pageCount = pageCount;
        mSettingsModel.setLayoutInfo(layoutInfo);
    }

    /**
     * Delete blank page.
     *
     * @param {number} pageIndex - Index of the page which is to be deleted.
     */
    deleteGridPage(pageIndex) {
        let info = mSettingsModel.getLayoutInfo();
        let layoutInfo = info.layoutInfo;
        for (let element of layoutInfo) {
            if (element.page > pageIndex) {
                element.page = element.page - 1;
            }
        }
        info.layoutInfo = layoutInfo;
        mSettingsModel.setLayoutInfo(info);
    }

    /**
     * Intergrate application list.
     *
     * @return {object} Application information list.
     */
    #pagingFiltering = () => {
        let appListInfo = [];
        let info = this.#getLayoutInfo();
        let layoutInfo = info.layoutInfo;
        for (let i = 0;i < layoutInfo.length; i++) {
            for (let j = 0; j < mBundleInfoList.length; j++) {
                if (layoutInfo[i].bundleName == mBundleInfoList[j].bundleName) {
                    appListInfo.push(
                        {
                            System: mBundleInfoList[j].System,
                            AppName: mBundleInfoList[j].AppName,
                            AppId: mBundleInfoList[j].AppId,
                            AppIcon: mBundleInfoList[j].AppIcon,
                            bundleName: mBundleInfoList[j].bundleName,
                            labelId: mBundleInfoList[j].labelId,
                            abilityName: mBundleInfoList[j].abilityName,
                            type: 0,
                            area: layoutInfo[i].area,
                            page: layoutInfo[i].page,
                            row: layoutInfo[i].row,
                            column: layoutInfo[i].column
                        }
                    );
                }
            }
        }
        return appListInfo;
    }

    /**
     * Verify whether the info is legal.
     *
     * @param {object} info - The info which is needed to be verify.
     * @return {boolean} Verify result.
     */
    #ifRationality = (info) => {
        let column = mGridConfig.column;
        let row = mGridConfig.row;
        //verify whether the info is null.
        if(this.#ifInfoIsNull(info)) {
            return false;
        }
        let layoutDescription = info.layoutDescription;
        //verify whether the layoutDescription is diffrent.
        if(this.#ifDescriptionIsDiffrent(layoutDescription, row, column)) {
            return false;
        }
        let layoutInfo = info.layoutInfo;
        //verify whether the layoutInfo's row and column is more than standard.
        if(this.#ifColumnOrRowAreBigger(layoutInfo, row, column)) {
            return false;
        }
        //verify whether the bottomBar's position is duplicated.
        if(this.#ifDuplicateBottomBarPosition(layoutInfo)) {
            return false;
        }
        //verify whether the layoutInfo's position is duplicated.
        if(this.#ifDuplicatePosition(layoutInfo)) {
            return false;
        }
        //verify whether the layoutInfo's bundleName is duplicated.
        if(this.#ifDuplicateBundleName(layoutInfo)) {
            return false;
        }
        return true;
    }

    /**
     * Verify whether the info is null.
     *
     * @param {object} info - The info which is needed to be verify.
     * @return {boolean} Verify result.
     */
    #ifInfoIsNull = (info) => {
        if(info == undefined || info == '' || info == {} || info == null) {
            return true;
        }
        return false;
    }

    /**
     * Verify whether the layoutDescription is diffrent.
     *
     * @param {object} layoutDescription - The layoutDescription which is needed to be verify.
     * @param {number} row - Standard row number.
     * @param {number} column - Standard column number.
     * @return {boolean} Verify result.
     */
    #ifDescriptionIsDiffrent = (layoutDescription,row,column) => {
        if(row != layoutDescription.row || column != layoutDescription.column) {
            return true;
        }
        return false;
    }

    /**
     * Verify whether the layoutInfo's row and column is more than standard.
     *
     * @param {object} layoutInfo - The layoutInfo which is needed to be verify.
     * @param {number} row - Standard row number.
     * @param {number} column - Standard column number.
     * @return {boolean} Verify result.
     */
    #ifColumnOrRowAreBigger = (layoutInfo, row, column) => {
        for (let i = 0; i < layoutInfo.length; i++) {
            //column or row are bigger than legal num
            if (layoutInfo[i].column >= column || layoutInfo[i].row >= row) {
                return true;
            }
        }
        return false;
    }

    /**
     * Verify whether the bottomBar's position is duplicated.
     *
     * @param {object} layoutInfo - The layoutInfo which is needed to be verify.
     * @return {boolean} Verify result.
     */
    #ifDuplicateBottomBarPosition = (layoutInfo) => {
        for (let i = 0; i < layoutInfo.length; i++) {
            if (layoutInfo[i].row < 0) {
                for (let j = layoutInfo.length - 1; j > 0 && j > i; j--) {
                    if (i != j && layoutInfo[j].row < 0) {
                        if (layoutInfo[i].column == layoutInfo[j].column) {
                         return true;
                        }
                    }
                }
            }
        }
        return false;
    }

    /**
     * Verify whether the layoutInfo's position is duplicated.
     *
     * @param {object} layoutInfo - The layoutInfo which is needed to be verify.
     * @return {boolean} Verify result.
     */
    #ifDuplicatePosition = (layoutInfo) => {
        for (let i = 0; i < layoutInfo.length; i++) {
            for (let j = layoutInfo.length - 1; j > 0 && j > i; j--) {
                if (layoutInfo[i].row == layoutInfo[j].row && layoutInfo[i].column == layoutInfo[j].column) {
                    return true;
                }

            }
        }
        return false;
    }

    /**
     * Verify whether the layoutInfo's bundleName is duplicated.
     *
     * @param {object} layoutInfo - The layoutInfo which is needed to be verify.
     * @return {boolean} Verify result.
     */
    #ifDuplicateBundleName = (layoutInfo) => {
        let count = {};
        for(let i = 0; i < layoutInfo.length; i++) {
            if(count[layoutInfo[i].bundleName] == undefined || count[layoutInfo[i].bundleName] == null || count[layoutInfo[i].bundleName] == '') {
                count[layoutInfo[i].bundleName] = 0;
            }else{
                if(++ count[layoutInfo[i].bundleName] > 1) {
                    return true;
                }
            }
        }
        return false;
    }


    /**
     * Get the latest info position in the page.
     *
     * @param {object} layoutInfo - Layout information.
     * @return {number} The latest information position number.
     */
    #getExistNumber = (layoutInfo) => {
        let column = mGridConfig.column;
        let row = mGridConfig.row;
        let existNumber = 0;
        for(let i = 0; i < layoutInfo.length ;i++) {
            let Page = layoutInfo[i].page;
            let Row = layoutInfo[i].row;
            let Column = layoutInfo[i].column;
            let result = (Page * column * row) + (Row * column) + (Column + 1);
            if(result > existNumber) {
                existNumber = result;
            }
        }
        return existNumber;
    }

    /**
     * Update layout information.
     *
     * @param {object} info - The current layout information.
     * @return {object} New layout information.
     */
    #updateLayoutInfo = (info) => {
        let layoutDescription = info.layoutDescription;
        let layoutInfo = info.layoutInfo;
        let column = mGridConfig.column;
        let row = mGridConfig.row;
        let newApp = [];
        layoutDescription.row = row;
        layoutDescription.column = column;
        //Detect newly installed apps
        for (let i in mBundleInfoList) {
            let sign = false;
            for (let j in layoutInfo) {
                if (mBundleInfoList[i].bundleName == layoutInfo[j].bundleName) {
                    sign = true;
                    break;
                }
            }
            if (!sign) {
                newApp.push(mBundleInfoList[i]);
            }
        }
        //Detect uninstalled apps
        for (let i in layoutInfo) {
            let sign = false;
            for (let j in mBundleInfoList) {
                if (layoutInfo[i].bundleName == mBundleInfoList[j].bundleName) {
                    sign = true;
                    break;
                }
            }
            if (!sign) {
                layoutInfo.splice(i, 1);
            }
        }
        //The latest info position in the page
        let existNumber = this.#getExistNumber(layoutInfo);
        //Add new app
        for (let i = 0; i < newApp.length; i++) {
            layoutInfo.push({
                bundleName: newApp[i].bundleName,
                type: 0,
                area: [1,1],
                page: Math.floor((i + existNumber) / (column * row)),
                row: Math.floor((i + existNumber) % (column * row) / column),
                column: Math.floor((i + existNumber) % (column * row) % column),
            });
        }
       info.layoutDescription = layoutDescription;
       info.layoutInfo = layoutInfo;
        return info;
    }

    /**
     * Get the current layout information.
     *
     * @return {object} Layout information.
     */
    #getLayoutInfo = () => {
        let layoutInfo = [];
        layoutInfo = mSettingsModel.getLayoutInfo();
        let isLegal = this.#ifRationality(layoutInfo);
        if (isLegal) {
            layoutInfo = this.#updateLayoutInfo(layoutInfo);
        } else if (this.#ifRationality(mSettingsModel.getDefaultLayoutInfo())) {
            layoutInfo = this.#updateLayoutInfo(mSettingsModel.getDefaultLayoutInfo());
        } else {
            layoutInfo = this.#updateLayoutInfo(this.#createNewLayoutInfo());
        }
        mSettingsModel.setLayoutInfo(layoutInfo);
        return layoutInfo;
    }

    /**
     * Create a new layout information.
     *
     * @return {object} New layout information.
     */
    #createNewLayoutInfo = () => {
        let layoutInfo = mSettingsModel.getLayoutInfo();
        let column = mGridConfig.column;
        let row = mGridConfig.row;
        let layoutNum = layoutInfo.layoutInfo.length;
        let maxPerPage = column * row;
        let pageNum = Math.ceil(layoutNum/maxPerPage);
        let newLayoutInfo = {};
        newLayoutInfo.layoutDescription = {
            "pageCount" : pageNum,
            "row" : row,
            "column" : column,
        }
        newLayoutInfo.layoutInfo = [];
        return newLayoutInfo;
    }

    /**
     * Move application to bottomBar.
     */
    #moveBottomLayout = (startInfo, endInfo, layoutInfo) => {
        let column = mGridConfig.column;
        let bottomBarLayoutInfo = [];
        let moveItem = {
            bundleName: "",
            type: 0,
            page: 0,
            row: 0,
            column: 0,
        };
        for (let i = layoutInfo.length - 1; i >= 0; i--) {
            if (layoutInfo[i].page == startInfo.page && layoutInfo[i].row == startInfo.row && layoutInfo[i].column == startInfo.column) {
                moveItem.bundleName = layoutInfo[i].bundleName;
                moveItem.type = layoutInfo[i].type;
                moveItem.page = layoutInfo[i].page;
                moveItem.row = layoutInfo[i].row;
                moveItem.column = layoutInfo[i].column;
                layoutInfo.splice(i, 1);
            }
        }
        for (let i = layoutInfo.length - 1; i >= 0; i--) {
            if (layoutInfo[i].row == -1) {
                bottomBarLayoutInfo.push(layoutInfo[i]);
                layoutInfo.splice(i, 1);
            }
        }

        if (bottomBarLayoutInfo.length >= column) {
            this.#swapAppIcon(moveItem, endInfo, bottomBarLayoutInfo);
        } else {
            if (this.#isBottomEndPositionEmpty(endInfo, bottomBarLayoutInfo)) {
                moveItem.page = endInfo.page;
                moveItem.row = endInfo.row;
                moveItem.column = endInfo.column;
            } else {
                if (this.#isBottomEmptyPositionAtForward(endInfo, bottomBarLayoutInfo)) {
                    this.#moveBottomLayoutForward(moveItem, endInfo, bottomBarLayoutInfo);
                } else {
                    this.#moveBottomLayoutBackward(moveItem, endInfo, bottomBarLayoutInfo);
                }
            }
        }

        bottomBarLayoutInfo.push(moveItem);

        for (let i = 0;i < bottomBarLayoutInfo.length; i++) {
            layoutInfo.push(bottomBarLayoutInfo[i]);
        }
    }

    /**
     * Change position of the two application information.
     *
     * @param {object} moveItem - Started application information.
     * @param {object} endInfo - Ended application information.
     * @param {object} bottomBarLayoutInfo - BottomBar layout information.
     */
    #swapAppIcon = (moveItem, endInfo, bottomBarLayoutInfo) => {
        let tmp = {
            page: 0,
            row: 0,
            column: 0
        };
        for (let i = 0;i < bottomBarLayoutInfo.length; i++) {
            if (bottomBarLayoutInfo[i].row == endInfo.row && bottomBarLayoutInfo[i].column == endInfo.column) {
                tmp.page = bottomBarLayoutInfo[i].page;
                tmp.row = bottomBarLayoutInfo[i].row;
                tmp.column = bottomBarLayoutInfo[i].column;
                bottomBarLayoutInfo[i].page = moveItem.page;
                bottomBarLayoutInfo[i].row = moveItem.row;
                bottomBarLayoutInfo[i].column = moveItem.column;
                moveItem.page = tmp.page;
                moveItem.row = tmp.row;
                moveItem.column = tmp.column;
            }
        }
    }

    /**
     * Verify whether the moveEnd position is null while the moveEnd position is in bottomBar.
     *
     * @param {object} endInfo -  MoveEnd position information.
     * @param {object} bottomBarLayoutInfo - BottomBar layout information.
     * @return {boolean} Verify result.
     */
    #isBottomEndPositionEmpty = (endInfo, bottomBarLayoutInfo) => {
        let isEndPositionEmpty = true;
        for (let i = 0;i < bottomBarLayoutInfo.length; i++) {
            if (bottomBarLayoutInfo[i].row == endInfo.row && bottomBarLayoutInfo[i].column == endInfo.column) {
                isEndPositionEmpty = false;
                break;
            }
        }
        return isEndPositionEmpty;
    }

    /**
     * Verify whether there is an empty position in front of the moveEnd position.
     *
     * @param {object} endInfo -  MoveEnd position information.
     * @param {object} bottomBarLayoutInfo - BottomBar layout information.
     * @return {boolean} Verify result.
     */
    #isBottomEmptyPositionAtForward = (endInfo, bottomBarLayoutInfo) => {
        let isEmptyPositionAtForward = true;
        for (let i = endInfo.column;i < mGridConfig.column; i++) {
            isEmptyPositionAtForward = true;
            for (let j = 0;j < bottomBarLayoutInfo.length; j++) {
                if (bottomBarLayoutInfo[j].column == i) {
                    isEmptyPositionAtForward = false;
                }
            }
            if (isEmptyPositionAtForward) {
                break;
            }
        }
        return isEmptyPositionAtForward;
    }

    /**
     * The icons go forwards.
     *
     * @param {object} moveItem - The moving item.
     * @param {object} endInfo - MoveEnd position information.
     * @param {object} bottomBarLayoutInfo - BottomBar layout information.
     */
    #moveBottomLayoutForward = (moveItem, endInfo, bottomBarLayoutInfo) => {
        moveItem.page = endInfo.page;
        moveItem.row = endInfo.row;
        moveItem.column = endInfo.column;
        let cTmp = [];
        for (let j = 0;j < bottomBarLayoutInfo.length; j++) {
            cTmp.push(bottomBarLayoutInfo[j].column);
        }
        for (let i = endInfo.column;i < mGridConfig.column; i++) {
            let isColumnEmpty = true;
            for (let j = 0;j < bottomBarLayoutInfo.length; j++) {
                if (cTmp[j] == i) {
                    isColumnEmpty = false;
                    bottomBarLayoutInfo[j].column = cTmp[j] + 1;
                }
            }
            if (isColumnEmpty) {
                break;
            }
        }
    }

    /**
     * The icons go backwards.
     *
     * @param {object} moveItem - Moving item information.
     * @param {object} endInfo - MoveEnd position information.
     * @param {object} bottomBarLayoutInfo - BottomBar layout information.
     */
    #moveBottomLayoutBackward = (moveItem, endInfo, bottomBarLayoutInfo) => {
        moveItem.page = endInfo.page;
        moveItem.row = endInfo.row;
        moveItem.column = endInfo.column;
        let cTmp = [];
        for (let j = 0;j < bottomBarLayoutInfo.length; j++) {
            cTmp.push(bottomBarLayoutInfo[j].column);
        }
        for (let i = endInfo.column;i >= 0; i--) {
            let isColumnEmpty = true;
            for (let j = 0;j < bottomBarLayoutInfo.length; j++) {
                if (cTmp[j] == i) {
                    isColumnEmpty = false;
                    bottomBarLayoutInfo[j].column = cTmp[j] - 1;
                }
            }
            if (isColumnEmpty) {
                break;
            }
        }
    }

    /**
     * Move icon.
     *
     * @param {object} source - Start position information.
     * @param {object} destination - End position information.
     * @param {object} layoutInfo - Current layout information.
     * @param {object} startInfo - Recursion start position information.
     */
    #moveLayout = (source, destination, layoutInfo, startInfo) => {
        let couldMoveForward = this.#moveLayoutForward(source, destination, layoutInfo, startInfo);
        if (couldMoveForward) return;
        this.#moveLayoutBackward(source, destination, layoutInfo, startInfo);
    }

    /**
     * Icons go forwards.
     *
     * @param {object} source - Start position information.
     * @param {object} destination - End position information.
     * @param {object} layoutInfo - Current layout information.
     * @param {object} startInfo - Recursion start position information.
     * @return {boolean} Move result.
     */
    #moveLayoutForward = (source, destination, layoutInfo, startInfo) => {

        let startLayoutInfo = layoutInfo.find(item => {
            return item.page == source.page && item.row == source.row && item.column == source.column;
        });
        let endLayoutInfo = layoutInfo.find(item => {
            return item.page == destination.page && item.row == destination.row && item.column == destination.column;
        });

        if (endLayoutInfo != undefined && !(endLayoutInfo.page == startInfo.page && endLayoutInfo.row == startInfo.row && endLayoutInfo.column == startInfo.column)) {

            if (endLayoutInfo.row == mGridConfig.row - 1 && endLayoutInfo.column == mGridConfig.column - 1) {
                return false;
            }

            let nextPosition = {
                page: destination.page,
                row: destination.column == mGridConfig.column - 1 ? destination.row + 1 : destination.row,
                column: destination.column == mGridConfig.column - 1 ? 0 : destination.column + 1
            }
            let couldMoveForward = this.#moveLayoutForward(destination, nextPosition, layoutInfo, startInfo);
            if (!couldMoveForward) return false;
        }
        startLayoutInfo.page = destination.page;
        startLayoutInfo.row = destination.row;
        startLayoutInfo.column = destination.column;
        return true;
    }

    /**
     * Icons go backwards.
     *
     * @param {object} source - Start position information.
     * @param {object} destination - End position information.
     * @param {object} layoutInfo - Current layout information.
     * @param {object} startInfo - Recursion start position information.
     * @return {boolean} Move result.
     */
    #moveLayoutBackward = (source, destination, layoutInfo, startInfo) => {

        let startLayoutInfo = layoutInfo.find(item => {
            return item.page == source.page && item.row == source.row && item.column == source.column;
        });
        let endLayoutInfo = layoutInfo.find(item => {
            return item.page == destination.page && item.row == destination.row && item.column == destination.column;
        });

        if (endLayoutInfo != undefined && !(endLayoutInfo.page == startInfo.page && endLayoutInfo.row == startInfo.row && endLayoutInfo.column == startInfo.column)) {

            if (endLayoutInfo.row == 0 && endLayoutInfo.column == 0) {
                return false;
            }

            let nextPosition = {
                page: destination.page,
                row: (destination.column == 0 && destination.row > 0) ? destination.row - 1 : destination.row,
                column: destination.column == 0 ? mGridConfig.column - 1 : destination.column - 1
            }

            let couldMoveBackward = this.#moveLayoutBackward(destination, nextPosition, layoutInfo, startInfo);
            if (!couldMoveBackward) return false;
        }
        startLayoutInfo.page = destination.page;
        startLayoutInfo.row = destination.row;
        startLayoutInfo.column = destination.column;
        return true;
    }

    /**
     * Integrate layout information after install application.
     *
     * @return {object} Layout information.
     */
    regroupDataAfterInstall(callbackList) {
        mBundleInfoList = callbackList;
        return this.#pagingFiltering();
    }
}

