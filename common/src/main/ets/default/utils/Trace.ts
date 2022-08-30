/*
 * Copyright (c) 2022 Huawei Device Co., Ltd.
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

import byTrace from '@ohos.bytrace';
import { Log } from './Log';

/**
 * Add method trace. Modify RECORD_TRACE before using.
 */
export class Trace {
  static readonly CORE_METHOD_START_APP_CENTER = 'startAppCenter';
  static readonly CORE_METHOD_START_RECENTS = 'startRecents';
  static readonly CORE_METHOD_START_SETTINGS = 'startSettings';
  static readonly CORE_METHOD_OPEN_FOLDER = 'openFolder';
  static readonly CORE_METHOD_OPEN_FOLDER_DIALOG = 'openFolderDialog';
  static readonly CORE_METHOD_CLEAR_ALL_MISSIONS = 'clearAllMissions';
  static readonly CORE_METHOD_START_APP_ANIMATION = 'startAppAnimation';
  static readonly CORE_METHOD_CLOSE_APP_ANIMATION = 'closeAppAnimation';

  private static readonly TRACE_TAG = 'L:Trace';
  private static readonly RECORD_TRACE = true;
  private static readonly TRACE_LIMIT = 2000;

  private static readonly TRACE_BASE_INDEX = 10000;

  /**
    * start trace method
    *
    * @param {string} methodName - methodName for tracing
    */
  static start(methodName: string) {
    if (!Trace.RECORD_TRACE) return;
    if (typeof globalThis.taskIdMap === 'undefined' || typeof globalThis.traceIndex === 'undefined') {
      Trace.init();
    }
    let taskId = globalThis.taskIdMap.get(methodName);
    if (taskId == undefined) {
      taskId = globalThis.traceIndex;
      globalThis.traceIndex++;
      globalThis.taskIdMap.set(methodName, taskId);
    }
    Log.showDebug(this.TRACE_TAG, `start trace taskId: ${taskId}`);
    byTrace.startTrace(this.TRACE_TAG + methodName, taskId, Trace.TRACE_LIMIT);
  }

  private static init() {
    Log.showDebug(this.TRACE_TAG, 'init trace parameters');
    globalThis.taskIdMap = new Map<string, number>();
    globalThis.traceIndex = Trace.TRACE_BASE_INDEX;
  }

  /**
    * stop trace method
    *
    * @param {string} methodName - methodName for tracing
    */
  static end(methodName: string) {
    if (!Trace.RECORD_TRACE) return;
    if (typeof globalThis.taskIdMap === 'undefined') {
      return;
    }
    const taskId = globalThis.taskIdMap.get(methodName);
    if (taskId == undefined) {
      Log.showDebug(this.TRACE_TAG, `fail to end trace name:${methodName}`);
      return;
    }
    Log.showDebug(this.TRACE_TAG, `end trace taskId: ${taskId}`);
    byTrace.finishTrace(this.TRACE_TAG + methodName, taskId);
  }
}