import AbilityStage from '@ohos.application.AbilityStage';
import Log from '../../../../../../common/src/main/ets/default/utils/Log';

const TAG = 'Launcher Settings MyAbilityStage';

export default class MyAbilityStage extends AbilityStage {
  onCreate(): void {
    Log.showInfo(TAG, 'onCreate is called');
  }
}