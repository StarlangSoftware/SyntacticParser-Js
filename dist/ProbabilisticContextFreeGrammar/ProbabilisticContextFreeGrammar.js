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
        /**
         * Constructor for the ProbabilisticContextFreeGrammar class. Reads the rules from the rule file, lexicon rules from
         * the dictionary file and sets the minimum frequency parameter.
         * @param ruleFileName File name for the rule file.
         * @param dictionaryFileName File name for the lexicon file.
         * @param minCount Minimum frequency parameter.
         */
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
        /**
         * Another constructor for the ProbabilisticContextFreeGrammar class. Constructs the lexicon from the leaf nodes of
         * the trees in the given treebank. Extracts rules from the non-leaf nodes of the trees in the given treebank. Also
         * sets the minimum frequency parameter.
         * @param treeBank Treebank containing the constituency trees.
         * @param minCount Minimum frequency parameter.
         */
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
        /**
         * Converts a parse node in a tree to a rule. The symbol in the parse node will be the symbol on the leaf side of the
         * rule, the symbols in the child nodes will be the symbols on the right hand side of the rule.
         * @param parseNode Parse node for which a rule will be created.
         * @param trim If true, the tags will be trimmed. If the symbol's data contains '-' or '=', this method trims all
         *             characters after those characters.
         * @return A new rule constructed from a parse node and its children.
         */
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
        /**
         * Recursive method to generate all rules from a subtree rooted at the given node.
         * @param parseNode Root node of the subtree.
         */
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
        /**
         * Calculates the probability of a parse node.
         * @param parseNode Parse node for which probability is calculated.
         * @return Probability of a parse node.
         */
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
        /**
         * Calculates the probability of a parse tree.
         * @param parseTree Parse tree for which probability is calculated.
         * @return Probability of the parse tree.
         */
        probabilityOfParseTree(parseTree) {
            return this.probabilityOfParseNode(parseTree.getRoot());
        }
        /**
         * In conversion to Chomsky Normal Form, rules like X -> Y are removed and new rules for every rule as Y -> beta are
         * replaced with X -> beta. The method first identifies all X -> Y rules. For every such rule, all rules Y -> beta
         * are identified. For every such rule, the method adds a new rule X -> beta. Every Y -> beta rule is then deleted.
         * The method also calculates the probability of the new rules based on the previous rules.
         */
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
        /**
         * In conversion to Chomsky Normal Form, rules like A -> BC... are replaced with A -> X1... and X1 -> BC. This
         * method determines such rules and for every such rule, it adds new rule X1->BC and updates rule A->BC to A->X1.
         * The method sets the probability of the rules X1->BC to 1, and calculates the probability of the rules A -> X1...
         */
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
        /**
         * The method converts the grammar into Chomsky normal form. First, rules like X -> Y are removed and new rules for
         * every rule as Y -> beta are replaced with X -> beta. Second, rules like A -> BC... are replaced with A -> X1...
         * and X1 -> BC.
         */
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