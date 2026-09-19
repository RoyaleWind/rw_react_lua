import { useEffect, useRef } from "react";

interface NuiMessageData<T = unknown> {
    action: string;
    data: T;
}

type NuiHandler<T> = (data: T) => void;

export function useNuiEvent<T = unknown>(
    action: string,
    handler: NuiHandler<T>,
): void {
    const handlerRef = useRef(handler);

    useEffect(() => {
        handlerRef.current = handler;
    }, [handler]);

    useEffect(() => {
        const listener = (event: MessageEvent<NuiMessageData<T>>) => {
            if (event.data.action !== action) {
                return;
            }

            handlerRef.current(event.data.data);
        };

        window.addEventListener("message", listener);

        return () => {
            window.removeEventListener("message", listener);
        };
    }, [action]);
}