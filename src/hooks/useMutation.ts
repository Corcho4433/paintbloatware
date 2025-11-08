import { useState } from 'react';

interface UseMutationOptions<TData, TVariables> {
  mutationFn: (variables: TVariables) => Promise<TData>;
  onSuccess?: (data: TData) => void | Promise<void>;
  onError?: (error: Error) => void;
}

export const useMutation = <TData, TVariables>({
  mutationFn,
  onSuccess,
  onError,
}: UseMutationOptions<TData, TVariables>) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<TData | null>(null);

  const mutateAsync = async (variables: TVariables): Promise<TData> => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await mutationFn(variables);
      setData(result);
      if (onSuccess) {
        await onSuccess(result);
      }
      return result;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('An error occurred');
      setError(error);
      if (onError) {
        onError(error);
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  // mutate is the same as mutateAsync but doesn't return a promise
  const mutate = (variables: TVariables) => {
    mutateAsync(variables).catch(() => {
      // Error already handled in mutateAsync
    });
  };

  return {
    mutate,
    mutateAsync, // ✅ Added this
    isLoading,
    isPending: isLoading, // TanStack uses isPending too
    error,
    data,
    isError: error !== null,
    isSuccess: data !== null && error === null,
  };
};