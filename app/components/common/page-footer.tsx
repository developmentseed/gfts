import React from 'react';
import {
  IconButton,
  Flex,
  useDisclosure,
  Divider,
  Image
} from '@chakra-ui/react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CollecticonCircleInformation,
  CollecticonXmarkSmall
} from '@devseed-ui/collecticons-chakra';

import destineLogo from '../../media/layout/destine.svg';
import ecmwfLogo from '../../media/layout/ecmwf.svg';
import esaLogo from '../../media/layout/esa.svg';
import euFlag from '../../media/layout/eu.svg';
import eumetsatLogo from '../../media/layout/eumetsat.svg';

import SmartLink from './smart-link';
const FooterSection = (props) => (
  <Flex as='p' gap={2} alignItems='center' {...props} />
);

export function PageFooter() {
  const { getButtonProps, getDisclosureProps, isOpen } = useDisclosure();

  return (
    <Flex
      as='footer'
      position='absolute'
      zIndex={100}
      p={1}
      bottom={8}
      right={4}
      bg='surface.400a'
      borderRadius='md'
      backdropFilter='blur(1rem)'
    >
      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            key='box'
          >
            <Flex
              {...getDisclosureProps()}
              alignItems='center'
              px={2}
              gap={4}
              overflow='hidden'
              height='100%'
              justifyContent='end'
              css={{
                textWrap: 'nowrap',
                a: {
                  transition: 'opacity 160ms ease-in-out',
                  ':hover': {
                    opacity: 0.6
                  }
                }
              }}
              color='base.400'
              fontSize='xs'
            >
              <FooterSection>
                Part of
                <SmartLink to='https://destination-earth.eu/'>
                  <Image src={destineLogo} alt='Destination earth' />
                </SmartLink>
              </FooterSection>
              <FooterSection>
                Funded by The European Union
                <Image src={euFlag} alt='EU Flag' />
              </FooterSection>
              <FooterSection>
                Implemented by
                <SmartLink to='https://www.ecmwf.int/'>
                  <Image src={ecmwfLogo} alt='ECMWF' />
                </SmartLink>
                <SmartLink to='https://www.esa.int/'>
                  <Image src={esaLogo} alt='ESA' />
                </SmartLink>
                <SmartLink to='https://www.eumetsat.int/'>
                  <Image src={eumetsatLogo} alt='EUMETSAT' />
                </SmartLink>
              </FooterSection>
              <Divider
                orientation='vertical'
                height={4}
                borderWidth='2px'
                borderColor='base.200a'
                borderRadius='md'
              />
            </Flex>
          </motion.div>
        ) : null}
      </AnimatePresence>
      <IconButton
        size='sm'
        variant='ghost'
        aria-label='Information'
        {...getButtonProps()}
      >
        {isOpen ? <CollecticonXmarkSmall /> : <CollecticonCircleInformation />}
      </IconButton>
    </Flex>
  );
}
