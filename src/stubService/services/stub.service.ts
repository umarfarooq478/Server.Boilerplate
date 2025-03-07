import { Injectable } from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';
import { Stub } from '../entities/stub.entity';

@Injectable()
export class StubService {
  /* Initializing the Invitation Repository/Database */
  constructor(
    @InjectRepository(Stub) public inviteRepository: Repository<Stub>,
  ) {}
}
