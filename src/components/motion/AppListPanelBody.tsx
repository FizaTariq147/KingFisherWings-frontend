import type { ReactNode } from 'react';
import { AppFetchBar } from './AppFetchBar';
import { AppLoadingState } from './AppLoadingState';

type AppListPanelBodyProps = {
  isLoading?: boolean;
  isFetching?: boolean;
  label?: string;
  children: ReactNode;
};

/** Portal-style list panel body: shimmer bar on refetch, dot loader on initial load. */
export function AppListPanelBody({
  isLoading = false,
  isFetching = false,
  label,
  children,
}: AppListPanelBodyProps) {
  return (
    <>
      <AppFetchBar active={isFetching && !isLoading} />
      {isLoading ? <AppLoadingState label={label} /> : children}
    </>
  );
}
