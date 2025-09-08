'use client';

import { useCallback, useMemo } from 'react';
import clsx from 'clsx';

import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@shadcn-ui/pagination';

import PaginationProvider, { usePagination } from './Provider';

export { PaginationProvider, usePagination };

const MAX_PAGES = 10;

const PaginationLinkItem = (props: { index: number }) => {
  const { index } = props;
  const { page, pages, setPage } = usePagination();
  const isActive = useMemo(() => index === page, [index, page]);

  const handleClick = useCallback(() => {
    if (index < 0 || index > pages - 1) {
      return;
    }

    setPage(index);
  }, [index, pages]);

  return (
    <PaginationItem key={index}>
      {isActive ? (
        <PaginationLink isActive={isActive}>{index + 1}</PaginationLink>
      ) : (
        <PaginationLink className="cursor-pointer" onClick={handleClick}>
          {index + 1}
        </PaginationLink>
      )}
    </PaginationItem>
  );
};

const PaginationList = () => {
  const { page, pages } = usePagination();
  const max = Math.ceil(MAX_PAGES / 2);

  if (pages <= MAX_PAGES) {
    return (
      <>
        {[...Array(pages)].map((_, index) => (
          <PaginationLinkItem key={index} index={index} />
        ))}
      </>
    );
  }

  if (page < max) {
    return (
      <>
        {[...Array(max)].map((_, index) => (
          <PaginationLinkItem key={index} index={index} />
        ))}
        <PaginationEllipsis />
        <PaginationLinkItem index={pages - 1} />
      </>
    );
  }

  if (page > pages - 1 - max) {
    return (
      <>
        <PaginationLinkItem index={0} />
        <PaginationEllipsis />
        {[...Array(max)].map((_, index) => (
          <PaginationLinkItem key={pages - (max - index)} index={pages - (max - index)} />
        ))}
      </>
    );
  }

  return (
    <>
      <PaginationLinkItem index={0} />
      <PaginationEllipsis />
      <PaginationLinkItem index={page - 1} />
      <PaginationLinkItem index={page} />
      <PaginationLinkItem index={page + 1} />
      <PaginationEllipsis />
      <PaginationLinkItem index={pages - 1} />
    </>
  );
};

export default function UIPagination(props: { className?: string }) {
  const { className = '' } = props;
  const { page, pages, setPage } = usePagination();

  const handlePrev = () => {
    if (page - 1 < 0) {
      return;
    }

    setPage(page - 1);
  };

  const handleNext = () => {
    if (page + 1 > pages - 1) {
      return;
    }

    setPage(page + 1);
  };

  if (pages <= 1) {
    return null;
  }

  return (
    <div className={clsx(className)}>
      <Pagination>
        <PaginationContent className="select-none">
          <PaginationItem>
            <PaginationPrevious
              className={clsx(
                page === 0
                  ? 'text-muted-foreground hover:text-muted-foreground cursor-default hover:bg-transparent'
                  : 'cursor-pointer'
              )}
              onClick={handlePrev}
            />
          </PaginationItem>
          <PaginationList />
          <PaginationItem>
            <PaginationNext
              className={clsx(
                page === pages - 1
                  ? 'text-muted-foreground hover:text-muted-foreground cursor-default hover:bg-transparent'
                  : 'cursor-pointer'
              )}
              onClick={handleNext}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  );
}
