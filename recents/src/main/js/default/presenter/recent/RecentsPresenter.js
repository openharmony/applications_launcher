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

import Router from '@system.router';

let mRecentsModel;
let mRecentsLimit;

/**
 * Class RecentsPresenter.
 */
export default class RecentsPresenter {
    /**
     * Constructor of RecentsPresenter.
     *
     * @param {object} recentsModel - the model of recentPresenter.
     */
    constructor(recentsModel) {
        console.info("Launcher recents  RecentsPresenter constructor start");
        mRecentsModel = recentsModel;
        mRecentsLimit = mRecentsModel.getRecentProcessLimit();
        console.info("Launcher recents  RecentsPresenter constructor end");
    }

    /**
     * Callback function of getRecentProcessList.
     *
     * @param {object} callback - the callback from view.
     */
    getRecentProcessList(callback) {
        console.info("Launcher recents  RecentsPresenter getRecentProcessList start")
        mRecentsModel.getRecentProcessList((data) => {
            console.info("Launcher recents  RecentsPresenter mRecentsModel.getRecentProcessList data = " + JSON.stringify(data));
            let recentProcessList = data;
            if (recentProcessList.length > mRecentsLimit) {
                recentProcessList.splice(0, recentProcessList.length - mRecentsLimit);
            }
            console.info("Launcher recents  RecentsPresenter mRecentsModel.getRecentProcessList getRecentProcessList recentProcessList = " + JSON.stringify(recentProcessList));
            callback(recentProcessList);
        });
        console.info("Launcher recents  RecentsPresenter getRecentProcessList end")
    }

    clearRecentProcess() {
        console.info("Launcher recents  RecentsPresenter clearRecentProcess start");
        mRecentsModel.clearRecentProcess();
        console.info("Launcher recents  RecentsPresenter clearRecentProcess end");
    }

    /**
     * Remove recent process.
     *
     * @param {string} missionId - the missionId of recent process.
     */
    removeRecentProcess(missionId) {
        console.info("Launcher recents  RecentsPresenter removeRecentProcess start missionId = " + missionId);
        mRecentsModel.removeRecentProcess(missionId);
        console.info("Launcher recents  RecentsPresenter removeRecentProcess end");
    }

    back() {
        console.info("Launcher recents  RecentsPresenter back start");
        Router.back();
        console.info("Launcher recents  RecentsPresenter back end");
    }

    /**
     * Hot start app.
     *
     * @param {object} appInfo - the app info .
     */
    startUpApp(appInfo) {
        console.info("Launcher recents  RecentsPresenter startUpApp start appInfo = " + JSON.stringify(appInfo));
        mRecentsModel.hotStartUpApp(appInfo);
        console.info("Launcher recents  RecentsPresenter startUpApp end ");
    }
}
