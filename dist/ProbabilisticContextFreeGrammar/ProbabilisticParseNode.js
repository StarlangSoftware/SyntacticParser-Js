(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "nlptoolkit-parsetree/dist/ParseNode"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ProbabilisticParseNode = void 0;
    const ParseNode_1 = require("nlptoolkit-parsetree/dist/ParseNode");
    class ProbabilisticParseNode extends ParseNode_1.ParseNode {
        /**
         * Constructor for the ProbabilisticParseNode class. Extends the parse node with a probability.
         * @param param1 Left child of this node.
         * @param param2 Right child of this node.
         * @param param3 Data for this node.
         * @param param4 Logarithm of the probability of the node.
         */
        constructor(param1, param2, param3, param4) {
            if (param4 != undefined) {
                super(param1, param2, param3);
                this.logProbability = param4;
            }
            else {
                if (param3 != undefined && typeof param3 == "number") {
                    super(param1, param2);
                    this.logProbability = param3;
                }
                else {
                    if (typeof param2 == "number") {
                        super(param1);
                        this.logProbability = param2;
                    }
                }
            }
        }
        /**
         * Accessor for the logProbability attribute.
         * @return logProbability attribute.
         */
        getLogProbability() {
            return this.logProbability;
        }
    }
    exports.ProbabilisticParseNode = ProbabilisticParseNode;
});
//# sourceMappingURL=ProbabilisticParseNode.js.map