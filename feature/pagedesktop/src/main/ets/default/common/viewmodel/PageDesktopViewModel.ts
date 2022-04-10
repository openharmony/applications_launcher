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

import Prompt from '@ohos.prompt';
import BaseAppPresenter from '../../../../../../../../common/src/main/ets/default/base/BaseAppPresenter';
import BigFolderModel from '../../../../../../../bigfolder/src/main/ets/default/common/BigFolderModel';
import FormDetailLayoutConfig from '../../../../../../../form/src/main/ets/default/common/FormDetailLayoutConfig';
import FormModel from '../../../../../../../../common/src/main/ets/default/model/FormModel';
import SettingsModel from '../../../../../../../../common/src/main/ets/default/model/SettingsModel';
import SettingsModelObserver from '../../../../../../../../common/src/main/ets/default/model/SettingsModelObserver';
import CommonConstants from '../../../../../../../../common/src/main/ets/default/constants/CommonConstants';
import StyleConstants from '../../../../../../../../common/src/main/ets/default/constants/StyleConstants';
import EventConstants from '../../../../../../../../common/src/main/ets/default/constants/EventConstants';
import LayoutConfigManager from '../../../../../../../../common/src/main/ets/default/layoutconfig/LayoutConfigManager';
import MenuInfo from '../../../../../../../../common/src/main/ets/default/bean/MenuInfo';
import CardItemInfo from '../../../../../../../../common/src/main/ets/default/bean/CardItemInfo';
import FeatureConstants from '../constants/FeatureConstants';
import PageDesktopGridStyleConfig from '../PageDesktopGridStyleConfig';
import PageDesktopModel from '../model/PageDesktopModel';
import BadgeManager from '../../../../../../../../common/src/main/ets/default/manager/BadgeManager';
import FormManager from '../../../../../../../../common/src/main/ets/default/manager/FormManager';
import FormListInfoCacheManager from '../../../../../../../../common/src/main/ets/default/cache/FormListInfoCacheManager';
import Log from '../../../../../../../../common/src/main/ets/default/utils/Log';
import windowManager from '../../../../../../../../common/src/main/ets/default/manager/WindowManager';
import CheckEmptyUtils from '../../../../../../../../common/src/main/ets/default/utils/CheckEmptyUtils';
import ResourceManager from '../../../../../../../../common/src/main/ets/default/manager/ResourceManager';

const TAG = 'PageDesktopViewModel';
const KEY_APP_LIST = 'appListInfo';
const KEY_FORM_LIST = 'formListInfo';

export default class PageDesktopViewModel extends BaseAppPresenter {
  private readonly pageDesktopStyleConfig: PageDesktopGridStyleConfig = null;
  private readonly formDetailLayoutConfig: FormDetailLayoutConfig = null;
  private readonly mSettingsModel: SettingsModel;
  private readonly mFolderModel: BigFolderModel;
  private readonly mFormModel: FormModel;
  private readonly mPageDesktopModel: PageDesktopModel;
  private readonly mBadgeManager: BadgeManager;
  private readonly mFormListInfoCacheManager: FormListInfoCacheManager;
  private readonly mAppInfoList;
  private mBundleInfoList;
  private mHideBundleInfoList = new Array<any>();
  private mGridConfig;
  private mPageIndex = 0;
  private mGridAppsInfos;
  private readonly mPageCoordinateData = {
    gridXAxis: [],
    gridYAxis: []
  };
  private isPad = false;
  private desktopSwiperController: SwiperController;

  async showFormManager(params) {
    Log.showInfo(TAG, `showFormManager params: ${JSON.stringify(params)}`);
    globalThis.createWindowWithName(windowManager.FORM_MANAGER_WINDOW_NAME, windowManager.FORM_MANAGER_RANK);
  }
  
  setSwiperController(swiperController: SwiperController) {
    this.desktopSwiperController = swiperController;
  }

  showNext() {
    Log.showInfo(TAG, 'show next page')
    this.desktopSwiperController?.showNext();
  }

  showPrevious() {
    Log.showInfo(TAG, 'show previous page')
    this.desktopSwiperController?.showPrevious();
  }

  private readonly mLocalEventListener = {
    onReceiveEvent: (event, params) => {
      console.info('Launcher PageDesktop receive event: ' + event + ', params: ' + params);
      if (!this.isPad) {
        if (event === EventConstants.EVENT_BADGE_UPDATE) {
          this.updateBadgeNumber(params);
        } else if (event === EventConstants.EVENT_REQUEST_JUMP_TO_FORM_VIEW) {
          this.showFormManager(params);
        } else {
          this.mHideBundleInfoList = params;
          this.getGridList();
        }
      }else{
        if (event === EventConstants.EVENT_REQUEST_PAGEDESK_ITEM_ADD) {
          this.addToDesktop(params);
        } else if (event === EventConstants.EVENT_BADGE_UPDATE) {
          this.updateBadgeNumber(params);
        } else if (event === EventConstants.EVENT_REQUEST_FORM_ITEM_ADD) {
          this.addFormToDesktop(params);
        } else if (event === EventConstants.EVENT_REQUEST_PAGEDESK_ITEM_DELETE) {
          this.deleteAppItem(params)
        }
      }
    }
  };

  private readonly mSettingsChangeObserver: SettingsModelObserver = (event: number)=> {
    console.info('Launcher PageDesktopViewModel mSettingsChangeObserver event is ' + event);

    this.mGridConfig = this.getGridConfig();
    this.pagingFiltering();
  };

  private constructor() {
    super();
    this.mPageDesktopModel = PageDesktopModel.getInstance();
    this.mFolderModel = BigFolderModel.getInstance();
    this.mFormModel = FormModel.getInstance();
    this.mSettingsModel = SettingsModel.getInstance();
    this.mBadgeManager = BadgeManager.getInstance();
    this.mFormListInfoCacheManager = FormListInfoCacheManager.getInstance();
    this.mSettingsModel.forceReloadConfig();
    this.mSettingsModel.addObserver(this.mSettingsChangeObserver);
    this.onPageDesktopCreate();
    this.mGridConfig = this.getGridConfig();
    this.pageDesktopStyleConfig = LayoutConfigManager.getStyleConfig(PageDesktopGridStyleConfig.APP_GRID_STYLE_CONFIG,
      FeatureConstants.FEATURE_NAME);
    this.formDetailLayoutConfig = LayoutConfigManager.getStyleConfig(FormDetailLayoutConfig.FORM_LAYOUT_INFO,
      FeatureConstants.FEATURE_NAME);
    AppStorage.SetOrCreate('pageIndex', this.mPageIndex);
  }

  /**
    * Obtains the PageDesktopViewModel instance.
    *
    * @return PageDesktopViewModel
   */
  static getInstance(): PageDesktopViewModel {
    if (globalThis.PageDesktopViewModel == null) {
      globalThis.PageDesktopViewModel = new PageDesktopViewModel();
    }
    return globalThis.PageDesktopViewModel;
  }

