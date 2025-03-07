import { Test, TestingModule } from '@nestjs/testing';
import { InitializeDatabaseService } from './seeding.service';

describe('InitializeDatabaseService', () => {
  let service: InitializeDatabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [InitializeDatabaseService],
    }).compile();

    service = module.get<InitializeDatabaseService>(InitializeDatabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
