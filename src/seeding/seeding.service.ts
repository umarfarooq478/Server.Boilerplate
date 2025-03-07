import { Injectable } from '@nestjs/common';
import { FeatureFlagService } from 'src/featureFlags/services/featureFlag.service';
import { CustomLogger } from 'src/logger/services/logger.service';
import { SettingsService } from 'src/settings/services/settings.service';
import { UsersService } from 'src/users/services/users/users.service';
@Injectable()
export class SeedingService {
  constructor(

    private featureFlagService: FeatureFlagService,
    private settingsService: SettingsService,

    private readonly customLogger: CustomLogger,
    private userService: UsersService,
  ) { }
  async seedDatabase() {
    try {

      await this.featureFlagService.seedDatabase();
      await this.settingsService.seedDatabase();

      await this.userService.seedDatabase();
    } catch (error) {
      this.customLogger.error({
        message: `${error}`,
        stack: error.stack,
        topicName: 'Exception Logs',
      });
    }
  }


}
