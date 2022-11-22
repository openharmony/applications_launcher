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

import { Log } from '@ohos/common';
import { PinyinSort } from '@ohos/common';
import { CheckEmptyUtils } from '@ohos/common';
import { EventConstants } from '@ohos/common';
import { CommonConstants } from '@ohos/common';
import { BaseViewModel } from '@ohos/common';
import { SettingsModel } from '@ohos/common';
import { PageDesktopModel } from '@ohos/common';
import { ResourceManager } from '@ohos/common';
import { localEventManager } from '@ohos/common';
import { layoutConfigManager } from '@ohos/common';
import { FolderLayoutConfig } from '@ohos/common';
import { BigFolderModel } from '../model/BigFolderModel';
import { BigFolderStyleConfig } from '../common/BigFolderStyleConfig';
import { BigFolderConstants } from '../common/constants/BigFolderConstants';
import { BigFolderStyleConstants } from '../common/constants/BigFolderStyleConstants';

const TAG = 'BigFolderViewModel';
const HEXADECIMAL_VALUE = 36;

export class BigFolderViewModel extends BaseViewModel {
  private readonly mSettingsModel: SettingsModel;
  private readonly mBigFolderModel: BigFolderModel;
  private readonly mPageDesktopModel: PageDesktopModel;
  private readonly mPinyinSort: PinyinSort;
  private readonly mGridConfig;
  private mPageIndex = 0;
  private readonly mFolderStyleConfig: BigFolderStyleConfig;
  private readonly mFolderLayoutConfig: FolderLayoutConfig;
  private readonly mLocalEventListener = {
    onReceiveEvent: (event, params) => {
      Log.showDebug(TAG, `onReceiveEvent receive event: ${event}, params: ${JSON.stringify(params)}`);
      const openStatus = AppStorage.Get('openFolderStatus');
      if (event === EventConstants.EVENT_BADGE_UPDATE && (openStatus == BigFolderConstants.OPEN_FOLDER_STATUS_OPEN || openStatus == BigFolderConstants.OPEN_FOLDER_STATUS_STATIC)) {
        const openFolderData: {
          layoutInfo: [[]]
        } = AppStorage.Get('openFolderData');
        this.updateBadge(openFolderData, params);
      } else if (event === EventConstants.EVENT_FOLDER_PACKAGE_REMOVED) {
        this.deleteAppFromFolderByUninstall(params);
      }
    }
  };

  // badge will be designed lastly
  private updateBadge(openFolderData, params): void {
    for (let i = 0; i < openFolderData.layoutInfo.length; i++) {
      const appInfo: any = openFolderData.layoutInfo[i].find(item => {
        return item.bundleName == params.bundleName;
      });
      if (appInfo != undefined && appInfo.bundleName.length > 0) {
        const index = openFolderData.layoutInfo[i].indexOf(appInfo);
        appInfo.badgeNumber = params.badgeNumber;
        openFolderData.layoutInfo[i][index] = appInfo;
        break;
      }
    }
    Log.showDebug(TAG, `mLocalEventListener openFolderData: ${JSON.stringify(openFolderData)}`);
    this.refreshFolder(openFolderData);
  }

  private constructor() {
    super();
    this.mBigFolderModel = BigFolderModel.getInstance();
    this.mSettingsModel = SettingsModel.getInstance();
    this.mPageDesktopModel = PageDesktopModel.getInstance();
    this.mGridConfig = this.mSettingsModel.getGridConfig();
    this.mPinyinSort = new PinyinSort();
    this.mBigFolderModel.registerFolderUpdateEvent(this.mLocalEventListener);
    this.mFolderStyleConfig = layoutConfigManager.getStyleConfig(BigFolderStyleConfig.APP_LIST_STYLE_CONFIG,
      BigFolderConstants.FEATURE_NAME);
    this.mFolderLayoutConfig = layoutConfigManager.getFunctionConfig(FolderLayoutConfig.FOLDER_GRID_LAYOUT_INFO);
  }

  static getInstance(): BigFolderViewModel {
    if (globalThis.BigFolderViewModelInstance == null) {
      globalThis.BigFolderViewModelInstance = new BigFolderViewModel();
    }
    return globalThis.BigFolderViewModelInstance;
  }

  /**
   * return BigFolderStyleConfig
   */
  getFolderStyleConfig(): BigFolderStyleConfig {
    return this.mFolderStyleConfig;
  }

  /**
    * return folderOpenLayoutTable
    */
  getFolderLayoutConfig(): any {
    return this.mFolderLayoutConfig.getFolderLayoutInfo().folderOpenLayoutTable;
  }

  /**
   * add new folder
   *
   * @param {any} appLayoutInfo (two app for create new folder).
   */
  async addNewFolder(appLayoutInfo) {
    const gridLayoutInfo = this.mSettingsModel.getLayoutInfo();
    const settingAppInfoList = this.mSettingsModel.getAppListInfo();
    const folderAppInfo = [];
    for (let j = 0; j < appLayoutInfo.length; j++) {
      Log.showDebug(TAG, `addNewFolder appLayoutInfo: ${JSON.stringify(appLayoutInfo[j])}`)
      for (let i = 0; i < settingAppInfoList.length; i++) {
        if (settingAppInfoList[i].keyName === appLayoutInfo[j].keyName) {
          folderAppInfo.push(settingAppInfoList[i]);
          break;
        }
      }
    }

    // sum all app badgeNumber
    let badgeNumber = 0;
    for (let i = 0; i < folderAppInfo.length; i++) {
      if (folderAppInfo[i].badgeNumber && folderAppInfo[i].badgeNumber > 0) {
        badgeNumber = badgeNumber + folderAppInfo[i].badgeNumber;
      }
    }

    // Delete {the app list} from desktop app list
    for (let i = 0; i < appLayoutInfo.length; i++) {
      const index = gridLayoutInfo.layoutInfo.indexOf(appLayoutInfo[i]);
      if (index != CommonConstants.INVALID_VALUE) {
        gridLayoutInfo.layoutInfo.splice(index, 1);
      }
    }

    const folderInfo = await this.createNewFolderInfo();
    folderInfo.layoutInfo.push(folderAppInfo);
    folderInfo.badgeNumber = badgeNumber;

    const needNewPage: boolean = this.mPageDesktopModel.updatePageDesktopLayoutInfo(gridLayoutInfo, folderInfo);
    if (needNewPage) {
      gridLayoutInfo.layoutDescription.pageCount = gridLayoutInfo.layoutDescription.pageCount + 1;
      for (let index = 0; index < gridLayoutInfo.layoutInfo.length; index++) {
        if (gridLayoutInfo.layoutInfo[index].page > this.mPageDesktopModel.getPageIndex()) {
          gridLayoutInfo.layoutInfo[index].page++;
        }
      }
    }

    // Push folder into the layoutInfo,include {the app list}
    gridLayoutInfo.layoutInfo.push(folderInfo);
    this.deleteAppLayoutItems(gridLayoutInfo, appLayoutInfo);
    if (needNewPage) {
      this.mPageDesktopModel.setPageIndex(this.mPageDesktopModel.getPageIndex() + 1);
    }
  }

