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

import rpc from '@ohos.rpc';
import CommonConstants from '../constants/CommonConstants';

/**
 * application badge message from call.call or call.callWithResult
 */
export default class AppBadgeMessage {
  badge: number = CommonConstants.INVALID_VALUE;
  bundleName = '';

  constructor(badge: number, bundleName: string) {
    this.badge = badge;
    this.bundleName = bundleName;
  }

  marshalling(messageParcel) {
    console.log(`AppBadgeMessage marshalling badge[${this.badge}], bundleName[${this.bundleName}]`);
    messageParcel.writeInt(this.badge);
    messageParcel.writeString(this.bundleName);
    return true;
  }

  unmarshalling(messageParcel) {
    console.log(`AppBadgeMessage marshalling badge[${this.badge}], bundleName[${this.bundleName}]`);
    this.badge = messageParcel.readInt();
    this.bundleName = messageParcel.readString();
    return true;
  }
}