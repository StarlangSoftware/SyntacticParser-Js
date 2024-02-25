(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "../ContextFreeGrammar/ContextFreeGrammar", "nlptoolkit-parsetree/dist/TreeBank", "fs", "./ProbabilisticRule", "nlptoolkit-parsetree/dist/Symbol", "../ContextFreeGrammar/RuleType"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ProbabilisticContextFreeGrammar = void 0;
    const ContextFreeGrammar_1 = require("../ContextFreeGrammar/ContextFreeGrammar");
    const TreeBank_1 = require("nlptoolkit-parsetree/dist/TreeBank");
    const fs = require("fs");
    const ProbabilisticRule_1 = require("./ProbabilisticRule");
    const Symbol_1 = require("nlptoolkit-parsetree/dist/Symbol");
    const RuleType_1 = require("../ContextFreeGrammar/RuleType");
    class ProbabilisticContextFreeGrammar extends ContextFreeGrammar_1.ContextFreeGrammar {
        constructor2(ruleFileName, dictionaryFileName, minCount) {
            let data = fs.readFileSync(ruleFileName, 'utf8');
            let lines = data.split("\n");
            for (let line of lines) {
                let newRule = new ProbabilisticRule_1.ProbabilisticRule(line);
                this.rules.push(newRule);
                this.rulesRightSorted.push(newRule);
            }
            this.rules.sort(this.ruleComparator);
            this.rulesRightSorted.sort(this.ruleRightComparator);
            this.readDictionary(dictionaryFileName);
            this.updateTypes();
            this.minCount = minCount;
        }
        constructor3(treeBank, minCount) {
            this.constructDictionary(treeBank);
            for (let i = 0; i < treeBank.size(); i++) {
                let parseTree = treeBank.get(i);
                this.updateTree(parseTree, minCount);
                this.addRules(parseTree.getRoot());
            }
            let variables = this.getLeftSide();
            for (let variable of variables) {
                let candidates = this.getRulesWithLeftSideX(variable);
                let total = 0;
                for (let candidate of candidates) {
                    total += candidate.getCount();
                }
                for (let candidate of candidates) {
                    candidate.normalizeProbability(total);
                }
            }
            this.updateTypes();
            this.minCount = minCount;
        }
        constructor(param1, param2, param3) {
            if (param1 == undefined) {
                super();
            }
            else {
                if (typeof param1 == "string" && typeof param2 == "string") {
                    super();
                    this.constructor2(param1, param2, param3);
                }
                else {
                    if (param1 instanceof TreeBank_1.TreeBank && typeof param2 == "number") {
                        super();
                        this.constructor3(param1, param2);
                    }
                }
            }
        }
        static toRule(parseNode, trim) {
            let right = [];
            let left;
            if (trim)
                left = parseNode.getData().trimSymbol();
            else
                left = parseNode.getData();
            for (let i = 0; i < parseNode.numberOfChildren(); i++) {
                let childNode = parseNode.getChild(i);
                if (childNode.getData() != null) {
                    if (childNode.getData().isTerminal()) {
                        right.push(childNode.getData());
                    }
                    else {
                        right.push(childNode.getData().trimSymbol());
                    }
                }
                else {
                    return null;
                }
            }
            return new ProbabilisticRule_1.ProbabilisticRule(left, right);
        }
        addRules(parseNode) {
            let newRule = ProbabilisticContextFreeGrammar.toRule(parseNode, true);
            if (newRule != null) {
                let existedRule = this.searchRule(newRule);
                if (existedRule == null) {
                    this.addRule(newRule);
                    newRule.increment();
                }
                else {
                    existedRule.increment();
                }
            }
            for (let i = 0; i < parseNode.numberOfChildren(); i++) {
                let childNode = parseNode.getChild(i);
                if (childNode.numberOfChildren() > 0) {
                    this.addRules(childNode);
                }
            }
        }
        probabilityOfParseNode(parseNode) {
            let sum = 0.0;
            if (parseNode.numberOfChildren() > 0) {
                let rule = ProbabilisticContextFreeGrammar.toRule(parseNode, true);
                let existedRule = this.searchRule(rule);
                sum = Math.log(existedRule.getProbability());
                if (existedRule.getType() != RuleType_1.RuleType.TERMINAL) {
                    for (let i = 0; i < parseNode.numberOfChildren(); i++) {
                        let childNode = parseNode.getChild(i);
                        sum += this.probabilityOfParseNode(childNode);
                    }
                }
            }
            return sum;
        }
        probabilityOfParseTree(parseTree) {
            return this.probabilityOfParseNode(parseTree.getRoot());
        }
        removeSingleNonTerminalFromRightHandSide() {
            let nonTerminalList = [];
            let removeCandidate = this.getSingleNonTerminalCandidateToRemove(nonTerminalList);
            while (removeCandidate != null) {
                let ruleList = this.getRulesWithRightSideX(removeCandidate);
                for (let rule of ruleList) {
                    let candidateList = this.getRulesWithLeftSideX(removeCandidate);
                    for (let candidate of candidateList) {
                        let clone = [];
                        for (let symbol of candidate.getRightHandSide()) {
                            clone.push(symbol);
                        }
                        this.addRule(new ProbabilisticRule_1.ProbabilisticRule(rule.getLeftHandSide(), clone, candidate.getType(), rule.getProbability() * candidate.getProbability()));
                    }
                    this.removeRule(rule);
                }
                nonTerminalList.push(removeCandidate);
                removeCandidate = this.getSingleNonTerminalCandidateToRemove(nonTerminalList);
            }
        }
        updateMultipleNonTerminalFromRightHandSide() {
            let newVariableCount = 0;
            let updateCandidate = this.getMultipleNonTerminalCandidateToUpdate();
            while (updateCandidate != null) {
                let newRightHandSide = [];
                let newSymbol = new Symbol_1.Symbol("X" + newVariableCount);
                newRightHandSide.push(updateCandidate.getRightHandSideAt(0));
                newRightHandSide.push(updateCandidate.getRightHandSideAt(1));
                this.updateAllMultipleNonTerminalWithNewRule(updateCandidate.getRightHandSideAt(0), updateCandidate.getRightHandSideAt(1), newSymbol);
                this.addRule(new ProbabilisticRule_1.ProbabilisticRule(newSymbol, newRightHandSide, RuleType_1.RuleType.TWO_NON_TERMINAL, 1.0));
                updateCandidate = this.getMultipleNonTerminalCandidateToUpdate();
                newVariableCount++;
            }
        }
        convertToChomskyNormalForm() {
            this.removeSingleNonTerminalFromRightHandSide();
            this.updateMultipleNonTerminalFromRightHandSide();
            this.rules.sort(this.ruleComparator);
            this.rulesRightSorted.sort(this.ruleRightComparator);
        }
    }
    exports.ProbabilisticContextFreeGrammar = ProbabilisticContextFreeGrammar;
});
//# sourceMappingURL=ProbabilisticContextFreeGrammar.js.map