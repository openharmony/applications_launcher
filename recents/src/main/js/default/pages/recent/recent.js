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

const APP_INFO_REFRESH_DELAY = 500;
const DISPLAY_NONE = 'none';
const DISPLAY_FLEX = 'flex';

let mRecentsPresenter;

export default {
    data: {
        recentProcessList: [],
        recentProcessListDisplay: DISPLAY_NONE,
        emptyMsgDisplay: DISPLAY_FLEX
    },
    onInit() {
        console.info("Launcher recents  onInit start");
        globalThis.$globalR = this.$r.bind(this);
        console.info("Launcher recents  onInit end");
    },

    onShow() {
        console.info("Launcher recents  onShow start");
        mRecentsPresenter = new RecentsPresenter(this.$app.$def.data.recentsModel);
        mRecentsPresenter.getRecentProcessList((data) => {
            this.recentProcessList = data;
            if (this.recentProcessList.length == 0) {
                this.recentProcessListDisplay = DISPLAY_NONE;
                this.emptyMsgDisplay = DISPLAY_FLEX;
                return;
            }
            this.recentProcessListDisplay = DISPLAY_FLEX;
            this.emptyMsgDisplay = DISPLAY_NONE;
            console.info("Launcher recents  onShow getRecentProcessList this.recentProcessList = " + JSON.stringify(this.recentProcessList));
            this.updateAppInfos();
        });
        console.info("Launcher recents  onShow end");
    },

    onHide() {
        console.info("Launcher recents  onHide start");
        this.recentProcessListDisplay = DISPLAY_NONE;
        this.emptyMsgDisplay = DISPLAY_NONE;
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

    /**
     * Remove recent process.
     *
     * @param {string} missionId - the missionId of recent process.
     * @param {object} e - the event form pre page.
     */
    clearApp(missionId, e) {
        console.info("Launcher recents  clearApp start missionId = " + missionId + " e.direction = " + e.direction);
        if (e.direction == "up") {
            console.info(" mRecentsPresenter.removeRecentProcess missionId = " + missionId);
            mRecentsPresenter.removeRecentProcess(missionId);
        }
        console.info("Launcher recents  clearApp end");
    },

    /**
     * Hot start app.
     *
     * @param {object} appInfo - the app info.
     */
    startUp(appInfo) {
        console.info("Launcher recents  startUp start appInfo = " + JSON.stringify(appInfo));
        mRecentsPresenter.startUpApp(appInfo);
        console.info("Launcher recents  startUp end");
    },

    /**
     * Update app information.
     */
    updateAppInfos() {
        console.info("Launcher recents updateAppInfos setTimeout this.recentProcessList.length = " + this.recentProcessList.length);
        setTimeout(() => {
            for(let i = 0; i < this.recentProcessList.length; i++) {
                console.info("Launcher recents updateAppInfos setTimeout in i = " + i);
                this.$child('icon' + i).updateIcon();
                this.$child('name' + i).updateName();
            }
        }, APP_INFO_REFRESH_DELAY);
    }
}