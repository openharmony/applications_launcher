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


const BOTTOM_BAR_FOCUS_PAGE = -1;


/**
 * A page element that display app icon.
 */
export default {
    props: ['itemBottomBarWidth', 'itemBottomBar'],

    data() {
        return {
            bottomBarWidth: this.itemBottomBarWidth,
            bottomBar: [],
            BOTTOM_BAR_FOCUS_PAGE: BOTTOM_BAR_FOCUS_PAGE
        };
    },

    onInit() {
        this.$watch('itemBottomBar','bottomBarWatcher');
    },

    /**
     * Open the choosen application.
     *
     * @param {string} abilityName - Abilityname of the application.
     * @param {string} bundleName - Bundlename of the application.
     */
    openApplicationBottomBar(abilityName, bundleName) {
        this.$emit('openApplicationBottomBar',{abilityName:abilityName,bundleName:bundleName});
    },

    /**
     * LongPress event for application.
     *
     * @param {object} appItem - The pressed application.
     * @param {number} index - The application's index in the page.
     */
    longPressBottomBar(appItem, index) {
        this.$emit('longPressBottomBar',{appItem:appItem,index:index});
    },

    /**
     * Focus event for application icon.
     *
     * @param {number} page - The index of the page where the focused application is in.
     * @param {number} idx - The index of the application in the page.
     */
    focusBottomBar(page, idx) {
        this.$emit('focusBottomBar',{page:page,idx:idx});
    }

}