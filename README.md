# RW React Lua

A FiveM resource template with a **React 19 + TypeScript 7** NUI frontend and a
**Lua 5.4** backend, wired end to end. A keybind opens the interface, the
interface calls into Lua, Lua answers with live game data, and the server fills
in the pieces only it knows.

## Stack

| Layer       | Choice                                 |
| ----------- | -------------------------------------- |
| Runtime     | FiveM (`cerulean`), Lua 5.4            |
| UI          | React 19, TypeScript 7                 |
| Styling     | Tailwind CSS 3                         |
| Icons       | Iconify (`@iconify/react`), Tabler set |
| Bundler     | Vite 8 (Rolldown)                      |
| Linter      | oxlint                                 |
| Package mgr | bun                                    |

## Quick start

```bash
cd web
bun install
bun run build   # writes web/build - required before the resource will start
```

Add it to your server config:

```cfg
ensure rw_react_lua
```

Press **F5** or run `/rw` to toggle the interface, **Escape** to close it. Run
`/rwping some text` while it is open to push a message at the UI from Lua.

> `web/build` is git-ignored, so a fresh clone must be built once before the
> resource will start - `ui_page` points at `web/build/index.html`.

## How to talk to Lua

Everything goes through two primitives. `fetchNui` sends a request from React
and gets an answer back. `SendNUIMessage` pushes from Lua and React listens.

### Fetch data from Lua

`fetchNui` POSTs to `https://<resource>/<eventName>` and resolves with whatever
Lua passes to `cb`. The third argument is returned as-is in a browser, so the UI
still works outside the game:

```tsx
import { fetchNui } from "../utils/fetchNui";

const player = await fetchNui<PlayerData>("getPlayer", undefined, MOCK_PLAYER);
```

Answer it on the Lua side, always calling `cb`:

```lua
RegisterNUICallback('getPlayer', function(data, cb)
    local ped = PlayerPedId()

    cb({
        ped = ped,
        health = GetEntityHealth(ped),
    })
end)
```

In a component, reach for `useNuiCallback` instead - it wraps `fetchNui` with
loading and error state:

```tsx
const { data, error, loading, call } = useNuiCallback<PlayerData>(
    "getPlayer",
    MOCK_PLAYER,
);

<button onClick={() => void call()} disabled={loading}>Get player</button>;
```

### Send data to Lua

Pass a body as the second argument. It arrives as the first argument in Lua:

```tsx
await call({ message: "Hello", style: "info" });
```

```lua
RegisterNUICallback('notify', function(data, cb)
    print(data.message, data.style)
    cb({ ok = true })
end)
```

### Listen for pushes from Lua

```lua
SendNUIMessage({ action = 'tick', data = { health = 180 } })
```

```tsx
useNuiEvent<Tick>("tick", (data) => setTick(data));
```

### Round trip through the server

A NUI callback cannot wait on the server, so acknowledge the request and push
the answer separately once it lands:

```lua
RegisterNUICallback('requestServerInfo', function(_, cb)
    TriggerServerEvent('rw_react_lua:server:requestServerInfo')
    cb({ pending = true })
end)

RegisterNetEvent('rw_react_lua:client:serverInfo', function(data)
    SendNUIMessage({ action = 'serverInfo', data = data })
end)
```

```tsx
const { call } = useNuiCallback<RequestAck>("requestServerInfo");

useNuiEvent<ServerInfo>("serverInfo", setInfo);
```

### Show and hide the frame

Lua owns focus. `setOpen` in `client.lua` calls `SetNuiFocus` and pushes
`setVisible`, and `VisibilityProvider` hides the tree and calls `hideFrame` when
the player presses Escape:

```tsx
void fetchNui("hideFrame");
```

### Keep the types in sync

NUI messages are untyped JSON at runtime. `web/src/types/nui.ts` holds one
interface per payload - update it whenever you change a Lua table.

