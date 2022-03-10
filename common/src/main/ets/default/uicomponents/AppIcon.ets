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

import ResourceManager from '../manager/ResourceManager';
import BadgeManager from '../manager/BadgeManager';
import StyleConstants from '../constants/StyleConstants';

@Component
export default struct AppIcon {
  @Prop iconSize: number;
  @Prop @Watch("updateIcon") appIcon: string;
  @Prop bundleName: string;
  @State icon: string = ' ';
  @State size: number = 1;
  useCache: boolean = true;
  @Prop @Watch("updateBadge") badgeNumber: number;
  @State badge: number = 0;
  badgeFontSize: number = StyleConstants.DEFAULT_BADGE_FONT_SIZE;
  private mResourceManager;
  private mBadgeManager;
  private mDefaultAppIcon;

  public aboutToAppear(): void  {
    this.mDefaultAppIcon = StyleConstants.DEFAULT_ICON;
    this.icon = this.mDefaultAppIcon;
    this.mResourceManager = ResourceManager.getInstance();
    this.mBadgeManager = BadgeManager.getInstance();
    this.updateIcon();
    this.updateBadge();
  }

  public iconLoadCallback(image) {
    this.icon = image;
  }

  public updateIcon() {
    this.mResourceManager.getAppIconWithCache(this.appIcon, this.bundleName, this.iconLoadCallback.bind(this), this.mDefaultAppIcon);
  }

  public badgeLoadCallback(badgeNumber) {
    this.badge = badgeNumber;
  }

  public updateBadge() {
    if (this.badgeNumber < 0) {
      return;
    }
    this.mBadgeManager.getBadgeByBundle(this.bundleName, this.badgeLoadCallback.bind(this));
  }

  build() {
    Column() {
      Badge({
        count: this.badge,
        maxCount: StyleConstants.MAX_BADGE_COUNT,
        style: {
          color: StyleConstants.DEFAULT_FONT_COLOR,
          fontSize: this.badgeFontSize,
          badgeSize: (this.badge > 0 ? StyleConstants.DEFAULT_BADGE_SIZE : 0),
          badgeColor: Color.Red
        }
      }) {
        Image(this.icon)
      }
      .width(this.iconSize)
      .height(this.iconSize)
    }
    .onHover((isHover: boolean) => {
      console.info('Launcher AppIcon onHover isHover ' + isHover);
      this.size = isHover ? 1.15 : 1
    })
    .onTouch((event: TouchEvent) => {
      if (event.type === TouchType.Down) {
        this.size = 0.9;
      } else if (event.type === TouchType.Up) {
        this.size = 1;
      }
    })
    .onMouse((event: MouseEvent) => {
      if (event.button == MouseButton.Left && event.action == MouseAction.Press) {
        this.size = 0.9;
      } else if (event.button == MouseButton.Left && event.action == MouseAction.Release) {
        this.size = 1;
      }
    })
    .width(this.iconSize)
    .height(this.iconSize)
    .scale({ x: this.size, y: this.size })
    .animation({ duration: 100 })
  }
}