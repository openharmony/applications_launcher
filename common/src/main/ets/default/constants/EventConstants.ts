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

/**
 * Constants of events that will be registered to system.
 */
const EventConstants = {
  EVENT_PACKAGE_ADDED: 'usual.event.PACKAGE_ADDED',
  EVENT_PACKAGE_CHANGED: 'usual.event.PACKAGE_CHANGED',
  EVENT_PACKAGE_REMOVED: 'usual.event.PACKAGE_REMOVED',
  EVENT_REQUEST_DOCK_ITEM_ADD: 'launcher.event.REQUEST_DOCK_ITEM_ADD',  //request add item to smartDock
  EVENT_REQUEST_PAGEDESK_ITEM_ADD: 'launcher.event.REQUEST_PAGEDESK_ITEM_ADD',  //request add item to pageDesk
  EVENT_REQUEST_PAGEDESK_ITEM_UPDATE: 'launcher.event.EVENT_REQUEST_PAGEDESK_ITEM_UPDATE',  //request update item to pageDesk
  EVENT_REQUEST_PAGEDESK_ITEM_DELETE: 'launcher.event.REQUEST_PAGEDESK_ITEM_DELETE',  //request add item to pageDesk
  EVENT_REQUEST_RESIDENT_DOCK_ITEM_UPDATE: 'launcher.event.EVENT_REQUEST_RESIDENT_DOCK_ITEM_UPDATE',//request update item to smartdock
  EVENT_REQUEST_RESIDENT_DOCK_ITEM_DELETE: 'launcher.event.REQUEST_DOCK_ITEM_DELETE',  //request delete resident item
  EVENT_REQUEST_RECENT_DOCK_ITEM_DELETE: 'launcher.event.RECENT_DOCK_ITEM_DELETE',  //request delete recent item
  EVENT_BADGE_UPDATE: 'launcher.event.EVENT_BADGE_UPDATE',
  EVENT_REQUEST_JUMP_TO_FORM_VIEW: 'launcher.event.EVENT_REQUEST_JUMP_TO_FORM_VIEW',
  EVENT_REQUEST_FORM_ITEM_ADD: 'launcher.event.REQUEST_FORM_ITEM_ADD',
  EVENT_FOLDER_PACKAGE_REMOVED: 'usual.event.FOLDER_PACKAGE_REMOVED',
  EVENT_NAVIGATOR_BAR_STATUS_CHANGE: 'usual.event.NAVIGATOR_BAR_STATUS_CHANGE'
};

export default EventConstants;