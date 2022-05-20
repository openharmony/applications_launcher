/*
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

import Ability from '@ohos.application.Ability';

export default class MainAbility extends Ability {
  onCreate(want, launchParam) {
    console.log('settings MainAbility onCreate is called');
  }

  onDestroy() {
    console.log('settings MainAbility onDestroy is called');
  }

  onWindowStageCreate(windowStage) {
    console.log('settings MainAbility onWindowStageCreate is called');
    globalThis.settingsContext = this.context;
    windowStage.setUIContent(this.context, 'pages/Settings', null);
  }

  onWindowStageDestroy() {
    console.log('settings MainAbility onWindowStageDestroy is called');
  }

  onForeground() {
    console.log('settings MainAbility onForeground is called');
  }

  onBackground() {
    console.log('settings MainAbility onBackground is called');
    globalThis.settingsContext.terminateSelf();
  }
}