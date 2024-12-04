import { extendTheme } from '@chakra-ui/react';

import { createColorPalette } from './color-palette';

const theme = {
  fonts: {
    body: '"Nunito Sans", sans-serif',
    heading: '"Nunito Sans", serif'
  },
  colors: {
    primary: createColorPalette('#219EBC'),
    secondary: createColorPalette('#FB8500'),
    base: createColorPalette('#023047'),
    danger: createColorPalette('#ED254E'),
    warning: createColorPalette('#FFB703'),
    success: createColorPalette('#52B69A'),
    info: createColorPalette('#219EBC'),
    surface: createColorPalette('#FFF'),
    warm: {
      1: '#ff7b00',
      2: '#ff9533',
      3: '#ffb066',
      4: '#ffca99'
    },
    cold: {
      1: '#0ac8e5',
      2: '#3bd3ea',
      3: '#6cdeef',
      4: '#9de9f5'
    }
  },
  fontSizes: {
    xs: '0.75rem',
    sm: '1rem',
    md: '1.25rem',
    lg: '1.5rem',
    xl: '1.75rem',
    '2xl': '2rem',
    '3xl': '2.25rem',
    '4xl': '2.5rem',
    '5xl': '2.75rem',
    '6xl': '3rem',
    '7xl': '3.25rem',
    '8xl': '3.5rem',
    '9xl': '3.75rem',
    '10xl': '4rem'
  },
  styles: {
    global: {
      body: {
        fontSize: 'sm',
        color: 'base.500',
        mW: '100vw',
        overflowX: 'hidden'
      },
      '*': {
        lineHeight: 'calc(0.5rem + 1em)'
      }
    }
  },
  textStyles: {
    lead: {
      sm: {
        fontSize: 'md'
      },
      lg: {
        fontSize: 'lg'
      }
    }
  },
  components: {
    Link: {
      baseStyle: {
        color: 'primary.500'
      }
    },
    Button: {
      baseStyle: {
        textTransform: 'uppercase',
        borderRadius: 'md',
        heading: 'Red Hat Text, serif',
        fontWeight: '600'
      },
      sizes: {
        xs: {
          fontSize: 'xs'
        },
        sm: {
          fontSize: 'xs'
        },
        md: {
          fontSize: 'sm'
        },
        lg: {
          fontSize: 'sm'
        }
      },
      variants: {
        outline: {
          border: '2px solid',
          '.chakra-button__group[data-attached][data-orientation=horizontal] > &:not(:last-of-type)':
            { marginEnd: '-2px' },
          '.chakra-button__group[data-attached][data-orientation=vertical] > &:not(:last-of-type)':
            { marginBottom: '-2px' }
        },
        'soft-outline': (props) => {
          const { colorScheme: c } = props;
          return {
            border: '2px solid',
            borderColor: `${c}.200a`,
            '.chakra-button__group[data-attached][data-orientation=horizontal] > &:not(:last-of-type)':
              { marginEnd: '-2px' },
            '.chakra-button__group[data-attached][data-orientation=vertical] > &:not(:last-of-type)':
              { marginBottom: '-2px' },
            _hover: {
              bg: `${c}.50a`
            },
            _active: {
              bg: `${c}.100a`
            }
          };
        }
      }
    }
  }
};

export default extendTheme(theme);
