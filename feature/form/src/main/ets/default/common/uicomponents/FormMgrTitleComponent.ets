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
import StyleConstants from '../constants/StyleConstants';
import Log from '../../../../../../../../common/src/main/ets/default/utils/Log';

const TAG = 'FormMgrTitleComponent';

@Component
export default struct  FormMgrTitleComponent {
  @Link mFormMgrTitleComponent: any;
  build() {
    Flex({ direction: FlexDirection.Column, alignItems: ItemAlign.Center, justifyContent: FlexAlign.Center }) {
      Text(this.mFormMgrTitleComponent)
        .fontColor(StyleConstants.DEFAULT_FORM_MGR_FONT_COLOR)
        .fontSize(StyleConstants.DEFAULT_FORM_MGR_TEXT_FONT_SIZE)
    }
    .width(StyleConstants.DEFAULT_LAYOUT_PERCENTAGE)
    .height(StyleConstants.FORM_MGR_TEXT_HEIGHT_PERCENTAGE)
  }
}