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
import ResourceManager from '../../../../../../../../common/src/main/ets/default/manager/ResourceManager';
import StyleConstants from '../constants/StyleConstants';

const TAG = 'Recent-RecentMissionAppName';

/**
 * App name component for recent missions.
 */
@Component
export default struct RecentMissionAppName {
  @Prop @Watch("updateName") appName: string;
  @State nameSize: number = StyleConstants.DEFAULT_FONT_SIZE;
  @State margin: number = StyleConstants.APP_NAME_MARGIN;
  @State name: string = ''
  @Prop bundleName: string;
  @Prop labelId: string;
  private mResourceManager;

  aboutToAppear(): void  {
    this.mResourceManager = ResourceManager.getInstance();
    this.updateName();
  }

  /**
   * The callback of recent missions app name.
   *
   * @param {string} name - the value get from ResourceManager
   */
  appNameLoadCallback(name: string): void {
    this.name = name;
  }

  /**
   * Update the app name of recent missions.
   */
  updateName(): void {
    if (this.bundleName && this.bundleName.length > 0) {
      this.mResourceManager.getAppNameWithCache(this.labelId,
        this.bundleName, this.appName, this.appNameLoadCallback.bind(this));
    }
  }

  build() {
    Column() {
      Text(this.name)
        .fontSize(this.nameSize)
        .fontColor(StyleConstants.DEFAULT_FONT_COLOR)
        .textOverflow({overflow: TextOverflow.Ellipsis})
        .margin({ left: this.margin })
    }
  }
}