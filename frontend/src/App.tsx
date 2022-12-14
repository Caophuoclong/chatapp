import React, { useContext, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import {
  Button,
  extendTheme,
  Flex,
  useColorMode,
  useMediaQuery,
} from '@chakra-ui/react';
import { Route, Routes, useNavigate } from 'react-router-dom';
import { useAppDispatch } from '~/app/hooks';
import Home from './pages/Home';
import Register from './pages/Register';
import { SocketContext } from './context/SocketContext';

import Setting from './components/Settings';
import Contacts from './components/Contacts/';
import User from './components/user';
import i18n from './i18n';
import { registerLocale } from 'react-datepicker';
import vi from 'date-fns/locale/vi';
import es from 'date-fns/locale/es';
import {
  handleChangeLanguage,
  handleSetLargerThanHD,
  setAutoChangeColorMode,
} from './app/slices/global.slice';
import AddFriend from './components/Contacts/Mobile/AddFriend';
import FoundUser from './components/Contacts/Mobile/AddFriend/FoundUser';
import Login from './pages/Login';
import { getMe } from './app/slices/user.slice';
import { getFriendsList } from './app/slices/friends.slice';
import NewGroup from './components/NewGroup';
import moment from 'moment-timezone';
import ForgetPassword from './pages/ForgetPassword';
import SetPassword from './pages/SetPassword/index';
import Confirm from './pages/Confirm/index';
function App() {
  const { setColorMode } = useColorMode();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const brakePoints = {
    sm: '320px',
    md: '768px',
    lg: '960px',
    xl: '1200px',
    '2xl': '1536px',
  };
  useEffect(() => {
    const lan = (window.localStorage.getItem('lan') || 'vn') as 'en' | 'vn';
    dispatch(handleChangeLanguage(lan));
    i18n.changeLanguage(lan);
    window.localStorage.setItem('lan', lan);
  }, []);
  const [isLargerThanHD] = useMediaQuery('(min-width: 1024px)');
  useEffect(() => {
    dispatch(handleSetLargerThanHD(isLargerThanHD));
  }, [isLargerThanHD]);
  useEffect(() => {
    const darkThemeMq = window.matchMedia('(prefers-color-scheme: dark)');
    console.log(darkThemeMq);
    if (darkThemeMq.matches) {
      setColorMode('dark');
    }
    darkThemeMq.onchange = (event) => {
      if (event.matches) {
        setColorMode('dark');
      } else {
        setColorMode('light');
      }
    };
    const isAutoChangeColorMode = () => {
      const x = window.localStorage.getItem('isAutoChangeColorMode');
      if (!x) {
        window.localStorage.setItem('isAutoChangeColorMode', 'false');
        dispatch(setAutoChangeColorMode(false));
      } else {
        dispatch(setAutoChangeColorMode(x === 'true'));
      }
    };
    isAutoChangeColorMode();
  }, []);
  return (
    <Routes>
      <Route path={'/'} element={<Home />} />
      <Route path="/user" element={<User />} />
      <Route path="/user/:id" element={<User />} />
      <Route path="/contacts" element={<Contacts />} />
      <Route path="/contacts/add" element={<AddFriend />} />
      <Route path="/contacts/add/:username" element={<FoundUser />} />
      <Route path="/newgroup" element={<NewGroup />} />
      <Route path="/register" element={<Register />} />
      <Route path="/login" element={<Login />} />
      <Route path="/forgot-password" element={<ForgetPassword />} />
      <Route path="/set-password" element={<SetPassword />} />
      <Route path="/auth/confirm" element={<Confirm />} />
    </Routes>
  );
}

export default App;
