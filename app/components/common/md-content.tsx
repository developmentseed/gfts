import {
  Box,
  Skeleton,
  SkeletonText,
  Table,
  TableContainer,
  Tbody,
  Td,
  Th,
  Thead,
  Tr
} from '@chakra-ui/react';
import React, { Suspense, useEffect, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMdFn } from '$utils/api';

const Markdown = React.lazy(() => import('react-markdown'));
const remarkGfm = import('remark-gfm');

function usePromise<T>(promise: Promise<T>) {
  const [value, setValue] = useState<T | null>(null);

  useEffect(() => {
    promise.then((v) => setValue(v));
  }, [promise]);

  return value;
}

const markdownComponents = {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  table: ({ node, ...props }) => (
    <TableContainer>
      <Table size='sm' {...props} />
    </TableContainer>
  ),
  tr: Tr,
  td: Td,
  th: Th,
  thead: Thead,
  tbody: Tbody
};

interface MdContentProps {
  url?: string;
}

export function MdContent(props: MdContentProps) {
  const { url } = props;

  const remarkGfmPlugin = usePromise(remarkGfm);

  const { data, error, isLoading } = useQuery({
    enabled: !!url,
    queryKey: ['markdown', url || 'n/a'],
    queryFn: getMdFn(url || '')
  });

  if (isLoading || !remarkGfmPlugin) {
    return <Loading />;
  }

  if (error) {
    return (
      <Box
        p={2}
        bg='danger.50'
        color='danger.700'
        border='1px'
        borderColor='danger.200'
        borderRadius='md'
      >
        Error loading the content: {error.message}
      </Box>
    );
  }

  if (!data) {
    return 'No content is available. Check back later.';
  }

  return (
    <Suspense fallback={<Loading />}>
      <Markdown
        remarkPlugins={[remarkGfmPlugin.default]}
        components={markdownComponents}
      >
        {data}
      </Markdown>
    </Suspense>
  );
}

function Loading() {
  return (
    <Box>
      <Skeleton height='4' width='10' />
      <SkeletonText mt='4' noOfLines={4} spacing='4' skeletonHeight='2' />
    </Box>
  );
}