  /**
   * add app to folder
   *
   * @param appInfo AppInfo
   * @param folderId folderId
   */
  addOneAppToFolder(appInfo, folderId): void {
    const gridLayoutInfo = this.mSettingsModel.getLayoutInfo();
    let appListInfo = this.mSettingsModel.getAppListInfo();
    appListInfo = appListInfo.filter(item => item.keyName !== appInfo.keyName);
    // add App
    for (let i = 0; i < gridLayoutInfo.layoutInfo.length; i++) {
      const layoutInfo = gridLayoutInfo.layoutInfo[i];
      if (layoutInfo.typeId === CommonConstants.TYPE_FOLDER && layoutInfo.folderId === folderId) {
        const info = layoutInfo.layoutInfo;
        if (layoutInfo.badgeNumber && layoutInfo.badgeNumber > 0) {
          if (appInfo.badgeNumber && appInfo.badgeNumber > 0) {
            layoutInfo.badgeNumber = layoutInfo.badgeNumber + appInfo.badgeNumber;
          }
        } else {
          layoutInfo.badgeNumber = appInfo.badgeNumber;
        }
        const lastPageItems = info[info.length - 1];
        if (lastPageItems[lastPageItems.length - 1].typeId == CommonConstants.TYPE_ADD) {
          lastPageItems[lastPageItems.length - 1] = appInfo;
        } else {
          const openFolderConfig = this.mBigFolderModel.getFolderOpenLayout();
          if (lastPageItems.length == openFolderConfig.column * openFolderConfig.row) {
            info.push([appInfo]);
          } else {
            lastPageItems.push(appInfo);
          }
        }
        break;
      }
    }

    // delete app from desktop
    this.mSettingsModel.setAppListInfo(appListInfo);
    this.deleteAppLayoutItems(gridLayoutInfo, [appInfo]);
  }

  /**
 * delete apps in pageDesktop
 * @param appListInfo
 */
  private deleteAppLayoutItems(gridLayoutInfo, appLayoutInfo) {
    for (let i = 0; i < appLayoutInfo.length; i++) {
      gridLayoutInfo.layoutInfo = gridLayoutInfo.layoutInfo.filter(item => item.keyName != appLayoutInfo[i].keyName);
    }
    Log.showDebug(TAG, `deleteAppItems gridLayoutInfo.layoutInfo: ${gridLayoutInfo.layoutInfo.length}`);
    this.mSettingsModel.setLayoutInfo(gridLayoutInfo);
    localEventManager.sendLocalEventSticky(EventConstants.EVENT_REQUEST_PAGEDESK_ITEM_UPDATE, null);
  }

  /**
   * Delete app from folder by dragging
   *
   * @param {any} folderAppList.
   * @param {number} index.
   */
  deleteAppByDraging(folderAppList, index): boolean {
    const gridLayoutInfo = this.mSettingsModel.getLayoutInfo();
    if (folderAppList.length == 0 || folderAppList.length <= index) {
      return false;
    }
    const dragAppInfo = folderAppList[index];
    if (folderAppList.length > 2) {
      const needNewPage: boolean = this.mPageDesktopModel.updatePageDesktopLayoutInfo(gridLayoutInfo, dragAppInfo);
      Log.showDebug(TAG, `deleteAppByDraging needNewPage: ${needNewPage}`);
      if (needNewPage) {
        return false;
      }
    }

    folderAppList.splice(index, 1);
    if (folderAppList.length > 0 && folderAppList[folderAppList.length - 1].typeId == CommonConstants.TYPE_ADD) {
      folderAppList.pop();
    }
    const folderLayoutInfo = this.filterFolderPage(folderAppList);
    const openFolderData: {
      folderId: string,
      layoutInfo: any
    } = AppStorage.Get('openFolderData');
    const removeAppInfos = [dragAppInfo];
    const folderIndex = gridLayoutInfo.layoutInfo.findIndex(item => {
      return item.typeId === CommonConstants.TYPE_FOLDER && item.folderId === openFolderData.folderId;
    });

    if (folderLayoutInfo.length == 1 && folderLayoutInfo[0].length == 1) {
      // delete folder and add app to desktop
      removeAppInfos.push(folderLayoutInfo[0][0]);
      gridLayoutInfo.layoutInfo.splice(folderIndex, 1);
    } else {
      this.updateBadgeNumber(gridLayoutInfo.layoutInfo[folderIndex], dragAppInfo);
      openFolderData.layoutInfo = folderLayoutInfo;
    }

    const appListInfo = this.mSettingsModel.getAppListInfo();
    for (let i = 0; i < removeAppInfos.length; i++) {
      this.mPageDesktopModel.updatePageDesktopLayoutInfo(gridLayoutInfo, removeAppInfos[i]);
      const gridLayout = this.createAppLayoutInfo(removeAppInfos[i]);
      gridLayoutInfo.layoutInfo.push(gridLayout);
      appListInfo.push(removeAppInfos[i]);
    }
    this.mSettingsModel.setAppListInfo(appListInfo);
    this.mSettingsModel.setLayoutInfo(gridLayoutInfo);
    return true;
  }

