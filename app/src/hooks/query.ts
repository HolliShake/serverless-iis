import { useCallback, useState, useMemo } from "react";

interface QueryProps<T = unknown> {
    callback: () => Promise<T>;
    onSuccess?: (data: T) => void;
    onFail?: (error: Error) => void;
}

interface QueryResult<T> {
    isLoading: boolean;
    isPending: boolean;
    error: Error | null;
    data: T | null;
    query: () => Promise<void>;
    refetch: () => Promise<void>;
}

interface MutateProps<T = unknown, P = unknown> {
    callback: (params: P) => Promise<T>;
    onSuccess?: (data: T) => void;
    onFail?: (error: Error) => void;
}

interface MutateResult<T, P> {
    isLoading: boolean;
    error: Error | null;
    data: T | null;
    mutate: (params: P) => Promise<void>;
}

export const useQuery = <T = unknown>({ callback, onSuccess, onFail }: QueryProps<T>): QueryResult<T> => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [isPending, setIsPending] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);
    const [data, setData] = useState<T | null>(null);
    
    const query = useCallback(async (): Promise<void> => {
        try {
            setIsLoading(true);
            setError(null);
            const result = await callback();
            setData(result);
            onSuccess?.(result);
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);
            onFail?.(error);
        } finally {
            setIsLoading(false);
        }
    }, [callback, onSuccess, onFail]);

    const refetch = useCallback(async (): Promise<void> => {
        try {
            setIsPending(true);
            setError(null);
            const result = await callback();
            setData(result);
            onSuccess?.(result);
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);
            onFail?.(error);
        } finally {
            setIsPending(false);
        }
    }, [callback, onSuccess, onFail]);

    return useMemo((): QueryResult<T> => ({
        isLoading,
        isPending,
        error,
        data,
        query,
        refetch
    }), [isLoading, isPending, error, data, query, refetch]);
};

export const useMutate = <T = unknown, P = unknown>({ callback, onSuccess, onFail }: MutateProps<T, P>): MutateResult<T, P> => {
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<Error | null>(null);
    const [data, setData] = useState<T | null>(null);
    
    const mutate = useCallback(async (params: P): Promise<void> => {
        try {
            setIsLoading(true);
            setError(null);
            const result = await callback(params);
            setData(result);
            onSuccess?.(result);
        } catch (err) {
            const error = err instanceof Error ? err : new Error(String(err));
            setError(error);
            onFail?.(error);
        } finally {
            setIsLoading(false);
        }
    }, [callback, onSuccess, onFail]);

    return useMemo((): MutateResult<T, P> => ({
        isLoading,
        error,
        data,
        mutate
    }), [isLoading, error, data, mutate]);
};
