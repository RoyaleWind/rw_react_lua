import { createContext, useContext } from "react";

export interface VisibilityProviderValue {
    visible: boolean;
    setVisible: (visible: boolean) => void;
}

export const VisibilityContext =
    createContext<VisibilityProviderValue | null>(null);

/**
 * Reads the current NUI visibility state.
 *
 * Must be called beneath a `VisibilityProvider`.
 */
export function useVisibility(): VisibilityProviderValue {
    const context = useContext(VisibilityContext);

    if (context === null) {
        throw new Error(
            "useVisibility must be used within a VisibilityProvider",
        );
    }

    return context;
}
