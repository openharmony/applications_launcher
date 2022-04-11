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
import router from '@system.router';
import Log from '../../../../../../../common/src/main/ets/default/utils/Log';
import FormModel from '../../../../../../../common/src/main/ets/default/model/FormModel';
import EventConstants from '../../../../../../../common/src/main/ets/default/constants/EventConstants';
import PageDesktopViewModel from '../../../../../../pagedesktop/src/main/ets/default/common/viewmodel/PageDesktopViewModel';
import CommonConstants from '../../../../../../../common/src/main/ets/default/constants/CommonConstants';
import FormStyleConfig from '../common/FormStyleConfig';
import FeatureConstants from '../common/constants/FeatureConstants';
import LayoutConfigManager from '../../../../../../../common/src/main/ets/default/layoutconfig/LayoutConfigManager';
import FormListInfoCacheManager from '../../../../../../../common/src/main/ets/default/cache/FormListInfoCacheManager';

const TAG = 'FormViewModel';
const KEY_FORM_LIST = 'formListInfo';

/**
 * Class FormViewModel.
 */
export default class FormViewModel {
  private readonly mPageDesktopViewModel: PageDesktopViewModel;
  private readonly mFormModel: FormModel;
  private readonly mFormStyleConfig: FormStyleConfig;
  private readonly mFormListInfoCacheManager: FormListInfoCacheManager;
  private mAllFormsInfo;

  private constructor() {
    Log.showInfo(TAG, 'constructor start');
    this.mFormModel = FormModel.getInstance();
    this.mFormStyleConfig = LayoutConfigManager.getStyleConfig(FormStyleConfig.APP_LIST_STYLE_CONFIG,
      FeatureConstants.FEATURE_NAME);
    this.mPageDesktopViewModel = PageDesktopViewModel.getInstance();
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
   * Event listener about jump to form manager view.
   */
  private readonly mLocalEventListener = {
    onReceiveEvent: (event, params) => {
      Log.showInfo(TAG, `Launcher FormViewModel receive event: ${event}, params: ${JSON.stringify(params)}`);
      if (event === EventConstants.EVENT_REQUEST_JUMP_TO_FORM_VIEW) {
        this.jumpToFormManagerView(params);
      }
    }
  };

  /**
   * Jump to form manager view
   *
   * @param {string} params - the formInfo witch can get service widget.
   */
  async jumpToFormManagerView(params) {
    Log.showInfo(TAG, `Launcher FormViewModel jumpToFormManagerView params: ${JSON.stringify(params)}`);
    const options = {
      uri: 'pages/FormManagerView',
      params: params
    };
    try {
      await router.push(options);
    } catch (err) {
      Log.showInfo(TAG, `fail callback, code: ${err.code}, msg: ${err.msg}`);
    }
  }

  /**
   * Judge whether the current application supports form
   *
   * @param {any} appInfo
   */
  async isSupportForm(appInfo) {
    const formInfoList = await this.mFormModel.getAllFormsInfo();
    const formInfo: any = formInfoList.find(item => {
      if (item.bundleName === appInfo.bundleName) {
        return true;
      }
    });
    let isSupportForm = false;
    if (formInfo.length > 0) {
      isSupportForm = true;
    }
    return isSupportForm;
  }

  /**
   * Obtains the FormInfo objects provided by all ohos applications on the device.
   */
  async getForms() {
    Log.showInfo(TAG, 'getForms start');
    this.mAllFormsInfo = await this.mFormModel.getAllFormsInfo();
    AppStorage.SetOrCreate('allFormsInfo', this.mAllFormsInfo);
  }

  /**
   * Delete form by cardId.
   *
   * @param {number} cardId.
   */
  async deleteForm(cardId) {
    Log.showInfo(TAG, 'deleteForm start');
    let gridLayoutInfo = {
      layoutInfo: []
    };
    gridLayoutInfo = this.mPageDesktopViewModel.getLayoutInfo();
    const cardIndex = gridLayoutInfo.layoutInfo.findIndex(item => {
      return item.type === CommonConstants.TYPE_CARD && item.cardId === cardId;
    });
    if (cardIndex != CommonConstants.INVALID_VALUE) {
      this.mFormModel.deleteFormById(cardId);
      gridLayoutInfo.layoutInfo.splice(cardIndex, 1);
      this.mPageDesktopViewModel.setLayoutInfo(gridLayoutInfo);
    }
    const formInfoList: any = this.mFormListInfoCacheManager.getCache(KEY_FORM_LIST);
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
      this.mFormListInfoCacheManager.setCache(KEY_FORM_LIST, null);
    } else {
      this.mFormListInfoCacheManager.setCache(KEY_FORM_LIST, formInfoList);
    }
  }
}