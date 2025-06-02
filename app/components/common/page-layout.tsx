import React, { Suspense } from 'react';
import {
  Box,
  Flex,
  Heading,
  IconButton,
  IconButtonProps,
  List,
  ListItem,
  Show,
  Skeleton,
  SkeletonText,
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
      <Show above='lg'>
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
              <Flex direction='column' alignItems='center'>
                <SmartLink to='/' w={8}>
                  <Logo w='100%' h='auto' />
                </SmartLink>
              </Flex>
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
            <Flex
              as='main'
              bg='surface.500'
              borderRadius='md'
              w='auto'
              p={4}
              flex='1'
            >
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
      </Show>
      <Show below='lg'>
        <Flex
          h='100vh'
          alignItems='center'
          justifyContent='center'
          direction='column'
          gap={8}
          bg='primary.200'
        >
          <Box px={8} w='100%' maxW={60}>
            <Logo w='auto' h='auto' />
          </Box>
          <Flex gap={2} direction='column' px={8} maxW='30rem'>
            <Heading as='h1' size='lg' textAlign='center'>
              Oops!
            </Heading>
            <Text>
              The fix you&apos;re trying to track is too big for your screen.
              <br />
              Please try on a larger device.
            </Text>
          </Flex>
        </Flex>
      </Show>
    </AppContextProvider>
  );
}

function Loading() {
  return (
    <Flex direction='column' gap={4} width='100%'>
      <Skeleton height={6} width='40%' />
      <Skeleton height={10} width='80%' />
      <SkeletonText noOfLines={4} spacing='4' width='100%' mt={4} />
    </Flex>
  );
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
