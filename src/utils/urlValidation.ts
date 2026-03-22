import validUrl from 'valid-url';

const SHORT_CODE_PATTERN = /^[A-Za-z0-9_-]{4,32}$/;

function isPrivateIpv4(host: string): boolean {
    const parts = host.split('.').map((part) => Number(part));
    if (parts.length !== 4 || parts.some((n) => Number.isNaN(n) || n < 0 || n > 255)) {
        return false;
    }

    if (parts[0] === 10) return true;
    if (parts[0] === 127) return true;
    if (parts[0] === 169 && parts[1] === 254) return true;
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    if (parts[0] === 192 && parts[1] === 168) return true;
    return false;
}

function isLocalHostname(host: string): boolean {
    const normalized = host.trim().toLowerCase();
    return normalized === 'localhost' || normalized.endsWith('.local');
}

export function isSafeShortCode(code: string): boolean {
    return SHORT_CODE_PATTERN.test(code);
}

export function isSafeHttpUrl(url: string): boolean {
    if (!url || typeof url !== 'string' || url.length > 2048) {
        return false;
    }

    if (!validUrl.isWebUri(url)) {
        return false;
    }

    try {
        const parsed = new URL(url);
        const host = parsed.hostname;
        if (isLocalHostname(host) || isPrivateIpv4(host)) {
            return false;
        }
        return true;
    } catch {
        return false;
    }
}
