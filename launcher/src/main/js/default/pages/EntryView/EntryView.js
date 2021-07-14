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

import EntryPresenter from '../../presenter/entry/EntryPresenter.js'
import Device from '@system.device';

const timeout = 1000;

let mEntryPresenter;

export default {
    onInit() {
        console.info("Launcher EntryView onInit start");
        mEntryPresenter = new EntryPresenter(this.$app.$def.data.settingsModel);
        console.info("Launcher EntryView onInit end");
    },

    onShow() {
        Device.getInfo({
            success: (data) => {
                this.$app.$def.data.screenHeight = data.windowHeight;
                this.$app.$def.data.screenWidth = data.windowWidth;
                setTimeout(() => {
                    console.info("Launcher EntryView onShow start");
                    mEntryPresenter.startAppListView();
                    console.info("Launcher EntryView onShow end");
                }, timeout);
            },
            fail: (data, code) => {
                console.info('Launcher Failed to obtain Device information. Error code:'+ code + '; Error information: ' + data);
                //Fake data
                this.$app.$def.data.screenHeight = 1240;
                this.$app.$def.data.screenWidth = 720;
                setTimeout(() => {
                    console.info("Launcher EntryView onShow start");
                    mEntryPresenter.startAppListView();
                    console.info("Launcher EntryView onShow end");
                }, timeout);
            }
        })
    },
}