  /**
   * create new app layoutInfo
   *
   * @param appInfo
   */
  private createAppLayoutInfo(appInfo): any {
    const appLayout = {
      bundleName: appInfo.bundleName,
      abilityName: appInfo.abilityName,
      moduleName: appInfo.moduleName,
      keyName: appInfo.keyName,
      typeId: appInfo.typeId,
      area: appInfo.area,
      page: appInfo.page,
      column: appInfo.column,
      row: appInfo.row
    };
    return appLayout;
  }

  /**
   * update folder badgeNumber
   *
   * @param folderLayoutInfo
   * @param dragAppInfo
   */
  private updateBadgeNumber(folderLayoutInfo, dragAppInfo): void {
    let folderBadgeNumber = 0;
    if (folderLayoutInfo.badgeNumber && folderLayoutInfo.badgeNumber > 0) {
      folderBadgeNumber = folderLayoutInfo.badgeNumber;
      if (dragAppInfo.badgeNumber && dragAppInfo.badgeNumber > 0) {
        folderBadgeNumber = folderBadgeNumber - dragAppInfo.badgeNumber;
      }
    }
    folderLayoutInfo.badgeNumber = folderBadgeNumber;
  }

  /**
   * Delete app from open folder
   *
   * @param {any} appInfo.
   */
  deleteAppFromOpenFolder(appInfo): any {
    let openFolderData: {
      folderId: string,
      layoutInfo: any
    } = AppStorage.Get('openFolderData');
    const folderLayoutInfo = this.getFolderLayoutInfo(openFolderData, appInfo);

    // Delete app from the folder
    const gridLayoutInfo = this.mSettingsModel.getLayoutInfo();
    const folderIndex = gridLayoutInfo.layoutInfo.findIndex(item => {
      return item.typeId === CommonConstants.TYPE_FOLDER && item.folderId === openFolderData.folderId;
    });

    const appListInfo = this.mSettingsModel.getAppListInfo();
    if (folderLayoutInfo.length == 1 && folderLayoutInfo[0].length == 1) {
      // delete from folder and add app to desktop
      const appLayout = {
        bundleName: folderLayoutInfo[0][0].bundleName,
        abilityName: folderLayoutInfo[0][0].abilityName,
        moduleName: folderLayoutInfo[0][0].moduleName,
        keyName: folderLayoutInfo[0][0].keyName,
        typeId: folderLayoutInfo[0][0].typeId,
        area: folderLayoutInfo[0][0].area,
        page: gridLayoutInfo.layoutInfo[folderIndex].page,
        column: gridLayoutInfo.layoutInfo[folderIndex].column,
        row: gridLayoutInfo.layoutInfo[folderIndex].row
      };
      gridLayoutInfo.layoutInfo.push(appLayout);
      appListInfo.push(folderLayoutInfo[0][0]);
      gridLayoutInfo.layoutInfo.splice(folderIndex, 1);
      openFolderData = {
        folderId: '', layoutInfo: []
      };
    } else {
      this.updateBadgeNumber(gridLayoutInfo.layoutInfo[folderIndex], appInfo);
      openFolderData.layoutInfo = folderLayoutInfo;
    }
    this.mSettingsModel.setAppListInfo(appListInfo);
    this.mSettingsModel.setLayoutInfo(gridLayoutInfo);
    return openFolderData;
  }

  /**
   * update folder app list info
   *
   * @param {any} appInfos.
   * @param {any} folderItem.
   */
  async updateFolderAppList(appInfos, folderItem) {
    Log.showDebug(TAG, 'updateFolderAppList start');
    let removeFolderApp = [];
    let gridLayoutInfoTemp: any;
    let gridLayoutInfo = {
      layoutInfo: []
    };
    gridLayoutInfo = this.mSettingsModel.getLayoutInfo();
    gridLayoutInfoTemp = this.mSettingsModel.getLayoutInfo();
    removeFolderApp = this.layoutInfoToList(folderItem);
    // checked app <= 1
    if (appInfos.length <= CommonConstants.FOLDER_APP_VALUE) {
      for (let i = 0; i < gridLayoutInfoTemp.layoutInfo.length; i++) {
        if (gridLayoutInfoTemp.layoutInfo[i].folderId === folderItem.folderId) {
          gridLayoutInfoTemp.layoutInfo.splice(i, 1);
          break;
        }
      }
      folderItem.layoutInfo = [[]];
      for (let i = 0; i < removeFolderApp.length; i++) {
        localEventManager.sendLocalEventSticky(EventConstants.EVENT_REQUEST_PAGEDESK_ITEM_ADD, removeFolderApp[i]);
        this.mPageDesktopModel.updatePageDesktopLayoutInfo(gridLayoutInfoTemp, removeFolderApp[i]);
        const gridLayout = this.createAppLayoutInfo(removeFolderApp[i]);
        gridLayoutInfoTemp.layoutInfo.push(gridLayout);
      }
      this.mSettingsModel.setLayoutInfo(gridLayoutInfoTemp);
    } else {
      // checked app's count >= 2
      // update badgeNumber of folder
      this.updateFolderBadgeNumber(appInfos, folderItem, gridLayoutInfo, gridLayoutInfoTemp);
      // move app from other folder
      this.moveAppFromOtherFolders(appInfos, folderItem, gridLayoutInfo, gridLayoutInfoTemp);
      // move apps from desktop to folder
      this.moveAppFromDesktopToFolder(appInfos, gridLayoutInfo, gridLayoutInfoTemp);
      // move apps from folder to desktop
      this.moveAppFromFolderToDesktop(appInfos, removeFolderApp, gridLayoutInfoTemp);
      // delete blank page
      this.deleteBlankPage();
    }
    Log.showDebug(TAG, 'updateFolderAppList end');
  }

