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

import { Log } from '../utils/Log';
import { BadgeManager } from '../manager/BadgeManager';
import { StyleConstants } from '../constants/StyleConstants';
import { ResourceManager } from '../manager/ResourceManager';

const TAG = 'AppIcon';

@Component
export struct AppIcon {
  iconSize: number;
  iconId: string;
  bundleName: string;
  moduleName: string;
  @State icon: string = '';
  badgeNumber: number = 0;
  @State iconScale: number = 1;
  useCache: boolean = true;
  badgeFontSize: number = StyleConstants.DEFAULT_BADGE_FONT_SIZE;
  private mResourceManager;
  private mBadgeManager;
  private mDefaultAppIcon;

  aboutToAppear(): void  {
    this.mResourceManager = ResourceManager.getInstance();
    this.mBadgeManager = BadgeManager.getInstance();
    this.updateIcon();
    this.initBadge();
  }

  public iconLoadCallback(image: string) {
    this.icon = image;
  }

  public updateIcon() {
    this.mResourceManager.getAppIconWithCache(this.iconId, this.bundleName, this.moduleName,
    this.iconLoadCallback.bind(this), this.mDefaultAppIcon);
  }

  public badgeInitCallback(badgeNumber) {
    if (this.badgeNumber != badgeNumber) {
      this.badgeNumber = badgeNumber;
    }
  }

  public initBadge() {
    this.mBadgeManager.getBadgeByBundle(this.bundleName, this.badgeInitCallback.bind(this));
  }

  build() {
    Column() {
      Badge({
        count: this.badgeNumber,
        maxCount: StyleConstants.MAX_BADGE_COUNT,
        style: {
          color: StyleConstants.DEFAULT_FONT_COLOR,
          fontSize: this.badgeFontSize,
          badgeSize: (this.badgeNumber > 0 ? StyleConstants.DEFAULT_BADGE_SIZE : 0),
          badgeColor: Color.Red
        }
      }) {
        Image(this.icon)
        .width(this.iconSize)
        .height(this.iconSize)
      }
    }
    .onHover((isHover: boolean) => {
      Log.showInfo(TAG, `onHover isHover ${isHover}`);
      this.iconScale = isHover ? 1.05 : 1
    })
    .onTouch((event: TouchEvent) => {
      if (event.type === TouchType.Down) {
        this.iconScale = 0.9;
      } else if (event.type === TouchType.Up) {
        this.iconScale = 1;
      }
    })
    .onMouse((event: MouseEvent) => {
      if (event.button == MouseButton.Left && event.action == MouseAction.Press) {
        this.iconScale = 0.9;
      } else if (event.button == MouseButton.Left && event.action == MouseAction.Release) {
        this.iconScale = 1;
      }
    })
    .width(this.iconSize)
    .height(this.iconSize)
    .scale({ x: this.iconScale, y: this.iconScale })
    .animation({ duration: 100 })
  }
}