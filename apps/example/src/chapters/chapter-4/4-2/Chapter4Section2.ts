import { ChapterPage } from '../../../lib/ChapterPage';
import { main } from './main';

export class Chapter4Section2 extends ChapterPage {
  override async onRender() {
    await main();
  }
}
