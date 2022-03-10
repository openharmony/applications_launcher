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

import LocalEventManager from '../../../../../../../../common/src/main/ets/default/manager/LocalEventManager';
import EventConstants from '../../../../../../../../common/src/main/ets/default/constants/EventConstants';

/**
 * PageDesktop Model
 */

export default class PageDesktopModel {
  private static sPageDesktopModel: PageDesktopModel = null;

  private constructor() {
  }

  /**
  * Obtains the pageDesktop data model object.
  *
  * @return PageDesktopModel
   */
  static getInstance(): PageDesktopModel {
    if (PageDesktopModel.sPageDesktopModel == null) {
      PageDesktopModel.sPageDesktopModel = new PageDesktopModel();
    }
    return PageDesktopModel.sPageDesktopModel;
  }

  /**
  * 注册PageDesktop应用列表添加事件.
  *
  * @param listener 监听对象
   */
  registerPageDesktopItemAddEvent(listener) {
    LocalEventManager.registerEventListener(listener, [
      EventConstants.EVENT_REQUEST_PAGEDESK_ITEM_ADD
    ]);
  }

  /**
  * register badge update event.
  *
  * @param listener
   */
  registerPageDesktopBadgeUpdateEvent(listener) {
    LocalEventManager.registerEventListener(listener, [
      EventConstants.EVENT_BADGE_UPDATE
    ]);
  }

  /**
  * 解注册应用列表改变监听.
  *
  * @param listener 监听对象
   */
  unregisterEventListener(listener) {
    LocalEventManager.unregisterEventListener(listener);
  }

  sendDockItemChangeEvent(appInfo) {
    LocalEventManager.sendLocalEventSticky(EventConstants.EVENT_REQUEST_DOCK_ITEM_ADD, appInfo);
  }
}