  /**
   * delete blank page
   */
  private deleteBlankPage(): void {
    const layoutInfo = this.mSettingsModel.getLayoutInfo();
    const pageItemMap = new Map<string, number>();
    for (let i = 0; i < layoutInfo.layoutDescription.pageCount; i++) {
      pageItemMap.set(i.toString(), 0);
    }

    for (let i = 0; i < layoutInfo.layoutInfo.length; i++) {
      const tmpPage = layoutInfo.layoutInfo[i].page.toString();
      pageItemMap.set(tmpPage, pageItemMap.get(tmpPage) + 1);
    }

    const blankPages = [];
    for (let [page, count] of pageItemMap) {
      if (count === 0) {
        layoutInfo.layoutDescription.pageCount--;
        blankPages.push(page);
      }
    }
    for (let m = 0; m < layoutInfo.layoutInfo.length; m++) {
      let pageMinus = 0;
      for (let n = 0; n < blankPages.length; n++) {
        if (layoutInfo.layoutInfo[m].page > blankPages[n]) {
          pageMinus++;
        }
      }
      if (pageMinus != 0) {
        layoutInfo.layoutInfo[m].page = layoutInfo.layoutInfo[m].page - pageMinus;
      }
    }
    this.mSettingsModel.setLayoutInfo(layoutInfo);
    localEventManager.sendLocalEventSticky(EventConstants.EVENT_REQUEST_PAGEDESK_ITEM_UPDATE, null);
  }

  /**
   * get apps in checked appinfos, not in folderAppList
   *
   * @param appInfos
   * @param folderAppList
   */
  getAppRemainInOtherFolder(appInfos, folderAppList): any[] {
    const appInfosRemaining = [];
    for (let m = 0; m < folderAppList.length; m++) {
      const appIndex = appInfos.findIndex(item => {
        return item.keyName === folderAppList[m].keyName;
      });
      if (appIndex == CommonConstants.INVALID_VALUE) {
        appInfosRemaining.push(folderAppList[m]);
      }
    }
    return appInfosRemaining;
  }

  /**
   * update badgeNumber of folder
   *
   * @param appInfos
   * @param folderItem
   * @param gridLayoutInfo
   */
  private updateFolderBadgeNumber(appInfos, folderItem, gridLayoutInfo, gridLayoutInfoTemp): void {
    for (let i = 0; i < gridLayoutInfo.layoutInfo.length; i++) {
      if (gridLayoutInfo.layoutInfo[i].typeId === CommonConstants.TYPE_FOLDER
      && gridLayoutInfo.layoutInfo[i].folderId === folderItem.folderId) {
        let badgeNumber = 0;
        appInfos.forEach((item) => {
          if (item.badgeNumber && item.badgeNumber > 0) {
            badgeNumber = badgeNumber + item.badgeNumber;
          }
        });
        const folderLayoutInfo = this.filterFolderPage(appInfos);
        folderItem.layoutInfo = folderLayoutInfo;
        folderItem.badgeNumber = badgeNumber;
        gridLayoutInfoTemp.layoutInfo[i].layoutInfo = JSON.parse(JSON.stringify(folderLayoutInfo));
        this.mSettingsModel.setLayoutInfo(gridLayoutInfoTemp);
        localEventManager.sendLocalEventSticky(EventConstants.EVENT_REQUEST_PAGEDESK_ITEM_UPDATE, null);
        break;
      }
    }
  }

  /**
   * move app from other folders to folder or to desktop
   *
   * @param appInfos
   * @param gridLayoutInfo
   * @param gridLayoutInfoTemp
   */
  private moveAppFromOtherFolders(appInfos, folderItem, gridLayoutInfo, gridLayoutInfoTemp): void {
    for (let i = gridLayoutInfo.layoutInfo.length - 1; i >= 0; i--) {
      if (gridLayoutInfo.layoutInfo[i].typeId === CommonConstants.TYPE_FOLDER
      && gridLayoutInfo.layoutInfo[i].folderId !== folderItem.folderId) {
        const folderAppList = this.layoutInfoToList(gridLayoutInfo.layoutInfo[i]);
        const appInfosRemaining = this.getAppRemainInOtherFolder(appInfos, folderAppList);
        const thisFolderItemIndex = gridLayoutInfoTemp.layoutInfo.findIndex(item => {
          return item.folderId === gridLayoutInfo.layoutInfo[i].folderId;
        });

        if (appInfosRemaining.length === 0) {
          gridLayoutInfoTemp.layoutInfo.splice(thisFolderItemIndex, 1);
          this.mSettingsModel.setLayoutInfo(gridLayoutInfoTemp);
          localEventManager.sendLocalEventSticky(EventConstants.EVENT_REQUEST_PAGEDESK_ITEM_UPDATE, null);
        } else if (appInfosRemaining.length === CommonConstants.FOLDER_APP_VALUE) {
          gridLayoutInfoTemp.layoutInfo.splice(thisFolderItemIndex, 1);
          this.mSettingsModel.setLayoutInfo(gridLayoutInfoTemp);
          localEventManager.sendLocalEventSticky(EventConstants.EVENT_REQUEST_PAGEDESK_ITEM_ADD, appInfosRemaining[0]);
        } else {
          let badgeNumber = 0;
          appInfosRemaining.forEach((item) => {
            if (item.badgeNumber && item.badgeNumber > 0) {
              badgeNumber = badgeNumber + item.badgeNumber;
            }
          });
          gridLayoutInfoTemp.layoutInfo[thisFolderItemIndex].badgeNumber = badgeNumber;
          gridLayoutInfoTemp.layoutInfo[thisFolderItemIndex].layoutInfo = this.filterFolderPage(appInfosRemaining);
          this.mSettingsModel.setLayoutInfo(gridLayoutInfoTemp);
          localEventManager.sendLocalEventSticky(EventConstants.EVENT_REQUEST_PAGEDESK_ITEM_UPDATE, null);
        }
      }
    }
  }

