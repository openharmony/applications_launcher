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

const TAG = 'FormMgrBottomComponent';

@Component
export default struct FormMgrBottomComponent {
  private aboutToAppear(): void  {
  }
  build() {
    Column() {
    }
    .height(StyleConstants.FORM_MGR_BOTTOM_HEIGHT_PERCENTAGE)
    .width(StyleConstants.FORM_MGR_BOTTOM_WIDTH_PERCENTAGE)
    .onClick(() => {
    })
  }
}