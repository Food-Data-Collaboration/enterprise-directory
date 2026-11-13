import structure from "./_structure.scss?raw";

function scssPixels(name: string): number {
    const match = structure.match(new RegExp(`\\$${name}:\\s*(\\d+(?:\\.\\d+)?)px`));
    if (!match) throw new Error(`$${name} not found in _structure.scss`);
    return Number.parseFloat(match[1]);
}

export const BREAKPOINT_MEDIUM = scssPixels("breakpoint-medium");
