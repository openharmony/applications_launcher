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

import AppGridPresenter from '../../presenter/app/AppGridPresenter.js';
import LayoutConstants from '../../common/constants/LayoutConstants.js';
import CheckArray from '../../common/utils/CheckArray.js';
import Prompt from '@system.prompt';

const APP_INFO_REFRESH_DELAY = 500;
const UNINSTALL_SUCCESS = "UNINSTALL_SUCCESS";
const UNINSTALL_FAILED = "UNINSTALL_FAILED";
const UNINSTALL_PROHIBITED = "UNINSTALL_PROHIBITED";
const CELL_WIDTH_RATIO = 0.65;
const COLUMN_SPACING_RATIO = 0.35;
const PROPORTION = 0.85;
const KEY_ICON = "icon";
const KEY_NAME = "name";
const BOTTOM_BAR = 1;
const NO_FOCUS_INDEX = [-1, -1];
const FOCUSED_ITEM_SCALE = 1.05;
const UNFOCUSED_ITEM_SCALE = 1;
const BOTTOM_BAR_FOCUS_PAGE = -1;
const KEY_CODE_CONFIRM_ON_TV_REMOTE = 23;
const KEY_CODE_CONFIRM_ON_KEYBOARD_ENTER = 66;
const KEY_CODE_CONFIRM_ON_NUMERIC_KEYBOARD_ENTER = 160;
const APP_NAME_HEIGHT = 40;
const POSITION_WIDTH_RATIO = 0.85;

let mAppGridPresenter;
let mAppListInfo = [];
let mGridConfig;
let mPageCoordinateData = {
    numberOfRows: 0,
    numberOfColumns: 0,
    columnSpacing: 0,
    rowSpacing: 0,
    cellHeight: 0,
    cellWidth: 0,
    x_axis: [],
    y_axis: [],
    grid_x_axis: [],
    grid_y_axis: [],
    bottom_x_axis: [],
    bottom_y_axis: []
};
let mTouchPointCoordinate = {
    startX: 0,
    startY: 0,
    endX: 0,
    endY: 0
};

let mPageCount;
let mScreenBottomBarTop = 0;
let mScreenHeight = 0;
let mScreenWidth = 0;
let mSelectedAppItem;
let mSelectedAppIndex = 0;
let mLongPress = false;
let mResourceManager;
let mDefaultAppIcon;

