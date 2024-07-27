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
        /**
         * Constructor for any probabilistic rule from a string. The string is of the form X -> .... [probability] The
         * method constructs left hand side symbol and right hand side symbol(s) from the input string.
         * @param rule String containing the rule. The string is of the form X -> .... [probability]
         */
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
        /**
         * Accessor for the probability attribute.
         * @return Probability attribute.
         */
        getProbability() {
            return this.probability;
        }
        /**
         * Increments the count attribute.
         */
        increment() {
            this.count++;
        }
        /**
         * Calculates the probability from count and the given total value.
         * @param total Value used for calculating the probability.
         */
        normalizeProbability(total) {
            this.probability = this.count / total;
        }
        /**
         * Accessor for the count attribute
         * @return Count attribute
         */
        getCount() {
            return this.count;
        }
        /**
         * Converts the rule to the form X -> ... [probability]
         * @return String form of the rule in the form of X -> ... [probability]
         */
        toString() {
            return super.toString() + " [" + this.probability + "]";
        }
    }
    exports.ProbabilisticRule = ProbabilisticRule;
});
//# sourceMappingURL=ProbabilisticRule.js.map