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

import BaseStage from '../../../../../../../common/src/main/ets/default/base/BaseStage.ets';
import recentsPreLoader from './RecentsPreLoader.ets';

/**
 * 多任务特性Stage
 */
export default class RecentsStage extends BaseStage {
  /**
   * Stage启动时的回调
   */
  public onCreate(): void {
    recentsPreLoader.load();
  }

  /**
   * Stage退出时的回调
   */
  public onDestroy(): void {
    recentsPreLoader.releaseConfigAndData();
  }
}