export default {
    data: {
        index: 0,
        disabled: false,
        isSwappingPage: false,
        bottomBar: [],
        pageCoordinateData: {},
        gridAppsInfos: [],
        chooseDialogRightBtnStr: "",
        movingAppInfo: {
            appIcon: mDefaultAppIcon,
            appName: "APP",
            display: "none",
            top: 0,
            left: 0
        },
        selectedAppItem: {},
        focusItemIndex: NO_FOCUS_INDEX,
        BOTTOM_BAR_FOCUS_PAGE: BOTTOM_BAR_FOCUS_PAGE
    },

    onInit() {
        console.info("Launcher AppGridView onInit");
        globalThis.$globalR = this.$r.bind(this);
        mResourceManager = this.$app.$def.data.resourceManager;
        mAppGridPresenter = new AppGridPresenter(this.$app.$def.data.appModel, this.$app.$def.data.mmiModel,
            this.$app.$def.data.settingsModel, this.$app.$def.data.appListInfoCacheManager);
        mAppGridPresenter.registerAppListChangeCallback(this.getGridListCallback.bind(this));
        mScreenHeight = this.$app.$def.data.screenHeight * PROPORTION;
        mScreenWidth = this.$app.$def.data.screenWidth;
        mScreenBottomBarTop = this.$app.$def.data.screenHeight * PROPORTION;
        mDefaultAppIcon = globalThis.$globalR('image.icon_default');
    },

    onShow() {
        console.info("Launcher AppGridView onShow");
        let isLayoutMigrate = mAppGridPresenter.layoutMigrate(LayoutConstants.Grid);
        if (isLayoutMigrate) {
            return;
        }
        let isLayoutConfigUpdated = mAppGridPresenter.updateLayoutConfig();
        if (isLayoutConfigUpdated) {
            this.loadData();
        }
    },

    /**
     * Load application data for grid layout.
     */
    loadData() {
        console.info("Launcher AppGridView loadData");
        mGridConfig = mAppGridPresenter.getGridConfig();
        this.pageCoordinateData = getPageCoordinateData();
        mAppGridPresenter.getGridList(this.getGridListCallback.bind(this));
    },

    onDestroy() {
        console.info("Launcher AppGridView onDestroy");
        mAppGridPresenter.unregisterAppListChangeCallback();
    },

    /**
     * Open the choosen application.
     *
     * @param {string} abilityName - Abilityname of the application.
     * @param {string} bundleName - Bundlename of the application.
     */
    openApplication(abilityName, bundleName) {
        console.info("Launcher openApplication " + bundleName + " + " + abilityName);
        mAppGridPresenter.jumpTo(abilityName, bundleName);
    },

    /**
     * Jump to setting.
     */
    intoSetting() {
        console.info("Launcher AppGridView intoSetting");
        this.$element('chooseDialog').close();
        mAppGridPresenter.jumpToSetting();
    },

    /**
     * Open uninstall dialog.
     *
     * @param {object} e - Event.
     */
    cancelDialog(e) {
        Prompt.showToast({
            message: 'Dialog cancelled'
        })
    },

    /**
     * Close uninstall dialog.
     *
     * @param {object} e - Event.
     */
    cancelSchedule(e) {
        this.$element('simpleDialog').close();
        Prompt.showToast({
            message: this.$t('strings.cancelled')
        })
    },

    /**
     * Uninstall the choosen application and close the dialog.
     *
     * @param {object} e - Event.
     */
    uninstallApplication(e) {
        this.$element('simpleDialog').close();
        if (this.selectedAppItem.bundleName != null) {
            mAppGridPresenter.uninstallApp(this.selectedAppItem.bundleName, this.selectedAppItem.System, this.getUninstallApp.bind(this));
        }
    },

    /**
     * Get the result after uninstall application.
     *
     * @param {object} callback - Uninstall result.
     */
    getUninstallApp(callback) {
        console.info("Launcher AppGridView getUninstallApp");
        let success = callback;
        if (success == UNINSTALL_PROHIBITED) {
            Prompt.showToast({
                message: this.$t('strings.prohibited')
            });
        } else if (success == UNINSTALL_SUCCESS) {
            Prompt.showToast({
                message: this.$t('strings.uninstall_succeeded')
            });
            mAppListInfo = [];
            this.gridAppsInfos = [];
            mAppGridPresenter.getGridList(this.getGridListCallback.bind(this));
        } else if (success == UNINSTALL_FAILED) {
            Prompt.showToast({
                message: this.$t('strings.uninstall_failed')
            });
        }
    },

    /**
     * Change index after swipe page.
     *
     * @param {object} e - Event.
     */
    pageChange(e) {
        this.index = e.index;
    },

    /**
     * Get grid applications' information and show them.
     *
     * @param {object} callbackData - Grid applications' information.
     */
    getGridListCallback(callbackData) {
        console.info("Launcher AppGridView getGridListCallback");
        mAppListInfo = callbackData;
        console.info("Launcher AppGridView getGridListCallback this.appList.length = " + mAppListInfo.length);
        this.integrateData();
        this.initFocus();
        this.updateAppInfos();
    },

    /**
     * Update applications' icon and name.
     */
    updateAppInfos() {
        setTimeout(() => {
            console.info("Launcher AppGridView getGridListCallback setTimeout this.appList.length = " + this.gridAppsInfos.length);
            for (let i = 0; i < this.gridAppsInfos.length; i++) {
                let page = this.gridAppsInfos[i];
                console.info("Launcher AppGridView getGridListCallback setTimeout page = " + i);
                for (let j = 0; j < page.length; j++) {
                    let element = page[j];
                    this.$child('icon-' + element.bundleName).updateIcon();
                    this.$child('name-' + element.bundleName).updateName();
                }
            }
            console.info("Launcher AppGridView updateAppInfos bottomBar.length = " + this.bottomBar.length);
            for (let i = 0; i < this.bottomBar.length; i++) {
                let element = this.bottomBar[i];
                this.$child('icon-' + element.bundleName).updateIcon();
                this.$child('name-' + element.bundleName).updateName();
            }
        }, APP_INFO_REFRESH_DELAY);
    },

    /**
     * LongPress event for application.
     *
     * @param {object} appItem - The pressed application.
     * @param {number} index - The application's index in the page.
     */
    longPress(appItem, index) {
        console.info("Launcher AppGridView longPress index: " + index);
        mSelectedAppItem = appItem;
        this.selectedAppItem = appItem;
        this.movingAppInfo.appIcon = mResourceManager.getAppResourceCache(this.selectedAppItem.bundleName, KEY_ICON);
        this.movingAppInfo.appName = mResourceManager.getAppResourceCache(this.selectedAppItem.bundleName, KEY_NAME);
        mSelectedAppIndex = index;
        mLongPress = true;
        this.disabled = true;
        this.$element('simpleDialog').show();
    },

    /**
     * Touchstart event for launcher.
     *
     * @param {object} e - Event.
     */
    touchStart(e) {
        console.info("Launcher AppGridView touchStart globalX = " + e.touches[0].globalX + " globalY = " + e.touches[0].globalY);
        mTouchPointCoordinate.startX = e.touches[0].globalX,
        mTouchPointCoordinate.startY = e.touches[0].globalY,
        this.movingAppInfo.top = e.touches[0].globalY;
        this.movingAppInfo.left = e.touches[0].globalX;
    },

    /**
     * Touchmove event for launcher.
     *
     * @param {object} e - Event.
     */
    touchMove(e) {
        if(!mLongPress) {
            return;
        }
        this.$element('simpleDialog').close();
        this.movingAppInfo.display = 'flex';
        if (this.selectedAppItem.bottomBarFlag == BOTTOM_BAR) {
            this.bottomBar[mSelectedAppIndex].opacity = 0;
        } else {
            this.gridAppsInfos[mSelectedAppItem.page][mSelectedAppIndex].opacity = 0;
        }
        this.movingAppInfo.top = e.touches[0].globalY - mPageCoordinateData.cellWidth / 2;
        this.movingAppInfo.left = e.touches[0].globalX - mPageCoordinateData.cellWidth / 2;
        if (this.movingAppInfo.left < 0 && !this.isSwappingPage && this.index > 0 && this.movingAppInfo.top < mScreenHeight) {
            this.index -= 1;
            this.movingIconSwapPageDelay();
        } else if (this.movingAppInfo.left + mPageCoordinateData.cellWidth > 720 && !this.isSwappingPage && this.movingAppInfo.top < mScreenHeight) {
            if (this.index == mPageCount - 1) {
                this.addBlankPage();
            } else {
                this.index += 1;
            }
            this.movingIconSwapPageDelay();
        }
    },

    /**
     * Touchend event for launcher.
     *
     * @param {object} e - Event.
     */
    touchEnd(e) {
        console.info("Launcher AppGridView touchEnd globalX = " + e.changedTouches[0].globalX + " globalY = " + e.changedTouches[0].globalY);
        this.movingAppInfo.display = 'none';
        mTouchPointCoordinate.endX = e.changedTouches[0].globalX;
        mTouchPointCoordinate.endY = e.changedTouches[0].globalY;
        let startColumn = 0, startRow = 0, startPage = this.index;
        let endColumn = 0, endRow = 0;
        let appInfo = mAppListInfo.find(item => {
            return item.bundleName == mSelectedAppItem.bundleName;
        });
        if (appInfo != '' && appInfo != undefined && appInfo != null) {
            startColumn = appInfo.column;
            startRow = appInfo.row;
            startPage = appInfo.page;
        }
        if (mTouchPointCoordinate.endY > mPageCoordinateData.bottom_y_axis[0]) {
            endRow = -1;
        } else {
            for (let i = 0; i < mPageCoordinateData.numberOfRows; i++) {
                if (mTouchPointCoordinate.endY < mPageCoordinateData.grid_y_axis[i]) {
                    endRow = i - 1;
                    break;
                } else {
                    endRow = mPageCoordinateData.numberOfRows - 1;
                }
            }
        }
        for (let i = 0; i < mPageCoordinateData.numberOfColumns; i++) {
            if (mTouchPointCoordinate.endX < mPageCoordinateData.grid_x_axis[i]) {
                endColumn = i - 1;
                break;
            } else {
                endColumn = mPageCoordinateData.numberOfColumns - 1;
            }
        }
        if (mLongPress) {
            let startInfo = {
                page: startPage,
                row: startRow,
                column: startColumn
            }
            let endInfo = {
                page: this.index,
                row: endRow,
                column: endColumn
            }
            mAppListInfo = mAppGridPresenter.layoutAdjustment(startInfo, endInfo);
            this.integrateData();
            this.initFocus();
            this.updateAppInfos();
        }
        mLongPress = false;
        this.disabled = false;
    },

    /**
     * Integrate applications' information.
     */
    integrateData() {
        console.info("Launcher AppGridView integrateData");
        mPageCount = mAppGridPresenter.getGridPageCount();
        let pageMax = 0;
        for (let i = 0;i < mAppListInfo.length; i++) {
            if (pageMax < mAppListInfo[i].page) {
                pageMax = mAppListInfo[i].page;
            }
        }
        if (mPageCount < pageMax + 1) {
            mPageCount = pageMax + 1;
        }
        let maxColumn = mGridConfig.column;
        this.bottomBar = [];
        let page = [];
        for (let i = 0;i < mPageCount; i++) {
            page.push([]);
        }
        this.gridAppsInfos = page;
        for (let i = 0;i < mAppListInfo.length; i++) {
            let iconInfo = {
                AppId: mAppListInfo[i].AppId,
                labelId: mAppListInfo[i].labelId,
                AppName: mAppListInfo[i].AppName,
                AppIcon: mAppListInfo[i].AppIcon,
                bundleName: mAppListInfo[i].bundleName,
                System: mAppListInfo[i].System,
                abilityName: mAppListInfo[i].abilityName,
                type: 0,
                page: mAppListInfo[i].page,
                wPixel: mPageCoordinateData.cellWidth,
                hPixel: mPageCoordinateData.cellHeight,
                wPosition: mPageCoordinateData.positionWidth,
                marginPosition: mPageCoordinateData.positionMargin,
                x: mPageCoordinateData.x_axis[mAppListInfo[i].column],
                y: mPageCoordinateData.y_axis[mAppListInfo[i].row],
                opacity: 1,
                scale: 1,
                bottomBarFlag:0
            }
            if (mAppListInfo[i].row == -1) {
                if (this.bottomBar.length < maxColumn) {
                    iconInfo.y = mPageCoordinateData.bottom_y_axis[0];
                    iconInfo.bottomBarFlag = 1;
                    this.bottomBar.push(iconInfo);
                }
                continue;
            }
            this.gridAppsInfos[mAppListInfo[i].page].push(iconInfo);
        }
    },

    /**
     * Longpress event for launcher.
     */
    onPageLongPress() {
        this.chooseDialogRightBtnStr = this.getBlankPageBtnStr();
        this.$element('chooseDialog').show();
    },

    /**
     * Get strings for addBlankPageButton.
     *
     * @return {string} AddBlankPageButton Strings.
     */
    getBlankPageBtnStr() {
        return this.isBlankPage() ? this.$t('strings.delete_blank_page') : this.$t('strings.add_blank_page');
    },

    /**
     * Detemine whether the page is empty.
     *
     * @return {boolean} Verify result.
     */
    isBlankPage() {
        return this.gridAppsInfos[this.index].length == 0;
    },

    /**
     * Add or delete the choosen blank page.
     */
    addOrDeleteBlankPage() {
        this.$element('chooseDialog').close();
        if (this.isBlankPage()) {
            this.deleteBlankPage();
        } else {
            this.addBlankPage();
        }
    },

    /**
     * Add a blank page.
     */
    addBlankPage() {
        console.info("Launcher AppGridView addBlankPage");
        mAppGridPresenter.setGridPageCount(mPageCount + 1);
        this.integrateData();
        this.initFocus();
        this.index = mPageCount - 1;
    },

    /**
     * Delete the choosen blank page.
     */
    deleteBlankPage() {
        console.info("Launcher AppGridView deleteBlankPage");
        mAppGridPresenter.deleteGridPage(this.index);
        if (this.index == this.gridAppsInfos.length - 1) {
            this.index = this.index - 1;
        }
        mAppGridPresenter.setGridPageCount(mPageCount - 1);
        mAppListInfo = mAppGridPresenter.getAppListInfo();
        this.integrateData();
        this.initFocus();
    },

    /**
     * Delay when swap page with icon.
     */
    movingIconSwapPageDelay() {
        this.isSwappingPage = true;
        setTimeout(() => {
            this.isSwappingPage = false;
        }, 1000);
    },

    /**
     * Focus event for application icon.
     *
     * @param {number} page - The index of the page where the focused application is in.
     * @param {number} idx - The index of the application in the page.
     */
    focus(page, idx) {
        if (!(CheckArray.arrayEqual(this.focusItemIndex, NO_FOCUS_INDEX))) {
            this.gridAppsInfos[this.focusItemIndex[0]][this.focusItemIndex[1]].scale = UNFOCUSED_ITEM_SCALE;
        }
        this.focusItemIndex = [page, idx];
        if (page == BOTTOM_BAR_FOCUS_PAGE) {
            this.bottomBar[idx].scale = FOCUSED_ITEM_SCALE;
        } else {
            this.gridAppsInfos[page][idx].scale = FOCUSED_ITEM_SCALE;
        }
    },

    /**
     * Init the focus status.
     */
    initFocus() {
        if (!(CheckArray.arrayEqual(this.focusItemIndex, NO_FOCUS_INDEX))) {
            if (this.focusItemIndex[0] != BOTTOM_BAR_FOCUS_PAGE) {
                if (this.gridAppsInfos[this.focusItemIndex[0]][this.focusItemIndex[1]] != undefined) {
                    this.gridAppsInfos[this.focusItemIndex[0]][this.focusItemIndex[1]].scale = FOCUSED_ITEM_SCALE;
                }
            } else {
                if (this.bottomBar[this.focusItemIndex[1]] != undefined) {
                    this.bottomBar[this.focusItemIndex[1]].scale = FOCUSED_ITEM_SCALE;
                }
            }
        }
    },

    /**
     * Key event of the application icon.
     *
     * @param {object} KeyEvent - Event.
     */
    onAppGridKeyEvent(KeyEvent) {
        console.info("Launcher AppGridView onAppGridKeyEvent KeyEvent: " + KeyEvent);
        switch (KeyEvent.code) {
            case KEY_CODE_CONFIRM_ON_TV_REMOTE:
            case KEY_CODE_CONFIRM_ON_KEYBOARD_ENTER:
            case KEY_CODE_CONFIRM_ON_NUMERIC_KEYBOARD_ENTER:
                this.openApplication(mAppListInfo[this.focusItemIndex[0][this.focusItemIndex[1]]].bundleName);
                break;
            default:
                break;
        }
    },
}

