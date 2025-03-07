import { NestFactory } from '@nestjs/core';
import { BucketService } from './bucket.service';
import { AppModule } from 'src/app.module';

async function runScript() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const bucket = app.get(BucketService);

  try {
    await bucket.saveAssetListToFile();
    console.log('Script completed successfully.');
  } catch (error) {
    console.error('Error running script:', error);
  } finally {
    await app.close();
  }
}

runScript()
  .then(() => process.exit())
  .catch((error) => {
    console.error('Error running script:', error);
    process.exit(1);
  });
