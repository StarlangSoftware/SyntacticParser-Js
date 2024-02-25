(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.RuleType = void 0;
    var RuleType;
    (function (RuleType) {
        RuleType[RuleType["TERMINAL"] = 0] = "TERMINAL";
        RuleType[RuleType["SINGLE_NON_TERMINAL"] = 1] = "SINGLE_NON_TERMINAL";
        RuleType[RuleType["TWO_NON_TERMINAL"] = 2] = "TWO_NON_TERMINAL";
        RuleType[RuleType["MULTIPLE_NON_TERMINAL"] = 3] = "MULTIPLE_NON_TERMINAL";
    })(RuleType = exports.RuleType || (exports.RuleType = {}));
});
//# sourceMappingURL=RuleType.js.map