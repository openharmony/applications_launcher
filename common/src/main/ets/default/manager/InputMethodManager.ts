/**
 * Copyright (c) 2022 Huawei Device Co., Ltd.
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

import inputMethod from '@ohos.inputMethod';

/**
 * Wrapper class for inputMethod interfaces.
 */
export class InputMethodManager {

  static getInstance(): InputMethodManager {
    if (globalThis.InputMethodManagerInstance == null) {
      globalThis.InputMethodManagerInstance = new InputMethodManager();
    }
    return globalThis.InputMethodManagerInstance;
  }

  stopInput(): void {
    inputMethod.getInputMethodController()?.stopInput();
  }
}