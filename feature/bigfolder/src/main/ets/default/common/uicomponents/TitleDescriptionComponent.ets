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

import FolderStyleConstants from '../constants/FolderStyleConstants';

@Component
export default struct TitleDescriptionComponent {
  @Link mTitleDescription: any;
  @State mTextSize: number = FolderStyleConstants.DEFAULT_APP_GRID_TEXT_FONT_SIZE;

  build() {
    Text(this.mTitleDescription)
      .fontSize(this.mTextSize)
      .margin({
        top: FolderStyleConstants.DEFAULT_APP_TITLE_MARGIN,
        bottom: FolderStyleConstants.DEFAULT_APP_TITLE_MARGIN,
        left: FolderStyleConstants.DEFAULT_APP_ADD_TEXT_MARGIN
      })
  }
}