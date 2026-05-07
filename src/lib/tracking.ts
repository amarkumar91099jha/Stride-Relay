export function generateTrackingToken(): string {
    return "tk-" + crypto.randomUUID().slice(0, 12);
}
