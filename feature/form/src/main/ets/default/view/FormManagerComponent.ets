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
import FormMgrBottomComponent from '../common/uicomponents/FormMgrBottomComponent.ets';
import FormMgrTitleComponent from '../common/uicomponents/FormMgrTitleComponent.ets';
import FormMgrSwiperComponent from '../common/uicomponents/FormMgrSwiperComponent.ets';
import StyleConstants from '../common/constants/StyleConstants';
import Log from '../../../../../../../common/src/main/ets/default/utils/Log';

const TAG = 'FormManagerComponent';

@Component
export default struct FormManagerComponent {
  @State formInfo: any;
  @State isClickedForm: boolean = false;

  private aboutToAppear(): void  {

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
          // back view
      })
      FormMgrTitleComponent({mFormMgrTitleComponent: $appInfo.formName});
      FormMgrSwiperComponent({formItemInfo: this.formItemInfo});
      FormMgrBottomComponent();
    }
    .height(StyleConstants.DEFAULT_LAYOUT_PERCENTAGE)
    .width(StyleConstants.DEFAULT_LAYOUT_PERCENTAGE)
    .backgroundImage(StyleConstants.DEFAULT_FORM_MGR_BACKGROUND_IMAGE)
    .onClick(() => {
    })
  }
}