  /**
   * move apps from desktop to folder
   *
   * @param appInfos
   * @param gridLayoutInfo
   * @param gridLayoutInfoTemp
   */
  private moveAppFromDesktopToFolder(appInfos, gridLayoutInfo, gridLayoutInfoTemp): void {
    const appDesktopToFolder = [];
    for (let i = 0; i < appInfos.length; i++) {
      for (let j = 0; j < gridLayoutInfo.layoutInfo.length; j++) {
        if (gridLayoutInfo.layoutInfo[j].typeId == CommonConstants.TYPE_APP &&
        appInfos[i].keyName == gridLayoutInfo.layoutInfo[j].keyName) {
          appDesktopToFolder.push(gridLayoutInfo.layoutInfo[j]);
          break;
        }
      }
    }

    if (appDesktopToFolder.length > 0) {
      this.deleteAppLayoutItems(gridLayoutInfoTemp, appDesktopToFolder);
    }
  }

  /**
   * move app from folder to desktop
   *
   * @param appInfos
   * @param removeFolderApp
   * @param gridLayoutInfoTemp
   */
  private moveAppFromFolderToDesktop(appInfos, removeFolderApp, gridLayoutInfoTemp) {
    const appFolderToDesktop = [];
    for (let i = 0; i < removeFolderApp.length; i++) {
      let remainFlag = false;
      for (let j = 0; j < appInfos.length; j++) {
        if (appInfos[j].keyName == removeFolderApp[i].keyName) {
          remainFlag = true;
          break;
        }
      }
      if (!remainFlag) {
        appFolderToDesktop.push(removeFolderApp[i]);
      }
    }

    if (appFolderToDesktop.length > 0) {
      for (let i = 0; i < appFolderToDesktop.length; i++) {
        const needNewPage: boolean = this.mPageDesktopModel.updatePageDesktopLayoutInfo(gridLayoutInfoTemp, appFolderToDesktop[i]);
        if (needNewPage) {
          gridLayoutInfoTemp.layoutDescription.pageCount = gridLayoutInfoTemp.layoutDescription.pageCount + 1;
          for (let index = 0; index < gridLayoutInfoTemp.layoutInfo.length; index++) {
            if (gridLayoutInfoTemp.layoutInfo[index].page > this.mPageDesktopModel.getPageIndex()) {
              gridLayoutInfoTemp.layoutInfo[index].page++;
            }
          }
        }
        const gridLayout = this.createAppLayoutInfo(appFolderToDesktop[i]);
        gridLayoutInfoTemp.layoutInfo.push(gridLayout);
        localEventManager.sendLocalEventSticky(EventConstants.EVENT_REQUEST_PAGEDESK_ITEM_ADD, appFolderToDesktop[i]);
      }
      this.mSettingsModel.setLayoutInfo(gridLayoutInfoTemp);
    }
  }

  /**
   * get folder app list
   *
   * @param {array} folderId.
   * @return {array} folderAppList.
   */
  async getFolderAppList(folderId) {
    Log.showDebug(TAG, 'getFolderAppList start');
    let folderAppList = [];
    let gridLayoutInfo = {
      layoutInfo: []
    };
    gridLayoutInfo = this.mSettingsModel.getLayoutInfo();

    // Get folder app list form the layout info
    for (let i = 0; i < gridLayoutInfo.layoutInfo.length; i++) {
      const layoutInfo = gridLayoutInfo.layoutInfo[i];
      if (layoutInfo.typeId === CommonConstants.TYPE_FOLDER && layoutInfo.folderId === folderId) {
        for (let j = 0; j < layoutInfo.layoutInfo.length; j++) {
          folderAppList = folderAppList.concat(layoutInfo.layoutInfo[j]);
        }
      }
    }
    if (folderAppList.length > 0 && folderAppList[folderAppList.length - 1].typeId == CommonConstants.TYPE_ADD) {
      folderAppList.pop();
    }
    AppStorage.SetOrCreate('folderAppList', folderAppList);
    return folderAppList;
  }

  /**
   * get all folder list
   *
   * @return {array} folderList.
   */
  async getAllFolderList() {
    Log.showDebug(TAG, 'getAllFolderList start');
    const folderList = [];
    let gridLayoutInfo = {
      layoutInfo: []
    };
    gridLayoutInfo = this.mSettingsModel.getLayoutInfo();

    // Get folder list form the layout info
    for (let i = 0; i < gridLayoutInfo.layoutInfo.length; i++) {
      if (gridLayoutInfo.layoutInfo[i].typeId === CommonConstants.TYPE_FOLDER) {
        folderList.push(gridLayoutInfo.layoutInfo[i]);
      }
    }
    AppStorage.SetOrCreate('allFolderList', folderList);
    return folderList;
  }

  /**
   * get the all app list for folder
   *
   * @param {number} folderId
   *
   */
  async getFolderAddAppList(folderId) {
    Log.showDebug(TAG, 'getFolderAddAppList start');
    if (CheckEmptyUtils.checkStrIsEmpty(folderId)) {
      Log.showDebug(TAG, 'getFolderAddAppList folderId is Empty');
      return;
    }
    let allAppList = [];
    let appInfos: any;
    let gridLayoutInfo = {
      layoutInfo: []
    };
    gridLayoutInfo = this.mSettingsModel.getLayoutInfo();
    const appListInfo = await this.mAppModel.getAppList();

    // first push this current app
    for (let i = 0; i < gridLayoutInfo.layoutInfo.length; i++) {
      const layoutInfo = gridLayoutInfo.layoutInfo[i];
      if (layoutInfo.typeId === CommonConstants.TYPE_FOLDER && layoutInfo.folderId === folderId) {
        for (let j = 0; j < layoutInfo.layoutInfo.length; j++) {
          appInfos = layoutInfo.layoutInfo[j];
          for (let k = 0; k < appInfos.length; k++) {
            appInfos[k].checked = true;
            allAppList.push(appInfos[k]);
          }
        }
        break;
      }
    }

    if (allAppList.length > 0 && allAppList[allAppList.length - 1].typeId == CommonConstants.TYPE_ADD) {
      allAppList.pop();
    }

    for (let i = 0; i < appListInfo.length; i++) {
      let isExist = false;
      for (let j = 0; j < allAppList.length; j++) {
        if (appListInfo[i].keyName === allAppList[j].keyName) {
          isExist = true;
          break;
        }
      }
      if (!isExist) {
        appListInfo[i].checked = false;
        allAppList.push(appListInfo[i]);
      }
    }
    if (!this.getIsPad()) {
      let bottomAppList: any = AppStorage.Get('residentList');
      if (!CheckEmptyUtils.isEmptyArr(bottomAppList)) {
        for (let i = 0; i < bottomAppList.length; i++) {
          allAppList = allAppList.filter((item) => {
            if (bottomAppList[i].keyName == item.keyName) {
              return false;
            }
            return true;
          })
        }
      }
    }
    AppStorage.SetOrCreate('allAppListForFolder', allAppList);
    return allAppList;
  }