  /**
   * Registering Listening Events.
   */
  private onPageDesktopCreate() {
    console.info('Launcher PageDesktopViewModel onPageDesktopCreate');
    this.mAppModel.registerAppListEvent();
    this.mPageDesktopModel.registerPageDesktopItemAddEvent(this.mLocalEventListener);
    this.mPageDesktopModel.registerPageDesktopBadgeUpdateEvent(this.mLocalEventListener);
    this.mFormModel.registerJumpToFormViewEvent(this.mLocalEventListener);
  }

  /**
   * Unregistering Listening Events.
   */
  private onPageDesktopDestroy() {
    console.info('Launcher PageDesktopViewModel onPageDesktopDestroy');
    this.mAppModel.unregisterAppListEvent();
    this.mPageDesktopModel.unregisterEventListener(this.mLocalEventListener);
    this.mFormModel.unregisterEventListener(this.mLocalEventListener);
  }

  /**
   * Obtains the application list displayed on the desktop.
   */
  async getGridList() {
    const appInfoList = await this.getAppList();
    const bundleInfoListTemp = [];
    this.appendAppData(appInfoList, bundleInfoListTemp);
    const folderInfoList = await this.mFolderModel.getFolderList();
    this.appendFolderData(folderInfoList, bundleInfoListTemp);
    let formInfoList: any = this.mFormListInfoCacheManager.getCache(KEY_FORM_LIST);
    if (formInfoList == CommonConstants.INVALID_VALUE) {
      formInfoList = await this.mFormModel.getAllFormsInfoFromRdb();
      if (formInfoList && formInfoList.length > 0) {
        this.mFormListInfoCacheManager.setCache(KEY_FORM_LIST, formInfoList);
      }
    }
    this.appendFormData(formInfoList, bundleInfoListTemp);
    if (!this.isPad) {
      this.mAppListInfoCacheManager.setCache(KEY_APP_LIST, this.mBundleInfoList);
    }
    this.mBundleInfoList = bundleInfoListTemp;
    this.pagingFiltering();

  }

  private async getAppList() {
    let tempAppInfoList = await this.mAppModel.getAppList();
    if (this.isPad) {
      console.info('Launcher PageDesktopViewModel getAppList info start');
      const info = this.mSettingsModel.getAppListInfo();
      if (!this.mSettingsModel.isAppListInfoExit() && this.ifInfoIsNull(info)) {
        for (const i in tempAppInfoList) {
          info.push(tempAppInfoList[i]);
        }
      }
      for (const i in info) {
        let hasUninstalled = true;
        await ResourceManager.getInstance().updateIconCache(info[i].appIconId, info[i].bundleName);
        for (const j in tempAppInfoList) {
          if (info[i].bundleName == tempAppInfoList[j].bundleName) {
            hasUninstalled = false;
            break;
          }
        }
        if (hasUninstalled) {
          info.splice(i, 1);
        }
      }
      tempAppInfoList = info;
      this.mSettingsModel.setAppListInfo(tempAppInfoList);
    } else {
      const gridLayoutInfo = this.getLayoutInfo();
      const layoutInfo = gridLayoutInfo.layoutInfo;
      for (let i = 0; i < layoutInfo.length; i++) {
        if (layoutInfo[i].type == CommonConstants.TYPE_FOLDER) {
          for (let j = 0; j < layoutInfo[i].layoutInfo.length; j++) {
            for (let k = 0; k < layoutInfo[i].layoutInfo[j].length; k++) {
              const appInfo = tempAppInfoList.find(item => {
                if (item.bundleName == layoutInfo[i].layoutInfo[j][k].bundleName) {
                  return true;
                }
              });
              if (!this.ifInfoIsNull(appInfo)) {
                const index = tempAppInfoList.indexOf(appInfo);
                tempAppInfoList.splice(index, 1);
              }
            }
          }
        }
      }
      this.mSettingsModel.setAppListInfo(tempAppInfoList);
    }
    console.info('Launcher PageDesktopViewModel getAppList:' + tempAppInfoList.length);
    AppStorage.SetOrCreate('isDesktopLoadFinished', true);
    return tempAppInfoList;
  }

  /**
   * delete app in pageDesktop
   * @param abilityName
   * @param bundleName
   */
  deleteAppItem(bundleName) {
    this.mBundleInfoList = this.mSettingsModel.getAppListInfo();
    console.info('Launcher PageDesktopViewModel deleteAppItem:mBundleInfoList' + this.mBundleInfoList.length);
    for (let i = 0; i < this.mBundleInfoList.length; i++) {
      if (this.mBundleInfoList[i].bundleName === bundleName) {
        console.info('Launcher PageDesktopViewModel deleteAppItem:abilityName:' + bundleName);
        this.mBundleInfoList.splice(i, 1);
        break;
      }
    }
    this.mSettingsModel.setAppListInfo(this.mBundleInfoList);

    const gridLayoutInfo = this.getLayoutInfo();
    const layoutInfo = gridLayoutInfo.layoutInfo;
    for (let i = 0; i < layoutInfo.length; i++) {
      if (layoutInfo[i].type == CommonConstants.TYPE_APP && layoutInfo[i].bundleName == bundleName) {
        const page = layoutInfo[i].page;
        gridLayoutInfo.layoutInfo.splice(i, 1);
        this.deleteBlankPageFromLayoutInfo(gridLayoutInfo, page);
        this.setLayoutInfo(gridLayoutInfo);
        break;
      }
    }
    this.getGridList();
  }

  /**
   * delete apps in pageDesktop
   * @param appListInfo
   */
  deleteAppItems(appListInfo) {
    this.mBundleInfoList = this.mSettingsModel.getAppListInfo();
    console.info('Launcher PageDesktop deleteAppItems:mBundleInfoList:' + this.mBundleInfoList.length);
    for (let j = 0; j < appListInfo.length; j++) {
      for (let i = 0; i < this.mBundleInfoList.length; i++) {
        if (this.mBundleInfoList[i].bundleName === appListInfo[j].bundleName) {
          this.mBundleInfoList.splice(i, 1);
          break;
        }
      }
    }

    this.mSettingsModel.setAppListInfo(this.mBundleInfoList);
    this.getGridList();
  }

  /**
   * add app to pageDesktop
   * @param appInfo
   */
  addToDesktop(appInfo) {
    console.info('Launcher PageDesktopViewModel addToDesktop bundleName ' + appInfo.bundleName);
    this.mBundleInfoList = this.mSettingsModel.getAppListInfo();
    this.mGridConfig = this.getGridConfig();
    const column = this.mGridConfig.column;
    const row = this.mGridConfig.row;
    console.info('Launcher PageDesktopViewModel addToDesktop mBundleInfoList ' + JSON.stringify(this.mBundleInfoList));
    for (let i = 0; i < this.mBundleInfoList.length; i++) {
      console.info('Launcher PageDesktopViewModel addToDesktop for' + appInfo.bundleName);
      if (this.mBundleInfoList[i].bundleName === appInfo.bundleName) {
        Prompt.showToast({
          message: $r('app.string.duplicate_add')
        });
        return;
      }
    }
    this.mBundleInfoList.push(appInfo);
    this.mSettingsModel.setAppListInfo(this.mBundleInfoList);
    this.getGridList();
  }

