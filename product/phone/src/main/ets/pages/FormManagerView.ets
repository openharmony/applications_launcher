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
import { windowManager } from '@ohos/common';
import { FormManagerComponent } from '@ohos/form';
import PhonePresetStyleConstants from '../common/constants/PhonePresetStyleConstants';

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
    windowManager.destroyWindow(windowManager.FORM_MANAGER_WINDOW_NAME);
    return true;
  }

  build() {
    Column() {
      FormManagerComponent()
    }
    .width(PhonePresetStyleConstants.DEFAULT_PERCENTAGE)
    .height(PhonePresetStyleConstants.DEFAULT_PERCENTAGE)
  }
}