  /**
   * open folder
   *
   * @param {any} folderInfo.
   */
  addAddIcon(folderItem: any): any {
    Log.showDebug(TAG, 'addAddIcon start');

    if (folderItem.layoutInfo.length == 0) {
      return folderItem;
    }
    const lastPageItem = folderItem.layoutInfo[folderItem.layoutInfo.length - 1];
    if (lastPageItem[lastPageItem.length - 1].typeId === CommonConstants.TYPE_ADD) {
      return folderItem;
    }

    const openFolderConfig = this.mBigFolderModel.getFolderOpenLayout();
    const column = openFolderConfig.column;
    const row = openFolderConfig.row;
    const addInfo = {
      typeId: CommonConstants.TYPE_ADD,
      appName: $r('app.string.add'),
      bundleName: '',
      appIconId: BigFolderStyleConstants.DEFAULT_ADD_FOLDER_APP_IMAGE,
      appLabelId: 0
    };
    if (folderItem.layoutInfo[folderItem.layoutInfo.length - 1].length === column * row) {
      folderItem.layoutInfo.push([addInfo]);
    } else {
      folderItem.layoutInfo[folderItem.layoutInfo.length - 1].push(addInfo);
    }

    Log.showDebug(TAG, 'addAddIcon end');
    return folderItem;
  }

  /**
   * open folder
   *
   * @param {any} folderInfo.
   */
  delAddIcon(folderItem: any): any {
    Log.showDebug(TAG, 'delAddIcon start');

    if (folderItem.layoutInfo.length == 0) {
      return folderItem;
    }
    const lastPageItem = folderItem.layoutInfo[folderItem.layoutInfo.length - 1];
    if (lastPageItem[lastPageItem.length - 1].typeId !== CommonConstants.TYPE_ADD) {
      return folderItem;
    }
    lastPageItem.pop();
    if (lastPageItem.length == 0) {
      folderItem.layoutInfo.pop();
    } else {
      folderItem.layoutInfo[folderItem.layoutInfo.length - 1] = lastPageItem;
    }

    Log.showDebug(TAG, 'delAddIcon end');
    return folderItem;
  }

  /**
   * open folder
   *
   * @param {any} folderInfo.
   */
  async openFolder(isRename: boolean, folderItem: any) {
    Log.showDebug(TAG, 'openFolder start');
    folderItem.enterEditing = isRename;

    AppStorage.SetOrCreate('openFolderData', folderItem);
    this.mPageIndex = 0;
    AppStorage.SetOrCreate('openFolderPageIndex', this.mPageIndex);
    AppStorage.SetOrCreate('openFolderStatus', BigFolderConstants.OPEN_FOLDER_STATUS_OPEN);
    Log.showDebug(TAG, 'openFolder end');
  }

  /**
   * close folder
   */
  async closeFolder() {
    Log.showDebug(TAG, 'closeFolder start');

    this.mPageIndex = 0;
    AppStorage.SetOrCreate('openFolderPageIndex', this.mPageIndex);
    AppStorage.SetOrCreate('openFolderStatus', BigFolderConstants.OPEN_FOLDER_STATUS_CLOSE);
  }

  /**
   * refresh folder data
   *
   * @param folderItem
   */
  async refreshFolder(folderItem: any) {
    Log.showDebug(TAG, 'refreshFolder start');
    folderItem.enterEditing = false;
    this.updateOpenFolderStatus(folderItem);
    Log.showDebug(TAG, 'refreshFolder end');
  }

  /**
   * get device type
   *
   * @return {boolean} isPad.
   */
  getIsPad(): boolean {
    return CommonConstants.PAD_DEVICE_TYPE == AppStorage.Get('deviceType');
  }

  /**
   * modify folder name
   *
   * @param {any} folderModel.
   */
  modifyFolderName(folderModel): void {
    let gridLayoutInfo = {
      layoutInfo: []
    };
    gridLayoutInfo = this.mSettingsModel.getLayoutInfo();

    for (let i = 0; i < gridLayoutInfo.layoutInfo.length; i++) {
      if (gridLayoutInfo.layoutInfo[i].typeId === CommonConstants.TYPE_FOLDER &&
      gridLayoutInfo.layoutInfo[i].folderId === folderModel.folderId) {
        gridLayoutInfo.layoutInfo[i].folderName = folderModel.folderName;
      }
    }
    this.mSettingsModel.setLayoutInfo(gridLayoutInfo);
  }

  /**
   * make the applist into folder page
   *
   * @param appInfos
   */
  filterFolderPage(appInfos): any[] {
    const folderLayoutInfo = [];
    const appListInfo = JSON.parse(JSON.stringify(appInfos));
    const openFolderConfig = this.mBigFolderModel.getFolderOpenLayout();

    const itemCountByPage = openFolderConfig.column * openFolderConfig.row;
    let pageCount = Math.floor(appListInfo.length / itemCountByPage);
    if (appListInfo.length % itemCountByPage != 0) {
      pageCount = pageCount + 1;
    }
    Log.showDebug(TAG, `filterFolderPage pageCount: ${pageCount}`);
    for (let i = 0; i < pageCount; i++) {
      let pageInfo = [];
      if (itemCountByPage > appListInfo.length) {
        pageInfo = appListInfo.splice(0, appListInfo.length);
      } else {
        pageInfo = appListInfo.splice(0, itemCountByPage);
      }
      folderLayoutInfo.push(pageInfo);
    }
    return folderLayoutInfo;
  }

