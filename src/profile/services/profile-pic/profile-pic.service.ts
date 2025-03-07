import { HttpService } from '@nestjs/axios';
import { Injectable, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import axios from 'axios';
import * as moment from 'moment';
import { CustomLogger } from 'src/logger/services/logger.service';
import { MailService } from 'src/mails/services/mail.services';

import { ProfilePictureEntity } from 'src/profile/entities/profilePic.entity';
import { User } from 'src/users/entities/user.entity';
import { FileUploadService } from 'src/utils/S3/fileUpload';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class ProfilePicService {
  constructor(
    private httpService: HttpService,
    private fileUploadService: FileUploadService,
    private configService: ConfigService,
    private readonly customLogger: CustomLogger,
    private mailService: MailService,

    @InjectRepository(User) public userRepository: Repository<User>,
  ) { }
  parseInstagramHandle = (instaUserName: string) => {
    // remove leading white space characters
    let parsedInstaDp = instaUserName.trim();
    // remove leading @ in dp
    parsedInstaDp = parsedInstaDp.replace(/^@+/, '');
    return parsedInstaDp;
  };
  async sendInstagEmail() {
    const recipients = this.configService.get('profilePic.recipients');
    recipients.forEach(async (reciever) => {
      // await this.mailService.sendMail(
      //   reciever.email,
      //   reciever.name,
      //   '',
      //   'instagAPiInfo.html',
      //   'InstagAPi balance info',
      // );
      await this.mailService.sendEmailWithSES(
        'instagAPiInfo.html',
        {
          email: reciever?.email,
          displayName: reciever?.name,
        },
        reciever?.email,
        'Instag Api Remaining request',
      );
    });
  }
  //todo: clean code asap
  async getInstagramProfilePicURL(userName: string) {
    let dpUrl = null;
    const parsedUsername = this.parseInstagramHandle(userName);
    const rocketApiHeaders = {
      Authorization: `Token ${this.configService.get('ROCKET_API_KEY')}`,
      'Content-Type': 'application/json',
    };

    try {
      const response = await axios.post(
        this.configService.get('ROCKET_API_URL'),
        { username: parsedUsername },
        { headers: rocketApiHeaders },
      );
      console.log(response.data);

      if (response?.data?.response?.body?.data?.user) {
        const user = response.data.response.body.data.user;
        // Try HD profile pic first, fall back to regular if not available
        dpUrl = user.profile_pic_url_hd || user.profile_pic_url;
      } else {
        throw new NotFoundException('Instagram username not found');
      }
    } catch (error) {
      console.error('Error fetching Instagram profile picture:', error);
      throw new NotFoundException('Instagram username not found');
    }

    return dpUrl;
  }

  // getting image from the url to save in aws later
  async getFilefromURL(imageuri: string) {
    try {
      const { data: fileData } = await this.httpService.axiosRef.get(
        encodeURI(imageuri),
        {
          responseType: 'arraybuffer',
        },
      );
      return fileData;
    } catch (err) {
      this.customLogger.error({
        message: `${err}`,
        stack: err.stack,
        topicName: 'Exception Logs',
      });
      return null;
    }
  }
  async getRandomPic() {
    try {
      const avatarUrl = this.configService.get('app.randomAvatarApiUrl');
      const response = await axios.get(avatarUrl, {
        responseType: 'arraybuffer',
      });
      const fileId = uuidv4();
      const filePath = `${this.configService.get(
        'S3.profilePicPrefix',
      )}/${fileId}_avatar.png`;
      await this.fileUploadService.uploadFile(response.data, filePath);
      const uploadedFileUrl =
        await this.fileUploadService.getPublicUrlForObject(filePath);

      return uploadedFileUrl;
    } catch (err) {
      this.customLogger.error({
        message: `${err}`,
        stack: err.stack,
        topicName: 'Exception Logs',
      });
      return this.configService.get('profilePic.defaultPicUrl');
    }
  }


  async getProfileAssets() {
    const users = await this.userRepository.find();
    const specified_format = this.configService.get('S3.awsBucketPublicUrl');
    const filteredData = users
      .map((user) => user.profilePicDetails.url)
      .filter((url) => url && url.startsWith(specified_format))
      .map((url) => url.replace(specified_format, ''));
    return filteredData;
  }
}
