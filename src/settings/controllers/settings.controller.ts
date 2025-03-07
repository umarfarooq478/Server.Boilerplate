import {
  Body,
  Controller,
  Delete,
  Get,
  Post,
  Put,
  Query
} from '@nestjs/common';
import {
  ApiOkResponse,
  ApiOperation,
  ApiTags
} from '@nestjs/swagger';

import { SettingDto } from '../dtos/createSetting.dto';
import { FetchSingleSettingDto } from '../dtos/fetchSetting.dto';
import { Setting } from '../entities/settings.entity';
import { SettingsService } from '../services/settings.service';


@ApiTags('settings')
@Controller('settings')
export class SettingsController {
  constructor(private readonly settingsService: SettingsService) { }

  @Post()
  @ApiOperation({ summary: 'Create a new setting' })
  @ApiOkResponse({ type: Setting })
  createSetting(@Body() createSettingDto: SettingDto) {
    return this.settingsService.createSetting(createSettingDto);
  }

  @Get()
  @ApiOperation({ summary: 'Fetch multiple settings by keys' })
  @ApiOkResponse({ type: [Setting] })
  findMultipleSettings(@Query('keys') keys: string) {
    const keyArray = keys.split(',');
    return this.settingsService.findMultiple(keyArray);
  }




  @Put()
  @ApiOperation({ summary: 'Update a setting by  key' })
  @ApiOkResponse({ type: Setting })
  updateSetting(@Body() updateSettingDto: SettingDto) {
    return this.settingsService.updateSetting(updateSettingDto);
  }

  @Delete(':key')
  @ApiOperation({ summary: 'Delete a setting by  key' })
  @ApiOkResponse({ description: 'Setting deleted successfully' })
  deleteSetting(@Query('key') key?: string) {
    const fetchSingleSettingDto: FetchSingleSettingDto = { key };
    return this.settingsService.deleteSetting(fetchSingleSettingDto);
  }
}
