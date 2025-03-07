import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';

import { ConfigService } from '@nestjs/config';
import { CustomLogger } from 'src/logger/services/logger.service';
import { FileUploadService } from 'src/utils/S3/fileUpload';
import { In, Repository } from 'typeorm';
import { SettingDto } from '../dtos/createSetting.dto';
import { FetchSingleSettingDto } from '../dtos/fetchSetting.dto';
import { UpdateSettingDto } from '../dtos/updateSetting.dto';
import { Setting } from '../entities/settings.entity';

@Injectable()
export class SettingsService {
  public SETTINGS_REDIS_KEY = 'SETTINGS';
  constructor(
    private readonly customLogger: CustomLogger,
    private readonly configService: ConfigService,
    @InjectRepository(Setting)
    private readonly settingRepository: Repository<Setting>,

    private fileUploadService: FileUploadService,
  ) { }
  // below function creates settings if no setting exists in database
  async seedDatabase() {

    try {
      const settingsToCreate: SettingDto[] = [
        {
          key: 'music.mode.talkMode',
          value: '33',
        },
        {
          key: 'music.mode.workoutMode',
          value: '100',
        },

      ];
      // fetching all settings from database
      let existingSettings = await this.findMultiple(
        settingsToCreate.map((setting) => {
          return setting.key;
        }),
      );
      // to avoid null values when there is no setting in database
      existingSettings = existingSettings.filter((setting) =>
        Boolean(setting),
      ) as Setting[];

      const settingCreationPromises = settingsToCreate.map(
        async (settingToCreate) => {
          const index = existingSettings.findIndex(
            (existingSetting) => existingSetting.key === settingToCreate.key,
          );
          if (index === -1) {
            return await this.createSetting(settingToCreate);
          } else {
            return existingSettings[index];
          }
        },
      );
      return await Promise.all(settingCreationPromises);
    } catch (error) {
      this.customLogger.error({
        message: `${error}`,
        stack: error.stack,
        topicName: 'Exception Logs',
      });
      throw new Error(error);
    }
  }





  async createSetting(createSettingDto: SettingDto) {
    const newSetting = new Setting();
    newSetting.key = createSettingDto.key;
    newSetting.value = createSettingDto.value;
    const savedSetting = await this.settingRepository.save(newSetting);
    // Saving setting in the cache
    return savedSetting;
  }

  async findMultiple(keys: string[]): Promise<(Setting | null)[]> {

    // Find the remaining settings from the database

    const settingsRetrievedFromDB = await this.settingRepository.find({
      where: {
        key: In(keys),
      },
    });



    // Create a map of the settings
    const foundSettingsMap = new Map<string, Setting>(
      settingsRetrievedFromDB.map((setting) => [setting.key, setting]),
    );
    // Add null for the keys that were not found
    const results = keys.map((key) => {
      if (foundSettingsMap.has(key)) {
        return foundSettingsMap.get(key);
      } else {
        return null;
      }
    });

    return results;
  }

  async updateSetting(updateSettingDto: UpdateSettingDto): Promise<Setting> {

    let setting: Setting | undefined = undefined;

    // Fetch the setting from the database
    setting = await this.settingRepository.findOne({
      where: {
        key: updateSettingDto.key,
      },
    });


    if (!setting) {
      // If the setting is not found (from cache as well as DB), create a new one
      setting = new Setting();
    }

    setting.key = updateSettingDto.key;
    setting.value = updateSettingDto.value;
    setting = await this.settingRepository.save(setting);
    // Saving setting in the cache
    return setting;
  }

  async deleteSetting(fetchSingleSettingDto: FetchSingleSettingDto) {
    const setting = await this.settingRepository.findOne({
      where: {
        key: fetchSingleSettingDto.key,
      },
    });

    if (!setting) {
      throw new NotFoundException('No such setting found');
    }

    await this.settingRepository.delete(setting);
    // ************ Deleting the setting from the cache ************
    // Get all the settings from the cache



    return {
      status: 'success',
      message: 'setting deleted !',
    };
  }

  async getMusicFileUrl(musicFileKey: string) {
    const musicFileUrl = await this.fileUploadService.getPublicUrlForObject(
      musicFileKey,
    );
    return musicFileUrl;
  }


}
