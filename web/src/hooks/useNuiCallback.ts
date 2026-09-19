import { useCallback, useState } from "react";

import { fetchNui } from "../utils/fetchNui";

interface NuiCallbackState<TResponse> {
    data: TResponse | null;
    error: string | null;
    loading: boolean;
}

export function useNuiCallback<TResponse, TPayload = void>(
    event: string,
    mockResponse?: TResponse,
) {
    const [state, setState] = useState<NuiCallbackState<TResponse>>({
        data: null,
        error: null,
        loading: false,
    });

    const call = useCallback(
        async (payload?: TPayload): Promise<TResponse | null> => {
            setState((current) => ({ ...current, loading: true, error: null }));

            try {
                const data = await fetchNui<TResponse>(
                    event,
                    payload,
                    mockResponse,
                );

                setState({ data, error: null, loading: false });

                return data;
            } catch (cause) {
                const message =
                    cause instanceof Error ? cause.message : String(cause);

                setState({ data: null, error: message, loading: false });

                return null;
            }
        },
        [event, mockResponse],
    );

    return { ...state, call };
}
