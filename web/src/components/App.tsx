import { Icon } from "@iconify/react";

import {
    LuaPushes,
    NotifyPayload,
    PlayerCallback,
    ServerRoundTrip,
} from "./demos";
import { useNuiEvent } from "../hooks/useNuiEvent";
import { useVisibility } from "../providers/visibilityContext";
import { debugData, type DebugEvent } from "../utils/debugData";
import { fetchNui } from "../utils/fetchNui";
import { isEnvBrowser } from "../utils/misc";

/** Opens the UI automatically when developing in a browser. */
const events: DebugEvent[] = [
    {
        action: "setVisible",
        data: true,
    },
];

function App() {
    const { setVisible } = useVisibility();

    useNuiEvent<boolean>("setVisible", () => undefined);

    const close = () => {
        if (isEnvBrowser()) {
            setVisible(false);
            return;
        }

        void fetchNui("hideFrame");
    };

    return (
        <div className="flex h-full w-full items-center justify-center p-6">
            <div className="flex h-[40rem] max-h-full w-[48rem] max-w-full flex-col overflow-hidden rounded-md border border-white/10 border-t-white/20 bg-zinc-950 text-zinc-100 shadow-2xl shadow-black/60 backdrop-blur-2xl backdrop-saturate-150 contrast-more:border-white/40 contrast-more:bg-zinc-950 contrast-more:backdrop-blur-none">
                <header className="flex items-center gap-3 border-b border-white/10 px-5 py-3.5">
                    <Icon
                        icon="tabler:plug-connected"
                        className="text-lg text-emerald-400"
                    />

                    <div className="flex-1">
                        <h1 className="text-sm font-semibold leading-none">
                            rw_react_lua
                        </h1>
                        <p className="mt-1 text-[11px] text-zinc-400">
                            Every way React and Lua talk to each other
                        </p>
                    </div>

                    <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-medium uppercase text-zinc-300">
                        {isEnvBrowser() ? "browser" : "in game"}
                    </span>

                    <button
                        type="button"
                        onClick={close}
                        title="Close (Escape)"
                        className="rounded-md p-1.5 text-zinc-300 transition duration-100 ease-out hover:bg-white/10 hover:text-white active:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 motion-safe:active:scale-[0.94]"
                    >
                        <Icon icon="tabler:x" />
                    </button>
                </header>

                <main className="grid min-h-0 flex-1 grid-cols-2 content-start gap-4 overflow-y-auto p-5">
                    <PlayerCallback />
                    <NotifyPayload />
                    <ServerRoundTrip />
                    <LuaPushes />
                </main>

                <footer className="border-t border-white/10 px-5 py-2.5 font-mono text-[10px] text-zinc-400">
                    Escape or the close button calls fetchNui(&quot;hideFrame&quot;)
                </footer>
            </div>
        </div>
    );
}

debugData(events);

export default App;
