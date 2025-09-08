'use client';

import { createContext, useContext, useState } from 'react';

interface IPaginationContext {
  page: number;
  pages: number;
  setPage: (value: number) => void;
  setPages: (value: number) => void;
}

const PaginationContext = createContext<IPaginationContext>({
  page: 0,
  pages: 0,
  setPage: () => {},
  setPages: () => {},
});

export default function PaginationProvider(props: { children: React.ReactNode }) {
  const { children } = props;
  const [page, setPage] = useState<number>(0);
  const [pages, setPages] = useState<number>(0);

  return (
    <PaginationContext.Provider value={{ page, pages, setPage, setPages }}>
      {children}
    </PaginationContext.Provider>
  );
}

export const usePagination = () => {
  const { page, pages, setPage, setPages } = useContext(PaginationContext);

  return { page, pages, setPage, setPages };
};
