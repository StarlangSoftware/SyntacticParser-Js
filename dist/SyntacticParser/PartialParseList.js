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
    exports.PartialParseList = void 0;
    class PartialParseList {
        constructor() {
            this.partialParses = [];
        }
        addPartialParse(parseNode) {
            this.partialParses.push(parseNode);
        }
        updatePartialParse(parseNode) {
            let found = false;
            for (let i = 0; i < this.partialParses.length; i++) {
                let partialParse = this.partialParses[i];
                if (partialParse.getData().getName() == parseNode.getData().getName()) {
                    if (partialParse.getLogProbability() < parseNode.getLogProbability()) {
                        this.partialParses.splice(i, 1);
                        this.partialParses.push(parseNode);
                    }
                    found = true;
                    break;
                }
            }
            if (!found) {
                this.partialParses.push(parseNode);
            }
        }
        getPartialParse(index) {
            return this.partialParses[index];
        }
        size() {
            return this.partialParses.length;
        }
    }
    exports.PartialParseList = PartialParseList;
});
//# sourceMappingURL=PartialParseList.js.map