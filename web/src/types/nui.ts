export interface Vector3 {
    x: number;
    y: number;
    z: number;
}

export interface PlayerData {
    ped: number;
    coords: Vector3;
    heading: number;
    health: number;
    armour: number;
    serverId: number;
    name: string;
}

export type NotifyStyle = "info" | "success" | "warning" | "error";

export interface NotifyRequest {
    message: string;
    style: NotifyStyle;
}

export interface NotifyResponse {
    ok: boolean;
    shownAt: number;
}

export interface RequestAck {
    pending: boolean;
}

export interface ServerInfo {
    resource: string;
    players: number;
    maxPlayers: number;
    uptime: number;
    timestamp: number;
}

export interface Tick {
    health: number;
    armour: number;
    speed: number;
    heading: number;
    coords: Vector3;
    clock: string;
}

export interface Notice {
    message: string;
    style: NotifyStyle;
}
