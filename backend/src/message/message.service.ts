import { HttpException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { Message, MessageStatusType } from './entities/message.entity';
import { Repository } from 'typeorm';
import { User } from '~/user/entities/user.entity';
import { Conversation } from '../conversation/entities/conversation.entity';
import { ConversationService } from '../conversation/conversation.service';
import { UserService } from '~/user/user.service';
import { Member } from '~/entities/member.entity';


@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(Conversation)
    private readonly conversationRepository: Repository<Conversation>,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    private readonly ConversationService: ConversationService,
    private readonly UserService: UserService,
  ) {}
  async create(senderId: string, createMessageDto: CreateMessageDto) {
    try {
      const message = this.messageRepository.create();
      message.sender = (await this.UserService.get(senderId)).data;
      message.content = createMessageDto.content;
      message.createdAt = new Date().getTime();
      message.type = createMessageDto.type;
      message.scale = createMessageDto.scale;
      const conversation = await this.conversationRepository.findOne({
        where:{
          _id: createMessageDto.destination
        }
      });
      if (conversation) {
        message.destination = conversation;
        conversation.lastMessage = message;
        conversation.updateAt =  createMessageDto.updateAt;
        const data = await this.messageRepository.save(message);
        await this.conversationRepository.save(conversation);
        delete data.destination;
        return {
          statusCode: 200,
          message: 'Message created successfully',
          data: data,
          updateAt: conversation.updateAt
        };
      } else {
        return {
          statusCode: 404,
          message: 'Conversation not found',
          data: null,
        };
      }

    } catch (error) {
      return {
        statusCode: 500,
        message: error.message,
        data: null,
      };
    }
  }
  async findByConversation(
    conversationId: string,
    userId: string,
    skip: number,
    limit: number,
  ) {
    try {
      // const user = await this.UserService.get(userId);
      const conversation = await this.conversationRepository.findOne({
        where: {
          _id: conversationId,
        },
        relations: {
          participants:{
              user: true
          }
        },
      });
      // console.log(conversation);
      // console.log(conversation.participants.find((m) => true));
      if (!conversation || !conversation.participants.find((user) => user.user._id === userId)) {
        return {
          statusCode: 404,
          message: 'Conversation not found',
          data: null,
        };
      } 
      // console.log(conversation);
      const id = conversation._id;
      const dateJoin = (await this.memberRepository.findOne({
        where:{
          conversationId: id,
          userId: userId
        }
      })).createdAt;
      const messages = await this.messageRepository
      .createQueryBuilder("message",)
      .where("message.destination_id = :conversationId and message.createdAt > :dateJoin", { conversationId: id, dateJoin:dateJoin })
      .innerJoinAndSelect("message.sender", "sender", "sender._id = message.sender_id")
      .select(["message", "sender"])
      .limit(20)
      .orderBy("message.createdAt", "DESC")
      .offset(skip)
      .getManyAndCount()
      ;
        
        // console.log(messages);
      return {
        statusCode: 200,
        message: 'messages found',
        count: messages[1],
        data: messages[0],
      };
    } catch (error) {
      return {
        statusCode: 500,
        message: error.message,
        data: null,
      };
    }
  }
  async receiveMessage(messageId: string) {
    // console.log(messageId);
    try {
      const message = await this.messageRepository.findOne({
        where: {
          _id: messageId,
        },
        relations: ["destination", "sender"],
        select:{
          _id: true,
          sender: {
            _id: true
          },
          destination:{
            _id: true
          }
        }
      });
      if (!message) {
        return {
          statusCode: 404,
          message: 'Message not found',
          data: null,
        };
      }
      message.status = MessageStatusType.RECEIVED;
      const data = await this.messageRepository.save(message);
      return {
        statusCode: 200,
        message: 'Message read successfully',
        data: data,
      };
    } catch (error) {
      return {
        statusCode: 500,
        message: error.message,
        data: null,
      };
    }
  }
  async markAsReceived(userId: string){
    try{
      const user = await this.userRepository.findOne({
        where:{
          _id: userId,
        },
        relations: {
          conversations: {
            conversation: true
          }
        }
      })
      if(!user){
        return {
          statusCode: 404,
          message: 'User not found',
          data: null,
        };
      }
      //TODO: check about create conversation
      const conversations = user.conversations;
      let x = [];
      for(let i = 0; i < conversations.length; i++){
        const conversation = conversations[i];
        const messages = await this.messageRepository.find({
          where:{
            destination: conversation.conversation,
            status: MessageStatusType.SENT
          },
          relations: ["sender", "destination"]
        })
        for(let j = 0; j < messages.length; j++){
          const message = messages[j];
          if(message.sender._id !== userId)
          message.status = MessageStatusType.RECEIVED;
          await this.messageRepository.save(message);
          x.push({
            senderId: message.sender._id,
            conversationId: conversation.conversation._id,
            messageId: message._id
          })
        }
        
      }return{
        statusCode: 200,
        message: 'Messages marked as received',
        data: x
      }
    }catch(error){
      throw new HttpException(error.message, 500);
    }
  }
  async recallMessage(messageId: string){
    try{
      const message = await this.messageRepository.findOne({
        where:{
          _id: messageId
        }
      })
      if(!message){
        return {
          statusCode: 404,
          message: 'Message not found',
          data: null,
        };
      }
      message.isRecall = true;
      const data = await this.messageRepository.save(message);
      return {
        statusCode: 200,
        message: 'Message recalled successfully',
        data: data,
      };
    }catch(error){
      throw new HttpException(error.message, 500);
    }
  }
  findAll() {
    return `This action returns all message`;
  }

  findOne(id: number) {
    return `This action returns a #${id} message`;
  }

  update(id: number, updateMessageDto: UpdateMessageDto) {
    return `This action updates a #${id} message`;
  }

  remove(id: number) {
    return `This action removes a #${id} message`;
  }
}
