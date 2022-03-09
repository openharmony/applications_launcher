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
import Ability from '@ohos.application.Ability'

export default class CalleeAbility extends Ability {
  onCreate(want, launchParam) {
    console.log(`CalleeAbility onCreate is called ${want} and ${launchParam}`)
    globalThis.callee = this.callee;
  }

  onDestroy() {
    console.log("CalleeAbility onDestroy is called")
  }

  onWindowStageCreate(windowStage) {
    console.log("CalleeAbility onWindowStageCreate is called")
    globalThis.CalleeAbilityContext = this.context
  }

  onWindowStageDestroy() {
    console.log("CalleeAbility onWindowStageDestroy is called")
  }

  onForeground() {
    console.log("CalleeAbility onForeground is called")
  }

  onBackground() {
    console.log("CalleeAbility onBackground is called")
  }
}