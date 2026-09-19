import { useEffect, useState } from "react";
import type { ReactNode } from "react";
import { Icon } from "@iconify/react";

import { useNuiCallback } from "../hooks/useNuiCallback";
import { useNuiEvent } from "../hooks/useNuiEvent";
import type {
    Notice,
    NotifyRequest,
    NotifyResponse,
    NotifyStyle,
    PlayerData,
    RequestAck,
    ServerInfo,
    Tick,
} from "../types/nui";
import { emitMockServerInfo, startMockTicks } from "../utils/browserMocks";

interface SectionProps {
    step: number;
    title: string;
    flow: string;
    children: ReactNode;
}

function Section({ step, title, flow, children }: SectionProps) {
    return (
        <section className="flex flex-col gap-3 rounded-xl border border-white/10 bg-white/[0.04] p-4 contrast-more:border-white/40 contrast-more:bg-zinc-900">
            <header className="flex gap-2.5">
                <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded bg-white/10 text-[10px] font-semibold text-zinc-300">
                    {step}
                </span>

                <div className="min-w-0">
                    <h2 className="text-sm font-semibold leading-tight text-zinc-100">
                        {title}
                    </h2>
                    <p className="mt-1 break-words font-mono text-[10px] leading-relaxed text-zinc-400">
                        {flow}
                    </p>
                </div>
            </header>

            {children}
        </section>
    );
}

interface ButtonProps {
    label: string;
    loading?: boolean;
    disabled?: boolean;
    onClick: () => void;
}

function Button({ label, loading, disabled, onClick }: ButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={loading || disabled}
            className="inline-flex w-fit items-center gap-1.5 rounded-md bg-zinc-100 px-3 py-1.5 text-xs font-semibold text-zinc-900 transition duration-100 ease-out hover:bg-white active:bg-zinc-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 focus-visible:ring-offset-2 focus-visible:ring-offset-zinc-950 disabled:cursor-not-allowed disabled:opacity-40 motion-safe:active:scale-[0.97]"
        >
            {loading && <Icon icon="tabler:loader-2" className="animate-spin" />}
            {label}
        </button>
    );
}

function Stat({ label, value }: { label: string; value: ReactNode }) {
    return (
        <div className="rounded-md bg-black/30 px-2.5 py-1.5">
            <p className="text-[10px] font-medium uppercase text-zinc-400">
                {label}
            </p>
            <p className="truncate font-mono text-[11px] text-zinc-200">
                {value}
            </p>
        </div>
    );
}

function Failure({ message }: { message: string | null }) {
    if (!message) {
        return null;
    }

    return (
        <p className="flex items-start gap-1.5 text-[11px] text-red-400">
            <Icon icon="tabler:alert-triangle" className="mt-px shrink-0" />
            {message}
        </p>
    );
}

const MOCK_PLAYER: PlayerData = {
    ped: 12345,
    coords: { x: 215.42, y: -810.31, z: 30.73 },
    heading: 180,
    health: 200,
    armour: 75,
    serverId: 1,
    name: "RoyaleWind",
};

export function PlayerCallback() {
    const { data, error, loading, call } = useNuiCallback<PlayerData>(
        "getPlayer",
        MOCK_PLAYER,
    );

    return (
        <Section
            step={1}
            title="Ask Lua for data"
            flow={'fetchNui("getPlayer") -> RegisterNUICallback -> cb(data)'}
        >
            <Button
                label="Get player"
                loading={loading}
                onClick={() => void call()}
            />

            <Failure message={error} />

            {data && (
                <div className="grid grid-cols-3 gap-1.5">
                    <Stat label="Name" value={data.name} />
                    <Stat label="Server ID" value={data.serverId} />
                    <Stat label="Ped" value={data.ped} />
                    <Stat label="Health" value={data.health} />
                    <Stat label="Armour" value={data.armour} />
                    <Stat label="Heading" value={`${data.heading} deg`} />
                    <div className="col-span-3">
                        <Stat
                            label="Coords"
                            value={`${data.coords.x}, ${data.coords.y}, ${data.coords.z}`}
                        />
                    </div>
                </div>
            )}
        </Section>
    );
}

const STYLES: NotifyStyle[] = ["info", "success", "warning", "error"];

