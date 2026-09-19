import type { ServerInfo, Tick } from "../types/nui";
import { debugData } from "./debugData";
import { isEnvBrowser } from "./misc";

export function emitMockServerInfo(delay = 420): void {
    const payload: ServerInfo = {
        resource: "rw_react_lua",
        players: 24,
        maxPlayers: 48,
        uptime: 4837,
        timestamp: Math.floor(Date.now() / 1000),
    };

    debugData([{ action: "serverInfo", data: payload }], delay);
}

export function emitMockNotice(): void {
    debugData(
        [
            {
                action: "notice",
                data: {
                    message: "Pushed from Lua with SendNUIMessage.",
                    style: "info",
                },
            },
        ],
        0,
    );
}

export function startMockTicks(interval = 250): () => void {
    if (!isEnvBrowser()) {
        return () => undefined;
    }

    let heading = 180;

    const timer = setInterval(() => {
        heading = (heading + 3) % 360;

        const payload: Tick = {
            health: 168 + Math.round(Math.sin(Date.now() / 1400) * 14),
            armour: 75,
            speed: Math.max(0, 48 + Math.sin(Date.now() / 900) * 26),
            heading,
            coords: {
                x: 215.42 + Math.sin(Date.now() / 2000) * 6,
                y: -810.31 + Math.cos(Date.now() / 2000) * 6,
                z: 30.73,
            },
            clock: new Date().toTimeString().slice(0, 5),
        };

        debugData([{ action: "tick", data: payload }], 0);
    }, interval);

    return () => clearInterval(timer);
}
