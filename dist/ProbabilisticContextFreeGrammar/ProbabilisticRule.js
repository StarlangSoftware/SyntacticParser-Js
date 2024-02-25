(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../ContextFreeGrammar/Rule", "nlptoolkit-parsetree/dist/Symbol"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ProbabilisticRule = void 0;
    const Rule_1 = require("../ContextFreeGrammar/Rule");
    const Symbol_1 = require("nlptoolkit-parsetree/dist/Symbol");
    class ProbabilisticRule extends Rule_1.Rule {
        constructor(param1, param2, param3, param4) {
            super();
            this.probability = 0.0;
            this.count = 0;
            if (param1 instanceof Symbol_1.Symbol && Array.isArray(param2) && param3 == undefined) {
                super(param1, param2);
            }
            else {
                if (param1 instanceof Symbol_1.Symbol && Array.isArray(param2) && param3 != undefined) {
                    super(param1, param2, param3);
                    this.probability = param4;
                }
                else {
                    if (typeof param1 == "string") {
                        this.constructor6(param1);
                    }
                }
            }
        }
        constructor6(rule) {
            let prob = rule.substring(rule.indexOf('[') + 1, rule.indexOf(']'));
            let left = rule.substring(0, rule.indexOf("->")).trim();
            let right = rule.substring(rule.indexOf("->") + 2, rule.indexOf('[')).trim();
            this.leftHandSide = new Symbol_1.Symbol(left);
            let rightSide = right.split(" ");
            this.rightHandSide = [];
            for (let i = 0; i < rightSide.length; i++) {
                this.rightHandSide.push(new Symbol_1.Symbol(rightSide[i]));
            }
            this.probability = parseFloat(prob);
        }
        getProbability() {
            return this.probability;
        }
        increment() {
            this.count++;
        }
        normalizeProbability(total) {
            this.probability = this.count / total;
        }
        getCount() {
            return this.count;
        }
        toString() {
            return super.toString() + " [" + this.probability + "]";
        }
    }
    exports.ProbabilisticRule = ProbabilisticRule;
});
//# sourceMappingURL=ProbabilisticRule.js.map