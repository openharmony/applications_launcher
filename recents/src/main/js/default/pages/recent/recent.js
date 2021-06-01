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

import RecentsPresenter from '../../presenter/recent/RecentsPresenter.js';

var mRecentsPresenter;

export default {
    data: {
        recentProcessList: []
    },
    onInit() {
        console.info("Launcher recents  onInit start");
        console.info("Launcher recents  onInit end");
    },

    onShow() {
        console.info("Launcher recents  onShow start");
        mRecentsPresenter = new RecentsPresenter(this.$app.$def.data.recentsModel);
        mRecentsPresenter.getRecentProcessList((data) => {
            this.recentProcessList = data;
            console.info("Launcher recents  onShow getRecentProcessList this.recentProcessList = " + JSON.stringify(this.recentProcessList));
        });
        console.info("Launcher recents  onShow end");
    },

    onHide() {
        console.info("Launcher recents  onHide start");
        this.recentProcessList = [];
        console.info("Launcher recents  onHide end");
    },

    clearAll() {
        console.info("Launcher recents  clearAll start");
        mRecentsPresenter.clearRecentProcess();
        setTimeout(() => {
            console.info("Launcher recents  clearAll mRecentsPresenter.back()");
            mRecentsPresenter.back();
        }, 1500);
        console.info("Launcher recents  clearAll end");
    },

    clearApp(missionId, e) {
        console.info("Launcher recents  clearApp start missionId = " + missionId + " e.direction = " + e.direction);
        if (e.direction == "up") {
            console.info(" mRecentsPresenter.removeRecentProcess missionId = " + missionId);
            mRecentsPresenter.removeRecentProcess(missionId);
        }
        console.info("Launcher recents  clearApp end");
    },

    startUp(appInfo) {
        console.info("Launcher recents  startUp start appInfo = " + JSON.stringify(appInfo));
        mRecentsPresenter.startUpApp(appInfo);
        console.info("Launcher recents  startUp end");
    }
}