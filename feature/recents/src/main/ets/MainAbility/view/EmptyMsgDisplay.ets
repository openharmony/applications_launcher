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
const TAG = 'EmptyMsgDisplay';
import StyleConstants from '../common/constants/StyleConstants';

@Component
export default struct EmptyMsgDisplay {
  build() {
    Flex({ direction: FlexDirection.Column, alignItems: ItemAlign.Center, justifyContent: FlexAlign.Center }) {
      Text($r('app.string.No_running_apps_recently'))
        .fontColor(StyleConstants.DEFAULT_FONT_COLOR)
        .fontSize(StyleConstants.DEFAULT_FONT_SIZE)
    }
    .width(StyleConstants.DEFAULT_LAYOUT_PERCENTAGE)
    .height(StyleConstants.DEFAULT_LAYOUT_PERCENTAGE)
  }
}