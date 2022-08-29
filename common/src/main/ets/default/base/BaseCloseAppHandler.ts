/**
 * Copyright (c) 2022-2022 Huawei Device Co., Ltd.
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

import { BaseRemoteAnimationHandler } from './BaseRemoteAnimationHandler';

/**
 * close app base class
 */
export abstract class BaseCloseAppHandler extends BaseRemoteAnimationHandler {
    constructor() {
        super();
    }

    /**
   * calculate app icon position.
   */
    protected calculateAppIconPosition(): void {
    }

    /**
     * get app icon info
     *
     * @param windowTarget close window target
     */
    public getAppIconInfo(windowTarget): void {
    }

    /**
     * set close app icon info.
     */
    public setAppIconInfo(): void {
        super.setAppIconInfo();
        AppStorage.SetOrCreate('closeAppIconInfo', {
            appIconSize: this.mAppIconSize,
            appIconHeight: this.mAppIconHeight,
            appIconPositionX: this.mAppIconPositionX,
            appIconPositionY: this.mAppIconPositionY
        });
    }
}
