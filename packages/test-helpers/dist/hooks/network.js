"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.snapshotAndRevertEach = exports.snapshotAndRevertOnce = void 0;
const utils_1 = require("../utils");
function snapshotAndRevertOnce() {
    before(async function () {
        await (0, utils_1.snapshot)();
    });
    after(async function () {
        await (0, utils_1.revert)();
    });
}
exports.snapshotAndRevertOnce = snapshotAndRevertOnce;
function snapshotAndRevertEach() {
    beforeEach(async function () {
        await (0, utils_1.snapshot)();
    });
    afterEach(async function () {
        await (0, utils_1.revert)();
    });
}
exports.snapshotAndRevertEach = snapshotAndRevertEach;
//# sourceMappingURL=network.js.map