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

import { BigFolderStyleConstants } from '../constants/BigFolderStyleConstants';

@Component
export default struct TitleDescriptionComponent {
  @StorageLink('titleDescription') titleDescription: any = '';
  @State mTextSize: number = BigFolderStyleConstants.DEFAULT_APP_GRID_TEXT_FONT_SIZE;

  build() {
    Text(this.titleDescription)
      .fontSize(this.mTextSize)
      .fontWeight(BigFolderStyleConstants.DEFAULT_APP_GRID_TEXT_FONT_WEIGHT)
      .margin({
        top: BigFolderStyleConstants.DEFAULT_APP_TITLE_MARGIN,
        bottom: BigFolderStyleConstants.DEFAULT_APP_TITLE_MARGIN,
        left: BigFolderStyleConstants.DEFAULT_APP_ADD_TEXT_MARGIN
      })
  }
}