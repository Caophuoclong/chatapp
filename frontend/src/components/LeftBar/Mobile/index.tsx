import { Flex, useColorMode } from '@chakra-ui/react';
import React from 'react';

import Conversations from '~/components/Conversations';
import FunctionBar from '../FunctionBar';
import SearchBar from '../SearchBar';

import { useLocation, useNavigate } from 'react-router-dom';
import Footer from '~/components/Footer';
import LeftFunction from '~/components/LeftFunction/index';
import LeftFriends from '~/components/LeftFriends';
import { useAppSelector } from '~/app/hooks';
import { ENUM_SCREEN } from '~/app/slices/global.slice';
type Props = {};

export default function LeftBar({}: Props) {
  const { colorMode } = useColorMode();
  const navigate = useNavigate();
  const location = useLocation();
  const showScreen = useAppSelector((state) => state.globalSlice.showScreen);
  return (
    <Flex
      width={{
        base: '100%',
        lg: '500px',
      }}
    >
      <Flex
        width={{
          base: '100%',
        }}
        boxSizing="border-box"
        borderRight={
          colorMode === 'dark'
            ? '1px solid rgba(255, 255, 255,0.3)'
            : '1px solid  rgba(0, 0, 0, 0.08)'
        }
        direction="column"
      >
        <Flex
          height="10%"
          paddingX="1rem"
          boxSizing="border-box"
          zIndex={50}
          justifyContent="center"
          alignItems="center"
          direction={{
            lg: 'column',
          }}
          gap=".3rem"
        >
          <FunctionBar />
          <SearchBar />
        </Flex>
        <Conversations />
        <Footer />
      </Flex>
    </Flex>
  );
}
