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

import { EventConstants } from '@ohos/common';
import { localEventManager } from '@ohos/common';

/**
 * PageDesktop Model
 */

export default class PageDesktopModel {
  private constructor() {
  }

  /**
  * Obtains the pageDesktop data model object.
  *
  * @return PageDesktopModel
   */
  static getInstance(): PageDesktopModel {
    if (globalThis.PageDesktopModel == null) {
      globalThis.PageDesktopModel = new PageDesktopModel();
    }
    return globalThis.PageDesktopModel;
  }

  /**
  * Register for the PageDesktop application list add event.
  *
  * @param listener
   */
  registerPageDesktopItemAddEvent(listener): void {
    localEventManager.registerEventListener(listener, [
      EventConstants.EVENT_REQUEST_PAGEDESK_ITEM_ADD,
      EventConstants.EVENT_REQUEST_PAGEDESK_ITEM_DELETE,
      EventConstants.EVENT_REQUEST_PAGEDESK_ITEM_UPDATE,
      EventConstants.EVENT_REQUEST_PAGEDESK_FORM_ITEM_ADD,
      EventConstants.EVENT_SMARTDOCK_INIT_FINISHED
    ]);
  }

  /**
  * register badge update event.
  *
  * @param listener
   */
  registerPageDesktopBadgeUpdateEvent(listener): void {
    localEventManager.registerEventListener(listener, [
      EventConstants.EVENT_BADGE_UPDATE
    ]);
  }

  /**
  * Unregister application list change listener.
  *
  * @param listener
   */
  unregisterEventListener(listener): void {
    localEventManager.unregisterEventListener(listener);
  }

  sendDockItemChangeEvent(appInfo) {
    localEventManager.sendLocalEventSticky(EventConstants.EVENT_REQUEST_DOCK_ITEM_ADD, appInfo);
  }
}