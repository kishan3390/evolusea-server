import { Moods } from '../../../domain/note/domain/enums/moods.enum';

export class MoodsLookupDto {
  moods: string[];

  static fromEnum(): MoodsLookupDto {
    return {
      moods: Object.values(Moods),
    };
  }
}
