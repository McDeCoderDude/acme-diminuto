import shortid from 'shortid';

const DEFAULT_EXCLUDED_URL_CODE_CHARACTERS = '_-';
const MAX_GENERATION_ATTEMPTS = 25;

export function getExcludedUrlCodeCharacters(rawValue = process.env.URL_CODE_EXCLUDED_CHARS): string[] {
    const normalized = (rawValue || DEFAULT_EXCLUDED_URL_CODE_CHARACTERS).replace(/\s+/g, '');
    return [...new Set(normalized.split('').filter(Boolean))];
}

export function hasExcludedUrlCodeCharacters(
    code: string,
    excludedCharacters = getExcludedUrlCodeCharacters()
): boolean {
    return excludedCharacters.some((character) => code.includes(character));
}

export function generateUrlCode(
    generate: () => string = shortid.generate,
    excludedCharacters = getExcludedUrlCodeCharacters()
): string {
    for (let attempt = 0; attempt < MAX_GENERATION_ATTEMPTS; attempt += 1) {
        const candidate = generate();
        if (!hasExcludedUrlCodeCharacters(candidate, excludedCharacters)) {
            return candidate;
        }
    }

    throw new Error('Unable to generate a URL code without excluded characters');
}
