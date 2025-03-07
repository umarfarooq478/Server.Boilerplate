import { Inject, Injectable, forwardRef } from '@nestjs/common';
import { ProfilePicService } from 'src/profile/services/profile-pic/profile-pic.service';

import { appendFileSync, existsSync, readFileSync, writeFileSync } from 'fs';
import { resolve } from 'path';
import { ConfigService } from '@nestjs/config';
import { CustomLogger } from 'src/logger/services/logger.service';

@Injectable()
export class BucketService {
  constructor(
    private readonly profilePicService: ProfilePicService,

    private readonly configService: ConfigService,
    private readonly customLogger: CustomLogger,
  ) { }

  async clearFile(filePath: string): Promise<void> {
    try {
      // Write an empty string to the file to clear its content
      await writeFileSync(filePath, '');
    } catch (error) {
      this.customLogger.error({
        message: `${error}`,
        stack: error.stack,
        topicName: 'Exception Logs',
      });
      throw new Error('Error clearing the file: ' + error.message);
    }
  }

  async saveDataToFile(cleanedData) {
    try {
      //Clearing the file first before writing in it
      const filepath = this.configService.get('S3.awsTextFileName');
      await this.clearFile(filepath);
      //Defining file path
      const filePath = resolve(process.cwd(), filepath);

      // Check if the file already exists
      if (!existsSync(filePath)) {
        // Create the file in the root folder
        appendFileSync(filePath, '');
      }

      // Read the already existing data
      const existingData = readFileSync(filePath, 'utf-8')
        .split('\n')
        .filter(Boolean);

      const cleanedDataWithoutSlash = cleanedData.map((url) =>
        url.replace(/^\//, ''),
      );

      // Find data that doesn't already exist in the file
      const newData = cleanedDataWithoutSlash.filter(
        (url) => !existingData.includes(url),
      );

      // Append the new data to the file
      if (newData.length > 0) {
        appendFileSync(filePath, newData.join('\n') + '\n');
      }
      console.log('Data written to file:', filePath);
    } catch (error) {
      this.customLogger.error({
        message: `${error}`,
        stack: error.stack,
        topicName: 'Exception Logs',
      });
    }
  }

  async saveAssetListToFile(): Promise<void> {
    try {
      const profileData = await this.profilePicService.getProfileAssets();

      const dataToWrite = [...profileData];
      this.saveDataToFile(dataToWrite);
    } catch (error) {
      this.customLogger.error({
        message: `${error}`,
        stack: error.stack,
        topicName: 'Exception Logs',
      });
      throw new Error('Error calling services: ' + error.message);
    }
  }
}
