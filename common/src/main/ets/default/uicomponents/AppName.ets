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

import { ResourceManager } from '../manager/ResourceManager';
import { PresetStyleConstants } from '../constants/PresetStyleConstants';

@Component
export struct AppName {
  nameSize: number;
  nameHeight: number;
  bundleName: string;
  moduleName: string;
  labelId: string;
  nameFontColor: string;
  @State @Watch("updateName") appName: string = '';
  useCache: boolean = true;
  nameLines: number = PresetStyleConstants.DEFAULT_APP_NAME_LINES;
  marginTop: number = PresetStyleConstants.DEFAULT_ICON_NAME_GAP;
  marginLeft: number = PresetStyleConstants.DEFAULT_DESKTOP_NAME_MARGIN;
  private mResourceManager;

  aboutToAppear(): void  {
    this.mResourceManager = ResourceManager.getInstance();
    this.updateName();
  }

  public appNameLoadCallback(name: string) {
    this.appName = name;
  }

  private updateName() {
    if (this.mResourceManager) {
      this.mResourceManager.getAppNameWithCache(this.labelId, this.bundleName, this.moduleName,
        this.appName, this.appNameLoadCallback.bind(this));
    }
  }

  build() {
    Column() {
      Text(this.appName)
        .fontSize(this.nameSize)
        .fontColor(this.nameFontColor)
        .textOverflow({overflow: TextOverflow.Ellipsis})
        .textAlign(TextAlign.Center)
        .maxLines(this.nameLines)
        .lineHeight(this.nameSize)
    }
    .height(this.nameHeight)
    .margin({top: this.marginTop,left: this.marginLeft, right: this.marginLeft})
  }
}