export function NotifyPayload() {
    const [message, setMessage] = useState("Sent from React.");
    const [style, setStyle] = useState<NotifyStyle>("info");

    const { data, error, loading, call } = useNuiCallback<
        NotifyResponse,
        NotifyRequest
    >("notify", { ok: true, shownAt: 0 });

    return (
        <Section
            step={2}
            title="Send data to Lua"
            flow={'fetchNui("notify", body) -> cb({ ok = true })'}
        >
            <input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Notification text"
                className="w-full rounded-md border border-white/10 bg-black/30 px-2.5 py-1.5 text-xs text-zinc-100 outline-none transition-colors duration-100 placeholder:text-zinc-500 focus-visible:border-white/40 focus-visible:bg-black/40 focus-visible:ring-2 focus-visible:ring-white/40"
            />

            <div className="flex gap-1">
                {STYLES.map((option) => (
                    <button
                        key={option}
                        type="button"
                        onClick={() => setStyle(option)}
                        className={`flex-1 rounded px-2 py-1 text-[10px] font-medium uppercase transition duration-100 ease-out active:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 motion-safe:active:scale-[0.96] ${
                            style === option
                                ? "bg-white/20 text-white"
                                : "bg-black/30 text-zinc-400 hover:text-zinc-200"
                        }`}
                    >
                        {option}
                    </button>
                ))}
            </div>

            <Button
                label="Send notification"
                loading={loading}
                disabled={message.trim().length === 0}
                onClick={() => void call({ message: message.trim(), style })}
            />

            <Failure message={error} />

            {data && (
                <p className="font-mono text-[11px] text-emerald-400">
                    Lua acknowledged at {data.shownAt}
                </p>
            )}
        </Section>
    );
}

export function ServerRoundTrip() {
    const [info, setInfo] = useState<ServerInfo | null>(null);
    const [waiting, setWaiting] = useState(false);

    const { error, loading, call } = useNuiCallback<RequestAck>(
        "requestServerInfo",
        { pending: true },
    );

    useNuiEvent<ServerInfo>("serverInfo", (data) => {
        setInfo(data);
        setWaiting(false);
    });

    const ask = async () => {
        setWaiting(true);
        await call();
        emitMockServerInfo();
    };

    return (
        <Section
            step={3}
            title="Round trip through the server"
            flow={
                'fetchNui("requestServerInfo") -> TriggerServerEvent -> ' +
                "TriggerClientEvent -> SendNUIMessage"
            }
        >
            <Button
                label="Ask the server"
                loading={loading || waiting}
                onClick={() => void ask()}
            />

            <Failure message={error} />

            {info && (
                <div className="grid grid-cols-2 gap-1.5">
                    <Stat label="Resource" value={info.resource} />
                    <Stat
                        label="Players"
                        value={`${info.players} / ${info.maxPlayers}`}
                    />
                    <Stat label="Uptime" value={`${info.uptime}s`} />
                    <Stat
                        label="Server time"
                        value={new Date(
                            info.timestamp * 1000,
                        ).toLocaleTimeString([], { hour12: false })}
                    />
                </div>
            )}
        </Section>
    );
}

export function LuaPushes() {
    const [tick, setTick] = useState<Tick | null>(null);
    const [received, setReceived] = useState(0);
    const [notice, setNotice] = useState<Notice | null>(null);

    useNuiEvent<Tick>(
        "tick",
        (data) => {
            setTick(data);
            setReceived((count) => count + 1);
        },
    );

    useNuiEvent<Notice>("notice", setNotice);

    useEffect(() => startMockTicks(), []);

    return (
        <Section
            step={4}
            title="Pushes from Lua"
            flow={'SendNUIMessage({ action = "tick" }) -> useNuiEvent'}
        >
            <div className="flex items-center gap-2">
                <span className="flex h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
                <span className="flex-1 text-[11px] text-zinc-300">
                    {received} messages received
                </span>
            </div>

            {tick && (
                <div className="grid grid-cols-3 gap-1.5">
                    <Stat label="Health" value={tick.health} />
                    <Stat label="Armour" value={tick.armour} />
                    <Stat label="Clock" value={tick.clock} />
                    <Stat label="Speed" value={`${tick.speed.toFixed(1)} km/h`} />
                    <Stat label="Heading" value={`${tick.heading.toFixed(0)} deg`} />
                    <Stat label="Z" value={tick.coords.z.toFixed(2)} />
                </div>
            )}

            <p className="font-mono text-[10px] text-zinc-400">
                {notice
                    ? `notice - ${notice.style} - ${notice.message}`
                    : "Run /rwping in game to push an unprompted message."}
            </p>
        </Section>
    );
}
