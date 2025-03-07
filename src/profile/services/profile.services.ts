import {
  ForbiddenException,
  Inject,
  Injectable,
  NotFoundException,
  forwardRef,
} from '@nestjs/common';
import { NotificationsService } from 'src/notifications/services/notifications/notifications.service';
import { UsersService } from 'src/users/services/users/users.service';
import { EditProfileDto } from '../dto/profiles/editProfile.dto';
@Injectable()
export class ProfilesServices {
  constructor(
    @Inject(forwardRef(() => UsersService))
    private usersService: UsersService,
    private notificationService: NotificationsService,
  ) { }

  async fetchProfile(userId: string) {
    const user = await this.usersService.getUserById(userId);
    if (!user) {
      throw new NotFoundException('No such user found !');
    }

    const profileDetails = await this.usersService.parseUserInfoToSendToClient(
      user,
    );

    // get the count for unread notifications
    profileDetails.unreadNotificationCount =
      await this.notificationService.getUnreadNotificationCount(userId);
    return profileDetails;
  }



  async editProfile(userBody: EditProfileDto, userId: string) {
    const user = await this.usersService.getUserById(userId);
    if (!user) {
      throw new ForbiddenException('Access Denied !');
    }
    const updatedUser = await this.usersService.updateUser(user, {
      ...userBody,
    });

    return await this.usersService.parseUserInfoToSendToClient(updatedUser);
  }
}