  /**
   * add form to pageDesktop
   * @param appInfo
   */
  addFormToDesktop(formInfo) {
    console.info('Launcher PageDesktopViewModel addFormToDesktop');
    this.mBundleInfoList = this.mSettingsModel.getAppListInfo();
    switch(formInfo.dimension) {
    case FormDimension.Dimension_1_2:
      formInfo.row = this.formDetailLayoutConfig.getFormLayoutInfo().formLayoutDimension1X2.row;
      formInfo.column = this.formDetailLayoutConfig.getFormLayoutInfo().formLayoutDimension1X2.column;
      formInfo.area = this.formDetailLayoutConfig.getFormLayoutInfo().formLayoutDimension1X2.area;
      break;
    case FormDimension.Dimension_2_2:
      formInfo.row = this.formDetailLayoutConfig.getFormLayoutInfo().formLayoutDimension2X2.row;
      formInfo.column = this.formDetailLayoutConfig.getFormLayoutInfo().formLayoutDimension2X2.column;
      formInfo.area = this.formDetailLayoutConfig.getFormLayoutInfo().formLayoutDimension2X2.area;
      break;
    case FormDimension.Dimension_2_4:
      formInfo.row = this.formDetailLayoutConfig.getFormLayoutInfo().formLayoutDimension2X4.row;
      formInfo.column = this.formDetailLayoutConfig.getFormLayoutInfo().formLayoutDimension2X4.column;
      formInfo.area = this.formDetailLayoutConfig.getFormLayoutInfo().formLayoutDimension2X4.area;
      break;
    case FormDimension.Dimension_4_4:
      formInfo.row = this.formDetailLayoutConfig.getFormLayoutInfo().formLayoutDimension4X4.row;
      formInfo.column = this.formDetailLayoutConfig.getFormLayoutInfo().formLayoutDimension4X4.column;
      formInfo.area = this.formDetailLayoutConfig.getFormLayoutInfo().formLayoutDimension4X4.area;
      break;
    default:
      break;
    }
    this.mBundleInfoList.push(formInfo);
    this.mSettingsModel.setAppListInfo(this.mBundleInfoList);
    this.getGridList();
  }

  /**
   * update badge in desktop
   * @param badgeInfo
   */
  updateBadgeNumber(badgeInfo) {
    console.info('Launcher PageDesktopViewModel updateBadgeNumber bundleName ' + badgeInfo.bundleName);
    this.mBundleInfoList = this.mSettingsModel.getAppListInfo();

    let appInfo = this.mBundleInfoList.find(item => {
      if (item.bundleName == badgeInfo.bundleName) {
        return true;
      }
    });
    if (!this.ifInfoIsNull(appInfo)) {
      appInfo.badgeNumber = badgeInfo.badgeNumber;
      this.mSettingsModel.setAppListInfo(this.mBundleInfoList);
      this.getGridList();
    } else {
      const gridLayoutInfo = this.getLayoutInfo();
      const layoutInfo = gridLayoutInfo.layoutInfo;
      let hasFound = false;
      for (let i = 0; i < layoutInfo.length; i++) {
        if (hasFound) {
          break;
        }
        if (layoutInfo[i].type == CommonConstants.TYPE_FOLDER && !hasFound) {
          for (let j = 0; j < layoutInfo[i].layoutInfo.length; j++) {
            appInfo = layoutInfo[i].layoutInfo[j].find(item => {
              if (item.bundleName == badgeInfo.bundleName) {
                return true;
              }
            });

            if (!this.ifInfoIsNull(appInfo)) {
              hasFound = true;
              let oldBadge = 0;
              if (layoutInfo[i].badgeNumber && layoutInfo[i].badgeNumber > 0) {
                if (appInfo.badgeNumber && appInfo.badgeNumber > 0) {
                  oldBadge = layoutInfo[i].badgeNumber - appInfo.badgeNumber;
                } else {
                  oldBadge = layoutInfo[i].badgeNumber;
                }
              }
              layoutInfo[i].badgeNumber = oldBadge + badgeInfo.badgeNumber;
              appInfo.badgeNumber = badgeInfo.badgeNumber;
              break;
            }
          }
        }
      }
      if (hasFound) {
        this.setLayoutInfo(gridLayoutInfo);
        this.getGridList();
      }
    }
  }

  /**
   * add app to pageDesktop by draging
   * @param appInfo
   */
  addToDesktopByDraging(appInfo) {
    console.info('Launcher PageDesktop addToDesktopByDraging bundleName ' + appInfo.bundleName);
    this.mGridConfig = this.mSettingsModel.getGridConfig();
    const column = this.mGridConfig.column;
    const row = this.mGridConfig.row;

    for (let i = 0; i < this.mBundleInfoList.length; i++) {
      if (this.mBundleInfoList[i].bundleName === appInfo.bundleName) {
        Prompt.showToast({
          message: $r('app.string.duplicate_add')
        });
        return;
      }
    }
    this.mBundleInfoList.push(appInfo);
    this.mSettingsModel.setAppListInfo(this.mBundleInfoList);
    this.getGridList();
  }

  /**
   * add app to dock
   * @param appInfo
   */
  addToDock(appInfo) {
    this.mPageDesktopModel.sendDockItemChangeEvent(appInfo);
  }

  /**
   * jump to form manager
   * @param formInfo
   */
  jumpToFormManagerView(formInfo) {
    this.mFormModel.sendJumpFormViewEvent(formInfo);
  }

  private appendAppData(appInfoList, bundleInfoList) {
    for (let i = 0; i < appInfoList.length; i++) {
      if (this.isInHideAppList(appInfoList[i])) {
        continue;
      }
      appInfoList[i].type = CommonConstants.TYPE_APP;
      appInfoList[i].area = [1, 1];
      bundleInfoList.push(appInfoList[i]);
    }
  }

  private isInHideAppList(appInfo): boolean {
    for (const hideInfo of this.mHideBundleInfoList) {
      if (appInfo.bundleName == hideInfo.bundleName && appInfo.abilityName == hideInfo.abilityName) {
        return true;
      }
    }
    return false;
  }

  private appendFolderData(folderInfoList, bundleInfoList) {
    for (let i = 0; i < folderInfoList.length; i++) {
      for (let j = 0; j < folderInfoList[i].layoutInfo.length; j++) {
        for (let k = 0; k < folderInfoList[i].layoutInfo[j].length; k++) {
          for (let l = 0; l < bundleInfoList.length; l++) {
            if (folderInfoList[i].layoutInfo[j][k].bundleName == bundleInfoList[l].bundleName) {
              bundleInfoList.splice(l, 1);
              break;
            }
          }
        }
      }
    }
  }

