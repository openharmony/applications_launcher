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

import router from '@system.router';
import PhoneStage from '../common/PhoneStage';
import FormMgrTitleComponent from '../../../../../../../feature/form/src/main/ets/default/common/uicomponents/FormMgrTitleComponent.ets';
import FormMgrSwiperComponent from '../../../../../../../feature/form/src/main/ets/default/common/uicomponents/FormMgrSwiperComponent.ets';
import FormMgrBottomComponent from '../../../../../../../feature/form/src/main/ets/default/common/uicomponents/FormMgrBottomComponent.ets';
import StyleConstants from '../../../../../../../feature/form/src/main/ets/default/common/constants/StyleConstants';

async function routeEntryView() {
  let options = {
    uri: 'pages/EntryView'
  }
  try {
    await router.push(options);
  } catch (err) {
    console.error(`fail callback, code: ${err.code}, msg: ${err.msg}`);
  }
}

@Entry
@Component
struct FormManagerView {
  private mStage: PhoneStage = new PhoneStage();
  private mFormInfo: Object = {};

  private aboutToAppear(): void  {
    this.mStage.onCreate();
    this.mFormInfo = router.getParams();
  }

  private aboutToDisappear(): void {
    this.mStage.onDestroy();
  }

  build() {
    Column() {
      Column() {
        Image(StyleConstants.DEFAULT_FORM_MGR_BACK_IMAGE)
          .width(StyleConstants.DEFAULT_LAYOUT_PERCENTAGE)
          .height(StyleConstants.FORM_MGR_TOP_HEIGHT_PERCENTAGE)
          .align(Alignment.Bottom)
      }.alignItems(HorizontalAlign.Center)
      .height(StyleConstants.FORM_MGR_TOP_HEIGHT_PERCENTAGE)
      .onClick(() => {
        routeEntryView();
      })
      FormMgrTitleComponent({mFormMgrTitleComponent: this.mFormInfo.formName});
      FormMgrSwiperComponent({formItemInfo: this.mFormInfo});
      FormMgrBottomComponent();
    }
    .height(StyleConstants.DEFAULT_LAYOUT_PERCENTAGE)
    .width(StyleConstants.DEFAULT_LAYOUT_PERCENTAGE)
    .backgroundImage(StyleConstants.DEFAULT_FORM_MGR_BACKGROUND_IMAGE)
    .onClick(() => {
    })
  }
}