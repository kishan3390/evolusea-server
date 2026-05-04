import { Controller, Get } from '@nestjs/common';
import {
  BeliefsLookupDto,
  CompassPersonalitiesLookupDto,
  CompassTopicsLookupDto,
  CountriesLookupDto,
  GoalsLookupDto,
  IntentionsLookupDto,
  MoodsLookupDto,
} from './dto';

@Controller('lookups')
export class LookupController {
  @Get('/countries')
  async getCountries(): Promise<CountriesLookupDto> {
    return CountriesLookupDto.fromEnum();
  }

  @Get('/beliefs')
  async getBeliefs(): Promise<BeliefsLookupDto> {
    return BeliefsLookupDto.fromEnum();
  }

  @Get('/goals')
  async getGoals(): Promise<GoalsLookupDto> {
    return GoalsLookupDto.fromEnum();
  }

  @Get('/compass-personalities')
  async getCompassPersonalities(): Promise<CompassPersonalitiesLookupDto> {
    return CompassPersonalitiesLookupDto.fromEnum();
  }

  @Get('/moods')
  async getMoods(): Promise<MoodsLookupDto> {
    return MoodsLookupDto.fromEnum();
  }

  @Get('/intentions')
  async getIntentions(): Promise<IntentionsLookupDto> {
    return IntentionsLookupDto.fromEnum();
  }

  @Get('/compass-topics')
  async getCompassTopics(): Promise<CompassTopicsLookupDto> {
    return CompassTopicsLookupDto.fromEnum();
  }
}