  private appendFormData(formInfoList, bundleInfoList) {
    for (let i = 0; i < formInfoList.length; i++) {
      formInfoList[i].type = CommonConstants.TYPE_CARD;
      bundleInfoList.push(formInfoList[i]);
    }
  }

  /**
   * Obtains Grid Configuration.
   */
  getGridConfig() {
    return this.mSettingsModel.getGridConfig();
  }

  /**
   * refresh page
   */
  pagingFiltering() {
    const appInfo = {
      appGridInfo: []
    };
    const appListInfo = [];
    const info = this.getAndSetLayoutInfo();
    const layoutInfo = info.layoutInfo;

    for (let i = 0; i < layoutInfo.length; i++) {
      if (layoutInfo[i].type == CommonConstants.TYPE_APP) {
        for (let j = 0; j < this.mBundleInfoList.length; j++) {
          if (layoutInfo[i].bundleName == this.mBundleInfoList[j].bundleName
          && layoutInfo[i].type == this.mBundleInfoList[j].type) {
            this.mBundleInfoList[j].area = layoutInfo[i].area;
            this.mBundleInfoList[j].page = layoutInfo[i].page;
            this.mBundleInfoList[j].row = layoutInfo[i].row;
            this.mBundleInfoList[j].column = layoutInfo[i].column;
            this.mBundleInfoList[j].x = 0;
            appListInfo.push(this.mBundleInfoList[j]);
          }
        }
      } else if (layoutInfo[i].type == CommonConstants.TYPE_FOLDER) {
        appListInfo.push(layoutInfo[i]);
      } else if (layoutInfo[i].type == CommonConstants.TYPE_CARD) {
        for (let j = 0; j < this.mBundleInfoList.length; j++) {
          if (layoutInfo[i].cardId == this.mBundleInfoList[j].cardId
          && layoutInfo[i].type == this.mBundleInfoList[j].type) {
            this.mBundleInfoList[j].cardId = layoutInfo[i].cardId;
            this.mBundleInfoList[j].area = layoutInfo[i].area;
            this.mBundleInfoList[j].page = layoutInfo[i].page;
            this.mBundleInfoList[j].row = layoutInfo[i].row;
            this.mBundleInfoList[j].column = layoutInfo[i].column;
            this.mBundleInfoList[j].x = 0;
            appListInfo.push(this.mBundleInfoList[j]);
          }
        }
      }
    }
    appInfo.appGridInfo = this.integrateSwiper(appListInfo);
    console.log('Launcher PageDesktopViewModel pagingFiltering appListInfo length:' + appListInfo.length);
    AppStorage.SetOrCreate('selectDesktopAppItem', '');
    AppStorage.SetOrCreate(KEY_APP_LIST, appInfo);
  }

  private integrateSwiper(list) {
    const gridAppsInfos = [];
    const allPageCount = this.getLayoutInfo().layoutDescription.pageCount;
    let max = allPageCount;
    for (let i = 0;i < list.length; i++) {
      if (max < list[i].page) {
        max = list[i].page;
      }
    }

    for (let i = 0;i < max; i++) {
      gridAppsInfos.push([]);
    }

    for (let i = 0;i < list.length; i++) {
      gridAppsInfos[list[i].page].push(list[i]);
    }
    this.mGridAppsInfos = gridAppsInfos;
    return gridAppsInfos;
  }

  private getAndSetLayoutInfo() {
    let info = {
      layoutInfo: []
    };
    info = this.getLayoutInfo();
    const isLegal = this.ifLayoutRationality(info);
    if (isLegal) {
      info = this.updateLayoutInfo(info);
    } else {
      info = this.updateLayoutInfo(this.createNewLayoutInfo());
    }
    this.setLayoutInfo(info);
    return info;
  }

  ifLayoutRationality = (info) => {
    //verify whether the info is null.
    if (this.ifInfoIsNull(info)) {
      return false;
    }
    const layoutDescription = info.layoutDescription;

    //verify whether the layoutDescription is different.
    this.mGridConfig = this.getGridConfig();
    const column = this.mGridConfig.column;
    const row = this.mGridConfig.row;
    if (this.ifDescriptionIsDiffrent(layoutDescription, row, column)) {
      return false;
    }
    const layoutInfo = info.layoutInfo;

    //verify whether the layoutInfo's row and column is more than standard.
    if (this.ifColumnOrRowAreBigger(layoutInfo, row, column)) {
      return false;
    }

    //verify whether the layoutInfo's position is duplicated.
    if (this.ifDuplicatePosition(layoutInfo)) {
      return false;
    }

    //verify whether the layoutInfo's bundleName is duplicated.
    if (this.ifDuplicateBundleName(layoutInfo)) {
      return false;
    }
    return true;
  };

  private ifInfoIsNull(info) {
    if (info == undefined || info == '' || info == {} || info == null) {
      return true;
    }
    return false;
  }

  private ifDescriptionIsDiffrent(layoutDescription, row, column) {
    if (row != layoutDescription.row || column != layoutDescription.column) {
      return true;
    }
    return false;
  }

  private ifColumnOrRowAreBigger(layoutInfo, row, column) {
    for (let i = 0; i < layoutInfo.length; i++) {
      //column or row are bigger than legal num
      if (layoutInfo[i].column >= column || layoutInfo[i].row >= row) {
        return true;
      }
    }
    return false;
  }

  ifDuplicatePosition(layoutInfo) {

    const mPositionInfo = [];
    for (let i = 0; i < layoutInfo.length; i++) {
      for(let j = 0; j < layoutInfo[i].area[1]; j++){
        for(let k = 0; k < layoutInfo[i].area[0]; k++){
          const position = [];
          position[0] = layoutInfo[i].page;
          position[1] = layoutInfo[i].row + j;
          position[2] = layoutInfo[i].column + k;
          mPositionInfo.push(position);
        }
      }
    }
    for (let i = 0; i < mPositionInfo.length; i++) {
      for (let j = mPositionInfo.length - 1; j > 0 && j > i; j--) {
        if (mPositionInfo[i][0] == mPositionInfo[j][0] && mPositionInfo[i][1] == mPositionInfo[j][1] && mPositionInfo[i][2] == mPositionInfo[j][2]) {
          return true;
        }

      }
    }
    return false;
  }

  ifDuplicateBundleName(layoutInfo) {
    const count = [];
    for (let i = 0; i < layoutInfo.length; i++) {
      if (CheckEmptyUtils.isEmpty(count[layoutInfo[i].bundleName])) {
        count[layoutInfo[i].bundleName] = 0;
      } else if (layoutInfo[i].type == CommonConstants.TYPE_APP) {
        return true;
      }
    }
    return false;
  }

