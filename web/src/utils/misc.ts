/**
 * Returns true when running in a regular browser
 * rather than FiveM's CEF environment.
 */
export const isEnvBrowser = (): boolean => {
    return window.invokeNative === undefined;
};
