import {isEnvBrowser} from "./misc";

/**
 * Sends a request to a FiveM NUI callback.
 *
 * When running in a browser, mockData can be returned instead.
 *
 * @param eventName - The NUI callback name.
 * @param data - Data sent to the NUI callback.
 * @param mockData - Mock response used when running in a browser.
 */
export async function fetchNui<T = unknown>(
    eventName: string,
    data?: unknown,
    mockData?: T,
): Promise<T> {
    if (isEnvBrowser() && mockData !== undefined) {
        return mockData;
    }

    const resourceName = window.GetParentResourceName?.() ?? "nui-frame-app";

    const response = await fetch(
        `https://${resourceName}/${eventName}`,
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json; charset=UTF-8",
            },
            body: JSON.stringify(data),
        },
    );

    if (!response.ok) {
        throw new Error(
            `NUI request failed: ${response.status} ${response.statusText}`,
        );
    }

    return await response.json() as Promise<T>;
}
