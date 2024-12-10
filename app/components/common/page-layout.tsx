import React, { Suspense } from 'react';
import {
  Box,
  Flex,
  IconButton,
  IconButtonProps,
  List,
  ListItem,
  Text
} from '@chakra-ui/react';
import {
  CollecticonCompass,
  CollecticonMagnifierRight,
  CollecticonMap
} from '@devseed-ui/collecticons-chakra';
import { Link, LinkProps, Route, Switch, useRoute } from 'wouter';
import SmartLink from './smart-link';
import Logo from './logo';
import { AppContextProvider } from '$components/common/app-context';

const Home = React.lazy(() => import('../home/'));
const Search = React.lazy(() => import('../search/'));
const Species = React.lazy(() => import('../species/'));
const IndividualSingle = React.lazy(() => import('../individual/'));

const MbMap = React.lazy(() => import('./mb-map'));

function NavButton(props: LinkProps & IconButtonProps) {
  const { to, state, replace, ...rest } = props;
  const [isActive] = useRoute(to!);

  return (
    <Link asChild href={to!} state={state} replace={replace}>
      <IconButton
        as='a'
        size='sm'
        variant='ghost'
        colorScheme='base'
        _active={{ bg: 'base.100a' }}
        isActive={isActive}
        {...rest}
      />
    </Link>
  );
}

export default function PageLayout() {
  return (
    <AppContextProvider>
      <Flex direction='column' minHeight='100vh'>
        <Flex
          position='absolute'
          width='25rem'
          inset={4}
          zIndex={100}
          p={4}
          pl={2}
          gap={2}
          bg='surface.400a'
          borderRadius='md'
          backdropFilter='blur(1rem)'
        >
          <Flex py={4} px={2} direction='column' gap={6} as='header'>
            <Box>
              <SmartLink to='/'>
                <Logo height={4} />
              </SmartLink>
            </Box>
            <Box as='nav'>
              <List display='flex' flexDirection='column' gap={4}>
                <ListItem>
                  <NavButton to='/' aria-label='Explore data'>
                    <CollecticonCompass title='Explore data' />
                  </NavButton>
                </ListItem>
                <ListItem>
                  <NavButton to='/search' aria-label='Search specimen'>
                    <CollecticonMagnifierRight title='Search specimen' />
                  </NavButton>
                </ListItem>
              </List>
            </Box>
          </Flex>
          <Flex as='main' bg='surface.500' borderRadius='md' w='100%' p={4}>
            <Suspense fallback={<Loading />}>
              <Switch>
                <Route path='/' component={Home} />
                <Route path='/species/:id' component={Species} />
                <Route path='/individual/:id' component={IndividualSingle} />
                <Route path='/search' component={Search} />
              </Switch>
            </Suspense>
          </Flex>
        </Flex>
        <Box flex='1'>
          <Suspense fallback={<MapLoading />}>
            <MbMap />
          </Suspense>
        </Box>
      </Flex>
    </AppContextProvider>
  );
}

function Loading() {
  return <Box>Loading...</Box>;
}

function MapLoading() {
  return (
    <Flex
      h='100vh'
      alignItems='center'
      justifyContent='center'
      direction='column'
      gap={2}
      bg='primary.200'
    >
      <CollecticonMap size='4rem' color='primary.600' />
      <Text textTransform='uppercase'>Loading...</Text>
    </Flex>
  );
}