## The demo UI

The bundled interface is a tester for the bridge. Each card exercises one
direction:

| # | Card                          | Path                                                                                            |
| - | ----------------------------- | ----------------------------------------------------------------------------------------------- |
| 1 | Ask Lua for data              | `fetchNui("getPlayer")` -> `RegisterNUICallback` -> `cb(data)`                                   |
| 2 | Send data to Lua              | `fetchNui("notify", body)` -> in-game notification -> `cb({ ok = true })`                        |
| 3 | Round trip through the server | `fetchNui("requestServerInfo")` -> `TriggerServerEvent` -> `TriggerClientEvent` -> `SendNUIMessage` |
| 4 | Pushes from Lua               | `SendNUIMessage` -> `useNuiEvent`, both a 250 ms stream and `/rwping`                            |

Card 4's stream is driven by `Config.StreamInterval` and only runs while the
frame is open. Delete `demos.tsx` and `browserMocks.ts` once you start building
your own interface - the hooks, providers and utils are the parts worth
keeping.

## Development

### Browser

```bash
cd web
bun run dev
```

Open the printed URL. `isEnvBrowser()` detects that FiveM's CEF runtime is
absent, so:

- `main.tsx` paints a GTA screenshot behind the UI for realistic contrast,
- `debugData()` fires a `setVisible` event so the UI is visible immediately,
- `fetchNui()` returns the mock payload you pass it instead of hitting a callback,
- `browserMocks.ts` stands in for the messages `client.lua` pushes, so the
  stream and the server round trip stay interactive.

### In game

Rebuild with `bun run build` and restart the resource. To iterate without
rebuilding, point `ui_page` at the dev server:

```lua
ui_page 'http://localhost:5173/'
```

Revert that before committing - it will not work for anyone else.

## Icons

Icons come from [Iconify](https://iconify.design) using the
[Tabler](https://tabler.io/icons) set. Browse the names there and use them as-is:

```tsx
import { Icon } from "@iconify/react";

<Icon icon="tabler:plug-connected" className="text-lg text-emerald-400" />;
```

Icons size to `1em`, so `text-lg` and friends control them. `@iconify/react`
fetches icon data from the Iconify API on first use and caches it in
`localStorage`. To drop that runtime dependency, register the handful you use up
front with `addIcon()` and the bundle stays offline.

## Project structure

```
fxmanifest.lua          Resource manifest (ui_page, files, scripts)
config.lua              Shared config: command, keybind, stream interval
client.lua              NUI callbacks, focus handling, command + keymapping
server.lua              Client <-> server round trips
web/
  index.html            Vite entry (source, not the ui_page)
  src/
    main.tsx            React root + browser-dev background
    index.css           Tailwind layers and base styles
    components/
      App.tsx           Demo shell: header and the four cards
      demos.tsx         One card per way React and Lua talk
    hooks/
      useNuiEvent.ts    Subscribe to SendNUIMessage actions
      useNuiCallback.ts fetchNui with loading/error state
    providers/
      visibilityProvider  Show/hide wrapper, Escape closes the frame
      visibilityContext   Context + useVisibility()
    types/
      global.d.ts       Window augmentations for the CEF runtime
      nui.ts            Payload shapes shared with the Lua side
    utils/
      fetchNui.ts       POST to a NUI callback, with browser mock fallback
      debugData.ts      Emulate SendNUIMessage while in a browser
      browserMocks.ts   Fake Lua pushes so the demo works in a browser
      misc.ts           isEnvBrowser()
```

## Scripts

Run from `web/`:

| Command             | Description                          |
| ------------------- | ------------------------------------ |
| `bun run dev`       | Vite dev server with HMR             |
| `bun run build`     | Typecheck, then build to `web/build` |
| `bun run typecheck` | Typecheck only                       |
| `bun run lint`      | oxlint                               |
| `bun run preview`   | Serve the production build locally   |