  private updateLayoutInfo(info) {
    const layoutDescription = info.layoutDescription;
    const layoutInfo = info.layoutInfo;
    this.mGridConfig = this.getGridConfig();
    console.log('Launcher PageDesktopViewModel updateLayoutInfo layoutDescription:' + JSON.stringify(layoutDescription));
    console.log('Launcher PageDesktopViewModel updateLayoutInfo mGridConfig:' + JSON.stringify(this.getGridConfig()));
    const column = this.mGridConfig.column;
    const row = this.mGridConfig.row;
    const newApp = [];
    layoutDescription.row = row;
    layoutDescription.column = column;
    //Detect newly installed apps
    for (const i in this.mBundleInfoList) {
      let sign = false;
      for (const j in layoutInfo) {
        if (this.mBundleInfoList[i].type == layoutInfo[j].type
        && this.mBundleInfoList[i].type == CommonConstants.TYPE_APP
        && this.mBundleInfoList[i].bundleName == layoutInfo[j].bundleName) {
          sign = true;
          break;
        }
      }
      if (!sign) {
        newApp.push(this.mBundleInfoList[i]);
      }
    }
    //Detect uninstalled apps
    for (const i in layoutInfo) {
      if (layoutInfo[i].type == CommonConstants.TYPE_FOLDER || layoutInfo[i].type == CommonConstants.TYPE_CARD) {
        continue;
      }
      let sign = false;
      for (const j in this.mBundleInfoList) {
        if (layoutInfo[i].bundleName == this.mBundleInfoList[j].bundleName) {
          sign = true;
          break;
        }
      }
      if (!sign) {
        layoutInfo.splice(i, 1);
      }
    }

    // Add new app
    for (let i = 0; i < newApp.length; i++) {
      if (newApp[i].type == CommonConstants.TYPE_APP) {
        this.updateAppItemLayoutInfo(info, layoutDescription, newApp[i]);
      }
    }
    info.layoutDescription = layoutDescription;
    info.layoutInfo = layoutInfo;
    return info;
  }

  private updateCardItemLayoutInfo(info, item) {
    const pageCount = info.layoutDescription.pageCount;
    const row = info.layoutDescription.row;
    const column = info.layoutDescription.column;
    // current page has space
    let isNeedNewPage = true;
    const max = pageCount - 1 > this.mPageIndex ? this.mPageIndex + 1 : pageCount - 1;
    pageCycle: for (let i = this.mPageIndex; i <= max; i++) {
      for (let y = 0; y < row; y++) {
        for (let x = 0; x < column; x++) {
          if (this.isPositionValid(info, item, i, x, y)) {
            console.log('updateCardItemLayoutInfo isPositionValid: x:' + x + ' y: '+ y + ' page: '+ i);
            isNeedNewPage = false;
            item.page = i;
            item.column = x;
            item.row = y;
            break pageCycle;
          }
        }
      }
    }
    if (isNeedNewPage) {
      item.page = this.mPageIndex + 1;
      item.column = 0;
      item.row = 0;
    }
    return isNeedNewPage;
  }

  private updateAppItemLayoutInfo(info, layoutDescription, item) {
    const pageCount = info.layoutDescription.pageCount;
    const row = info.layoutDescription.row;
    const column = info.layoutDescription.column;
    const layoutInfo = info.layoutInfo;
    // current page has space
    let isNeedNewPage = true;
    for (let i = 0; i < pageCount; i++) {
      for (let y = 0; y < row; y++) {
        for (let x = 0; x < column; x++) {
          if (!isNeedNewPage) {
            break;
          }
          if (this.isPositionValid(info, item, i, x, y)) {
            console.log('Launcher PageDesktopViewModel updateAppItemLayoutInfo isPositionValid' + x + ' y '+ y);
            isNeedNewPage = false;
            layoutInfo.push({
              bundleName: item.bundleName,
              type: item.type,
              area: item.area,
              page: i,
              column: x,
              row: y
            });
          }
        }
      }
    }
    if (isNeedNewPage) {
      layoutInfo.push({
        bundleName: item.bundleName,
        type: item.type,
        area: item.area,
        page: pageCount,
        column: 0,
        row: 0
      });
      layoutDescription.pageCount = layoutDescription.pageCount + 1;
    }
  }

  updateFolderItemLayoutInfo(info, item): boolean {
    const pageCount = info.layoutDescription.pageCount;
    const row = info.layoutDescription.row;
    const column = info.layoutDescription.column;
    // current page has space
    let isNeedNewPage = true;
    const max = pageCount - 1 > this.mPageIndex ? this.mPageIndex + 1 : pageCount - 1;
    for (let i = this.mPageIndex; i <= this.mPageIndex + 1; i++) {
      for (let y = 0; y < row; y++) {
        for (let x = 0; x < column; x++) {
          if (!isNeedNewPage) {
            break;
          }
          if (this.isPositionValid(info, item, i, x, y)) {
            console.log('updateFolderItemLayoutInfo isPositionValid' + x + ' y '+ y);
            isNeedNewPage = false;
            item.page = i;
            item.column = x;
            item.row = y;
          }
        }
      }
    }
    if (isNeedNewPage) {
      item.page = this.mPageIndex + 1;
      item.column = 0;
      item.row = 0;
    }
    return isNeedNewPage;
  }

  updateAppItemFromFolder(info, item): boolean {
    const pageCount = info.layoutDescription.pageCount;
    const row = info.layoutDescription.row;
    const column = info.layoutDescription.column;
    // current page has space
    let isNeedNewPage = true;
    for (let y = 0; y < row; y++) {
      for (let x = 0; x < column; x++) {
        if (!isNeedNewPage) {
          break;
        }
        if (this.isPositionValid(info, item, this.mPageIndex, x, y)) {
          console.log('updateAppItemFromFolder isPositionValid' + x + ' y '+ y);
          isNeedNewPage = false;
          item.page = this.mPageIndex;
          item.column = x;
          item.row = y;
        }
      }
    }
    return isNeedNewPage;
  }

  private isPositionValid(info, item, page, startColumn, startRow) {
    const row = info.layoutDescription.row;
    const column = info.layoutDescription.column;
    if ((startColumn + item.area[0]) > column || (startRow + item.area[1]) > row) {
      return false;
    }
    let isValid = true;
    for (let x = startColumn; x < startColumn + item.area[0]; x++) {
      for (let y = startRow; y < startRow + item.area[1]; y++) {
        if (this.isPositionOccupied(info, page, x, y)) {
          isValid = false;
          break;
        }
      }
    }
    return isValid;
  }

  private isPositionOccupied(info, page, column, row) {
    const pageCount = info.layoutDescription.pageCount;
    const layoutInfo = info.layoutInfo;
    // current page has space
    for (const layout of layoutInfo) {
      if (layout.page == page) {
        const xMatch = (column >= layout.column) && (column < layout.column + layout.area[0]);
        const yMatch = (row >= layout.row) && (row < layout.row + layout.area[1]);
        if (xMatch && yMatch) {
          return true;
        }
      }
    }
    return false;
  }

