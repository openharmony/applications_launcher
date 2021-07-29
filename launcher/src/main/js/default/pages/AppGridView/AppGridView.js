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
const BOTTOM_BAR_FOCUS_PAGE = -1;
const BOTTOM_BAR_COLUMN = -1;
const BOTTOM_BAR_ROW = -1;
const KEY_CODE_CONFIRM_ON_TV_REMOTE = 23;
const KEY_CODE_CONFIRM_ON_KEYBOARD_ENTER = 66;
const KEY_CODE_CONFIRM_ON_NUMERIC_KEYBOARD_ENTER = 160;
const APP_NAME_HEIGHT = 40;
const POSITION_WIDTH_RATIO = 0.85;

let mAppGridPresenter;
let mAppListInfo = {};
let mGridConfig;
let mPageCoordinateData = {
    numberOfRows: 0,
    numberOfColumns: 0,
    columnSpacing: 0,
    rowSpacing: 0,
    cellHeight: 0,
    cellWidth: 0,
    xAxis: [],
    yAxis: [],
    gridXAxis: [],
    gridYAxis: [],
    bottomXAxis: [],
    bottomYAxis: []
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
        bottomBarWidth: 0,
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
        uninstallAppName: ''
    },

    onInit() {
        console.info("Launcher AppGridView onInit");
        globalThis.$globalR = this.$r.bind(this);
        mResourceManager = this.$app.$def.data.resourceManager;
        mAppGridPresenter = new AppGridPresenter(this.$app.$def.data.appModel, this.$app.$def.data.mmiModel,
            this.$app.$def.data.settingsModel, this.$app.$def.data.appListInfoCacheManager,
            this.$app.$def.data.resourceManager);
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
     * Open the application which is in the bottomBar.
     *
     * @param {Object} e - Event.
     */
    openApplicationBottomBar(e) {
        this.openApplication(e.detail.abilityName, e.detail.bundleName);
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
     * @param {Object} e - Event.
     */
    cancelDialog(e) {
        Prompt.showToast({
            message: 'Dialog cancelled'
        });
    },

    /**
     * Close uninstall dialog.
     *
     * @param {Object} e - Event.
     */
    cancelSchedule(e) {
        this.$element('simpleDialog').close();
        Prompt.showToast({
            message: this.$t('strings.cancelled')
        });
    },

    /**
     * Uninstall the choosen application and close the dialog.
     *
     * @param {Object} e - Event.
     */
    uninstallApplication(e) {
        this.$element('simpleDialog').close();
        if (this.selectedAppItem.bundleName != null) {
            mAppGridPresenter.uninstallApp(this.selectedAppItem.bundleName, this.selectedAppItem.System,
                this.getUninstallApp.bind(this));
        }
    },

    /**
     * Get the result after uninstall application.
     *
     * @param {Object} result - Uninstall result.
     */
    getUninstallApp(result) {
        console.info("Launcher AppGridView getUninstallApp callback = " + result);
        if (result === UNINSTALL_PROHIBITED) {
            Prompt.showToast({
                message: this.$t('strings.prohibited')
            });
        } else if (result === UNINSTALL_SUCCESS) {
            Prompt.showToast({
                message: this.$t('strings.uninstall_succeeded')
            });
            mAppListInfo = {};
            this.gridAppsInfos = [];
            mAppGridPresenter.getGridList(this.getGridListCallback.bind(this));
        } else if (result === UNINSTALL_FAILED) {
            Prompt.showToast({
                message: this.$t('strings.uninstall_failed')
            });
        }
    },

    /**
     * Change index after swipe page.
     *
     * @param {Object} e - Event.
     */
    pageChange(e) {
        this.index = e.index;
    },

    /**
     * Get grid applications' information and show them.
     *
     * @param {Object} callbackData - Grid applications' information.
     */
    getGridListCallback(callbackData) {
        console.info("Launcher AppGridView getGridListCallback");
        mAppListInfo = callbackData;
        console.info("Launcher AppGridView getGridListCallback this.appList.length = "
            + mAppListInfo.appListInfo.length);
        console.info("Launcher AppGridView getGridListCallback this.bottomBar.length = "
            + mAppListInfo.appBottomBarInfo.length);
        this.integrateData();
        this.updateAppInfos();
    },

    /**
     * Update applications' icon and name.
     */
    updateAppInfos() {
        setTimeout(() => {
            console.info("Launcher AppGridView getGridListCallback setTimeout this.appList.length = "
                + this.gridAppsInfos.length);
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
                this.$child('bottomBarCon').$child('icon-' + element.bundleName).updateIcon();
                this.$child('bottomBarCon').$child('name-' + element.bundleName).updateName();
            }
        }, APP_INFO_REFRESH_DELAY);
    },

    /**
     * LongPress event for application.
     *
     * @param {Object} appItem - The pressed application.
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
        this.uninstallAppName = mAppGridPresenter.getAppName(appItem.bundleName);
        setTimeout(() => {
            this.$element('simpleDialog').show();
        }, APP_INFO_REFRESH_DELAY)
    },

    /**
     * LongPress event for applications in the bottomBar.
     *
     * @param {Object} e - Event.
     */
    longPressBottomBar(e) {
        this.longPress(e.detail.appItem, e.detail.index);
    },

    /**
     * Touchstart event for launcher.
     *
     * @param {Object} e - Event.
     */
    touchStart(e) {
        console.info("Launcher AppGridView touchStart globalX = " + e.touches[0].globalX + " globalY = "
            + e.touches[0].globalY);
        mTouchPointCoordinate.startX = e.touches[0].globalX;
        mTouchPointCoordinate.startY = e.touches[0].globalY;
        this.movingAppInfo.top = e.touches[0].globalY;
        this.movingAppInfo.left = e.touches[0].globalX;
    },

    /**
     * Touchmove event for launcher.
     *
     * @param {Object} e - Event.
     */
    touchMove(e) {
        if (!mLongPress) {
            return;
        }
        this.$element('simpleDialog').close();
        this.movingAppInfo.display = 'flex';
        if (this.selectedAppItem.bottomBarFlag === BOTTOM_BAR) {
            this.bottomBar[mSelectedAppIndex].opacity = 0;
        } else {
            this.gridAppsInfos[mSelectedAppItem.page][mSelectedAppIndex].opacity = 0;
        }
        this.movingAppInfo.top = e.touches[0].globalY - mPageCoordinateData.cellWidth / 2;
        this.movingAppInfo.left = e.touches[0].globalX - mPageCoordinateData.cellWidth / 2;
        if (this.movingAppInfo.left < 0 && !this.isSwappingPage && this.index > 0 && this.movingAppInfo.top
            < mScreenHeight) {
            this.index -= 1;
            this.movingIconSwapPageDelay();
        } else if (this.movingAppInfo.left + mPageCoordinateData.cellWidth > 720 && !this.isSwappingPage
                    && this.movingAppInfo.top < mScreenHeight) {
            if (this.index === mPageCount - 1) {
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
     * @param {Object} e - Event.
     */
    touchEnd(e) {
        console.info("Launcher AppGridView touchEnd globalX = "
            + e.changedTouches[0].globalX + " globalY = " + e.changedTouches[0].globalY);
        this.movingAppInfo.display = 'none';
        mTouchPointCoordinate.endX = e.changedTouches[0].globalX;
        mTouchPointCoordinate.endY = e.changedTouches[0].globalY;
        if (mLongPress) {
            let startInfo = this.getStartInfo();
            let endInfo = this.getEndInfo();
            mAppListInfo = mAppGridPresenter.layoutAdjustment(startInfo, endInfo, this.bottomBar);
            this.integrateData();
            this.updateAppInfos();
        }
        mLongPress = false;
        this.disabled = false;
    },

    /**
     * Get touchStart information for touchEnd event.
     *
     * @return {Object} Start position information.
     */
    getStartInfo() {
        let startColumn = 0;
        let startRow = 0;
        let startPage = this.index;
        let appInfo = mAppListInfo.appListInfo.find(item => {
            return item.bundleName === mSelectedAppItem.bundleName;
        });
        if (appInfo !== '' && appInfo != undefined && appInfo != null) {
            startColumn = appInfo.column;
            startRow = appInfo.row;
            startPage = appInfo.page;
        }
        let startInfo = {};
        if (mTouchPointCoordinate.startY >= mPageCoordinateData.bottomYAxis[0]) {
            startInfo = {
                page: BOTTOM_BAR_FOCUS_PAGE,
                row: BOTTOM_BAR_ROW,
                column: BOTTOM_BAR_COLUMN,
                startX: mTouchPointCoordinate.startX,
                startY: mTouchPointCoordinate.startY
            };
        } else {
            startInfo = {
                page: startPage,
                row: startRow,
                column: startColumn,
                startX: mTouchPointCoordinate.startX,
                startY: mTouchPointCoordinate.startY
            };
        }
        return startInfo;
    },

    /**
     * Get touchEnd information for touchEnd event.
     *
     * @return {Object} End position information.
     */
    getEndInfo() {
        let endRow = 0;
        let endColumn = 0;
        let endInfo = {};
        if (mTouchPointCoordinate.endY > mPageCoordinateData.bottomYAxis[0]) {
            endInfo = {
                page: BOTTOM_BAR_FOCUS_PAGE,
                row: BOTTOM_BAR_ROW,
                column: BOTTOM_BAR_COLUMN,
                endX: mTouchPointCoordinate.endX,
                endY: mTouchPointCoordinate.endY
            };
        } else {
            for (let i = 0; i < mPageCoordinateData.numberOfRows; i++) {
                if (mTouchPointCoordinate.endY < mPageCoordinateData.gridYAxis[i]) {
                    endRow = i - 1;
                    break;
                }
            }
            for (let i = 0; i < mPageCoordinateData.numberOfColumns; i++) {
                if (mTouchPointCoordinate.endX < mPageCoordinateData.gridXAxis[i]) {
                    endColumn = i - 1;
                    break;
                }
            }
            endInfo = {
                page: this.index,
                row: endRow,
                column: endColumn,
                endX: mTouchPointCoordinate.endX,
                endY: mTouchPointCoordinate.endY
            };
        }
        return endInfo;
    },

    /**
     * Integrate applications' information.
     */
    integrateData() {
        console.info("Launcher AppGridView integrateData");
        this.integrateSwiper();
        this.integrateBottomBar();
    },

    /**
     * Integrate swiper's information.
     */
    integrateSwiper() {
        mPageCount = mAppGridPresenter.getGridPageCount();
        let pageMax = 0;
        let appListInfo = mAppListInfo.appListInfo;
        for (let i = 0; i < appListInfo.length; i++) {
            if (pageMax < appListInfo[i].page) {
                pageMax = appListInfo[i].page;
            }
        }
        if (mPageCount < pageMax + 1) {
            mPageCount = pageMax + 1;
        }
        let page = [];
        for (let i = 0; i < mPageCount; i++) {
            page.push([]);
        }
        this.gridAppsInfos = page;
        for (let i = 0; i < appListInfo.length; i++) {
            let iconInfo = {
                AppId: appListInfo[i].AppId,
                labelId: appListInfo[i].labelId,
                AppName: appListInfo[i].AppName,
                AppIcon: appListInfo[i].AppIcon,
                bundleName: appListInfo[i].bundleName,
                System: appListInfo[i].System,
                abilityName: appListInfo[i].abilityName,
                type: 0,
                page: appListInfo[i].page,
                wPixel: mPageCoordinateData.cellWidth,
                hPixel: mPageCoordinateData.cellHeight,
                wPosition: mPageCoordinateData.positionWidth,
                marginPosition: mPageCoordinateData.positionMargin,
                x: mPageCoordinateData.xAxis[appListInfo[i].column],
                y: mPageCoordinateData.yAxis[appListInfo[i].row],
                opacity: 1,
                scale: 1,
                bottomBarFlag: 0
            };
            this.gridAppsInfos[appListInfo[i].page].push(iconInfo);
        }
    },

    /**
     * Integrate bottomBar's information.
     */
    integrateBottomBar() {
        let appBottomBarInfo = mAppListInfo.appBottomBarInfo;
        this.bottomBar = [];
        let bottomBarLength = appBottomBarInfo.length;
        if (bottomBarLength === 0) {
            this.bottomBarWidth = mScreenWidth;
        } else {
            for (let i = 0; i < appBottomBarInfo.length; i++) {
                let iconInfo = {
                    AppId: appBottomBarInfo[i].AppId,
                    labelId: appBottomBarInfo[i].labelId,
                    AppName: appBottomBarInfo[i].AppName,
                    AppIcon: appBottomBarInfo[i].AppIcon,
                    bundleName: appBottomBarInfo[i].bundleName,
                    System: appBottomBarInfo[i].System,
                    abilityName: appBottomBarInfo[i].abilityName,
                    type: appBottomBarInfo[i].type,
                    wPixel: mPageCoordinateData.cellWidth,
                    hPixel: mPageCoordinateData.cellHeight,
                    opacity: 1,
                    scale: 1,
                    bottomBarFlag: BOTTOM_BAR
                };
                if (bottomBarLength === 1) {
                    this.bottomBarWidth = mPageCoordinateData.cellWidth;
                    iconInfo.wPosition = mPageCoordinateData.cellWidth;
                    iconInfo.x = (mScreenWidth - mPageCoordinateData.cellWidth) / 2;
                } else if (bottomBarLength === 2) {
                    this.bottomBarWidth = (mPageCoordinateData.cellWidth + mPageCoordinateData.columnSpacing * 2) * 2;
                    iconInfo.wPosition = mPageCoordinateData.cellWidth + mPageCoordinateData.columnSpacing * 2;
                    iconInfo.x = (mScreenWidth - mPageCoordinateData.cellWidth * 2
                                - mPageCoordinateData.columnSpacing * 2) / 2 + i * (mPageCoordinateData.cellWidth
                                + mPageCoordinateData.columnSpacing * 2);
                } else if (bottomBarLength === 3) {
                    this.bottomBarWidth = ((mScreenWidth - mPageCoordinateData.cellWidth * bottomBarLength)
                                         / (bottomBarLength + 1) + mPageCoordinateData.cellWidth) * 3;
                    iconInfo.wPosition = (mScreenWidth - mPageCoordinateData.cellWidth * bottomBarLength)
                                        / (bottomBarLength + 1) + mPageCoordinateData.cellWidth;
                    iconInfo.x = (mScreenWidth - mPageCoordinateData.cellWidth * bottomBarLength)
                                / (bottomBarLength + 1) * (i + 1) + mPageCoordinateData.cellWidth * i;
                } else if (bottomBarLength > 3) {
                    this.bottomBarWidth = mScreenWidth;
                    iconInfo.wPosition = mScreenWidth / bottomBarLength;
                    iconInfo.x = (mScreenWidth / bottomBarLength - mPageCoordinateData.cellWidth) / 2
                                + mScreenWidth / bottomBarLength * i;
                }
                this.bottomBar.push(iconInfo);
            }
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
        return this.gridAppsInfos[this.index].length === 0;
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
        this.index = mPageCount - 1;
    },

    /**
     * Delete the choosen blank page.
     */
    deleteBlankPage() {
        console.info("Launcher AppGridView deleteBlankPage");
        mAppGridPresenter.deleteGridPage(this.index);
        if (this.index === this.gridAppsInfos.length - 1) {
            this.index = this.index - 1;
        }
        mAppGridPresenter.setGridPageCount(mPageCount - 1);
        mAppListInfo = mAppGridPresenter.getAppListInfo();
        this.integrateData();
    },

    /**
     * Delay when swap page with icon.
     */
    movingIconSwapPageDelay() {
        this.isSwappingPage = true;
        setTimeout(() => {
            this.isSwappingPage = false;
        }, APP_INFO_REFRESH_DELAY);
    },

    /**
     * Focus event for application icon.
     *
     * @param {number} page - The index of the page where the focused application is in.
     * @param {number} idx - The index of the application in the page.
     */
    focus(page, idx) {
        this.focusItemIndex = [page, idx];
    },

    /**
     * Focus event for bottomBar application icon.
     * @param {Object} e - Event.
     */
    focusBottomBar(e) {
        this.focus(e.detail.page, e.detail.idx);
    },

    /**
     * Key event of the application icon.
     *
     * @param {Object} KeyEvent - Event.
     */
    onAppGridKeyEvent(KeyEvent) {
        console.info("Launcher AppGridView onAppGridKeyEvent KeyEvent: " + KeyEvent);
        switch (KeyEvent.code) {
            case KEY_CODE_CONFIRM_ON_TV_REMOTE:
            case KEY_CODE_CONFIRM_ON_KEYBOARD_ENTER:
            case KEY_CODE_CONFIRM_ON_NUMERIC_KEYBOARD_ENTER:
                if (!(CheckArray.arrayEqual(this.focusItemIndex, NO_FOCUS_INDEX))) {
                    if (this.focusItemIndex[0] === BOTTOM_BAR_FOCUS_PAGE) {
                        let focusIcon = this.bottomBar[this.focusItemIndex[1]];
                        this.openApplication(focusIcon.bundleName, focusIcon.abilityName);
                    } else {
                        let focusIcon = this.gridAppsInfos[this.focusItemIndex[0]][this.focusItemIndex[1]];
                        this.openApplication(focusIcon.bundleName, focusIcon.abilityName);
                    }
                }
                break;
            default:
                break;
        }
    },
};

/**
 * Calculate the coordinate.
 *
 * @return {Object} Coordinate information.
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
        mPageCoordinateData.positionWidth =
            (mScreenWidth / column) * POSITION_WIDTH_RATIO > mPageCoordinateData.cellWidth ?
            (mScreenWidth / column) * POSITION_WIDTH_RATIO : mPageCoordinateData.cellWidth;
        mPageCoordinateData.positionMargin = (mPageCoordinateData.positionWidth - mPageCoordinateData.cellWidth) / 2;
    }
    mPageCoordinateData.xAxis = [];
    mPageCoordinateData.yAxis = [];
    mPageCoordinateData.gridXAxis = [];
    mPageCoordinateData.gridYAxis = [];
    mPageCoordinateData.bottomXAxis = [];
    mPageCoordinateData.bottomYAxis = [];
    for (let i = 0; i < row; i++) {
        let iconPositioningY = (i * 2 + 1) * mPageCoordinateData.rowSpacing + i * mPageCoordinateData.cellHeight;
        let touchPositioningY = i * (mPageCoordinateData.rowSpacing * 2 + mPageCoordinateData.cellHeight);
        mPageCoordinateData.yAxis.push(iconPositioningY);
        mPageCoordinateData.gridYAxis.push(touchPositioningY);
    }

    for (let i = 0; i < column; i++) {
        let iconPositioningX = (i * 2 + 1) * mPageCoordinateData.columnSpacing
            + i * mPageCoordinateData.cellWidth - mPageCoordinateData.positionMargin;
        let touchPositioningX = i * (mPageCoordinateData.columnSpacing * 2 + mPageCoordinateData.cellWidth);
        mPageCoordinateData.xAxis.push(iconPositioningX);
        mPageCoordinateData.gridXAxis.push(touchPositioningX);
        mPageCoordinateData.bottomXAxis.push(iconPositioningX);
    }

    for (let i = 0; i < column; i++) {
        mPageCoordinateData.bottomYAxis.push(mScreenBottomBarTop);
    }

    return mPageCoordinateData;
}
