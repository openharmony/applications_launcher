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

import BaseAppPresenter from './base/BaseAppPresenter.js';

var mSettingsModel;
var mGridConfig;
var mAppGridList = [];
var viewCallback;
var mIndex = 0;

export default class AppGridPresenter extends BaseAppPresenter {
    constructor(AppModel, SettingsModel) {
        super(AppModel);
        this.appModel = AppModel;
        mSettingsModel = SettingsModel;
        mGridConfig = mSettingsModel.getGridConfig();
    }

    pagingFiltering(mblist) {
        mAppGridList = [];
        var listLength = mblist.length;
        var column = mGridConfig.column;
        var row = mGridConfig.row;
        var page = Math.ceil(listLength / column / row);
        for (var k = 0; k < page; k++) {
            var appPageList = [];
            for (var i = 0; i < row; i++) {
                var appRowList = [];
                for (var j = 0; j < column; j++) {
                    if ((i * column) + j + k * column * row >= listLength) {
                        var appInfo = {
                            System: false,
                            AppName: '',
                            AppId: '',
                            AppIcon: '',
                            bundleName: '',
                            labelId: '',
                            visibility: 'hidden'
                        };
                        appRowList.push(appInfo);
                    } else {
                        var tmp ={
                            System: mblist[(i * column) + j + k * column * row].System,
                            AppName: mblist[(i * column) + j + k * column * row].AppName,
                            AppId: mblist[(i * column) + j + k * column * row].AppId,
                            AppIcon: mblist[(i * column) + j + k * column * row].AppIcon,
                            bundleName: mblist[(i * column) + j + k * column * row].bundleName,
                            labelId: mblist[(i * column) + j + k * column * row].labelId,
                            visibility:'visible'
                        };
                        appRowList.push(tmp);
                    }
                }
                appPageList.push(appRowList);
            }
            mAppGridList.push(appPageList);
        }
        return mAppGridList;
    }

    getGridList(callback) {
        viewCallback = callback;
        this.appModel.getGridPagesAppList(this.getGridListCallback.bind(this));
    }

    getGridListCallback(list) {
        let callbackList = this.pagingFiltering(list);
        viewCallback(callbackList);
    }

    getGridIndex() {
        return mIndex;
    }

    setGridIndex(index) {
        mIndex = index
    }

    getBootAppList() {
        return this.appModel.getGridBootAppList();
    }

}