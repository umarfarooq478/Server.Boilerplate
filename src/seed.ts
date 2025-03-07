import 'reflect-metadata';
import { NestFactory } from '@nestjs/core/nest-factory';
import { AppModule } from './app.module';
import { SeedingService } from './seeding/seeding.service';
async function seedDatabase() {
  const app = await NestFactory.createApplicationContext(AppModule);
  app.enableShutdownHooks();
  const seeder = app.get(SeedingService);
  try {
    console.log('Database seeding started...');
    await seeder.seedDatabase();
    console.log('Database seeding completed.');

    console.log('Stripe seeding completed.');
  } catch (error) {
    console.error('Database seeding failed:', error);
  } finally {
    console.log('Shutting down NestJS application...');
    await app.close();
    process.exit(0);
  }
}

seedDatabase();
