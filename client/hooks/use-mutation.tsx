import {
  useMutation as RQUseMutation,
  UseMutationOptions,
} from "@tanstack/react-query";
import { AxiosError } from "axios";
import { toast } from "sonner";

interface ErrorResponse {
  message?: string;
  error?: string;
}

type ToastErrorOptions = Parameters<typeof toast.error>[1];

interface MutationOptions<
  TData,
  TError = AxiosError<ErrorResponse>,
  TVariables = unknown,
  TContext = unknown
> extends UseMutationOptions<TData, TError, TVariables, TContext> {
  showErrorToast?: boolean;
  toastErrorMessage?: string;
  errorToastOptions?: ToastErrorOptions;
}

export const useMutation = <
  TData = unknown,
  TError = AxiosError<ErrorResponse>,
  TVariables = unknown,
  TContext = unknown
>(
  optionsParams: MutationOptions<TData, TError, TVariables, TContext> = {}
) => {
  const options = {
    showErrorToast: true,
    errorToastOptions: {},
    ...optionsParams,
  };

  return RQUseMutation<TData, TError, TVariables, TContext>({
    ...options,
    onError: (
      error: TError,
      variables: TVariables,
      context: TContext | undefined
    ) => {
      const axiosError = error as AxiosError<ErrorResponse>;
      const errorMessage =
        options.toastErrorMessage ??
        axiosError?.response?.data?.message ??
        axiosError?.response?.data?.error ??
        "Something went wrong";
      if (options?.showErrorToast) {
        setTimeout(() => {
          toast.error(errorMessage, options.errorToastOptions);
        }, 0);
      }

      // Call any additional onError handler passed in options
      options.onError?.(error, variables, context);
    },
  });
};
