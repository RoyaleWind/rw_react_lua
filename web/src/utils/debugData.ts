import { isEnvBrowser } from "./misc";

export interface DebugEvent<T = unknown> {
    action: string;
    data: T;
}

/**
 * Emulates dispatching an event using SendNuiMessage in Lua scripts.
 * Used when developing the NUI in a browser.
 *
 * @param events - Events to dispatch.
 * @param timer - Delay before dispatching each event (ms).
 */
export const debugData = <T>(
    events: DebugEvent<T>[],
    timer = 1000,
): void => {
    if (!import.meta.env.DEV || !isEnvBrowser()) {
        return;
    }

    for (const event of events) {
        setTimeout(() => {
            window.dispatchEvent(
                new MessageEvent("message", {
                    data: {
                        action: event.action,
                        data: event.data,
                    },
                }),
            );
        }, timer);
    }
};
