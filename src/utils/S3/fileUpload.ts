import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { S3 } from 'aws-sdk';
@Injectable()
export class FileUploadService {
  // AWS_SECRET_ACCESS_KEY must be in .env
  // SIGNED_URL_EXPIRATION must be in .env for this to work.
  private s3api: S3;
  constructor(private configService: ConfigService) {
    this.s3api = new S3({ signatureVersion: 'v4' });
  }
  async getSignedUrl(fileId: string) {
    return await this.s3api.getSignedUrl('getObject', {
      Bucket: this.configService.get('S3.awsBucketName'),
      Key: fileId,
      Expires: parseInt(this.configService.get('S3.awsSignedUrlExpiry')),
    });
  }
  async getPublicUrlForObject(fileName: string) {
    // returns the public url for a file
    return `${this.configService.get('S3.awsBucketPublicUrl')}/${fileName}`;
  }
  // upload file to S3 function
  async uploadFile(
    fileBuffer: Buffer | File,
    fileName: string,
    usePutAPI = false,
  ) {
    if (usePutAPI) {
      return await this.s3api
        .putObject({
          ACL: 'public-read',
          Bucket: this.configService.get('S3.awsBucketName'),
          Body: fileBuffer,
          Key: `${fileName}`,
        })
        .promise();
    }
    return await this.s3api
      .upload({
        ACL: 'public-read',
        Bucket: this.configService.get('S3.awsBucketName'),
        Body: fileBuffer,
        Key: `${fileName}`,
      })
      .promise();
  }

  async uploadPdf(
    fileBuffer: Buffer | File,
    fileName: string,
    usePutAPI = false,
  ) {
    if (usePutAPI) {
      return await this.s3api
        .putObject({
          ACL: 'public-read',
          Bucket: this.configService.get('S3.awsBucketName'),
          Body: fileBuffer,
          Key: `${fileName}`,
          ContentDisposition: 'inline',
          ContentType: 'application/pdf',
        })
        .promise();
    }
    return await this.s3api
      .upload({
        ACL: 'public-read',
        Bucket: this.configService.get('S3.awsBucketName'),
        Body: fileBuffer,
        Key: `${fileName}`,
      })
      .promise();
  }
  //   delete file from this.s3api
  async deleteFile(fileName: string) {
    return await this.s3api
      .deleteObject({
        Bucket: this.configService.get('S3.awsBucketName'),
        Key: fileName,
      })
      .promise();
  }
  // get single File from this.s3api
  async GetFile(fileId: string) {
    const file = await this.s3api
      .getObject({
        Bucket: this.configService.get('S3.awsBucketName'),
        Key: fileId,
      })
      .promise();
    const url = await this.getSignedUrl(fileId);
    return {
      file,
      url,
    };
  }
  // get all single File from this.s3api from bucket
  async GetAllFiles() {
    const files = await this.s3api
      .listObjects({
        Bucket: this.configService.get('S3.awsBucketName'),
      })
      .promise();
    return files;
  }

}