  /**
   * make the folder layoutInfo into list
   *
   * @param folderInfo
   */
  private layoutInfoToList(folderInfo): any[] {
    let appInfo = [];
    for (let i = 0; i < folderInfo.layoutInfo.length; i++) {
      for (let j = 0; j < folderInfo.layoutInfo[i].length; j++) {
        if (folderInfo.layoutInfo[i][j].typeId != CommonConstants.TYPE_ADD) {
          appInfo = appInfo.concat(folderInfo.layoutInfo[i][j]);
        }
      }
    }
    return appInfo;
  }

  /**
   * create folder info
   *
   * @return {any} folderInfo.
   */
  private async createNewFolderInfo() {
    const folderConfig = this.mBigFolderModel.getFolderLayout();
    const folderName = await this.generateFolderName();
    // Create new folder info
    const folderInfo = {
      folderId: this.getUUID(),
      folderName: folderName,
      layoutInfo: [],
      typeId: CommonConstants.TYPE_FOLDER,
      area: folderConfig.area,
      badgeNumber: 0
    };
    return folderInfo;
  }

  /**
   * generate folder name
   *
   * @return {string} folderName.
   */
  private async generateFolderName() {
    Log.showDebug(TAG, 'generateFolderName start');
    const folderList = await this.getAllFolderList();
    let folderName: string = await ResourceManager.getInstance().getStringByIdSync($r('app.string.new_folder_name').id);
    const autoNameFolderList = folderList.filter((element, index, self) => {
      return element.folderName.startsWith(folderName) && (element.folderName.length > folderName.length);
    });

    autoNameFolderList.sort(this.mPinyinSort.sortByFolderName.bind(this.mPinyinSort));

    let nameNumber = 1;
    let tempFolderName = folderName + nameNumber;
    for (let i = 0; i < autoNameFolderList.length; i++) {
      if (autoNameFolderList[i].folderName == tempFolderName) {
        nameNumber = nameNumber + 1;
        tempFolderName = folderName + nameNumber;
      } else {
        break;
      }
    }
    folderName = folderName + nameNumber;
    return folderName;
  }

  /**
   * generate a non duplicate ID
   *
   * @param {string} idLength
   */
  private getUUID(): string {
    Log.showDebug(TAG, 'getUUID start');
    let id = Date.now().toString(HEXADECIMAL_VALUE);
    id += Math.random().toString(HEXADECIMAL_VALUE).substr(2);
    return id;
  }

  /**
   * change the open folder page number.
   *
   * @param idx: Page number
   */
  changeIndex(idx): void {
    this.mPageIndex = idx;
    AppStorage.SetOrCreate('openFolderPageIndex', this.mPageIndex);
  }

  /**
   * get the open folder page number.
   */
  getIndex(): number {
    return this.mPageIndex;
  }

  /**
   * get addlist dialog's column
   */
  getAddListColumn(): number {
    return this.mBigFolderModel.getFolderAddAppLayout().column;
  }

  /**
   * get add app dialog's height
   *
   * @param appList
   */
  getDialogHeight(appList: []): number {
    let height = 0;
    const styleConfig = this.mFolderStyleConfig;
    const column = this.mBigFolderModel.getFolderAddAppLayout().column;
    const row = this.mBigFolderModel.getFolderAddAppLayout().row;
    const num = Math.ceil(appList.length / column);
    if (num <= row) {
      height = styleConfig.mAddFolderDialogHeight;
    } else {
      const gridHeight = num * (this.mFolderStyleConfig.mAddFolderIconSize + this.mFolderStyleConfig.mAddFolderTextLines) + num * styleConfig.mAddFolderGridGap +
      styleConfig.mAddFolderGridMargin * 2;
      height = gridHeight + BigFolderStyleConstants.DEFAULT_APP_ADD_TITLE_SIZE +
      BigFolderStyleConstants.DEFAULT_BUTTON_HEIGHT + BigFolderStyleConstants.DEFAULT_DIALOG_BOTTOM_MARGIN;
      if (height > styleConfig.mAddFolderMaxHeight) {
        height = styleConfig.mAddFolderMaxHeight;
      }
    }
    return height;
  }

  /**
   * delete app from folder
   *
   * @param bundleName
   */
  deleteAppFromFolderByUninstall(bundleName): void {
    Log.showDebug(TAG, 'deleteAppFromFolderByUninstall start');
    const gridLayoutInfo = this.mSettingsModel.getLayoutInfo();
    const layoutInfo = gridLayoutInfo.layoutInfo;
    for (let i = 0; i < layoutInfo.length; i++) {
      if (layoutInfo[i].typeId == CommonConstants.TYPE_FOLDER) {
        let folderAppList = this.layoutInfoToList(layoutInfo[i]);
        folderAppList = folderAppList.filter(item => item.bundleName != bundleName);
        this.updateFolderInfo(folderAppList, gridLayoutInfo, i);
      }
    }
    Log.showDebug(TAG, 'deleteAppFromFolderByUninstall end');
  }

