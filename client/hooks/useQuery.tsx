import {
  useQuery as RQUseQuery,
  UseQueryOptions,
  QueryKey,
} from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";

interface ErrorResponse {
  message?: string;
  error?: string;
}

type FetchOptions<
  TQueryFnData,
  TError = AxiosError<ErrorResponse>,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
> = UseQueryOptions<TQueryFnData, TError, TData, TQueryKey> & {
  onError?: (error: TError) => void;
  toastErrorMessage?: string;
};

export const useQuery = <
  TQueryFnData = unknown,
  TError = AxiosError<ErrorResponse>,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey
>(
  options: FetchOptions<TQueryFnData, TError, TData, TQueryKey>
) => {
  const handleError = (error: TError) => {
    const axiosError = error as AxiosError<ErrorResponse>;
    const errorMessage =
      options.toastErrorMessage ??
      axiosError?.response?.data?.message ??
      axiosError?.response?.data?.error ??
      "Something went wrong";
    setTimeout(() => toast.error(errorMessage), 0);
  };

  const combinedOnError = (error: TError) => {
    handleError(error);
    options.onError?.(error);
  };

  // Construct the query options explicitly
  const queryOptions: UseQueryOptions<TQueryFnData, TError, TData, TQueryKey> =
    {
      throwOnError: combinedOnError,
      ...options,
    } as UseQueryOptions<TQueryFnData, TError, TData, TQueryKey>;

  const queryResult = RQUseQuery(queryOptions);

  return queryResult;
};
