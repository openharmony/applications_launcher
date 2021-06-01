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

import router from '@system.router';

var mRecentsModel;
var mRecentsLimit;

export default class RecentsPresenter {
    constructor(recentsModel) {
        console.info("Launcher recents  RecentsPresenter constructor start");
        mRecentsModel = recentsModel;
        mRecentsLimit = mRecentsModel.getRecentProcessLimit();
        console.info("Launcher recents  RecentsPresenter constructor end");
    }

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

    removeRecentProcess(missionId) {
        console.info("Launcher recents  RecentsPresenter removeRecentProcess start missionId = " + missionId);
        mRecentsModel.removeRecentProcess(missionId);
        console.info("Launcher recents  RecentsPresenter removeRecentProcess end");
    }

    back() {
        console.info("Launcher recents  RecentsPresenter back start");
        router.back();
        console.info("Launcher recents  RecentsPresenter back end");
    }

    startUpApp(appInfo) {
        console.info("Launcher recents  RecentsPresenter startUpApp start appInfo = " + JSON.stringify(appInfo));
        mRecentsModel.hotStartUpApp(appInfo);
        console.info("Launcher recents  RecentsPresenter startUpApp end ");
    }
}