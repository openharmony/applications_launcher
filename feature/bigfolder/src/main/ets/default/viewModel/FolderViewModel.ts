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

import BaseAppPresenter from '../../../../../../../common/src/main/ets/default/base/BaseAppPresenter';
import CommonConstants from '../../../../../../../common/src/main/ets/default/constants/CommonConstants';
import EventConstants from '../../../../../../../common/src/main/ets/default/constants/EventConstants';
import ResourceManager from '../../../../../../../common/src/main/ets/default/manager/ResourceManager';
import SettingsModel from '../../../../../../../common/src/main/ets/default/model/SettingsModel';
import LayoutConfigManager from '../../../../../../../common/src/main/ets/default/layoutconfig/LayoutConfigManager';
import Log from '../../../../../../../common/src/main/ets/default/utils/Log';
import PinyinSort from '../../../../../../../common/src/main/ets/default/utils/PinyinSort';
import PageDesktopViewModel from '../../../../../../pagedesktop/src/main/ets/default/common/viewmodel/PageDesktopViewModel';
import BigFolderModel from '../common/BigFolderModel';
import FolderStyleConstants from '../common/constants/FolderStyleConstants';
import FeatureConstants from '../common/constants/FeatureConstants';
import BigFolderStyleConfig from '../common/BigFolderStyleConfig';

const TAG = 'FolderViewModel';
const HEXADECIMAL_VALUE = 36;

