/*
 * Copyright (c) 2022 Huawei Device Co., Ltd.
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
import Notification from '@ohos.notification';
import { NotificationSubscriber } from 'notification/notificationSubscriber';
import { Log, AppModel, BadgeManager } from '@ohos/common';

const TAG = 'NumBadgeManager';

export class NumBadgeManager {
    private readonly mRegisterNumBadgeCallback;
    private readonly mUnRegisterNumBadgeCallback;
    private mSubscriber: NotificationSubscriber = {
        onConsume: this.onConsumeCallback.bind(this),
        onCancel: this.onCancelCallback.bind(this),
        onUpdate: this.onUpdateCallback.bind(this),
        onConnect: this.onConnectCallback.bind(this),
        onDisconnect: this.onDisconnectCallback.bind(this),
        onDestroy: this.onDestroyCallback.bind(this)
    }

    private constructor() {
        this.mRegisterNumBadgeCallback = this.registerNumBadgeCallback.bind(this);
        this.mUnRegisterNumBadgeCallback = this.unRegisterNumBadgeCallback.bind(this);
    }

    private onConsumeCallback(data) {
        Log.showInfo(TAG, 'onConsumeCallback called !!');
        this.handleSubscribeCallbackData(data);
    }

    private onCancelCallback(data) {
        Log.showInfo(TAG, "onCancelCallback called !!");
        Log.showInfo(TAG, `onCancelCallback request ${JSON.stringify(data?.request)}`);
        this.handleSubscribeCallbackData(data);
    }

    private onUpdateCallback() {
        Log.showInfo(TAG, 'onUpdateCallback called !!');
    }

    private onConnectCallback() {
        Log.showInfo(TAG, 'onConnectCallback called !!');
    }

    private onDisconnectCallback() {
        Log.showInfo(TAG, 'onDisconnectCallback called !!');
    }

    private onDestroyCallback() {
        Log.showInfo(TAG, 'onDestroyCallback called !!');
    }

    private async handleSubscribeCallbackData(data) {
        Log.showInfo(TAG, 'handleSubscribeCallbackData start !!');

        let creatorUserId: number = data?.request?.creatorUserId;
        let creatorBundleName: string = data?.request?.creatorBundleName;
        let badgeNumber: number = data?.request?.badgeNumber;
        Log.showDebug(TAG, `handleSubscribeCallbackData creatorUserId is ${creatorUserId} creatorBundleName is ${creatorBundleName} badgeNumber is ${badgeNumber}`);

        let userId: number = AppModel.getInstance().getUserId();
        if (userId != creatorUserId) {
            Log.showError(TAG, `handleSubscribeCallbackData userid is diff  ${userId}`);
            return;
        }
        BadgeManager.getInstance().updateBadgeNumber(creatorBundleName, badgeNumber)
            .then((result) => {
                Log.showInfo(TAG, `updateBadgeByBundle result is ${result}`);
                let badgeNotification = {
                    creatorBundleName: creatorBundleName,
                    badgeNumber: badgeNumber
                };
                AppStorage.SetOrCreate('badgenotification', badgeNotification);
                Log.showInfo(TAG, `updateBadgeByBundle badgeNotification is ${JSON.stringify(badgeNotification)}`);
            })
            .catch(error => {
                Log.showError(TAG, `updateBadgeByBundle error is ${error.message}`);
            });

    }

    private insertBadgeItem() {

    }

    private registerNumBadgeCallback(err, data) {
        if (err.code) {
            Log.showInfo(TAG, "registerNumBadgeCallback faided " + JSON.stringify(err));
        } else {
            Log.showInfo(TAG, "registerNumBadgeCallback success ");
        }
    }

    private unRegisterNumBadgeCallback(err, data) {
        if (err.code) {
            Log.showInfo(TAG, "unRegisterNumBadgeCallback faided " + JSON.stringify(err));
        } else {
            Log.showInfo(TAG, "unRegisterNumBadgeCallback success ");
        }
    }

    static getInstance(): NumBadgeManager {
        if (globalThis.sNumBadgeManager == null) {
            globalThis.sNumBadgeManager = new NumBadgeManager();
        }
        return globalThis.sNumBadgeManager;
    }

    registerNumBadge() {
        Log.showInfo(TAG, "registerNumBadge called ");
        Notification.subscribe(this.mSubscriber, this.mRegisterNumBadgeCallback);
    }

    unRegisterNumBadge() {
        Log.showInfo(TAG, "unRegisterNumBadge called ");
        Notification.unsubscribe(this.mSubscriber, this.mUnRegisterNumBadgeCallback);
    }
}