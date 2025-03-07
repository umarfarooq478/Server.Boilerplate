import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { CustomLogger } from 'src/logger/services/logger.service';
import { Repository } from 'typeorm';
import { CreateFlagDto } from '../dtos/createFlag.dto';
import { UpdateFlagDto } from '../dtos/updateFlag.dto';
import { FeatureFlag } from '../entities/featureFlag.entity';

@Injectable()
export class FeatureFlagService {
  public FEATURE_FLAG_REDIS_KEY = 'FEATURE_FLAG';
  constructor(
    @InjectRepository(FeatureFlag)
    public featureFlagRepository: Repository<FeatureFlag>,
    @Inject(forwardRef(() => CustomLogger))
    private readonly customLogger: CustomLogger,

  ) {
  }

  /**
   * This function is called when the module is initialized.
   * It can be used to enable/disable functionality in other modules based on the feature flag.
   */
  async onInit() {
    // Checking the status of the feature flag to enable logging on the backend
    const loggingEnabledFlag = await this.fetchSingleFeatureFlag(
      'BackendLogging',
    );
    if (loggingEnabledFlag) {
      this.customLogger.updateFeatureFlagValue(
        loggingEnabledFlag.data.featureActive,
      );
    } else {
      // If the feature flag does not exist, by default, we will enable logging
      this.customLogger.updateFeatureFlagValue(true);
    }
  }
  // below function creates feature flags if no feature flag exists in database
  async seedDatabase() {
    try {
      this.customLogger.log({
        message: `Seeding feature flags in database`,
        topicName: 'Feature Flag',
      });
      const { data: flags } = await this.fetchAllFeatureFlags();
      const featureFlagsToCreate: CreateFlagDto[] = [
        {
          featureName: 'BackendLogging',
          featureActive: true,
        },
        {
          featureName: 'LogRocket',
          featureActive: true,
        },
        {
          featureName: 'JoiningRestrictions',
          featureActive: true,
        },
        {
          featureName: 'automateOnDemandSession',
          featureActive: true,
        },
        {
          featureName: 'noiseCancellation',
          featureActive: true,
        },
        {
          featureName: 'echoCancellation',
          featureActive: true,
        },
        {
          featureName: 'fullScreenMode',
          featureActive: true,
        },
        {
          featureName: 'allowDupCodeWords',
          featureActive: true,
        },
        {
          featureName: 'musicFileCompression',
          featureActive: false,
        },
      ];

      const creationPromises = featureFlagsToCreate.map(
        async (flagToCreate) => {
          const index = flags.findIndex(
            (flag) => flag.featureName === flagToCreate.featureName,
          );
          if (index === -1) {
            return await this.createFeatureFlag(flagToCreate);
          } else {
            return { status: 'success', data: flags[index] };
          }
        },
      );
      return await Promise.all(creationPromises);
    } catch (error) {
      this.customLogger.error({
        message: `${error}`,
        stack: error.stack,
        topicName: 'Exception Logs',
      });
      throw new Error(error);
    }
  }

  async createFeatureFlag(createFeatureFlag: CreateFlagDto) {
    const flag = await this.featureFlagRepository.findOne({
      where: {
        featureName: createFeatureFlag.featureName,
      },
    });

    if (flag) {
      throw new ForbiddenException('Flag already exists');
    }

    const newFlag = new FeatureFlag();

    newFlag.featureName = createFeatureFlag.featureName;
    newFlag.featureActive = createFeatureFlag.featureActive;

    const savedFlag = await this.featureFlagRepository.save(newFlag);
    if (createFeatureFlag.featureName === 'BackendLogging') {
      this.customLogger.updateFeatureFlagValue(createFeatureFlag.featureActive);
    }
    // Saving the flag in the cache


    return {
      status: 'success',
      data: newFlag,
    };
  }

  async getAllFlags(): Promise<FeatureFlag[] | null> {
    const flags = await this.featureFlagRepository.find();
    return flags;
  }

  async fetchAllFeatureFlags() {
    // Getting all the feature flags from redis cache else from the database
    const flags = await this.featureFlagRepository.find()
    return {
      status: 'success',
      data: flags,
    };
  }



  /* 
  This function returns details of a single feature flag.
  If the feature doesn't exist, it returns null.
  */
  async fetchSingleFeatureFlag(featureName: string) {
    let flag: FeatureFlag | undefined = undefined;
    // Check if the feature flag exists in the redis cache


    // If the flag is not found in the cache, check the database
    flag = await this.featureFlagRepository.findOne({
      where: {
        featureName: featureName,
      },
    });
    // If flag is found in the db, update the cache



    if (!flag) {
      return null;
    }
    return {
      status: 'success',
      data: flag,
    };
  }

  async updateFeatureFlag(updateFeatureFlagDto: UpdateFlagDto) {

    let flag: FeatureFlag | undefined = undefined;


    flag = await this.featureFlagRepository.findOne({
      where: {
        featureName: updateFeatureFlagDto.featureName,
      },
    });

    if (!flag) {
      throw new NotFoundException('Flag not found');
    }

    const updatedFlag: FeatureFlag = { ...flag };
    Object.assign(updatedFlag, updateFeatureFlagDto);
    await this.featureFlagRepository.save(updatedFlag);


    if (updateFeatureFlagDto.featureName === 'BackendLogging') {
      this.customLogger.updateFeatureFlagValue(
        updateFeatureFlagDto.featureActive,
      );
    }
    return {
      status: 'success',
      data: updatedFlag,
    };
  }

  async deleteFeatureFlag(featureName: string) {
    const flag = await this.featureFlagRepository.findOne({
      where: {
        featureName: featureName,
      },
    });
    if (!flag) {
      throw new NotFoundException('Flag does not exist ');
    }

    await this.featureFlagRepository.delete({ featureName: featureName });

    // ************ Deleting the flag from the cache ************
    // Get all the flags from the cache


    return {
      status: 'Success',
      message: 'deletion Successful !',
    };
  }
}
