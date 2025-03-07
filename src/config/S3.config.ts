import { registerAs } from '@nestjs/config';

export default registerAs('S3', () => ({
  awsBucketName: process.env.BUCKET_NAME,
  awsAccessKey: process.env.AWS_ACCESS_KEY_ID,
  awsSecretKey: process.env.AWS_SECRET_ACCESS_KEY,
  awsSignedUrlExpiry: process.env.SIGNED_URL_EXPIRATION,
  awsBucketPublicUrl: process.env.BUCKET_PUBLIC_URL,
  profilePicPrefix: process.env.PROIFILE_PIC_PREFIX || 'profilePics',
  musicTracksPrefix: process.env.PROIFILE_PIC_PREFIX || 'music',
  compressedImageWidth: process.env.COMPRESSED_IMAGE_WIDTH || 800,
  compressedImageHeight: process.env.COMPRESSED_IMAGE_HEIGHT || 600,
}));
