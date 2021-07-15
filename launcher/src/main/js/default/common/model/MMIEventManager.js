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

let mCallbacks = [];

/**
 * A manager class support Multi-Mode input events.
 */
export default class MMIEventManager {

    /**
     * Register the multi mode event callback function.
     *
     * @param {object} callback - callback function to be registered.
     */
    registerEventCallback(callback) {
        mCallbacks.push(callback);
    }

    /**
     * Unregister the multi mode event callback function.
     *
     * @param {object} callback - callback function to be unregistered.
     */
    unregisterEventCallback(callback) {
        for (let idx = 0; idx < mCallbacks.length; idx++) {
            if (mCallbacks[idx] == callback) {
                mCallbacks.splice(idx, 1);
                break;
            }
        }
    }

    /**
     * Called when the multi mode event occur.
     */
    onMMIEvent() {
        for (let callback of mCallbacks) {
            if (callback != undefined) {
                callback();
            }
        }
    }
}