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

import CommonEvent from '@ohos.commonEvent';
import { AsyncCallback, BusinessError} from 'basic';
import { CommonEventData } from 'commonEvent/commonEventData';
import { CommonEventSubscriber } from 'commonEvent/commonEventSubscriber';
import { CommonEventSubscribeInfo } from 'commonEvent/commonEventSubscribeInfo';
import { EventConstants } from '../constants/EventConstants';
import { localEventManager } from './LocalEventManager';
import commonEventManager from './CommonEventManager';
import { Log } from '../utils/Log';

const TAG = 'NavigationBarCommonEventManager';

/**
 * Wrapper class for NavigationBarCommonEvent interfaces.
 */
class NavigationBarCommonEventManager {
    private static NAVIGATION_BAR_HIDE = 'systemui.event.NAVIGATIONBAR_HIDE';
    private static subscriber: CommonEventSubscriber;
    private static eventCallback: AsyncCallback<CommonEventData>;

    /**
     * get NavigationBarCommonEvent instance
     *
     * @return NavigationBarCommonEvent singleton
     */
    static getInstance(): NavigationBarCommonEventManager {
        if (globalThis.NavigationBarCommonEvent == null) {
            globalThis.NavigationBarCommonEvent = new NavigationBarCommonEventManager();
            this.eventCallback = this.navigationBarEventCallback.bind(this);
            this.initSubscriber();
        }
        return globalThis.NavigationBarCommonEvent;
    }

    private static initSubscriber() {
        if (NavigationBarCommonEventManager.subscriber != null) {
            return;
        }
        const subscribeInfo: CommonEventSubscribeInfo = {
            events: [NavigationBarCommonEventManager.NAVIGATION_BAR_HIDE]
        };
        CommonEvent.createSubscriber(subscribeInfo).then((commonEventSubscriber: CommonEventSubscriber) => {
            Log.showDebug(TAG, "init SPLIT_SCREEN subscriber success");
            NavigationBarCommonEventManager.subscriber = commonEventSubscriber;
        }, (err) => {
            Log.showError(TAG, `Failed to createSubscriber ${err}`)
        })
    }

    /**
     * Register navigationBar event listener.
     */
    public registerNavigationBarEvent() {
        commonEventManager.registerCommonEvent(NavigationBarCommonEventManager.subscriber, NavigationBarCommonEventManager.eventCallback);
    }

    /**
     * Unregister navigationBar event listener.
     */
    public unregisterNavigationBarEvent() {
        commonEventManager.unregisterCommonEvent(NavigationBarCommonEventManager.subscriber, NavigationBarCommonEventManager.eventCallback);
    }

    /**
     * navigationBar event handler.
     */
    private static async navigationBarEventCallback(error: BusinessError, data: CommonEventData) {
        Log.showDebug(TAG,`navigationBarEventCallback receive data: ${JSON.stringify(data)}.`);
        if (error.code != 0) {
            Log.showError(TAG, `navigationBarEventCallback error: ${JSON.stringify(error)}`);
            return;
        }
        switch (data.event) {
            case NavigationBarCommonEventManager.NAVIGATION_BAR_HIDE:
                setTimeout(() => {
                    localEventManager.sendLocalEventSticky(EventConstants.EVENT_NAVIGATOR_BAR_STATUS_CHANGE, '0');
                }, 30)
            default:
                break;
        }
    }
}

export const navigationBarCommonEventManager = NavigationBarCommonEventManager.getInstance();