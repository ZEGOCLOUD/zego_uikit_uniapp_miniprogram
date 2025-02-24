export * from "./logger";

let listenerSeed = 0

export function makeListenerID(): string {
    return `listener_${Date.now()}_${listenerSeed++}`
}