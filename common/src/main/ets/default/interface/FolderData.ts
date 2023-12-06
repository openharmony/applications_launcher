import { AppItemInfo } from '../bean';

export class FolderData {
  layoutInfo: AppItemInfo[][];
  enterEditing: boolean;
  folderName: string;
  folderId: string;
  badgeNumber?: number;
}