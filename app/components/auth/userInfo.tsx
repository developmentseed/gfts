import React from 'react';
import { Avatar, IconButton, Tooltip } from '@chakra-ui/react';
import { CollecticonLogin } from '@devseed-ui/collecticons-chakra';

import { useKeycloak } from './context';
import SmartLink from '$components/common/smart-link';

export function UserInfo() {
  const { profile, isLoading, isEnabled, keycloak } = useKeycloak();

  if (!isEnabled) {
    return null;
  }

  const isAuthenticated = keycloak.authenticated;

  if (!isAuthenticated || !profile || isLoading) {
    return (
      <Tooltip hasArrow label='Login' placement='right' bg='base.500'>
        <IconButton
          aria-label='Login'
          size='sm'
          variant='ghost'
          colorScheme='base'
          _active={{ bg: 'base.100a' }}
          icon={<CollecticonLogin />}
          onClick={() => {
            if (!isLoading) {
              keycloak.login({
                redirectUri: window.location.href
              });
            }
          }}
        />
      </Tooltip>
    );
  }

  const username = profile.username;

  return (
    <Tooltip hasArrow label='Logout' placement='right' bg='base.500'>
      <SmartLink
        to='/'
        display='block'
        onClick={(e) => {
          e.preventDefault();
          keycloak.clearToken();
          keycloak.logout({
            redirectUri: window.location.href
          });
        }}
      >
        <Avatar
          size='sm'
          name={username}
          bg='secondary.500'
          color='white'
          borderRadius='4px'
        />
      </SmartLink>
    </Tooltip>
  );
}
