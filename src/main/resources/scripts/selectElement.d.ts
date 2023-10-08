export function selectElement<T extends typeof Element>(
    selector: string,
    elementType: T,
): T["prototype"];
