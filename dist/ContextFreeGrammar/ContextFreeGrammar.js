(function (factory) {
    if (typeof module === "object" && typeof module.exports === "object") {
        var v = factory(require, exports);
        if (v !== undefined) module.exports = v;
    }
    else if (typeof define === "function" && define.amd) {
        define(["require", "exports", "./Rule", "nlptoolkit-parsetree/dist/Symbol", "nlptoolkit-datastructure/dist/CounterHashMap", "nlptoolkit-parsetree/dist/TreeBank", "fs", "./RuleType", "nlptoolkit-dictionary/dist/Dictionary/Word", "nlptoolkit-parsetree/dist/NodeCollector", "nlptoolkit-parsetree/dist/NodeCondition/IsLeaf"], factory);
    }
})(function (require, exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.ContextFreeGrammar = void 0;
    const Rule_1 = require("./Rule");
    const Symbol_1 = require("nlptoolkit-parsetree/dist/Symbol");
    const CounterHashMap_1 = require("nlptoolkit-datastructure/dist/CounterHashMap");
    const TreeBank_1 = require("nlptoolkit-parsetree/dist/TreeBank");
    const fs = require("fs");
    const RuleType_1 = require("./RuleType");
    const Word_1 = require("nlptoolkit-dictionary/dist/Dictionary/Word");
    const NodeCollector_1 = require("nlptoolkit-parsetree/dist/NodeCollector");
    const IsLeaf_1 = require("nlptoolkit-parsetree/dist/NodeCondition/IsLeaf");
    class ContextFreeGrammar {
        constructor(param1, param2, param3) {
            this.rules = [];
            this.rulesRightSorted = [];
            this.ruleLeftComparator = (ruleA, ruleB) => (ruleA.getLeftHandSide().getName().localeCompare(ruleB.getLeftHandSide().getName()));
            this.ruleRightComparator = (ruleA, ruleB) => (this.ruleRightCompare(ruleA, ruleB));
            this.ruleComparator = (ruleA, ruleB) => (ruleA.getLeftHandSide().getName() != ruleB.getLeftHandSide().getName() ? this.ruleLeftComparator(ruleA, ruleB) : this.ruleRightComparator(ruleA, ruleB));
            this.dictionary = new CounterHashMap_1.CounterHashMap();
            this.rules = [];
            this.rulesRightSorted = [];
            if (param1 == undefined) {
                this.constructor1();
            }
            else {
                if (typeof param1 == "string" && typeof param2 == "string") {
                    this.constructor2(param1, param2, param3);
                }
                else {
                    if (param1 instanceof TreeBank_1.TreeBank && typeof param2 == "number") {
                        this.constructor3(param1, param2);
                    }
                }
            }
        }
        constructor1() {
            this.minCount = 1;
        }
        constructor2(ruleFileName, dictionaryFileName, minCount) {
            let data = fs.readFileSync(ruleFileName, 'utf8');
            let lines = data.split("\n");
            for (let line of lines) {
                let newRule = new Rule_1.Rule(line);
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
            this.updateTypes();
            this.minCount = minCount;
        }
        readDictionary(dictionaryFileName) {
            let data = fs.readFileSync(dictionaryFileName, 'utf8');
            let lines = data.split("\n");
            for (let line of lines) {
                let items = line.split(" ");
                this.dictionary.putNTimes(items[0], parseInt(items[1]));
            }
        }
        constructDictionary(treeBank) {
            for (let i = 0; i < treeBank.size(); i++) {
                let parseTree = treeBank.get(i);
                let nodeCollector = new NodeCollector_1.NodeCollector(parseTree.getRoot(), new IsLeaf_1.IsLeaf());
                let leafList = nodeCollector.collect();
                for (let parseNode of leafList) {
                    this.dictionary.put(parseNode.getData().getName());
                }
            }
        }
        ruleRightCompare(ruleA, ruleB) {
            let i = 0;
            while (i < ruleA.getRightHandSideSize() && i < ruleB.getRightHandSideSize()) {
                if (ruleA.getRightHandSideAt(i).getName() == ruleB.getRightHandSideAt(i).getName()) {
                    i++;
                }
                else {
                    return ruleA.getRightHandSideAt(i).getName().localeCompare(ruleB.getRightHandSideAt(i).getName());
                }
            }
            if (ruleA.getRightHandSideSize() < ruleB.getRightHandSideSize()) {
                return -1;
            }
            else {
                if (ruleA.getRightHandSideSize() > ruleB.getRightHandSideSize()) {
                    return 1;
                }
                else {
                    return 0;
                }
            }
        }
        updateTypes() {
            let nonTerminals = new Set();
            for (let rule of this.rules) {
                nonTerminals.add(rule.getLeftHandSide().getName());
            }
            for (let rule of this.rules) {
                if (rule.getRightHandSideSize() > 2) {
                    rule.setType(RuleType_1.RuleType.MULTIPLE_NON_TERMINAL);
                }
                else {
                    if (rule.getRightHandSideSize() == 2) {
                        rule.setType(RuleType_1.RuleType.TWO_NON_TERMINAL);
                    }
                    else {
                        if (rule.getRightHandSideAt(0).isTerminal() || Word_1.Word.isPunctuation(rule.getRightHandSideAt(0).getName()) || !nonTerminals.has(rule.getRightHandSideAt(0).getName())) {
                            rule.setType(RuleType_1.RuleType.TERMINAL);
                        }
                        else {
                            rule.setType(RuleType_1.RuleType.SINGLE_NON_TERMINAL);
                        }
                    }
                }
            }
        }
        updateTree(parseTree, minCount) {
            let nodeCollector = new NodeCollector_1.NodeCollector(parseTree.getRoot(), new IsLeaf_1.IsLeaf());
            let leafList = nodeCollector.collect();
            let pattern1 = RegExp("^\\+?\\d+$");
            let pattern2 = RegExp("^\\+?(\\d+)?\\.\\d*$");
            for (let parseNode of leafList) {
                let data = parseNode.getData().getName();
                if (data.match(pattern1) != null || (data.match(pattern2) != null && data != ".")) {
                    parseNode.setData(new Symbol_1.Symbol("_num_"));
                }
                else {
                    if (this.dictionary.count(data) < minCount) {
                        parseNode.setData(new Symbol_1.Symbol("_rare_"));
                    }
                }
            }
        }
        removeExceptionalWordsFromSentence(sentence) {
            let pattern1 = RegExp("^\\+?\\d+$");
            let pattern2 = RegExp("^\\+?(\\d+)?\\.\\d*$");
            for (let i = 0; i < sentence.wordCount(); i++) {
                let word = sentence.getWord(i);
                if (word.getName().match(pattern1) != null || (word.getName().match(pattern2) != null && word.getName() != ".")) {
                    word.setName("_num_");
                }
                else {
                    if (this.dictionary.count(word.getName()) < this.minCount) {
                        word.setName("_rare_");
                    }
                }
            }
        }
        reinsertExceptionalWordsFromSentence(parseTree, sentence) {
            let nodeCollector = new NodeCollector_1.NodeCollector(parseTree.getRoot(), new IsLeaf_1.IsLeaf());
            let leafList = nodeCollector.collect();
            for (let i = 0; i < leafList.length; i++) {
                let treeWord = leafList[i].getData().getName();
                let sentenceWord = sentence.getWord(i).getName();
                if (treeWord == "_rare_" || treeWord == "_num_") {
                    leafList[i].setData(new Symbol_1.Symbol(sentenceWord));
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
                    if (childNode.getData().isTerminal() || !trim) {
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
            return new Rule_1.Rule(left, right);
        }
        addRules(parseNode) {
            let newRule = ContextFreeGrammar.toRule(parseNode, true);
            if (newRule != null) {
                this.addRule(newRule);
            }
            for (let i = 0; i < parseNode.numberOfChildren(); i++) {
                let childNode = parseNode.getChild(i);
                if (childNode.numberOfChildren() > 0) {
                    this.addRules(childNode);
                }
            }
        }
        binarySearch(rules, rule, comparator) {
            let lo = 0;
            let hi = rules.length - 1;
            while (lo <= hi) {
                let mid = Math.floor((lo + hi) / 2);
                if (comparator(rules[mid], rule) == 0) {
                    return mid;
                }
                if (comparator(rules[mid], rule) <= 0) {
                    lo = mid + 1;
                }
                else {
                    hi = mid - 1;
                }
            }
            return -(lo + 1);
        }
        addRule(newRule) {
            let pos = this.binarySearch(this.rules, newRule, this.ruleComparator);
            if (pos < 0) {
                this.rules.splice(-pos - 1, 0, newRule);
                pos = this.binarySearch(this.rulesRightSorted, newRule, this.ruleRightComparator);
                if (pos >= 0) {
                    this.rulesRightSorted.splice(pos, 0, newRule);
                }
                else {
                    this.rulesRightSorted.splice(-pos - 1, 0, newRule);
                }
            }
        }
        removeRule(rule) {
            let pos = this.binarySearch(this.rules, rule, this.ruleComparator);
            if (pos >= 0) {
                this.rules.splice(pos, 1);
                pos = this.binarySearch(this.rulesRightSorted, rule, this.ruleRightComparator);
                let posUp = pos;
                while (posUp >= 0 && this.ruleRightComparator(this.rulesRightSorted[posUp], rule) == 0) {
                    if (this.ruleComparator(rule, this.rulesRightSorted[posUp]) == 0) {
                        this.rulesRightSorted.splice(posUp, 1);
                        return;
                    }
                    posUp--;
                }
                let posDown = pos + 1;
                while (posDown < this.rulesRightSorted.length && this.ruleRightComparator(this.rulesRightSorted[posDown], rule) == 0) {
                    if (this.ruleComparator(rule, this.rulesRightSorted[posDown]) == 0) {
                        this.rulesRightSorted.splice(posDown, 1);
                        return;
                    }
                    posDown++;
                }
            }
        }
        /*Return rules such as X -> ... */
        getRulesWithLeftSideX(X) {
            let result = [];
            let dummyRule = new Rule_1.Rule(X, X);
            let middle = this.binarySearch(this.rules, dummyRule, this.ruleLeftComparator);
            if (middle >= 0) {
                let middleUp = middle;
                while (middleUp >= 0 && this.rules[middleUp].getLeftHandSide().getName() == X.getName()) {
                    result.push(this.rules[middleUp]);
                    middleUp--;
                }
                let middleDown = middle + 1;
                while (middleDown < this.rules.length && this.rules[middleDown].getLeftHandSide().getName() == X.getName()) {
                    result.push(this.rules[middleDown]);
                    middleDown++;
                }
            }
            return result;
        }
        /*Return symbols X from terminal rules such as X -> a */
        partOfSpeechTags() {
            let result = [];
            for (let rule of this.rules) {
                if (rule.getType() == RuleType_1.RuleType.TERMINAL && !result.includes(rule.getLeftHandSide())) {
                    result.push(rule.getLeftHandSide());
                }
            }
            return result;
        }
        /*Return symbols X from all rules such as X -> ... */
        getLeftSide() {
            let result = [];
            for (let rule of this.rules) {
                if (!result.includes(rule.getLeftHandSide())) {
                    result.push(rule.getLeftHandSide());
                }
            }
            return result;
        }
        /*Return terminal rules such as X -> s*/
        getTerminalRulesWithRightSideX(S) {
            let result = [];
            let dummyRule = new Rule_1.Rule(S, S);
            let middle = this.binarySearch(this.rulesRightSorted, dummyRule, this.ruleRightCompare);
            if (middle >= 0) {
                let middleUp = middle;
                while (middleUp >= 0 && this.rulesRightSorted[middleUp].getRightHandSideAt(0).getName() == S.getName()) {
                    if (this.rulesRightSorted[middleUp].getType() == RuleType_1.RuleType.TERMINAL) {
                        result.push(this.rulesRightSorted[middleUp]);
                    }
                    middleUp--;
                }
                let middleDown = middle + 1;
                while (middleDown < this.rulesRightSorted.length && this.rulesRightSorted[middleDown].getRightHandSideAt(0).getName() == S.getName()) {
                    if (this.rulesRightSorted[middleDown].getType() == RuleType_1.RuleType.TERMINAL) {
                        result.push(this.rulesRightSorted[middleDown]);
                    }
                    middleDown++;
                }
            }
            return result;
        }
        getRulesWithRightSideX(S) {
            let result = [];
            let dummyRule = new Rule_1.Rule(S, S);
            let pos = this.binarySearch(this.rulesRightSorted, dummyRule, this.ruleRightCompare);
            if (pos >= 0) {
                let posUp = pos;
                while (posUp >= 0 && this.rulesRightSorted[posUp].getRightHandSideAt(0).getName() == S.getName() && this.rulesRightSorted[posUp].getRightHandSideSize() == 1) {
                    result.push(this.rulesRightSorted[posUp]);
                    posUp--;
                }
                let posDown = pos + 1;
                while (posDown < this.rulesRightSorted.length && this.rulesRightSorted[posDown].getRightHandSideAt(0).getName() == S.getName() && this.rulesRightSorted[posDown].getRightHandSideSize() == 1) {
                    result.push(this.rulesRightSorted[posDown]);
                    posDown++;
                }
            }
            return result;
        }
        /*Return rules such as X -> AB */
        getRulesWithTwoNonTerminalsOnRightSide(A, B) {
            let result = [];
            let dummyRule = new Rule_1.Rule(A, A, B);
            let pos = this.binarySearch(this.rulesRightSorted, dummyRule, this.ruleRightCompare);
            if (pos >= 0) {
                let posUp = pos;
                while (posUp >= 0 && this.rulesRightSorted[posUp].getRightHandSideSize() == 2 && this.rulesRightSorted[posUp].getRightHandSideAt(0).getName() == A.getName() && this.rulesRightSorted[posUp].getRightHandSideAt(1).getName() == B.getName()) {
                    result.push(this.rulesRightSorted[posUp]);
                    posUp--;
                }
                let posDown = pos + 1;
                while (posDown < this.rulesRightSorted.length && this.rulesRightSorted[posDown].getRightHandSideSize() == 2 && this.rulesRightSorted[posDown].getRightHandSideAt(0).getName() == A.getName() && this.rulesRightSorted[posDown].getRightHandSideAt(1).getName() == B.getName()) {
                    result.push(this.rulesRightSorted[posDown]);
                    posDown++;
                }
            }
            return result;
        }
        /*Return Y of the first rule such as X -> Y */
        getSingleNonTerminalCandidateToRemove(removedList) {
            let removeCandidate = null;
            for (let rule of this.rules) {
                if (rule.getType() == RuleType_1.RuleType.SINGLE_NON_TERMINAL && !rule.leftRecursive() && !removedList.includes(rule.getRightHandSideAt(0))) {
                    removeCandidate = rule.getRightHandSideAt(0);
                    break;
                }
            }
            return removeCandidate;
        }
        /*Return the first rule such as X -> ABC... */
        getMultipleNonTerminalCandidateToUpdate() {
            let removeCandidate = null;
            for (let rule of this.rules) {
                if (rule.getType() == RuleType_1.RuleType.MULTIPLE_NON_TERMINAL) {
                    removeCandidate = rule;
                    break;
                }
            }
            return removeCandidate;
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
                        this.addRule(new Rule_1.Rule(rule.getLeftHandSide(), clone, candidate.getType()));
                    }
                    this.removeRule(rule);
                }
                nonTerminalList.push(removeCandidate);
                removeCandidate = this.getSingleNonTerminalCandidateToRemove(nonTerminalList);
            }
        }
        updateAllMultipleNonTerminalWithNewRule(first, second, _with) {
            for (let rule of this.rules) {
                if (rule.getType() == RuleType_1.RuleType.MULTIPLE_NON_TERMINAL) {
                    rule.updateMultipleNonTerminal(first, second, _with);
                }
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
                this.addRule(new Rule_1.Rule(newSymbol, newRightHandSide, RuleType_1.RuleType.TWO_NON_TERMINAL));
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
        searchRule(rule) {
            let pos = this.binarySearch(this.rules, rule, this.ruleComparator);
            if (pos >= 0) {
                return this.rules[pos];
            }
            else {
                return null;
            }
        }
        size() {
            return this.rules.length;
        }
    }
    exports.ContextFreeGrammar = ContextFreeGrammar;
});
//# sourceMappingURL=ContextFreeGrammar.js.map