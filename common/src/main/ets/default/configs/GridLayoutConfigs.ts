/**
 * Copyright (c) 2021-2022 Huawei Device Co., Ltd.
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

const GridLayoutConfigs = {
  GridLayoutTable: [
    {
      id: 0,
      layout: '4X4',
      name: '4X4',
      value: 1,
      row: 4,
      column: 4,
      checked: false
    },

    {
      id: 1,
      layout: '5X4',
      name: '5X4',
      value: 0,
      row: 5,
      column: 4,
      checked: false
    },

    {
      id: 2,
      layout: '6X4',
      name: '6X4',
      value: 2,
      row: 6,
      column: 4,
      checked: false
    },
  ],
  GridLayoutTableHorizontal: [
    {
      id: 0,
      layout: '2X6',
      name: '2X6',
      value: 0,
      row: 2,
      column: 6,
      checked: false
    }
  ],
  PadGridLayoutTableHorizontal: [
    {
      id: 0,
      layout: '5X11',
      name: '5X11',
      value: 0,
      row: 5,
      column: 11,
      checked: false
    },
    {
      id: 1,
      layout: '4X10',
      name: '4X10',
      value: 1,
      row: 4,
      column: 10,
      checked: false
    },
    {
      id: 2,
      layout: '4X9',
      name: '4X9',
      value: 2,
      row: 4,
      column: 9,
      checked: false
    }
  ],
};

export default GridLayoutConfigs;