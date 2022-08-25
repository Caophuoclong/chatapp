import { HttpException, Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, JoinTable } from 'typeorm';
import { IUtils } from '~/interfaces/IUtils';
import Utils from '~/utils';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { User } from './entities/user.entity';
import { LoginUserDto } from './dto/login-user.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
import { FriendshipService } from '~/friendship/friendship.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @Inject('IUtils')
    private readonly utils: IUtils,
    private readonly friendShipService: FriendshipService,
  ) {}
  async register(createUserDto: CreateUserDto) {
    try {
      const { salt, hashedPassowrd } = await this.utils.hashPassword(
        createUserDto.password,
      );
      createUserDto.password = hashedPassowrd;
      createUserDto.salt = salt;
      const user = this.userRepository.create(createUserDto);
      await this.userRepository.save(user);
      return {
        statusCode: 200,
        message: 'User created successfully',
      };
    } catch (error) {
      throw new HttpException(error.message, 400);
    }
  }
  async login(loginUserDto: LoginUserDto) {
    try {
      const user = await this.userRepository.findOne({
        where: {
          username: loginUserDto.username,
        },
      });
      if (!user) {
        throw new HttpException('User not found', 400);
      }
      const verified = await this.utils.verify(
        loginUserDto.password,
        user.salt,
        user.password,
      );
      if (!verified) {
        throw new HttpException('Invalid password', 403);
      }
      delete user.salt;
      delete user.password;
      return {
        statusCode: 200,
        message: 'Login success',
        data: user,
      };
    } catch (error) {
      throw new HttpException(error.message, 403);
    }
  }
  async updatePassword(updatePasswordDto: UpdatePasswordDto, _id: string) {
    try {
      const user = await this.userRepository.findOne({
        where: {
          _id: _id,
        },
      });
      if (!user) {
        throw new HttpException('User not found', 400);
      }
      const verified = await this.utils.verify(
        updatePasswordDto.oldPassword,
        user.salt,
        user.password,
      );
      if (!verified) {
        throw new HttpException('Old password does not match', 403);
      }
      const { salt, hashedPassowrd } = await this.utils.hashPassword(
        updatePasswordDto.newPassword,
      );
      user.password = hashedPassowrd;
      user.salt = salt;
      await this.userRepository.save(user);
      return {
        statusCode: 200,
        message: 'Password updated successfully',
      };
    } catch (error) {
      throw new HttpException(error.message, 403);
    }
  }
  async get(_id: string) {
    try {
      const user = await this.userRepository.findOne({
        where: {
          _id: _id,
        },
      });
      if (!user) {
        throw new HttpException('User not found', 400);
      }
      delete user.salt;
      delete user.password;
      return {
        statusCode: 200,
        message: 'User found',
        data: user,
      };
    } catch (error) {
      throw new HttpException(error.message, 403);
    }
  }
  async getMe(_id: string) {
    try {
      const user = await this.userRepository.findOne({
        where: {
          _id,
        },
        
      });
      if (!user) {
        throw new HttpException('User not found', 400);
      }
      delete user.salt;
      delete user.password;
      
      return {
        statusCode: 200,
        message: 'User found',
        data: user,
      };
    } catch (error) {
      throw new HttpException(error.message, 400);
    }
  }
  async getListFriend(_id: string) {
    try {
      const user = await this.userRepository.findOne({
        where: {
          _id,
        },
        relations: {
          friendRequest: {
            userAddress: true,
            statusCode: true,
          },
          friendAddress: {
            userRequest: true,
            statusCode: true,
          },
        },
      });
      if (!user) {
        throw new HttpException('User not found', 400);
      }

      const friends = 
        (() => {
          const friends = user.friendRequest.filter(
            (friend) => {
              delete friend.userAddress.salt;
              delete friend.userAddress.password;
              return friend.statusCode
            },
          );
          const friends1 = user.friendAddress.filter(
            (friend) => {
              delete friend.userRequest.salt;
              delete friend.userRequest.password;
              return friend.statusCode},
          );
          const mergeFriend = [];
          friends.forEach((friend) => {
            mergeFriend.push({
              friendShipId: friend._id,
              statusCode: friend.statusCode,
              user: friend.userAddress,
              flag: 'sender',
            })
          })
          friends1.forEach((friend) => {
            mergeFriend.push({
              friendShipId: friend._id,
              statusCode: friend.statusCode,
              user: friend.userRequest,
              flag: 'target',
            })
          }
          )
          return mergeFriend;
        })()
      

      return {
        statusCode: 200,
        message: 'User found',
        data: friends,
      };
    } catch (error) {
      throw new HttpException(error.message, 400);
    }

  }
  async getListConversations(_id: string){
    try {
      const user = await this.userRepository.findOne({
        where: {
          _id,
        },
        relations: {
          conversations: {
            participants: true,
          }
        },
      });
      if (!user) {
        throw new HttpException('User not found', 400);
      }
      return {
        statusCode: 200,
        message: 'User found',
        data: user.conversations,
      };
    } catch (error) {
      throw new HttpException(error.message, 400);
    }
  }
  async updateInfo(updateUserDto: UpdateUserDto, _id: string) {
    try {
      const user = await this.userRepository.findOne({
        where: {
          _id: _id,
        },
      });
      if (!user) {
        throw new HttpException('User not found', 400);
      }
      const { password, salt, ...result } = await this.userRepository.save({
        ...user,
        ...updateUserDto,
      });
      return result;
    } catch (error) {
      throw new HttpException(error.message, 400);
    }
  }
  async addFriend(_id: string, friendId: string) {
    return this.friendShipService
      .addFreiend(_id, friendId)
      .then((response) => response)
      .catch((error) => new HttpException(error.message, 400));
  }
  async removeFriend(_id: string, friendShipId: string) {
    return this.friendShipService
      .removeFriend(_id, friendShipId)
      .then((response) => response)
      .catch((error) => new HttpException(error.message, error.code));
  }
  async acceptFriend(_id: string, friendShipId: string) {
    return this.friendShipService
      .acceptFriend(_id, friendShipId)
      .then((response) => response)
      .catch((error) => new HttpException(error, 400));
  }
  async rejectFriend(_id: string, friendShipId: string) {
    return this.friendShipService
      .rejectFriend(_id, friendShipId)
      .then((response) => response)
      .catch((error) => new HttpException(error, 400));
  }
  async getFriendShip(_id: string, otherUserId: string) {
    const user = await this.userRepository.findOne({
      where: { _id: _id },
      relations: [
        'friendRequest',
        'friendRequest.userAddress',
        'friendRequest.statusCode',
        'friendAddress',
        "friendAddress.userRequest",
        'friendAddress.statusCode'
      ],
    });
    if(user){
      const isFriend = user.friendRequest.find(
        (friend) => friend.userAddress._id === otherUserId,
      );
      if(isFriend){
        return {
          statusCode: 200,
          message: 'Friendship found',
          data: isFriend.statusCode,
          flag: "sender",
          friendShipId: isFriend._id
        };
      }else{
        const isFriend = user.friendAddress.find(
          (friend) => friend.userRequest._id === otherUserId,
        );
        if(isFriend){
          return {
            statusCode: 200,
            message: 'Friendship found',
            data: isFriend.statusCode,
            flag: "target",
            friendShipId: isFriend._id
          };
        }else{
          return {
            statusCode: 404,
            message: 'Friendship not found',
            data: null,
          };
        }
      }
    }else{
      return {
        statusCode: 404,
        message: 'User not found',
      }
    }
    
  }
  async getUserByUsername(_id: string, username: string){
    const user = await this.userRepository.findOne({
      where: {
        username: username
      }
    })
    if(user){
      delete user.password;
      delete user.salt;
      const friendShip = await this.getFriendShip(_id, user._id);
      return {
        statusCode: 200,
        message: 'User found',
        data: {
          user: user,
          friendShip: friendShip.data,
          flag: friendShip.flag,
          friendShipId: friendShip.friendShipId
        },
      }
      
    }else{
      return {
        statusCode: 404,
        message: 'User not found',
      }
    }
  }
  async blockFriend(_id: string, friendShipId: string) {
    return this.friendShipService
      .blockFriend(_id, friendShipId)
      .then((response) => response)
      .catch((error) => new HttpException(error, 400));
  }
}