  private createNewInfo() {
    this.mGridConfig = this.getGridConfig();
    const column = this.mGridConfig.column;
    const row = this.mGridConfig.row;
    const layoutNum = this.mBundleInfoList.length;
    const maxPerPage = column * row;
    const pageNum = Math.ceil(layoutNum / maxPerPage);
    const newLayoutInfo = {
      layoutDescription: {},
      layoutInfo: []
    };
    newLayoutInfo.layoutDescription = {
      'pageCount': pageNum,
      'row': row,
      'column': column,
    };
    newLayoutInfo.layoutInfo = [];
    return newLayoutInfo;
  }

  private createNewLayoutInfo() {
    const info = this.getLayoutInfo();
    this.mGridConfig = this.getGridConfig();
    const column = this.mGridConfig.column;
    const row = this.mGridConfig.row;
    const layoutNum = info.layoutInfo.length;
    const maxPerPage = column * row;
    const pageNum = Math.ceil(layoutNum / maxPerPage);
    const newLayoutInfo = {
      layoutDescription: {},
      layoutInfo: []
    };
    newLayoutInfo.layoutDescription = {
      'pageCount': pageNum,
      'row': row,
      'column': column
    };
    newLayoutInfo.layoutInfo = [];
    return newLayoutInfo;
  }

  regroupDataAppListChange(callbackList) {
    this.getGridList();
  }

  /**
   * The application uninstallation result is displayed.
   *
   * @param resultCode: Application uninstallation result
   */
  informUninstallResult(resultCode) {
    console.info('Launcher PageDesktopViewModel informUninstallResult resultCode = ' + resultCode);
    if (resultCode === CommonConstants.UNINSTALL_FORBID) {
      Prompt.showToast({
        message: $r('app.string.disable_uninstall')
      });
    } else if (resultCode === CommonConstants.UNINSTALL_SUCCESS) {
      Prompt.showToast({
        message: $r('app.string.uninstall_success')
      });
    } else {
      Prompt.showToast({
        message: $r('app.string.uninstall_failed')
      });
    }
  }

  /**
   * Open the app.
   *
   * @param abilityName
   * @param bundleName
   */
  openApplication(abilityName, bundleName) {
    this.jumpTo(abilityName, bundleName);
  }

  /**
   * Open Settings.
   */
  intoSetting() {
    console.info('Launcher PageDesktopViewModel intoSetting');
    this.jumpToSetting();
  }

  /**
   * Get strings for addBlankPageButton.
   *
   * @return {string} AddBlankPageButton Strings.
   */
  getBlankPageBtnStr() {
    return this.isBlankPage() ? $r('app.string.delete_blank_page') : $r('app.string.add_blank_page');
  }

  /**
   * Get strings for deleteBlankPageButton.
   *
   * @return {string} AddBlankPageButton Strings.
   */
  getBlankPageBtnIcon() {
    return this.isBlankPage() ? '/common/pics/ic_public_delete.svg' : '/common/pics/ic_public_add_black.svg';
  }

  /**
   * Changing the Desktop Page Number.
   *
   * @param newPageIndex: Page number
   */
  changeIndexOnly(newPageIndex: number) {
    this.mPageIndex = newPageIndex;
    this.updateMenuId();
  }

  /**
   * set pageIndex to appStorage.
   */
  setPageIndex() {
    AppStorage.SetOrCreate('pageIndex', this.mPageIndex);
  }

  isBlankPage() {
    console.info(`isBlankPage ${this.mPageIndex}`);
    if (CheckEmptyUtils.isEmpty(this.mGridAppsInfos) || CheckEmptyUtils.isEmpty(this.mGridAppsInfos[this.mPageIndex])
      || CheckEmptyUtils.isEmpty(this.mGridAppsInfos[this.mPageIndex].length)) {
      return true;
    }
    console.info(`isBlankPage ${this.mGridAppsInfos[this.mPageIndex].length}`);
    if (this.mGridAppsInfos[this.mPageIndex].length === 0) {
      return true;
    }
    return false;
  }

  /**
   * Changing the Desktop Page Number.
   *
   * @param idx: Page number
   */
  changeIndex(idx) {
    this.mPageIndex = idx;
    console.info('Launcher PageDesktopViewModel changeIndex ' + idx);
    AppStorage.SetOrCreate('pageIndex', this.mPageIndex);
  }

  /**
   * Get the Desktop Page Number.
   */
  getIndex() {
    return this.mPageIndex;
  }

  /**
   * Add or delete the choosen blank page.
   */
  addOrDeleteBlankPage() {
    if (this.isBlankPage()) {
      this.deleteBlankPage();
    } else {
      this.addBlankPage();
    }
  }

  /**
   * Add a blank page.
   */
  addBlankPage() {
    console.info('Launcher PageDesktopViewModel addBlankPage' + this.mPageIndex);
    const allPageCount = this.getLayoutInfo().layoutDescription.pageCount + 1;
    this.setGridPageCount(allPageCount);
    this.pagingFiltering();
    this.mPageIndex = allPageCount - 1;
    AppStorage.SetOrCreate('pageIndex', this.mPageIndex);
  }

  /**
   * Get pageCount.
   *
   * @return {number} PageCount.
   */
  getLayoutInfo() {
    return this.mSettingsModel.getLayoutInfo();
  }

  setLayoutInfo(layoutInfo) {
    this.mSettingsModel.setLayoutInfo(layoutInfo);
    this.updateMenuId();
  }

  private updateMenuId() {
    let currentId: number = AppStorage.Get('menuId') as number ?? 0;
    currentId++;
    AppStorage.SetOrCreate('menuId', currentId % 100);
  }

  /**
   * Get pageCount.
   *
   * @return {number} PageCount.
   */
  getGridPageCount() {
    return this.mSettingsModel.getLayoutInfo().layoutDescription.pageCount;
  }

  /**
   * Set pageCount.
   *
   * @param {number} pageCount - PageCount.
   */
  private setGridPageCount(pageCount) {
    const gridLayoutInfo = this.getLayoutInfo();
    gridLayoutInfo.layoutDescription.pageCount = pageCount;
    this.setLayoutInfo(gridLayoutInfo);
  }

  /**
   * Delete the choosen blank page.
   */
  private deleteBlankPage() {
    console.info('Launcher PageDesktopViewModel deleteBlankPage ' + this.mPageIndex);
    this.deleteGridPage(this.mPageIndex);
    this.mPageIndex = this.mPageIndex - 1;
    AppStorage.SetOrCreate('pageIndex', this.mPageIndex);
    this.setGridPageCount(this.getLayoutInfo().layoutDescription.pageCount - 1);
    this.pagingFiltering();
  }

  /**
   * Delete blank page.
   *
   * @param {number} pageIndex - Index of the page which is to be deleted.
   */
  private deleteGridPage(pageIndex) {
    const info = this.getLayoutInfo();
    const layoutInfo = info.layoutInfo;
    for (const element of layoutInfo) {
      if (element.page > pageIndex) {
        element.page = element.page - 1;
      }
    }
    info.layoutInfo = layoutInfo;
    this.setLayoutInfo(info);
  }

  /**
   * Set device type.
   *
   * @param EType: Device type
   */
  setDevice(EType) {
    this.mSettingsModel.setDevice(EType);
    this.isPad = EType === CommonConstants.PAD_DEVICE_TYPE;
  }

