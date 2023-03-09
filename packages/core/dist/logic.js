"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LogicDefinitionDecorator = exports.Logic = void 0;
const tslib_1 = require("tslib");
const common = tslib_1.__importStar(require("@composable-router/common"));
const path_1 = tslib_1.__importDefault(require("path"));
class Logic extends common.Web3Toolkit {
    static get rid() {
        return `${this.protocol}:${this.id}`;
    }
}
exports.Logic = Logic;
function LogicDefinitionDecorator() {
    return (logic) => {
        const [, , , logicFilePath] = common.getErrorStackCallerPaths();
        logic.id = path_1.default.basename(logicFilePath).split('.')[1];
        logic.protocol = path_1.default.basename(path_1.default.dirname(logicFilePath));
    };
}
exports.LogicDefinitionDecorator = LogicDefinitionDecorator;
//# sourceMappingURL=logic.js.map