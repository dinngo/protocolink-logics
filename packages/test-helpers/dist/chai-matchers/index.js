"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
require("./types");
const change_balance_1 = require("./change-balance");
const chai_1 = require("chai");
(0, chai_1.use)(function (chai, utils) {
    (0, change_balance_1.supportChangeBalance)(chai.Assertion, utils);
});
//# sourceMappingURL=index.js.map