"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = require("vitest/config");
exports.default = (0, config_1.defineConfig)({
    test: {
        environment: 'node',
        include: ['src/**/*.test.ts'],
        coverage: {
            provider: 'v8',
            include: ['src/routes/**/*.ts', 'src/utils/**/*.ts'],
            exclude: ['src/**/*.test.ts'],
            thresholds: {
                lines: 85,
                functions: 85,
                statements: 85,
                branches: 85
            }
        }
    }
});
//# sourceMappingURL=vitest.config.js.map