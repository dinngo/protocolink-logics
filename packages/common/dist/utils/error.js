"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getErrorStackCallerPaths = void 0;
function getErrorStackCallerPaths() {
    const filePaths = [];
    const stack = new Error().stack;
    if (stack) {
        const stackLines = stack.split('\n');
        for (const stackLine of stackLines) {
            const matches = stackLine.match(/^[^\/]+([^\:]+)\:/);
            if (matches) {
                filePaths.push(matches[1]);
            }
        }
    }
    return filePaths;
}
exports.getErrorStackCallerPaths = getErrorStackCallerPaths;
//# sourceMappingURL=error.js.map