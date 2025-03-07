import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
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

import { StubService } from '../services/stub.service';
import { Stub } from '../entities/stub.entity';
import { CreateStubDto } from '../dtos/stub.dto';
@Controller('stubService')
@ApiTags('stubService')
export class StubController {
  constructor(private readonly eventService: StubService) {}

  @ApiBearerAuth()
  @UseGuards(AuthGuard('jwt'))
  @Post('/createStub')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new Stub' })
  @ApiOkResponse({
    type: Stub,
  })
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async createEvent(@Body() eventDto: CreateStubDto) {
    return null;
  }
}
