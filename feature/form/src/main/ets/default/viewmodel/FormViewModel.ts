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
import {
  Log,
  FormModel,
  SettingsModel,
  PageDesktopModel,
  CommonConstants,
  layoutConfigManager,
  FormListInfoCacheManager,
  CardItemInfo,
  LauncherDragItemInfo,
  GridLayoutInfo
} from '@ohos/common';
import { FormStyleConfig } from '../common/FormStyleConfig';
import FeatureConstants from '../common/constants/FeatureConstants';

const TAG = 'FormViewModel';

/**
 * Class FormViewModel.
 */
export class FormViewModel {
  private readonly mFormModel: FormModel;
  private readonly mSettingsModel: SettingsModel;
  private readonly mPageDesktopModel: PageDesktopModel;
  private readonly mFormStyleConfig: FormStyleConfig;
  private readonly mFormListInfoCacheManager: FormListInfoCacheManager;
  private mAllFormsInfo?: CardItemInfo[];
  private KEY_FORM_LIST:string = 'formListInfo';

  private constructor() {
    Log.showInfo(TAG, 'constructor start');
    this.mFormModel = FormModel.getInstance();
    this.mSettingsModel = SettingsModel.getInstance();
    this.mPageDesktopModel = PageDesktopModel.getInstance();
    this.mFormStyleConfig = layoutConfigManager.getStyleConfig(FormStyleConfig.APP_LIST_STYLE_CONFIG,
      FeatureConstants.FEATURE_NAME);
    this.mFormListInfoCacheManager = FormListInfoCacheManager.getInstance();
  }

  /**
   * Get the form view model object.
   *
   * @return {object} form view model singleton
   */
  static getInstance(): FormViewModel {
    if (globalThis.FormViewModelInstance == null) {
      globalThis.FormViewModelInstance = new FormViewModel();
    }
    return globalThis.FormViewModelInstance;
  }

  /**
   * Get the form style config info.
   *
   * @return {object} mFormStyleConfig - get the style from layout config manager.
   */
  getFormStyleConfig(): FormStyleConfig {
    return this.mFormStyleConfig;
  }

  /**
   * Judge whether the current application supports form
   *
   * @param {any} appInfo
   */
  async isSupportForm(appInfo: LauncherDragItemInfo) {
    const formInfoList = await this.mFormModel.getAllFormsInfo();
    const formInfo: CardItemInfo = formInfoList.find(item => {
      if (item.bundleName === appInfo.bundleName) {
        return true;
      }
    });
    let isSupportForm = false;
    if (formInfo) {
      isSupportForm = true;
    }
    return isSupportForm;
  }

  /**
   * Obtains the FormInfo objects provided by all ohos applications on the device.
   */
  async getForms() {
    Log.showDebug(TAG, 'getForms start');
    this.mAllFormsInfo = await this.mFormModel.getAllFormsInfo();
    AppStorage.setOrCreate('allFormsInfo', this.mAllFormsInfo);
  }

  /**
   * Delete form by cardId.
   *
   * @param {number} cardId.
   */
  async deleteForm(cardId) {
    Log.showDebug(TAG, 'deleteForm start');
    let gridLayoutInfo: GridLayoutInfo = {
      layoutDescription: undefined,
      layoutInfo: []
    };
    gridLayoutInfo = this.mSettingsModel.getLayoutInfo();
    const cardIndex = gridLayoutInfo.layoutInfo.findIndex(item => {
      return item.typeId === CommonConstants.TYPE_CARD && item.cardId === cardId;
    });
    if (cardIndex != CommonConstants.INVALID_VALUE) {
      this.mFormModel.deleteFormById(cardId);
      const page = gridLayoutInfo.layoutInfo[cardIndex].page;
      gridLayoutInfo.layoutInfo.splice(cardIndex, 1);
      let ret: boolean = this.mPageDesktopModel.deleteBlankPageFromLayoutInfo(gridLayoutInfo, page);
      this.mSettingsModel.setLayoutInfo(gridLayoutInfo);
      if(ret){
        const curPageIndex = this.mPageDesktopModel.getPageIndex();
        Log.showInfo(TAG, 'deleteForm' + curPageIndex);
        this.mPageDesktopModel.setPageIndex(curPageIndex - 1);
      }
    }
    const formInfoList: any = this.mFormListInfoCacheManager.getCache(this.KEY_FORM_LIST);
    if (formInfoList === CommonConstants.INVALID_VALUE) {
      return;
    }
    for(let i = 0; i < formInfoList.length; i++) {
      if (formInfoList[i].cardId === cardId){
        formInfoList.splice(i, 1);
        break;
      }
    }
    if (formInfoList.length === 0) {
      this.mFormListInfoCacheManager.setCache(this.KEY_FORM_LIST, null);
    } else {
      this.mFormListInfoCacheManager.setCache(this.KEY_FORM_LIST, formInfoList);
    }
  }
}