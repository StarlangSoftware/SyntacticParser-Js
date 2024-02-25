(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./RuleType", "nlptoolkit-parsetree/dist/Symbol"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.Rule = void 0;
    const RuleType_1 = require("./RuleType");
    const Symbol_1 = require("nlptoolkit-parsetree/dist/Symbol");
    class Rule {
        constructor(param1, param2, param3) {
            if (param1 == undefined) {
                this.constructor1();
            }
            else {
                if (param1 instanceof Symbol_1.Symbol && param2 instanceof Symbol_1.Symbol && param3 == undefined) {
                    this.constructor2(param1, param2);
                }
                else {
                    if (param1 instanceof Symbol_1.Symbol && param2 instanceof Symbol_1.Symbol && param3 instanceof Symbol_1.Symbol) {
                        this.constructor3(param1, param2, param3);
                    }
                    else {
                        if (param1 instanceof Symbol_1.Symbol && Array.isArray(param2) && param3 == undefined) {
                            this.constructor4(param1, param2);
                        }
                        else {
                            if (param1 instanceof Symbol_1.Symbol && Array.isArray(param2) && param3 != undefined) {
                                this.constructor5(param1, param2, param3);
                            }
                            else {
                                if (typeof param1 == "string") {
                                    this.constructor6(param1);
                                }
                            }
                        }
                    }
                }
            }
        }
        constructor1() {
            this.rightHandSide = [];
        }
        constructor2(leftHandSide, rightHandSideSymbol) {
            this.leftHandSide = leftHandSide;
            this.rightHandSide = [];
            this.rightHandSide.push(rightHandSideSymbol);
        }
        constructor3(leftHandSide, rightHandSideSymbol1, rightHandSideSymbol2) {
            this.constructor2(leftHandSide, rightHandSideSymbol1);
            this.rightHandSide.push(rightHandSideSymbol2);
        }
        constructor4(leftHandSide, rightHandSide) {
            this.leftHandSide = leftHandSide;
            this.rightHandSide = rightHandSide;
        }
        constructor5(leftHandSide, rightHandSide, type) {
            this.leftHandSide = leftHandSide;
            this.rightHandSide = rightHandSide;
            this.type = type;
        }
        constructor6(rule) {
            let left = rule.substring(0, rule.indexOf("->")).trim();
            let right = rule.substring(rule.indexOf("->") + 2).trim();
            this.leftHandSide = new Symbol_1.Symbol(left);
            let rightSide = right.split(" ");
            this.rightHandSide = [];
            for (let i = 0; i < rightSide.length; i++) {
                this.rightHandSide.push(new Symbol_1.Symbol(rightSide[i]));
            }
        }
        leftRecursive() {
            return this.rightHandSide[0].getName() == this.leftHandSide.getName() && this.type == RuleType_1.RuleType.SINGLE_NON_TERMINAL;
        }
        updateMultipleNonTerminal(first, second, _with) {
            for (let i = 0; i < this.rightHandSide.length - 1; i++) {
                if (this.rightHandSide[i].getName() == first.getName() && this.rightHandSide[i + 1].getName() == second.getName()) {
                    this.rightHandSide.splice(i + 1, 1);
                    this.rightHandSide.splice(i, 1);
                    this.rightHandSide.splice(i, 0, _with);
                    if (this.rightHandSide.length == 2) {
                        this.type = RuleType_1.RuleType.TWO_NON_TERMINAL;
                    }
                    return true;
                }
            }
            return false;
        }
        getType() {
            return this.type;
        }
        setType(type) {
            this.type = type;
        }
        getLeftHandSide() {
            return this.leftHandSide;
        }
        getRightHandSide() {
            return this.rightHandSide;
        }
        getRightHandSideSize() {
            return this.rightHandSide.length;
        }
        getRightHandSideAt(index) {
            return this.rightHandSide[index];
        }
        toString() {
            let result = this.leftHandSide + " -> ";
            for (let symbol of this.rightHandSide) {
                result = result + " " + symbol;
            }
            return result;
        }
    }
    exports.Rule = Rule;
});
//# sourceMappingURL=Rule.js.map