  /**
   * Get device type.
   */
  getDevice() {
    return this.isPad;
  }

  buildMenuInfoList(appInfo, dialog, formDialog?, folderCallback?) {
    let menuInfoList = new Array<MenuInfo>();
    const shortcutInfo = this.mAppModel.getShortcutInfo(appInfo.bundleName);
    if (shortcutInfo) {
      let Menu = null;
      shortcutInfo.forEach((value) => {
        Menu = new MenuInfo();
        Menu.menuType = CommonConstants.MENU_TYPE_DYNAMIC;
        Menu.menuImgSrc = value.icon;
        Menu.menuText = value.label;
        Menu.shortcutIconId = value.iconId;
        Menu.shortcutLabelId =  value.labelId;
        Menu.bundleName = value.bundleName;
        Menu.onMenuClick = () => {
          this.jumpTo(value.wants[0].targetClass, value.wants[0].targetBundle);
        };
        menuInfoList.push(Menu);
      });
    }

    let open = new MenuInfo();
    open.menuType = CommonConstants.MENU_TYPE_FIXED;
    open.menuImgSrc = "/common/pics/ic_public_add_norm.svg";
    open.menuText = $r('app.string.app_menu_open');
    open.onMenuClick = () => {
      this.jumpTo(appInfo.abilityName, appInfo.bundleName);
    };
    menuInfoList.push(open);

    const formInfoList = this.mFormModel.getAppItemFormInfo(appInfo.bundleName);
    if (!CheckEmptyUtils.isEmptyArr(formInfoList)) {
      let addFormToDeskTopMenu = new MenuInfo();
      addFormToDeskTopMenu.menuType = CommonConstants.MENU_TYPE_FIXED;
      addFormToDeskTopMenu.menuImgSrc = '/common/pics/ic_public_app.svg';
      addFormToDeskTopMenu.menuText = $r('app.string.add_form_to_desktop');
      addFormToDeskTopMenu.onMenuClick = () => {
        console.info('Launcher click menu item into add form to desktop view');
        const appName = this.getAppName(appInfo.appLabelId + appInfo.bundleName);
        console.info(`Launcher PageDesktopViewModel buildMenuInfoList appName: ${appName}`);
        if (appName != null) {
          appInfo.appName = appName;
        }
        AppStorage.SetOrCreate('formAppInfo', appInfo);
        console.info('Launcher AppStorage.SetOrCreate formAppInfo');
        if (!this.isPad) {
          this.jumpToFormManagerView(appInfo);
        } else {
          formDialog.open();
        }
      };
      menuInfoList.push(addFormToDeskTopMenu);
    }

    if (this.isPad) {
      const addToDockMenu = new MenuInfo();
      addToDockMenu.menuType = CommonConstants.MENU_TYPE_FIXED;
      addToDockMenu.menuImgSrc = '/common/pics/ic_public_copy.svg';
      addToDockMenu.menuText = $r('app.string.app_center_menu_add_dock');
      addToDockMenu.onMenuClick = () => {
        const appName = this.getAppName(appInfo.appLabelId + appInfo.bundleName);
        console.info('Launcher PageDesktopViewModel buildMenuInfoList appName' + appName);
        if (appName != null) {
          appInfo.appName = appName;
        }
        console.info('Launcher click menu item add to dock');
        this.addToDock(appInfo);
      };
      menuInfoList.push(addToDockMenu);
    }

    if (folderCallback) {
      const moveOutMenu = new MenuInfo();
      moveOutMenu.menuType = CommonConstants.MENU_TYPE_FIXED;
      moveOutMenu.menuImgSrc = '/common/pics/ic_public_remove.svg';
      moveOutMenu.menuText = $r('app.string.remove_app_from_folder');
      moveOutMenu.onMenuClick = () => {
        console.info('Launcher click menu item remove app from folder');
        // remove app from folder
        folderCallback(appInfo);
      };
      menuInfoList.push(moveOutMenu);
    }

    const uninstallMenu = new MenuInfo();
    uninstallMenu.menuType = CommonConstants.MENU_TYPE_FIXED;
    uninstallMenu.menuImgSrc = this.isPad ? '/common/pics/ic_public_remove.svg' : '/common/pics/ic_public_delete.svg';
    uninstallMenu.menuText = this.isPad ?  $r('app.string.delete_app') : $r('app.string.uninstall');
    uninstallMenu.onMenuClick = () => {
      console.info('Launcher click menu item uninstall');
      const appName = this.getAppName(appInfo.appLabelId + appInfo.bundleName);
      console.info('Launcher PageDesktopViewModel buildMenuInfoList appName' + appName);
      if (appName != null) {
        appInfo.appName = appName;
      }
      AppStorage.SetOrCreate('uninstallAppInfo', appInfo);
      dialog.open();
    };
    uninstallMenu.menuEnabled = appInfo.isUninstallAble;
    menuInfoList.push(uninstallMenu);
    return menuInfoList;
  }

  buildCardMenuInfoList(formInfo, dialog, formDialog) {
    const menuInfoList = new Array<MenuInfo>();
    if (!this.ifStringIsNull(formInfo.formConfigAbility)
      && formInfo.formConfigAbility.startsWith(CommonConstants.FORM_CONFIG_ABILITY_PREFIX, 0)) {
      const editForm = new MenuInfo();
      editForm.menuType = CommonConstants.MENU_TYPE_FIXED;
      editForm.menuImgSrc = '/common/pics/ic_public_edit.svg';
      editForm.menuText = $r('app.string.form_edit');
      editForm.onMenuClick = () => {
        console.info(`Launcher click menu item into form edit view:${formInfo.formConfigAbility}`);
        const abilityName = formInfo.formConfigAbility.slice(CommonConstants.FORM_CONFIG_ABILITY_PREFIX.length);
        this.jumpToForm(abilityName, formInfo.bundleName, formInfo.cardId);
      };
      menuInfoList.push(editForm);
    }
    const addFormToDeskTopMenu = new MenuInfo();
    addFormToDeskTopMenu.menuType = CommonConstants.MENU_TYPE_FIXED;
    addFormToDeskTopMenu.menuImgSrc = '/common/pics/ic_public_app.svg';
    addFormToDeskTopMenu.menuText = $r('app.string.add_form_to_desktop');
    addFormToDeskTopMenu.onMenuClick = () => {
      console.info('Launcher click menu item into add form to desktop view');
      if (!this.isPad) {
        this.jumpToFormManagerView(formInfo);
      } else {
        const appName = this.getAppName(formInfo.appLabelId + formInfo.bundleName);
        console.info(`Launcher PageDesktopViewModel buildCardMenuInfoList appName: ${appName}`);
        if (appName != null) {
          formInfo.appName = appName;
        }
        AppStorage.SetOrCreate('formAppInfo', formInfo);
        formDialog.open();
      }
    };
    menuInfoList.push(addFormToDeskTopMenu);
    const deleteFormFromDeskTop = new MenuInfo();
    deleteFormFromDeskTop.menuType = CommonConstants.MENU_TYPE_FIXED;
    deleteFormFromDeskTop.menuImgSrc = '/common/pics/ic_public_remove.svg';
    deleteFormFromDeskTop.menuText = $r('app.string.delete_form');
    deleteFormFromDeskTop.onMenuClick = () => {
      console.info('Launcher click menu item remove form to desktop view');
      const formAnimateData: {
          cardId: number,
          isOpenRemoveFormDialog: boolean,
        } = { cardId: formInfo.cardId, isOpenRemoveFormDialog: true };
      AppStorage.SetOrCreate('formAnimateData', formAnimateData);
      dialog.open();
    };
    menuInfoList.push(deleteFormFromDeskTop);
    return menuInfoList;
  }

