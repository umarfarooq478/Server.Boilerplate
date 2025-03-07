import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';

import { FeatureFlagService } from '../services/featureFlag.service';
import { CreateFlagDto } from '../dtos/createFlag.dto';
import { Roles } from 'src/users/roles/roles.decorator';
import { RolesGuard } from 'src/users/roles/roles.guard';
import { Role } from 'src/users/roles/roles.enum';
import { UpdateFlagDto } from '../dtos/updateFlag.dto';

@Controller('featureFlag')
@ApiTags('featureFlag')
export class FeatureFlagController {
  constructor(private readonly featureFlagService: FeatureFlagService) {}

  @Get('/fetchAllFeatureFlags')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'fetches all feature flags from db' })
  @ApiOkResponse({
    type: CreateFlagDto,
  })

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async fetchAllFeatureFlags() {
    return await this.featureFlagService.fetchAllFeatureFlags();
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.Admin)
  @Post('/createFeatureFlag')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new feature flag in db' })
  @ApiOkResponse({
    type: CreateFlagDto,
  })
  async createFeatureFlag(@Body() createFlagDto: CreateFlagDto) {
    return await this.featureFlagService.createFeatureFlag(createFlagDto);
  }

  @Get('/fetchSingleFeatureFlag/:featureName')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'fetches specific feature flag from db' })
  @ApiOkResponse({
    type: CreateFlagDto,
  })
  async fetchSingleFeatureFlag(@Param('featureName') featureName: string) {
    return await this.featureFlagService.fetchSingleFeatureFlag(featureName);
  }

  // @ApiBearerAuth()
  // @UseGuards(AuthGuard('jwt'))
  // @UseGuards(AuthGuard('jwt'), RolesGuard)
  // @Roles(Role.Admin)
  // @Patch('/toggleFeatureStatus/:featureFlagId')
  // @HttpCode(HttpStatus.OK)
  // @ApiOperation({ summary: 'toggle feature status' })
  // @ApiOkResponse({
  //   type: CreateFlagDto,
  // })
  // async toggleFeatureStatus(
  //   @Param('featureFlagId') featureFlagId: string,
  //   @Body() toggleFeatureStatusDto: ToggleFlagDto,
  // ) {
  //   return await this.featureFlagService.toggleFlagStatus(
  //     featureFlagId,
  //     toggleFeatureStatusDto,
  //   );
  // }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.Admin)
  @Patch('/updateFeatureFlag')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'updates details for feauter flags ' })
  @ApiOkResponse({
    type: UpdateFlagDto,
  })
  async updateFeatureFlag(@Body() updateFeatureFlagDto: UpdateFlagDto) {
    return await this.featureFlagService.updateFeatureFlag(
      updateFeatureFlagDto,
    );
  }

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'), RolesGuard)
  @Roles(Role.Admin)
  @Delete('/deleteFeatureFlag/:featureName')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'deletes specific feature flag from db' })
  @ApiOkResponse({
    type: CreateFlagDto,
  })
  async deleteFeatureFlag(@Param('featureName') featureName: string) {
    return await this.featureFlagService.deleteFeatureFlag(featureName);
  }
}
