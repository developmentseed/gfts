import React, { useEffect, useState } from 'react';
import { Avatar, IconButton, Tooltip } from '@chakra-ui/react';
import { CollecticonLogin } from '@devseed-ui/collecticons-chakra';

import { useKeycloak } from './context';
import SmartLink from '$components/common/smart-link';

async function hash(string: string) {
  const utf8 = new TextEncoder().encode(string);
  const hashBuffer = await crypto.subtle.digest('SHA-256', utf8);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray
    .map((bytes) => bytes.toString(16).padStart(2, '0'))
    .join('');
  return hashHex;
}

export function UserInfo() {
  const { profile, isLoading, isEnabled, keycloak } = useKeycloak();

  const [userEmailHash, setUserEmailHash] = useState<string>('');
  useEffect(() => {
    if (profile?.email) {
      hash(profile.email).then(setUserEmailHash);
    }
  }, [profile?.email]);

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

  const username =
    `${profile.firstName} ${profile.lastName}`.trim() || profile.username;

  return (
    <Tooltip hasArrow label='Logout' placement='right' bg='base.500'>
      <SmartLink
        to='/'
        display='block'
        onClick={(e) => {
          e.preventDefault();
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
          src={`https://www.gravatar.com/avatar/${userEmailHash}?d=404`}
        />
      </SmartLink>
    </Tooltip>
  );
}