export default class FolderViewModel extends BaseAppPresenter {
  private readonly mPageDesktopViewModel: PageDesktopViewModel;
  private readonly mSettingsModel: SettingsModel;
  private readonly mFolderModel: BigFolderModel;
  private readonly mPinyinSort: PinyinSort;
  private readonly mGridConfig;
  private mPageIndex = 0;
  private readonly mFolderStyleConfig: BigFolderStyleConfig;
  private readonly mLocalEventListener = {
    onReceiveEvent: (event, params) => {
      Log.showInfo(TAG, `FolderViewModel receive event: ${event}, params: ${JSON.stringify(params)}`);
      const openStatus = AppStorage.Get('openFolderStatus');
      if (event === EventConstants.EVENT_BADGE_UPDATE && openStatus == FeatureConstants.OPEN_FOLDER_STATUS_OPEN) {
        const openFolderData: {
          layoutInfo: [[]]
        } = AppStorage.Get('openFolderData');
        this.updateBadge(openFolderData, params);
      } else if (event === EventConstants.EVENT_FOLDER_PACKAGE_REMOVED) {
        this.deleteAppFromFolderByUninstall(params);
      }
    }
  };

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
    Log.showInfo(TAG, `mLocalEventListener openFolderData: ${JSON.stringify(openFolderData)}`);
    this.refreshFolder(openFolderData);
  }

  private constructor() {
    super();
    this.mFolderModel = BigFolderModel.getInstance();
    this.mPageDesktopViewModel = PageDesktopViewModel.getInstance();
    this.mSettingsModel = SettingsModel.getInstance();
    this.mGridConfig = this.mPageDesktopViewModel.getGridConfig();
    this.mPinyinSort = new PinyinSort();
    this.mFolderModel.registerFolderUpdateEvent(this.mLocalEventListener);
    this.mFolderStyleConfig = LayoutConfigManager.getStyleConfig(BigFolderStyleConfig.APP_LIST_STYLE_CONFIG,
      FeatureConstants.FEATURE_NAME);
  }

  static getInstance(): FolderViewModel {
    if (globalThis.FolderViewModelInstance == null) {
      globalThis.FolderViewModelInstance = new FolderViewModel();
    }
    return globalThis.FolderViewModelInstance;
  }

  /**
   * return BigFolderStyleConfig
   */
  getFolderStyleConfig(): BigFolderStyleConfig {
    return this.mFolderStyleConfig;
  }

  /**
   * add new folder
   *
   * @param {any} appListInfo (two app for create new folder).
   */
  async addNewFolder(appListInfo) {
    const gridLayoutInfo = this.mPageDesktopViewModel.getLayoutInfo();
    const settingAppInfoList = this.mSettingsModel.getAppListInfo();
    const folderAppInfo = [];
    for (let j = 0; j < appListInfo.length; j++) {
      for (let i = 0; i < settingAppInfoList.length; i++) {
        if (settingAppInfoList[i].bundleName === appListInfo[j].bundleName) {
          folderAppInfo.push(settingAppInfoList[i]);
          break;
        }
      }
    }
    let badgeNumber = 0;
    for (let i = 0; i < folderAppInfo.length; i++) {
      const index = settingAppInfoList.indexOf(folderAppInfo[i]);
      if (folderAppInfo[i].badgeNumber && folderAppInfo[i].badgeNumber > 0) {
        badgeNumber = badgeNumber + folderAppInfo[i].badgeNumber;
      }
      settingAppInfoList.splice(index, 1);
    }

    // Delete {the app list} from desktop app list
    for (let i = 0; i < appListInfo.length; i++) {
      const index = gridLayoutInfo.layoutInfo.indexOf(appListInfo[i]);
      gridLayoutInfo.layoutInfo.splice(index, 1);
    }

    const folderInfo = await this.createNewFolderInfo();
    folderInfo.layoutInfo.push(folderAppInfo);
    folderInfo.badgeNumber = badgeNumber;

    const needNewPage: boolean = this.mPageDesktopViewModel.updateFolderItemLayoutInfo(gridLayoutInfo, folderInfo);
    if (needNewPage) {
      gridLayoutInfo.layoutDescription.pageCount = gridLayoutInfo.layoutDescription.pageCount + 1;
      for (let index = 0; index < gridLayoutInfo.layoutInfo.length; index++) {
        if (gridLayoutInfo.layoutInfo[index].page > this.mPageDesktopViewModel.getIndex()) {
          gridLayoutInfo.layoutInfo[index].page++;
        }
      }
    }

    // Push folder into the layoutInfo,include {the app list}
    gridLayoutInfo.layoutInfo.push(folderInfo);
    this.mSettingsModel.setAppListInfo(settingAppInfoList);
    this.mPageDesktopViewModel.setLayoutInfo(gridLayoutInfo);
    this.mPageDesktopViewModel.deleteAppItems(appListInfo);
    if (needNewPage) {
      this.mPageDesktopViewModel.changeIndex(this.mPageDesktopViewModel.getIndex() + 1);
    }
  }

  /**
   * add app to folder
   *
   * @param appInfo AppInfo
   * @param folderId folderId
   */
  addOneAppToFolder(appInfo, folderId): void {
    const gridLayoutInfo = this.mPageDesktopViewModel.getLayoutInfo();
    const appListInfo = this.mSettingsModel.getAppListInfo();
    this.setAppInfo(appInfo, appListInfo);
    // add App
    for (let i = 0; i < gridLayoutInfo.layoutInfo.length; i++) {
      const layoutInfo = gridLayoutInfo.layoutInfo[i];
      if (layoutInfo.type === CommonConstants.TYPE_FOLDER && layoutInfo.folderId === folderId) {
        const info = layoutInfo.layoutInfo;
        if (layoutInfo.badgeNumber && layoutInfo.badgeNumber > 0) {
          if (appInfo.badgeNumber && appInfo.badgeNumber > 0) {
            layoutInfo.badgeNumber = layoutInfo.badgeNumber + appInfo.badgeNumber;
          }
        } else {
          layoutInfo.badgeNumber = appInfo.badgeNumber;
        }
        const lastPageItems = info[info.length - 1];
        if (lastPageItems[lastPageItems.length - 1].type == CommonConstants.TYPE_ADD) {
          lastPageItems[lastPageItems.length - 1] = appInfo;
        } else {
          const openFolderConfig = this.mFolderModel.getFolderOpenLayout();
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
    this.deleteAppLayoutInfo(gridLayoutInfo, appInfo.bundleName);
    this.mPageDesktopViewModel.setLayoutInfo(gridLayoutInfo);
    if (!this.getIsPad()) {
      this.mSettingsModel.setAppListInfo(appListInfo);
    }
    this.mPageDesktopViewModel.getGridList();
  }

  /**
   * set appInfo by appListInfo
   *
   * @param appInfo
   * @param appListInfo
   */
  private setAppInfo(appInfo, appListInfo): void {
    for (let i = 0; i < appListInfo.length; i++) {
      if (appInfo.bundleName === appListInfo[i].bundleName) {
        appInfo.appId = appListInfo[i].appId;
        appInfo.appName = appListInfo[i].appName;
        appInfo.isSystemApp = appListInfo[i].isSystemApp;
        appInfo.isUninstallAble = appListInfo[i].isUninstallAble;
        appInfo.appIconId = appListInfo[i].appIconId;
        appInfo.appLabelId = appListInfo[i].appLabelId;
        appInfo.abilityName = appListInfo[i].abilityName;
        appInfo.x = appListInfo[i].x;
        appInfo.badgeNumber = appListInfo[i].badgeNumber;
        appListInfo.splice(i, 1);
        break;
      }
    }
  }

  /**
   * delete app layoutInfo by bundleName
   *
   * @param gridLayoutInfo
   * @param bundleName
   */
  private deleteAppLayoutInfo(gridLayoutInfo, bundleName): void {
    for (let i = 0; i < gridLayoutInfo.layoutInfo.length; i++) {
      if (gridLayoutInfo.layoutInfo[i].type === CommonConstants.TYPE_APP) {
        if (gridLayoutInfo.layoutInfo[i].bundleName === bundleName) {
          gridLayoutInfo.layoutInfo.splice(i, 1);
          break;
        }
      }
    }
  }

  /**
   * Delete app from folder by draging
   *
   * @param {any} folderAppList.
   * @param {number} index.
   */
  deleteAppByDraging(folderAppList, index): boolean {
    const gridLayoutInfo = this.mPageDesktopViewModel.getLayoutInfo();
    if (folderAppList.length == 0 || folderAppList.length <= index) {
      return false;
    }
    const dragAppInfo = folderAppList[index];
    if (folderAppList.length > 2) {
      const needNewPage: boolean = this.mPageDesktopViewModel.updateAppItemFromFolder(gridLayoutInfo, dragAppInfo);
      Log.showInfo(TAG, `deleteAppByDraging needNewPage: ${needNewPage}`);
      if (needNewPage) {
        return false;
      }
    }

    folderAppList.splice(index, 1);
    if (folderAppList.length > 0 && folderAppList[folderAppList.length - 1].type == CommonConstants.TYPE_ADD) {
      folderAppList.pop();
    }
    const folderLayoutInfo = this.filterFolderPage(folderAppList);
    const openFolderData: {
      folderId: string,
      layoutInfo: any
    } = AppStorage.Get('openFolderData');
    const removeAppInfos = [dragAppInfo];
    const folderIndex = gridLayoutInfo.layoutInfo.findIndex(item => {
      return item.type === CommonConstants.TYPE_FOLDER && item.folderId === openFolderData.folderId;
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
      this.mPageDesktopViewModel.updateAppItemFromFolder(gridLayoutInfo, removeAppInfos[i]);
      const gridLayout = this.createAppLayoutInfo(removeAppInfos[i]);
      gridLayoutInfo.layoutInfo.push(gridLayout);
      appListInfo.push(removeAppInfos[i]);
    }
    this.mPageDesktopViewModel.setLayoutInfo(gridLayoutInfo);
    if (!this.getIsPad()) {
      this.mSettingsModel.setAppListInfo(appListInfo);
    }
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
      type: appInfo.type,
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
    const gridLayoutInfo = this.mPageDesktopViewModel.getLayoutInfo();
    const folderIndex = gridLayoutInfo.layoutInfo.findIndex(item => {
      return item.type === CommonConstants.TYPE_FOLDER && item.folderId === openFolderData.folderId;
    });

    const appListInfo = this.mSettingsModel.getAppListInfo();
    if (folderLayoutInfo.length == 1 && folderLayoutInfo[0].length == 1) {
      // delete from folder and add app to desktop
      const appLayout = {
        bundleName: folderLayoutInfo[0][0].bundleName,
        type: folderLayoutInfo[0][0].type,
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
    this.mPageDesktopViewModel.setLayoutInfo(gridLayoutInfo);
    if (!this.getIsPad()) {
      this.mSettingsModel.setAppListInfo(appListInfo);
    }
    return openFolderData;
  }

  /**
   * Delete folder
   *
   * @param {number} folderId.
   */
  async deleteFolder(folderId) {
    Log.showInfo(TAG, 'deleteFolder start');
    let gridLayoutInfo = {
      layoutInfo: []
    };
    gridLayoutInfo = this.mPageDesktopViewModel.getLayoutInfo();

    const tempGridLayoutInfo = gridLayoutInfo;
    for (let i = 0; i < gridLayoutInfo.layoutInfo.length; i++) {
      if (gridLayoutInfo.layoutInfo[i].type === CommonConstants.TYPE_FOLDER
        && gridLayoutInfo.layoutInfo[i].folderId === folderId) {
        // Push the folder app list into desktop
        tempGridLayoutInfo.layoutInfo.push(gridLayoutInfo.layoutInfo[i].layoutInfo);

        // Delete the folder
        tempGridLayoutInfo.layoutInfo.splice(i, 1);
      }
    }
    this.mPageDesktopViewModel.setLayoutInfo(tempGridLayoutInfo);
  }

  /**
   * add app to folder
   *
   * @param {any} appInfos.
   * @param {number} folderId.
   */
  async addAppToFolder(appInfos, folderId) {
    Log.showInfo(TAG, 'addAppToFolder start');
    let gridLayoutInfo = {
      layoutInfo: []
    };
    gridLayoutInfo = this.mPageDesktopViewModel.getLayoutInfo();

    // Add app to the folder
    for (let i = 0; i < gridLayoutInfo.layoutInfo.length; i++) {
      if (gridLayoutInfo.layoutInfo[i].type === CommonConstants.TYPE_FOLDER &&
        gridLayoutInfo.layoutInfo[i].folderId === folderId) {
        gridLayoutInfo.layoutInfo[i].layoutInfo.push(appInfos);
      }
    }

    // Check whether the app exists in other data
    for (let i = 0; i < gridLayoutInfo.layoutInfo.length; i++) {
      const layoutInfo = gridLayoutInfo.layoutInfo[i];
      for (let j = 0; j < appInfos.length; j++) {
        if (layoutInfo.type === CommonConstants.TYPE_FOLDER && layoutInfo.folderId !== folderId) {
          const indexA = layoutInfo.layoutInfo.indexOf(appInfos[j]);
          if (indexA != CommonConstants.INVALID_VALUE) {
            layoutInfo.layoutInfo.splice(indexA, 1);
          }
        } else {
          const indexB = layoutInfo.indexOf(appInfos[j]);
          if (indexB != CommonConstants.INVALID_VALUE) {
            layoutInfo.splice(indexB, 1);
          }
        }
      }
    }
    this.mPageDesktopViewModel.setLayoutInfo(gridLayoutInfo);
  }

  /**
   * delete app from folder
   *
   * @param {any} appInfo.
   * @param {number} folderId.
   */
  async deleteAppFromFolder(appInfo, folderId) {
    Log.showInfo(TAG, 'deleteAppFromFolder start');
    let gridLayoutInfo = {
      layoutInfo: []
    };
    gridLayoutInfo = this.mPageDesktopViewModel.getLayoutInfo();

    // Add app to desktop app list
    gridLayoutInfo.layoutInfo.push(appInfo);

    // Delete app from the folder
    for (let i = 0; i < gridLayoutInfo.layoutInfo.length; i++) {
      if (gridLayoutInfo.layoutInfo[i].type === CommonConstants.TYPE_FOLDER
        && gridLayoutInfo.layoutInfo[i].folderId === folderId) {
        const index = gridLayoutInfo.layoutInfo[i].layoutInfo.indexOf(appInfo);
        Log.showInfo(TAG, `deleteAppFromFolder app index: ${index}`);
        gridLayoutInfo.layoutInfo[i].layoutInfo.splice(index, 1);
      }
    }
    this.mPageDesktopViewModel.setLayoutInfo(gridLayoutInfo);
  }

  /**
   * update folder app list info
   *
   * @param {any} appInfos.
   * @param {any} folderItem.
   */
  async updateFolderAppList(appInfos, folderItem) {
    Log.showInfo(TAG, 'updateFolderAppList start');
    let removeFolderApp = [];
    let gridLayoutInfoTemp: any;
    let gridLayoutInfo = {
      layoutInfo: []
    };
    gridLayoutInfo = this.mPageDesktopViewModel.getLayoutInfo();
    gridLayoutInfoTemp = this.mPageDesktopViewModel.getLayoutInfo();
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
      this.mPageDesktopViewModel.setLayoutInfo(gridLayoutInfoTemp);
      for (let i = 0; i < removeFolderApp.length; i++) {
        this.mPageDesktopViewModel.addToDesktop(removeFolderApp[i]);
      }
    } else {
      // checked app's count >= 2
      // update badgeNumber of folder
      this.updateFolderBadgeNumber(appInfos, folderItem, gridLayoutInfo, gridLayoutInfoTemp);
      // move app from other folder
      this.moveAppFromOtherFolders(appInfos, folderItem, gridLayoutInfo, gridLayoutInfoTemp);
      // move apps from desktop to folder
      this.moveAppFromDesktopToFolder(appInfos, gridLayoutInfo, gridLayoutInfoTemp);
      // move apps from folder to desktop
      this.moveAppFromFolderToDesktop(appInfos, removeFolderApp);
      // delete blank page
      this.deleteBlankPage();

    }
    Log.showInfo(TAG, 'updateFolderAppList end');
  }

  /**
   * delete blank page
   */
  private deleteBlankPage(): void {
    const layoutInfo = this.mPageDesktopViewModel.getLayoutInfo();
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
    this.mPageDesktopViewModel.setLayoutInfo(layoutInfo);
    this.mPageDesktopViewModel.getGridList();
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
        return item.bundleName === folderAppList[m].bundleName;
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
      if (gridLayoutInfo.layoutInfo[i].type === CommonConstants.TYPE_FOLDER
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
        this.mPageDesktopViewModel.setLayoutInfo(gridLayoutInfoTemp);
        this.mPageDesktopViewModel.getGridList();
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
      if (gridLayoutInfo.layoutInfo[i].type === CommonConstants.TYPE_FOLDER
        && gridLayoutInfo.layoutInfo[i].folderId !== folderItem.folderId) {
        const folderAppList = this.layoutInfoToList(gridLayoutInfo.layoutInfo[i]);
        const appInfosRemaining = this.getAppRemainInOtherFolder(appInfos, folderAppList);
        const thisFolderItemIndex = gridLayoutInfoTemp.layoutInfo.findIndex(item => {
          return item.folderId === gridLayoutInfo.layoutInfo[i].folderId;
        });

        if (appInfosRemaining.length === 0) {
          gridLayoutInfoTemp.layoutInfo.splice(thisFolderItemIndex, 1);
          this.mPageDesktopViewModel.setLayoutInfo(gridLayoutInfoTemp);
          this.mPageDesktopViewModel.getGridList();
        } else if (appInfosRemaining.length === CommonConstants.FOLDER_APP_VALUE) {
          gridLayoutInfoTemp.layoutInfo.splice(thisFolderItemIndex, 1);
          this.mPageDesktopViewModel.setLayoutInfo(gridLayoutInfoTemp);
          this.mPageDesktopViewModel.addToDesktop(appInfosRemaining[0]);
        } else {
          let badgeNumber = 0;
          appInfosRemaining.forEach((item) => {
            if (item.badgeNumber && item.badgeNumber > 0) {
              badgeNumber = badgeNumber + item.badgeNumber;
            }
          });
          gridLayoutInfoTemp.layoutInfo[thisFolderItemIndex].badgeNumber = badgeNumber;
          gridLayoutInfoTemp.layoutInfo[thisFolderItemIndex].layoutInfo = this.filterFolderPage(appInfosRemaining);
          this.mPageDesktopViewModel.setLayoutInfo(gridLayoutInfoTemp);
          this.mPageDesktopViewModel.getGridList();
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
        if (gridLayoutInfo.layoutInfo[j].type == CommonConstants.TYPE_APP &&
          appInfos[i].bundleName == gridLayoutInfo.layoutInfo[j].bundleName) {
          appDesktopToFolder.push(gridLayoutInfo.layoutInfo[j]);
          break;
        }
      }
    }

    if (appDesktopToFolder.length > 0) {
      for (let i = 0; i < appDesktopToFolder.length; i++) {
        const desktopItemIndex = gridLayoutInfoTemp.layoutInfo.indexOf(appDesktopToFolder[i]);
        gridLayoutInfoTemp.layoutInfo.splice(desktopItemIndex, 1);
      }
      this.mPageDesktopViewModel.setLayoutInfo(gridLayoutInfoTemp);
      this.mPageDesktopViewModel.deleteAppItems(appDesktopToFolder);
    }
  }

  /**
   * move app from folder to desktop
   *
   * @param appInfos
   * @param removeFolderApp
   */
  private moveAppFromFolderToDesktop(appInfos, removeFolderApp) {
    const appFolderToDesktop = [];
    for (let i = 0; i < removeFolderApp.length; i++) {
      let remainFlag = false;
      for (let j = 0; j < appInfos.length; j++) {
        if (appInfos[j].bundleName == removeFolderApp[i].bundleName) {
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
        this.mPageDesktopViewModel.addToDesktop(appFolderToDesktop[i]);
      }
    }
  }

  /**
   * get folder list form layout info
   *
   * @param {array} folderIds.
   * @return {array} folderList.
   */
  async getFolderList(folderIds) {
    Log.showInfo(TAG, 'getFolderList start');
    const folderList = [];
    let gridLayoutInfo = {
      layoutInfo: []
    };
    gridLayoutInfo = this.mPageDesktopViewModel.getLayoutInfo();

    // Get folder list form the layout info
    for (let i = 0; i < gridLayoutInfo.layoutInfo.length; i++) {
      if (gridLayoutInfo.layoutInfo[i].type === CommonConstants.TYPE_FOLDER) {
        for (let j = 0; j < folderIds.length; j++) {
          if (gridLayoutInfo.layoutInfo[i].folderId === folderIds[j]) {
            folderList.push(gridLayoutInfo.layoutInfo[i]);
            break;
          }
        }
      }
    }
    AppStorage.SetOrCreate('folderList', folderList);
    return folderList;
  }

  /**
   * get folder app list
   *
   * @param {array} folderId.
   * @return {array} folderAppList.
   */
  async getFolderAppList(folderId) {
    Log.showInfo(TAG, 'getFolderAppList start');
    let folderAppList = [];
    let gridLayoutInfo = {
      layoutInfo: []
    };
    gridLayoutInfo = this.mPageDesktopViewModel.getLayoutInfo();

    // Get folder app list form the layout info
    for (let i = 0; i < gridLayoutInfo.layoutInfo.length; i++) {
      const layoutInfo = gridLayoutInfo.layoutInfo[i];
      if (layoutInfo.type === CommonConstants.TYPE_FOLDER && layoutInfo.folderId === folderId) {
        for (let j = 0; j < layoutInfo.layoutInfo.length; j++) {
          folderAppList = folderAppList.concat(layoutInfo.layoutInfo[j]);
        }
      }
    }
    if (folderAppList.length > 0 && folderAppList[folderAppList.length - 1].type == CommonConstants.TYPE_ADD) {
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
    Log.showInfo(TAG, 'getAllFolderList start');
    const folderList = [];
    let gridLayoutInfo = {
      layoutInfo: []
    };
    gridLayoutInfo = this.mPageDesktopViewModel.getLayoutInfo();

    // Get folder list form the layout info
    for (let i = 0; i < gridLayoutInfo.layoutInfo.length; i++) {
      if (gridLayoutInfo.layoutInfo[i].type === CommonConstants.TYPE_FOLDER) {
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
    Log.showInfo(TAG, 'getFolderAddAppList start');
    const allAppList = [];
    let appInfos: any;
    let gridLayoutInfo = {
      layoutInfo: []
    };
    gridLayoutInfo = this.mPageDesktopViewModel.getLayoutInfo();
    const appListInfo = await this.mAppModel.getAppList();

    // first push this current app
    for (let i = 0; i < gridLayoutInfo.layoutInfo.length; i++) {
      const layoutInfo = gridLayoutInfo.layoutInfo[i];
      if (layoutInfo.type === CommonConstants.TYPE_FOLDER && layoutInfo.folderId === folderId) {
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

    if (allAppList.length > 0 && allAppList[allAppList.length - 1].type == CommonConstants.TYPE_ADD) {
      allAppList.pop();
    }

    for (let i = 0; i < appListInfo.length; i++) {
      let isExist = false;
      for (let j = 0; j < allAppList.length; j++) {
        if (appListInfo[i].bundleName === allAppList[j].bundleName) {
          isExist = true;
          break;
        }
      }
      if (!isExist) {
        appListInfo[i].checked = false;
        allAppList.push(appListInfo[i]);
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
    Log.showInfo(TAG, 'addAddIcon start');

    if (folderItem.layoutInfo.length == 0) {
      return folderItem;
    }
    const lastPageItem = folderItem.layoutInfo[folderItem.layoutInfo.length - 1];
    if (lastPageItem[lastPageItem.length - 1].type === CommonConstants.TYPE_ADD) {
      return folderItem;
    }

    const openFolderConfig = this.mFolderModel.getFolderOpenLayout();
    const column = openFolderConfig.column;
    const row = openFolderConfig.row;
    const addInfo = {
      type: CommonConstants.TYPE_ADD,
      appName: $r('app.string.add'),
      bundleName: '',
      appIconId: FolderStyleConstants.DEFAULT_ADD_FOLDER_APP_IMAGE,
      appLabelId: 0
    };
    if (folderItem.layoutInfo[folderItem.layoutInfo.length - 1].length === column * row) {
      folderItem.layoutInfo.push([addInfo]);
    } else {
      folderItem.layoutInfo[folderItem.layoutInfo.length - 1].push(addInfo);
    }

    Log.showInfo(TAG, 'addAddIcon end');
    return folderItem;
  }

  /**
   * open folder
   *
   * @param {any} folderInfo.
   */
  delAddIcon(folderItem: any): any {
    Log.showInfo(TAG, 'delAddIcon start');

    if (folderItem.layoutInfo.length == 0) {
      return folderItem;
    }
    const lastPageItem = folderItem.layoutInfo[folderItem.layoutInfo.length - 1];
    if (lastPageItem[lastPageItem.length - 1].type !== CommonConstants.TYPE_ADD) {
      return folderItem;
    }
    lastPageItem.pop();
    if (lastPageItem.length == 0) {
      folderItem.layoutInfo.pop();
    } else {
      folderItem.layoutInfo[folderItem.layoutInfo.length - 1] = lastPageItem;
    }

    Log.showInfo(TAG, 'delAddIcon end');
    return folderItem;
  }

  /**
   * open folder
   *
   * @param {any} folderInfo.
   */
  async openFolder(isRename: boolean, folderItem: any) {
    Log.showInfo(TAG, 'openFolder start');
    folderItem.enterEditing = isRename;

    AppStorage.SetOrCreate('openFolderData', folderItem);
    this.mPageIndex = 0;
    AppStorage.SetOrCreate('openFolderPageIndex', this.mPageIndex);
    AppStorage.SetOrCreate('openFolderStatus', FeatureConstants.OPEN_FOLDER_STATUS_OPEN);
    Log.showInfo(TAG, 'openFolder end');
  }

  /**
   * close folder
   */
  async closeFolder() {
    Log.showInfo(TAG, 'closeFolder start');

    this.mPageIndex = 0;
    AppStorage.SetOrCreate('openFolderPageIndex', this.mPageIndex);
    AppStorage.SetOrCreate('openFolderStatus', FeatureConstants.OPEN_FOLDER_STATUS_CLOSE);
  }

  /**
   * refresh folder data
   *
   * @param folderItem
   */
  async refreshFolder(folderItem: any) {
    Log.showInfo(TAG, 'refreshFolder start');
    folderItem.enterEditing = false;
    AppStorage.SetOrCreate('openFolderData', folderItem);
    if (folderItem.folderId == '') {
      AppStorage.SetOrCreate('openFolderStatus', FeatureConstants.OPEN_FOLDER_STATUS_CLOSE);
    } else {
      AppStorage.SetOrCreate('openFolderStatus', FeatureConstants.OPEN_FOLDER_STATUS_REFRESH);
    }
    Log.showInfo(TAG, 'refreshFolder end');
  }

  /**
   * get device type
   *
   * @return {boolean} isPad.
   */
  getIsPad(): boolean {
    return this.mPageDesktopViewModel.getDevice();
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
    gridLayoutInfo = this.mPageDesktopViewModel.getLayoutInfo();

    for (let i = 0; i < gridLayoutInfo.layoutInfo.length; i++) {
      if (gridLayoutInfo.layoutInfo[i].type === CommonConstants.TYPE_FOLDER &&
        gridLayoutInfo.layoutInfo[i].folderId === folderModel.folderId) {
        gridLayoutInfo.layoutInfo[i].folderName = folderModel.folderName;
      }
    }
    this.mPageDesktopViewModel.setLayoutInfo(gridLayoutInfo);
  }

  /**
   * make the applist into folder page
   *
   * @param appInfos
   */
  filterFolderPage(appInfos): any[] {
    const folderLayoutInfo = [];
    const appListInfo = JSON.parse(JSON.stringify(appInfos));
    const openFolderConfig = this.mFolderModel.getFolderOpenLayout();

    const itemCountByPage = openFolderConfig.column * openFolderConfig.row;
    let pageCount = Math.floor(appListInfo.length / itemCountByPage);
    if (appListInfo.length % itemCountByPage != 0) {
      pageCount = pageCount + 1;
    }
    Log.showInfo(TAG, `filterFolderPage pageCount: ${pageCount}`);
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
        if (folderInfo.layoutInfo[i][j].type != CommonConstants.TYPE_ADD) {
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
    const folderConfig = this.mFolderModel.getFolderLayout();
    const folderName = await this.generateFolderName();
    // Create new folder info
    const folderInfo = {
      folderId: this.getUUID(),
      folderName: folderName,
      layoutInfo: [],
      type: CommonConstants.TYPE_FOLDER,
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
    Log.showInfo(TAG, 'generateFolderName start');
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
    Log.showInfo(TAG, 'getUUID start');
    let id = Date.now().toString(HEXADECIMAL_VALUE);
    id += Math.random().toString(HEXADECIMAL_VALUE).substr(2);
    return id;
  }

  /**
   * change the open folder page number.
   *
   * @param idx: Page number
   */
  changeIndexOnly(idx): void {
    this.mPageIndex = idx;
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
    return this.mFolderModel.getFolderAddAppLayout().column;
  }

  /**
   * get add app dialog's height
   *
   * @param appList
   */
  getDialogHeight(appList: []): number {
    let height = 0;
    const styleConfig = this.mFolderStyleConfig;
    const column = this.mFolderModel.getFolderAddAppLayout().column;
    const row = this.mFolderModel.getFolderAddAppLayout().row;
    const num = Math.ceil(appList.length / column);
    if (num <= row) {
      height = styleConfig.mAddFolderDialogHeight;
    } else {
      const gridHeight = num * styleConfig.mAddFolderItemSize + (num - 1) * styleConfig.mAddFolderGridGap;
      height = gridHeight + FolderStyleConstants.DEFAULT_APP_ADD_TITLE_SIZE + FolderStyleConstants.DEFAULT_BUTTON_HEIGHT +
        FolderStyleConstants.DEFAULT_DIALOG_BOTTOM_MARGIN;
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
    Log.showInfo(TAG, 'deleteAppFromFolderByUninstall start');
    const gridLayoutInfo = this.mSettingsModel.getLayoutInfo();
    const layoutInfo = gridLayoutInfo.layoutInfo;
    let changeFlag = false;
    for (let i = 0; i < layoutInfo.length; i++) {
      if (changeFlag) {
        break;
      }
      if (layoutInfo[i].type == CommonConstants.TYPE_FOLDER) {
        const folderAppList = this.layoutInfoToList(layoutInfo[i]);
        for (let m = 0; m < folderAppList.length; m++) {
          if (folderAppList[m].bundleName == bundleName) {
            folderAppList.splice(m, 1);
            this.updateFolderInfo(folderAppList, gridLayoutInfo, i);
            changeFlag = true;
            break;
          }
        }
      }
    }
    Log.showInfo(TAG, 'deleteAppFromFolderByUninstall end');
  }

  /**
   * update layoutInfo when only one item in the folder
   *
   * @param folderAppList
   * @param gridLayoutInfo
   * @param index
   */
  private updateFolderInfo(folderAppList, gridLayoutInfo, index): void {
    if (folderAppList.length == 1) {
      const appLayoutInfo = {
        'bundleName': folderAppList[0].bundleName,
        'type': CommonConstants.TYPE_APP,
        'area': [1, 1],
        'page': gridLayoutInfo.layoutInfo[index].page,
        'column': gridLayoutInfo.layoutInfo[index].column,
        'row': gridLayoutInfo.layoutInfo[index].row
      };
      gridLayoutInfo.layoutInfo.splice(index, 1);
      gridLayoutInfo.layoutInfo.push(appLayoutInfo);
      this.mSettingsModel.setLayoutInfo(gridLayoutInfo);
      this.mPageDesktopViewModel.addToDesktop(folderAppList[0]);
    } else {
      gridLayoutInfo.layoutInfo[index].layoutInfo = this.filterFolderPage(folderAppList);
      this.mSettingsModel.setLayoutInfo(gridLayoutInfo);
      this.mPageDesktopViewModel.getGridList();
    }
  }

  /**
   * remove app from folder
   *
   * @param {any} appInfo.
   */
  removeAppOutOfFolder(appInfo): boolean {
    let openFolderData: {
      folderId: string,
      layoutInfo: any
    } = AppStorage.Get('openFolderData');

    const folderAppList = this.getAppListInFolder(openFolderData);
    const gridLayoutInfo = this.mPageDesktopViewModel.getLayoutInfo();
    if (folderAppList.length > 2) {
      const needNewPage: boolean = this.mPageDesktopViewModel.updateAppItemFromFolder(gridLayoutInfo, appInfo);
      Log.showInfo(TAG, `removeAppOutOfFolder needNewPage: ${needNewPage}`);
      if (needNewPage) {
        return false;
      }
    }

    this.deleteAppFromFolderAppList(appInfo, folderAppList);
    const folderLayoutInfo = this.filterFolderPage(folderAppList);

    const removeAppInfos = [appInfo];
    const folderIndex = gridLayoutInfo.layoutInfo.findIndex(item => {
      return item.type === CommonConstants.TYPE_FOLDER && item.folderId === openFolderData.folderId;
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
      this.mPageDesktopViewModel.updateAppItemFromFolder(gridLayoutInfo, removeAppInfos[i]);
      const gridLayout = this.createAppLayoutInfo(removeAppInfos[i]);
      gridLayoutInfo.layoutInfo.push(gridLayout);
      const appIndex = appListInfo.findIndex(item => {
        return item.bundleName === removeAppInfos[i].bundleName && item.abilityName === removeAppInfos[i].abilityName;
      })
      if (appIndex == CommonConstants.INVALID_VALUE) {
        appListInfo.push(removeAppInfos[i]);
      }
    }
    this.mPageDesktopViewModel.setLayoutInfo(gridLayoutInfo);
    if (!this.getIsPad()) {
      this.mSettingsModel.setAppListInfo(appListInfo);
    }
    this.mPageDesktopViewModel.getGridList();
    this.updateOpenFolderStatus(openFolderData);
    return true;
  }

  /**
   * update folderData and openFolderStatus
   *
   * @param openFolderData
   */
  private updateOpenFolderStatus(openFolderData): void {
    AppStorage.SetOrCreate('openFolderData', openFolderData);
    if (openFolderData.folderId == '') {
      AppStorage.SetOrCreate('openFolderStatus', FeatureConstants.OPEN_FOLDER_STATUS_CLOSE);
    } else {
      AppStorage.SetOrCreate('openFolderStatus', FeatureConstants.OPEN_FOLDER_STATUS_REFRESH);
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
      return item.bundleName === appInfo.bundleName;
    });
    folderAppList.splice(appIndex, 1);
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
    if (folderAppList.length > 0 && folderAppList[folderAppList.length - 1].type == CommonConstants.TYPE_ADD) {
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
      return item.bundleName === appInfo.bundleName;
    });
    folderAppList.splice(index, 1);
    return this.filterFolderPage(folderAppList);
  }

}