/**
 * Calculate the coordinate.
 *
 * @return {object} Coordinate information.
 */
function getPageCoordinateData() {
    let column = mGridConfig.column;
    let row = mGridConfig.row;
    mPageCoordinateData.numberOfColumns = column;
    mPageCoordinateData.numberOfRows = row;
    if ((mScreenWidth / column) < (mScreenHeight / row)) {
        mPageCoordinateData.cellWidth = (mScreenWidth / column) * CELL_WIDTH_RATIO;
        mPageCoordinateData.columnSpacing = ((mScreenWidth / column) * COLUMN_SPACING_RATIO) / 2;
        mPageCoordinateData.cellHeight = mPageCoordinateData.cellWidth + APP_NAME_HEIGHT;
        mPageCoordinateData.rowSpacing = (mScreenHeight - mPageCoordinateData.cellHeight * row) / (row * 2);
        mPageCoordinateData.positionWidth = (mScreenWidth / column) * POSITION_WIDTH_RATIO;
        mPageCoordinateData.positionMargin = (mPageCoordinateData.positionWidth - mPageCoordinateData.cellWidth) / 2;
    } else {
        mPageCoordinateData.cellWidth = (mScreenHeight / row) - APP_NAME_HEIGHT;
        mPageCoordinateData.columnSpacing = (mScreenWidth - (mPageCoordinateData.cellWidth * column)) / (column * 2);
        mPageCoordinateData.cellHeight = mScreenHeight / row;
        mPageCoordinateData.rowSpacing = (mScreenHeight - (mPageCoordinateData.cellHeight * row)) / (row * 2);
        mPageCoordinateData.positionWidth = (mScreenWidth / column) * POSITION_WIDTH_RATIO > mPageCoordinateData.cellWidth ? (mScreenWidth / column) * POSITION_WIDTH_RATIO : mPageCoordinateData.cellWidth;
        mPageCoordinateData.positionMargin = (mPageCoordinateData.positionWidth - mPageCoordinateData.cellWidth) / 2;
    }
    mPageCoordinateData.x_axis = [],
    mPageCoordinateData.y_axis = [],
    mPageCoordinateData.grid_x_axis = [],
    mPageCoordinateData.grid_y_axis = [],
    mPageCoordinateData.bottom_x_axis = [],
    mPageCoordinateData.bottom_y_axis = []
    for (let i = 0; i < row; i++) {
        let iconPositioningY = (i * 2 + 1) * mPageCoordinateData.rowSpacing + i * mPageCoordinateData.cellHeight;
        let touchPositioningY = i * (mPageCoordinateData.rowSpacing * 2 + mPageCoordinateData.cellHeight);
        mPageCoordinateData.y_axis.push(iconPositioningY);
        mPageCoordinateData.grid_y_axis.push(touchPositioningY);
    }

    for (let i = 0; i < column; i++) {
        let iconPositioningX = (i * 2 + 1) * mPageCoordinateData.columnSpacing + i * mPageCoordinateData.cellWidth - mPageCoordinateData.positionMargin;
        let touchPositioningX = i * (mPageCoordinateData.columnSpacing * 2 + mPageCoordinateData.cellWidth);
        mPageCoordinateData.x_axis.push(iconPositioningX);
        mPageCoordinateData.grid_x_axis.push(touchPositioningX);
        mPageCoordinateData.bottom_x_axis.push(iconPositioningX);
    }

    for (let i = 0; i < column; i++) {
        mPageCoordinateData.bottom_y_axis.push(mScreenBottomBarTop);
    }

    return mPageCoordinateData;
}
