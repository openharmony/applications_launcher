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

import { CommonConstants } from '@ohos/common';

const phonePresetDockItem = [
  {
    itemType: CommonConstants.TYPE_APP,
    bundleName: 'com.ohos.contacts',
    abilityName: 'com.ohos.contacts.MainAbility',
    moduleName: 'entry',
    editable: true,
  },
  {
    itemType: CommonConstants.TYPE_APP,
    bundleName: 'com.ohos.photos',
    abilityName: 'com.ohos.photos.MainAbility',
    moduleName: 'entry',
    editable: true,
  },
  {
    itemType: CommonConstants.TYPE_APP,
    bundleName: 'com.ohos.settings',
    abilityName: 'com.ohos.settings.MainAbility',
    moduleName: 'phone',
    editable: true,
  },
  {
    itemType: CommonConstants.TYPE_APP,
    bundleName: 'com.ohos.mms',
    abilityName: 'com.ohos.mms.MainAbility',
    moduleName: 'entry',
    editable: true,
  },
];

export default phonePresetDockItem;
