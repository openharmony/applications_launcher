/**
 * Copyright (c) 2024 Huawei Device Co., Ltd.
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

import wallpaper from '@ohos.wallpaper';
import image from '@ohos.multimedia.image';
import { StyleConstants } from '@ohos/common';

@Entry
@Component
struct SubDisplayWallpaperPage {
  @State wallPaperImg: image.PixelMap | undefined = undefined

  aboutToAppear() {
    wallpaper.getImage(wallpaper.WallpaperType.WALLPAPER_SYSTEM).then(value => this.wallPaperImg = value)
  }

  build() {
    Column() {
      Image(this.wallPaperImg ?? StyleConstants.DEFAULT_BACKGROUND_IMAGE)
        .size({ width: '100%', height: '100%' })
        .objectFit(ImageFit.Cover)
    }
    .size({ width: '100%', height: '100%' })
  }
}