  buildRenameMenuInfoList(folderItemInfo, menuCallback) {
    const menuInfoList = new Array<MenuInfo>();
    const renameMenu = new MenuInfo();
    renameMenu.menuType = CommonConstants.MENU_TYPE_DYNAMIC;
    renameMenu.menuImgSrc = StyleConstants.DEFAULT_RENAME_IMAGE;
    renameMenu.menuText = $r('app.string.rename_folder');
    renameMenu.onMenuClick = () => {
      console.info('Launcher click menu to rename');
      menuCallback();
    };
    menuInfoList.push(renameMenu);
    return menuInfoList;
  }

  /**
   * Get PageDesktopStyleConfig.
   */
  getPageDesktopStyleConfig() {
    return this.pageDesktopStyleConfig;
  }

  /**
   * Get workSpaceWidth.
   */
  getWorkSpaceWidth() {
    return AppStorage.Get('workSpaceWidth');
  }

  /**
   * Get workSpaceHeight.
   */
  getWorkSpaceHeight() {
    return AppStorage.Get('workSpaceHeight');
  }

  /**
   * Set workSpaceWidth.
   *
   * @param workSpaceWidth
   */
  setWorkSpaceWidth(workSpaceWidth) {
    AppStorage.SetOrCreate('workSpaceWidth', workSpaceWidth);
  }

  /**
   * Set workSpaceHeight.
   *
   * @param workSpaceHeight
   */
  setWorkSpaceHeight(workSpaceHeight) {
    AppStorage.SetOrCreate('workSpaceHeight', workSpaceHeight);
  }

  /**
   * Get getAppPageStartConfig.
   */
  getAppPageStartConfig() {
    return this.mSettingsModel.getAppPageStartConfig();
  }

  /**
   * click event
   *
   * @param abilityName ability name
   * @param bundleName bundle name
   */
  onAppClick(abilityName, bundleName) {
    if (!this.isPad) {
      this.jumpTo(abilityName, bundleName);
      return;
    }
    AppStorage.SetOrCreate('selectDesktopAppItem', bundleName);
  }

  /**
   * double click event
   *
   * @param abilityName ability name
   * @param bundleName bundle name
   */
  onAppDoubleClick(abilityName, bundleName) {
    AppStorage.SetOrCreate('selectDesktopAppItem', '');
    this.jumpTo(abilityName, bundleName);
  }

  /**
   * add card to pageDesktop
   * @param appInfo
   */
  async createCardToDeskTop(formCardItem) {
    Log.showInfo(TAG, 'createCardToDeskTop start');
    Log.showInfo(TAG, `createCardToDeskTop formCardItem id: ${formCardItem.id}`);
    const cardItemInfo = new CardItemInfo();
    cardItemInfo.cardId = formCardItem.id;
    cardItemInfo.cardName = formCardItem.name;
    cardItemInfo.bundleName = formCardItem.bundleName;
    cardItemInfo.abilityName = formCardItem.abilityName;
    cardItemInfo.moduleName = formCardItem.moduleName;
    cardItemInfo.formConfigAbility = formCardItem.formConfigAbility;
    cardItemInfo.appLabelId = formCardItem.appLabelId;
    cardItemInfo.cardDimension = formCardItem.dimension;

    let formInfoList: any = this.mFormListInfoCacheManager.getCache(KEY_FORM_LIST);
    if (formInfoList == CommonConstants.INVALID_VALUE) {
      formInfoList = new Array<CardItemInfo>();
    }
    formInfoList.push(cardItemInfo);
    this.mFormListInfoCacheManager.setCache(KEY_FORM_LIST, formInfoList);

    const result = await this.mFormModel.updateFormInfoById(cardItemInfo);
    Log.showInfo(TAG, `createCardToDeskTop result: ${result}`);
    if (result) {
      const gridLayoutInfo = this.getLayoutInfo();
      const cardItemLayoutInfo = {
        cardId: cardItemInfo.cardId,
        type: CommonConstants.TYPE_CARD,
        area: FormManager.getInstance().getCardSize(cardItemInfo.cardDimension),
        page: 0,
        row: 0,
        column: 0
      };

      const needNewPage: boolean =this.updateCardItemLayoutInfo(gridLayoutInfo, cardItemLayoutInfo);
      if (needNewPage) {
        gridLayoutInfo.layoutDescription.pageCount = gridLayoutInfo.layoutDescription.pageCount + 1;
        for (let index = 0; index < gridLayoutInfo.layoutInfo.length; index++) {
          if (gridLayoutInfo.layoutInfo[index].page > this.getIndex()) {
            gridLayoutInfo.layoutInfo[index].page++;
          }
        }
      }

      // Push card into the layoutInfo
      gridLayoutInfo.layoutInfo.push(cardItemLayoutInfo);
      this.setLayoutInfo(gridLayoutInfo);
      if (needNewPage) {
        this.changeIndex(this.getIndex() + 1);
      }
    }
    this.getGridList();
    Log.showInfo(TAG, 'createCardToDeskTop end');
  }

  private ifStringIsNull(str) {
    if (str == undefined || str == '' || str == null) {
      return true;
    }
    return false;
  }

  /**
   * delete blank page where no item in this page
   *
   * @param page
   */
  deleteBlankPageByPageNo(page): void {
    const layoutInfo = this.getLayoutInfo();
    const deleteFlag = this.deleteBlankPageFromLayoutInfo(layoutInfo, page);
    if (!deleteFlag) {
      return;
    }
    this.setLayoutInfo(layoutInfo);
    this.pagingFiltering();
  }

  /**
   * delete blank page from layoutInfo
   *
   * @param layoutInfo
   * @param page
   */
  deleteBlankPageFromLayoutInfo(layoutInfo, page): boolean {
    for (let i = 0; i < layoutInfo.layoutInfo.length; i++) {
      if (layoutInfo.layoutInfo[i].page == page) {
        return false;
      }
    }
    layoutInfo.layoutDescription.pageCount--;
    for (let m = 0; m < layoutInfo.layoutInfo.length; m++) {
      if (layoutInfo.layoutInfo[m].page > page) {
        layoutInfo.layoutInfo[m].page--;
      }
    }
    return true;
  }
}