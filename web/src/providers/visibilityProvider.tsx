import { useCallback, useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";

import { useNuiEvent } from "../hooks/useNuiEvent";
import { fetchNui } from "../utils/fetchNui";
import { isEnvBrowser } from "../utils/misc";
import { VisibilityContext } from "./visibilityContext";

interface VisibilityProviderProps {
    children: ReactNode;
}

/**
 * Provides visibility state for the NUI application.
 *
 * Mount this provider at the top level of your application. It listens for the
 * `setVisible` message from Lua and asks the client to release NUI focus when
 * the player presses Escape.
 */
export function VisibilityProvider({
    children,
}: VisibilityProviderProps) {
    const [visible, setVisibleState] = useState(false);
    const [exitSettled, setExitSettled] = useState(true);
    const reduceMotion = useReducedMotion();

    const setVisible = useCallback((next: boolean) => {
        setVisibleState(next);

        if (next) {
            setExitSettled(false);
        }
    }, []);

    useNuiEvent<boolean>("setVisible", setVisible);

    useEffect(() => {
        if (!visible) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.code !== "Escape") {
                return;
            }

            if (isEnvBrowser()) {
                setVisible(false);
                return;
            }

            void fetchNui("hideFrame");
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, [visible, setVisible]);

    const value = useMemo(
        () => ({ visible, setVisible }),
        [visible, setVisible],
    );

    return (
        <VisibilityContext.Provider value={value}>
            <motion.div
                initial={false}
                animate={visible ? "visible" : "hidden"}
                variants={
                    reduceMotion
                        ? {
                              visible: { opacity: 1 },
                              hidden: { opacity: 0 },
                          }
                        : {
                              visible: { opacity: 1, scale: 1 },
                              hidden: { opacity: 0, scale: 0.97 },
                          }
                }
                transition={
                    reduceMotion
                        ? { duration: 0.2, ease: "easeOut" }
                        : { type: "spring", bounce: 0, duration: 0.42 }
                }
                onAnimationComplete={() => {
                    if (!visible) {
                        setExitSettled(true);
                    }
                }}
                style={{
                    height: "100%",
                    visibility: !visible && exitSettled ? "hidden" : "visible",
                    pointerEvents: visible ? "auto" : "none",
                    willChange: "transform, opacity",
                }}
            >
                {children}
            </motion.div>
        </VisibilityContext.Provider>
    );
}
