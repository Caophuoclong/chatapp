import React, { useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMe } from '~/app/slices/user.slice';
import DatabaseContenxt from '~/context/DatabaseContext';
import { useAppDispatch, useAppSelector } from '~/app/hooks';
import Desktop from './Desktop';
import Mobile from './Mobile';
import { changeOnlineStatus, getFriendsList } from '~/app/slices/friends.slice';
import {
  getMyConversations,
  updateLastestMessage,
} from '~/app/slices/conversations.slice';
import { connectSocket } from '../../providers/SocketProvider';
import { setSocket } from '~/app/slices/global.slice';
import Auth from '~/services/apis/Auth.api';
import { Button } from '@chakra-ui/react';
import {
  addMessage,
  updateReceivedMessage,
  updateSentMessage,
} from '~/app/slices/messages.slice';
import { string } from 'yup/lib/locale';
import { IMessage, MessageStatusType } from '~/interfaces/IMessage';

type Props = {};

export default function Home({}: Props) {
  const isLargerThanHD = useAppSelector(
    (state) => state.globalSlice.isLargerThanHD
  );
  const navigate = useNavigate();
  useEffect(() => {
    navigate('/');
  }, [isLargerThanHD]);
  const dispatch = useAppDispatch();
  const messages = useAppSelector((state) => state.messageSlice.messages);
  useEffect(() => {
    const access_token = localStorage.getItem('access_token');
    if (!access_token) {
      navigate('/login');
    } else {
      dispatch(getMe());
      dispatch(getFriendsList());
      dispatch(getMyConversations());
      const s = connectSocket();
      dispatch(setSocket(s));
      s.on('connectSuccessFull', (data) => {
        console.log(data);
      });
      s.on('newMessage', (data) => {
        const { destination, ...message } = data;
        console.log(data);
        dispatch(
          addMessage({
            message: message,
            conversationId: destination,
          })
        );
        dispatch(
          updateLastestMessage({
            message: message,
            conversationId: destination,
          })
        );
        s.emit('markReceiveMessage', message._id);
      });
      s.on('MY_FRIEND_ONLINE', (_id: string) => {
        dispatch(changeOnlineStatus({ _id, isOnline: true }));
      });
      s.on('MY_FRIEND_OFFLINE', (data: { _id: string; lastOnline: number }) => {
        // console.log(data);
        dispatch(
          changeOnlineStatus({
            _id: data._id,
            isOnline: false,
            lastOnline: data.lastOnline,
          })
        );
      });
      s.on(
        'sentMessageSuccess',
        (data: {
          tempId: string;
          conversationId: string;
          message: IMessage;
        }) => {
          const { conversationId, tempId, message } = data;

          dispatch(
            updateLastestMessage({
              message: message,
              conversationId,
            })
          );
          dispatch(
            updateSentMessage({
              conversationId,
              tempId,
              value: {
                _id: message._id,
                status: MessageStatusType.SENT,
              },
            })
          );
        }
      );
      s.on(
        'receivedMessage',
        (data: { conversationId: string; messageId: string }) => {
          const { conversationId, messageId } = data;
          console.log(data);
          dispatch(
            updateReceivedMessage({
              conversationId,
              messageId,
            })
          );
        }
      );
    }
  }, []);
  const handle = async () => {
    const response = await Auth.refreshToken();
    console.log(response);
  };
  // return <Button onClick={handle}>hhihihi</Button>;
  return <>{isLargerThanHD ? <Desktop /> : <Mobile />}</>;
}
