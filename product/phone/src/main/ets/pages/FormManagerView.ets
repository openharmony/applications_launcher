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

import windowManager from '../../../../../../common/src/main/ets/default/manager/WindowManager';
import Log from '../../../../../../common/src/main/ets/default/utils/Log';
import FormManagerComponent from '../../../../../../feature/form/src/main/ets/default/view/FormManagerComponent';
import StyleConstants from '../../../../../../feature/form/src/main/ets/default/common/constants/StyleConstants';

const TAG = "FormManagerView";

@Entry
@Component
struct FormManagerView {
  private mFormInfo: Object = {};

  onPageShow(): void {
    Log.showInfo(TAG, 'onPageShow');
  }

  onPageHide(): void {
    Log.showInfo(TAG, `onPageHide`);
  }

  onBackPress(): boolean {
    Log.showInfo(TAG, 'onBackPress');
    windowManager.hideWindow(windowManager.FORM_MANAGER_WINDOW_NAME);
    return true;
  }

  build() {
      Column() {
        FormManagerComponent()
      }
      .width(StyleConstants.DEFAULT_LAYOUT_PERCENTAGE)
      .height(StyleConstants.DEFAULT_LAYOUT_PERCENTAGE)
  }
}