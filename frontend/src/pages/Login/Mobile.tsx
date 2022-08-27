import { Box, Button, Flex, Text, useToast } from '@chakra-ui/react';
import React from 'react';
import { useTranslation } from 'react-i18next';
import MyInput from '~/components/MyInput';
import { FormProvider, useForm } from 'react-hook-form';
import { FaUser } from 'react-icons/fa';
import { BsKey } from 'react-icons/bs';
import { Link, useNavigate } from 'react-router-dom';
import background from '~/assets/images/bg_login.png';
import ChangeLanguage from '../../components/Settings/ChangeLanguage';
import Auth from '~/services/apis/Auth.api';
import { ILoginRequest } from '~/interfaces/ILogin';

type Props = {};

export default function Mobile({}: Props) {
  const { t } = useTranslation();
  const methods = useForm<ILoginRequest>({});
  const toast = useToast();
  const navigate = useNavigate();
  const onSubmit = async (data: ILoginRequest) => {
    try {
      const response = await Auth.login(data);
      window.localStorage.setItem('access_token', response.data.access_token);
      console.log(response);
      toast({
        title: t('Success'),
        description: t('Success__Login'),
        status: 'success',
        position: 'bottom',
        duration: 1000,
        onCloseComplete: () => {
          navigate('/');
        },
      });
    } catch (error: any) {
      toast({
        title: t('Error'),
        description: t('Password__NotMatch'),
        status: 'error',
        position: 'bottom',
        duration: 3000,
        isClosable: true,
      });
    }
    console.log(data);
  };
  return (
    <FormProvider {...methods}>
      <Box
        bg="none"
        position="absolute"
        right="0"
        margin="1rem"
        zIndex={50}
        color="white"
      >
        <ChangeLanguage />
      </Box>
      <Box
        width="100vw"
        height="100vh"
        position="relative"
        bg=" #1F41A9"
        style={{
          backgroundImage: `url(${background})`,
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
        }}
      >
        <Flex
          justifyContent={'center'}
          direction="column"
          alignItems={'center'}
          position="absolute"
          top="50%"
          transform={'translateY(-50%)'}
          width="100%"
        >
          <Box marginY="40px">
            <Text
              textAlign={'center'}
              fontSize="48px"
              fontWeight={700}
              color="white"
            >
              {t('Login')}
            </Text>
            <Text
              fontWeight={700}
              color="white"
              fontSize={'16px'}
              textAlign="center"
            >
              {t('Details__Login')}
            </Text>
          </Box>
          <form onSubmit={methods.handleSubmit(onSubmit)}>
            <Flex direction={'column'} gap="20px" color="white">
              <MyInput
                icon={<FaUser size="34px" />}
                name="username"
                placeholder={t('Username')}
              />
              <MyInput
                icon={<BsKey size="34px" />}
                name="password"
                type="password"
                placeholder={t('Password')}
              />
              <Link to="/forgot-password">
                <Text fontSize={12} textAlign="right">
                  {t('Forgot__Password')}
                </Text>
              </Link>
              <Button
                type="submit"
                bg="none"
                borderRadius={'15px'}
                color="#00FF29"
                border="2px solid #00FF29"
                _hover={{
                  bg: 'none',
                }}
              >
                {t('Login')}
              </Button>
            </Flex>
          </form>
          <Flex
            marginY="1rem"
            justifyContent={'center'}
            gap="3px"
            color="white"
          >
            <Text>{t('Not__Registered')}</Text>
            <Link to="/register">
              <Text fontStyle={'italic'} color="#318ABC">
                {t('Register')}
              </Text>
            </Link>
          </Flex>
        </Flex>
      </Box>
    </FormProvider>
  );
}