  /**
   * update layoutInfo when only one item in the folder
   *
   * @param folderAppList
   * @param gridLayoutInfo
   * @param index
   */
  private updateFolderInfo(folderAppList, gridLayoutInfo, index): void {
    if (folderAppList.length == 0) {
      gridLayoutInfo.layoutInfo.splice(index, 1);
      this.mSettingsModel.setLayoutInfo(gridLayoutInfo);
      localEventManager.sendLocalEventSticky(EventConstants.EVENT_REQUEST_PAGEDESK_ITEM_UPDATE, null);
    } else if (folderAppList.length == 1) {
      const appLayoutInfo = {
        bundleName: folderAppList[0].bundleName,
        abilityName: folderAppList[0].abilityName,
        moduleName: folderAppList[0].moduleName,
        keyName: folderAppList[0].keyName,
        typeId: CommonConstants.TYPE_APP,
        area: [1, 1],
        page: gridLayoutInfo.layoutInfo[index].page,
        column: gridLayoutInfo.layoutInfo[index].column,
        row: gridLayoutInfo.layoutInfo[index].row
      };
      gridLayoutInfo.layoutInfo.splice(index, 1);
      gridLayoutInfo.layoutInfo.push(appLayoutInfo);
      this.mSettingsModel.setLayoutInfo(gridLayoutInfo);
      localEventManager.sendLocalEventSticky(EventConstants.EVENT_REQUEST_PAGEDESK_ITEM_ADD, folderAppList[0]);
    } else {
      gridLayoutInfo.layoutInfo[index].layoutInfo = this.filterFolderPage(folderAppList);
      this.mSettingsModel.setLayoutInfo(gridLayoutInfo);
      localEventManager.sendLocalEventSticky(EventConstants.EVENT_REQUEST_PAGEDESK_ITEM_UPDATE, null);
    }
  }

  /**
   * remove app from folder
   *
   * @param {any} appInfo.
   */
  removeAppOutOfFolder(appInfo): void {
    let openFolderData: {
      folderId: string,
      layoutInfo: any
    } = AppStorage.Get('openFolderData');

    const folderAppList = this.getAppListInFolder(openFolderData);
    this.deleteAppFromFolderAppList(appInfo, folderAppList);
    const folderLayoutInfo = this.filterFolderPage(folderAppList);

    const removeAppInfos = [appInfo];
    const gridLayoutInfo = this.mSettingsModel.getLayoutInfo();
    const folderIndex = gridLayoutInfo.layoutInfo.findIndex(item => {
      return item.typeId === CommonConstants.TYPE_FOLDER && item.folderId === openFolderData.folderId;
    });

    if (folderLayoutInfo.length == 1 && folderLayoutInfo[0].length == 1) {
      // delete folder and add app to desktop
      removeAppInfos.push(folderLayoutInfo[0][0]);
      gridLayoutInfo.layoutInfo.splice(folderIndex, 1);
      openFolderData = {
        folderId: '', layoutInfo: []
      };
    } else {
      this.updateBadgeNumber(gridLayoutInfo.layoutInfo[folderIndex], appInfo);
      openFolderData.layoutInfo = folderLayoutInfo;
    }
    const appListInfo = this.mSettingsModel.getAppListInfo();
    // Add app to desktop app list
    for (let i = 0; i < removeAppInfos.length; i++) {
      const needNewPage: boolean = this.mPageDesktopModel.updatePageDesktopLayoutInfo(gridLayoutInfo, removeAppInfos[i]);
      if (needNewPage) {
        gridLayoutInfo.layoutDescription.pageCount = gridLayoutInfo.layoutDescription.pageCount + 1;
        for (let index = 0; index < gridLayoutInfo.layoutInfo.length; index++) {
          if (gridLayoutInfo.layoutInfo[index].page > this.mPageDesktopModel.getPageIndex()) {
            gridLayoutInfo.layoutInfo[index].page++;
          }
        }
      }
      const gridLayout = this.createAppLayoutInfo(removeAppInfos[i]);
      gridLayoutInfo.layoutInfo.push(gridLayout);
      const appIndex = appListInfo.findIndex(item => {
        return item.keyName === removeAppInfos[i].keyName;
      })
      if (appIndex == CommonConstants.INVALID_VALUE) {
        appListInfo.push(removeAppInfos[i]);
      }
    }
    this.mSettingsModel.setAppListInfo(appListInfo);
    this.mSettingsModel.setLayoutInfo(gridLayoutInfo);
    localEventManager.sendLocalEventSticky(EventConstants.EVENT_REQUEST_PAGEDESK_ITEM_UPDATE, null);
    this.updateOpenFolderStatus(openFolderData);
  }

  /**
   * update folderData and openFolderStatus
   *
   * @param openFolderData
   */
  private updateOpenFolderStatus(openFolderData): void {
    AppStorage.SetOrCreate('openFolderData', openFolderData);
    if (openFolderData.folderId == '') {
      AppStorage.SetOrCreate('openFolderStatus', BigFolderConstants.OPEN_FOLDER_STATUS_CLOSE);
    } else {
      AppStorage.SetOrCreate('openFolderStatus', BigFolderConstants.OPEN_FOLDER_STATUS_REFRESH);
    }
  }

  /**
   * delete appInfo from folder
   *
   * @param appInfo
   * @param folderAppList
   */
  private deleteAppFromFolderAppList(appInfo, folderAppList): void {
    const appIndex = folderAppList.findIndex(item => {
      return item.keyName === appInfo.keyName;
    });
    if (appIndex !== CommonConstants.INVALID_VALUE) {
      folderAppList.splice(appIndex, 1);
    }
  }

  /**
   * get folder's appList from appStorage
   *
   * @param openFolderData
   */
  private getAppListInFolder(openFolderData): any[] {
    let folderAppList = [];
    for (let i = 0; i < openFolderData.layoutInfo.length; i++) {
      folderAppList = folderAppList.concat(openFolderData.layoutInfo[i]);
    }
    if (folderAppList.length > 0 && folderAppList[folderAppList.length - 1].typeId == CommonConstants.TYPE_ADD) {
      folderAppList.pop();
    }
    return folderAppList;
  }

  /**
   * get folder layoutInfo after delete appInfo from folder
   *
   * @param openFolderData
   * @param appInfo
   */
  private getFolderLayoutInfo(openFolderData, appInfo): any {
    let folderAppList = this.getAppListInFolder(openFolderData);
    const index = folderAppList.findIndex(item => {
      return item.keyName === appInfo.keyName;
    });
    if (index !== CommonConstants.INVALID_VALUE) {
      folderAppList.splice(index, 1);
    }
    return this.filterFolderPage(folderAppList);
  }
}