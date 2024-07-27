import {Rule} from "./Rule";
import {Symbol} from "nlptoolkit-parsetree/dist/Symbol";
import {CounterHashMap} from "nlptoolkit-datastructure/dist/CounterHashMap";
import {TreeBank} from "nlptoolkit-parsetree/dist/TreeBank";
import * as fs from "fs";
import {RuleType} from "./RuleType";
import {Word} from "nlptoolkit-dictionary/dist/Dictionary/Word";
import {NodeCollector} from "nlptoolkit-parsetree/dist/NodeCollector";
import {IsLeaf} from "nlptoolkit-parsetree/dist/NodeCondition/IsLeaf";
import {ParseTree} from "nlptoolkit-parsetree/dist/ParseTree";
import {Sentence} from "nlptoolkit-corpus/dist/Sentence";
import {ParseNode} from "nlptoolkit-parsetree/dist/ParseNode";

export class ContextFreeGrammar {

    protected dictionary: CounterHashMap<string>
    protected rules: Array<Rule> = []
    protected rulesRightSorted: Array<Rule> = []
    protected minCount: number

    /**
     * Empty constructor for the ContextFreeGrammar class.
     */
    constructor1() {
        this.minCount = 1
    }

    /**
     * Constructor for the ContextFreeGrammar class. Reads the rules from the rule file, lexicon rules from the
     * dictionary file and sets the minimum frequency parameter.
     * @param ruleFileName File name for the rule file.
     * @param dictionaryFileName File name for the lexicon file.
     * @param minCount Minimum frequency parameter.
     */
    constructor2(ruleFileName: string, dictionaryFileName: string, minCount: number) {
        let data = fs.readFileSync(ruleFileName, 'utf8')
        let lines = data.split("\n")
        for (let line of lines) {
            let newRule = new Rule(line)
            this.rules.push(newRule)
            this.rulesRightSorted.push(newRule)
        }
        this.rules.sort(this.ruleComparator)
        this.rulesRightSorted.sort(this.ruleRightComparator)
        this.readDictionary(dictionaryFileName)
        this.updateTypes()
        this.minCount = minCount
    }

    /**
     * Another constructor for the ContextFreeGrammar class. Constructs the lexicon from the leaf nodes of the trees
     * in the given treebank. Extracts rules from the non-leaf nodes of the trees in the given treebank. Also sets the
     * minimum frequency parameter.
     * @param treeBank Treebank containing the constituency trees.
     * @param minCount Minimum frequency parameter.
     */
    constructor3(treeBank: TreeBank, minCount: number){
        this.constructDictionary(treeBank)
        for (let i = 0; i < treeBank.size(); i++){
            let parseTree = treeBank.get(i)
            this.updateTree(parseTree, minCount)
            this.addRules(parseTree.getRoot())
        }
        this.updateTypes()
        this.minCount = minCount
    }

    constructor(param1?: string | TreeBank,
                param2?: string | number,
                param3?: number) {
        this.dictionary = new CounterHashMap<string>()
        this.rules = []
        this.rulesRightSorted = []
        if (param1 == undefined) {
            this.constructor1()
        } else {
            if (typeof param1 == "string" && typeof param2 == "string") {
                this.constructor2(param1, param2, param3)
            } else {
                if (param1 instanceof TreeBank && typeof param2 == "number"){
                    this.constructor3(param1, param2)
                }
            }
        }
    }

    /**
     * Reads the lexicon for the grammar. Each line consists of two items, the terminal symbol and the frequency of
     * that symbol. The method fills the dictionary counter hash map according to this data.
     * @param dictionaryFileName File name of the lexicon.
     */
    readDictionary(dictionaryFileName: string) {
        let data = fs.readFileSync(dictionaryFileName, 'utf8')
        let lines = data.split("\n")
        for (let line of lines) {
            let items = line.split(" ")
            this.dictionary.putNTimes(items[0], parseInt(items[1]));
        }
    }

    /**
     * Constructs the lexicon from the given treebank. Reads each tree and for each leaf node in each tree puts the
     * symbol in the dictionary.
     * @param treeBank Treebank containing the constituency trees.
     */
    constructDictionary(treeBank: TreeBank){
        for (let i = 0; i < treeBank.size(); i++){
            let parseTree = treeBank.get(i);
            let nodeCollector = new NodeCollector(parseTree.getRoot(), new IsLeaf())
            let leafList = nodeCollector.collect()
            for (let parseNode of leafList){
                this.dictionary.put(parseNode.getData().getName())
            }
        }
    }

    ruleLeftComparator = (ruleA: Rule, ruleB: Rule) => (ruleA.getLeftHandSide().getName().localeCompare(ruleB.getLeftHandSide().getName()))
    ruleRightComparator = (ruleA: Rule, ruleB: Rule) => (this.ruleRightCompare(ruleA, ruleB))
    ruleComparator = (ruleA: Rule, ruleB: Rule) => (ruleA.getLeftHandSide().getName() != ruleB.getLeftHandSide().getName() ? this.ruleLeftComparator(ruleA, ruleB) : this.ruleRightComparator(ruleA, ruleB))
    ruleRightCompare(ruleA: Rule, ruleB: Rule): number{
        let i = 0
        while (i < ruleA.getRightHandSideSize() && i < ruleB.getRightHandSideSize()){
            if (ruleA.getRightHandSideAt(i).getName() == ruleB.getRightHandSideAt(i).getName()){
                i++
            } else {
                return ruleA.getRightHandSideAt(i).getName().localeCompare(ruleB.getRightHandSideAt(i).getName())
            }
        }
        if (ruleA.getRightHandSideSize() < ruleB.getRightHandSideSize()){
            return -1
        } else {
            if (ruleA.getRightHandSideSize() > ruleB.getRightHandSideSize()){
                return 1
            } else {
                return 0
            }
        }
    }

    /**
     * Updates the types of the rules according to the number of symbols on the right hand side. Rule type is TERMINAL
     * if the rule is like X -> a, SINGLE_NON_TERMINAL if the rule is like X -> Y, TWO_NON_TERMINAL if the rule is like
     * X -> YZ, MULTIPLE_NON_TERMINAL if the rule is like X -> YZT...
     */
    updateTypes(){
        let nonTerminals = new Set<string>()
        for (let rule of this.rules){
            nonTerminals.add(rule.getLeftHandSide().getName())
        }
        for (let rule of this.rules){
            if (rule.getRightHandSideSize() > 2){
                rule.setType(RuleType.MULTIPLE_NON_TERMINAL)
            } else {
                if (rule.getRightHandSideSize() == 2){
                    rule.setType(RuleType.TWO_NON_TERMINAL)
                } else {
                    if (rule.getRightHandSideAt(0).isTerminal() || Word.isPunctuation(rule.getRightHandSideAt(0).getName()) || !nonTerminals.has(rule.getRightHandSideAt(0).getName())){
                        rule.setType(RuleType.TERMINAL)
                    } else {
                        rule.setType(RuleType.SINGLE_NON_TERMINAL)
                    }
                }
            }
        }
    }

    /**
     * Updates the exceptional symbols of the leaf nodes in the trees. Constituency trees consists of rare symbols and
     * numbers, which are usually useless in creating constituency grammars. This is due to the fact that, numbers may
     * not occur exactly the same both in the train and/or test set, although they have the same meaning in general.
     * Similarly, when a symbol occurs in the test set but not in the training set, there will not be any rule covering
     * that symbol and therefore no parse tree will be generated. For those reasons, the leaf nodes containing numerals
     * are converted to the same terminal symbol, i.e. _num_; the leaf nodes containing rare symbols are converted to
     * the same terminal symbol, i.e. _rare_.
     * @param parseTree Parse tree to be updated.
     * @param minCount Minimum frequency for the terminal symbols to be considered as rare.
     */
    updateTree(parseTree: ParseTree, minCount: number){
        let nodeCollector = new NodeCollector(parseTree.getRoot(), new IsLeaf())
        let leafList = nodeCollector.collect()
        let pattern1 = RegExp("^\\+?\\d+$")
        let pattern2 = RegExp("^\\+?(\\d+)?\\.\\d*$")
        for (let parseNode of leafList){
            let data = parseNode.getData().getName()
            if (data.match(pattern1) != null || (data.match(pattern2) != null && data != ".")){
                parseNode.setData(new Symbol("_num_"))
            } else {
                if (this.dictionary.count(data) < minCount){
                    parseNode.setData(new Symbol("_rare_"))
                }
            }
        }
    }

    /**
     * Updates the exceptional words in the sentences for which constituency parse trees will be generated. Constituency
     * trees consist of rare symbols and numbers, which are usually useless in creating constituency grammars. This is
     * due to the fact that, numbers may not occur exactly the same both in the train and/or test set, although they have
     * the same meaning in general. Similarly, when a symbol occurs in the test set but not in the training set, there
     * will not be any rule covering that symbol and therefore no parse tree will be generated. For those reasons, the
     * words containing numerals are converted to the same terminal symbol, i.e. _num_; thewords containing rare symbols
     * are converted to the same terminal symbol, i.e. _rare_.
     * @param sentence Sentence to be updated.
     */
    removeExceptionalWordsFromSentence(sentence: Sentence){
        let pattern1 = RegExp("^\\+?\\d+$")
        let pattern2 = RegExp("^\\+?(\\d+)?\\.\\d*$")
        for (let i = 0; i < sentence.wordCount(); i++){
            let word = sentence.getWord(i)
            if (word.getName().match(pattern1) != null || (word.getName().match(pattern2) != null && word.getName() != ".")){
                word.setName("_num_")
            } else {
                if (this.dictionary.count(word.getName()) < this.minCount){
                    word.setName("_rare_")
                }
            }
        }
    }

    /**
     * After constructing the constituency tree with a parser for a sentence, it contains exceptional words such as
     * rare words and numbers, which are represented as _rare_ and _num_ symbols in the tree. Those words should be
     * converted to their original forms. This method replaces the exceptional symbols to their original forms by
     * replacing _rare_ and _num_ symbols.
     * @param parseTree Parse tree to be updated.
     * @param sentence Original sentence for which constituency tree is generated.
     */
    reinsertExceptionalWordsFromSentence(parseTree: ParseTree, sentence: Sentence){
        let nodeCollector = new NodeCollector(parseTree.getRoot(), new IsLeaf())
        let leafList = nodeCollector.collect()
        for (let i = 0; i < leafList.length; i++){
            let treeWord = leafList[i].getData().getName()
            let sentenceWord = sentence.getWord(i).getName()
            if (treeWord == "_rare_" || treeWord == "_num_"){
                leafList[i].setData(new Symbol(sentenceWord))
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
    static toRule(parseNode: ParseNode, trim: boolean): Rule{
        let right: Array<Symbol> = []
        let left: Symbol
        if (trim)
            left = parseNode.getData().trimSymbol()
        else
            left = parseNode.getData()
        for (let i = 0; i < parseNode.numberOfChildren(); i++) {
            let childNode = parseNode.getChild(i)
            if (childNode.getData() != null){
                if (childNode.getData().isTerminal() || !trim){
                    right.push(childNode.getData())
                } else {
                    right.push(childNode.getData().trimSymbol())
                }
            } else {
                return null
            }
        }
        return new Rule(left, right)
    }

    /**
     * Recursive method to generate all rules from a subtree rooted at the given node.
     * @param parseNode Root node of the subtree.
     */
    addRules(parseNode: ParseNode){
        let newRule = ContextFreeGrammar.toRule(parseNode, true)
        if (newRule != null){
            this.addRule(newRule)
        }
        for (let i = 0; i < parseNode.numberOfChildren(); i++) {
            let childNode = parseNode.getChild(i)
            if (childNode.numberOfChildren() > 0){
                this.addRules(childNode)
            }
        }
    }

    binarySearch(rules: Array<Rule>, rule: Rule, comparator: (a: Rule, b: Rule) => number): number{
        let lo = 0
        let hi = rules.length - 1
        while (lo <= hi){
            let mid = Math.floor((lo + hi) / 2)
            if (comparator(rules[mid], rule) == 0){
                return mid
            }
            if (comparator(rules[mid], rule) <= 0) {
                lo = mid + 1
            } else {
                hi = mid - 1
            }
        }
        return -(lo + 1)
    }

    /**
     * Inserts a new rule into the correct position in the sorted rules and rulesRightSorted array lists.
     * @param newRule Rule to be inserted into the sorted array lists.
     */
    addRule(newRule: Rule){
        let pos = this.binarySearch(this.rules, newRule, this.ruleComparator);
        if (pos < 0){
            this.rules.splice(-pos - 1, 0, newRule)
            pos = this.binarySearch(this.rulesRightSorted, newRule, this.ruleRightComparator)
            if (pos >= 0){
                this.rulesRightSorted.splice(pos, 0, newRule)
            } else {
                this.rulesRightSorted.splice(-pos - 1, 0, newRule)
            }
        }
    }

    /**
     * Removes a given rule from the sorted rules and rulesRightSorted array lists.
     * @param rule Rule to be removed from the sorted array lists.
     */
    removeRule(rule: Rule){
        let pos = this.binarySearch(this.rules, rule, this.ruleComparator)
        if (pos >= 0){
            this.rules.splice(pos, 1)
            pos = this.binarySearch(this.rulesRightSorted, rule, this.ruleRightComparator)
            let posUp = pos
            while (posUp >= 0 && this.ruleRightComparator(this.rulesRightSorted[posUp], rule) == 0){
                if (this.ruleComparator(rule, this.rulesRightSorted[posUp]) == 0){
                    this.rulesRightSorted.splice(posUp, 1)
                    return
                }
                posUp--
            }
            let posDown = pos + 1
            while (posDown < this.rulesRightSorted.length && this.ruleRightComparator(this.rulesRightSorted[posDown], rule) == 0){
                if (this.ruleComparator(rule, this.rulesRightSorted[posDown]) == 0){
                    this.rulesRightSorted.splice(posDown, 1)
                    return
                }
                posDown++
            }
        }
    }

    /**
     * Returns rules formed as X -> ... Since there can be more than one rule, which have X on the left side, the method
     * first binary searches the rule to obtain the position of such a rule, then goes up and down to obtain others
     * having X on the left side.
     * @param X Left side of the rule
     * @return Rules of the form X -> ...
     */
    getRulesWithLeftSideX(X: Symbol): Array<Rule>{
        let result : Array<Rule> = []
        let dummyRule = new Rule(X, X)
        let middle = this.binarySearch(this.rules, dummyRule, this.ruleLeftComparator)
        if (middle >= 0){
            let middleUp = middle
            while (middleUp >= 0 && this.rules[middleUp].getLeftHandSide().getName() == X.getName()){
                result.push(this.rules[middleUp])
                middleUp--
            }
            let middleDown = middle + 1
            while (middleDown < this.rules.length && this.rules[middleDown].getLeftHandSide().getName() == X.getName()){
                result.push(this.rules[middleDown])
                middleDown++
            }
        }
        return result
    }

    /**
     * Returns all symbols X from terminal rules such as X -> a.
     * @return All symbols X from terminal rules such as X -> a.
     */
    partOfSpeechTags(): Array<Symbol>{
        let result : Array<Symbol> = []
        for (let rule of this.rules) {
            if (rule.getType() == RuleType.TERMINAL && !result.includes(rule.getLeftHandSide())) {
                result.push(rule.getLeftHandSide())
            }
        }
        return result
    }

    /**
     * Returns all symbols X from all rules such as X -> ...
     * @return All symbols X from all rules such as X -> ...
     */
    getLeftSide(): Array<Symbol>{
        let result : Array<Symbol> = []
        for (let rule of this.rules) {
            if (!result.includes(rule.getLeftHandSide())) {
                result.push(rule.getLeftHandSide())
            }
        }
        return result
    }

    /**
     * Returns all rules with the given terminal symbol on the right hand side, that is it returns all terminal rules
     * such as X -> s
     * @param S Terminal symbol on the right hand side.
     * @return All rules with the given terminal symbol on the right hand side
     */
    getTerminalRulesWithRightSideX(S: Symbol): Array<Rule>{
        let result : Array<Rule> = []
        let dummyRule = new Rule(S, S)
        let middle = this.binarySearch(this.rulesRightSorted, dummyRule, this.ruleRightCompare)
        if (middle >= 0){
            let middleUp = middle
            while (middleUp >= 0 && this.rulesRightSorted[middleUp].getRightHandSideAt(0).getName() == S.getName()){
                if (this.rulesRightSorted[middleUp].getType() == RuleType.TERMINAL){
                    result.push(this.rulesRightSorted[middleUp])
                }
                middleUp--
            }
            let middleDown = middle + 1
            while (middleDown < this.rulesRightSorted.length && this.rulesRightSorted[middleDown].getRightHandSideAt(0).getName() == S.getName()){
                if (this.rulesRightSorted[middleDown].getType() == RuleType.TERMINAL){
                    result.push(this.rulesRightSorted[middleDown])
                }
                middleDown++
            }
        }
        return result
    }

    /**
     * Returns all rules with the given non-terminal symbol on the right hand side, that is it returns all non-terminal
     * rules such as X -> S
     * @param S Non-terminal symbol on the right hand side.
     * @return All rules with the given non-terminal symbol on the right hand side
     */
    getRulesWithRightSideX(S: Symbol): Array<Rule>{
        let result : Array<Rule> = []
        let dummyRule = new Rule(S, S)
        let pos = this.binarySearch(this.rulesRightSorted, dummyRule, this.ruleRightCompare)
        if (pos >= 0){
            let posUp = pos
            while (posUp >= 0 && this.rulesRightSorted[posUp].getRightHandSideAt(0).getName() == S.getName() && this.rulesRightSorted[posUp].getRightHandSideSize() == 1){
                result.push(this.rulesRightSorted[posUp])
                posUp--
            }
            let posDown = pos + 1
            while (posDown < this.rulesRightSorted.length && this.rulesRightSorted[posDown].getRightHandSideAt(0).getName() == S.getName() && this.rulesRightSorted[posDown].getRightHandSideSize() == 1){
                result.push(this.rulesRightSorted[posDown])
                posDown++
            }
        }
        return result
    }

    /**
     * Returns all rules with the given two non-terminal symbols on the right hand side, that is it returns all
     * non-terminal rules such as X -> AB.
     * @param A First non-terminal symbol on the right hand side.
     * @param B Second non-terminal symbol on the right hand side.
     * @return All rules with the given two non-terminal symbols on the right hand side
     */
    getRulesWithTwoNonTerminalsOnRightSide(A: Symbol, B: Symbol): Array<Rule>{
        let result : Array<Rule> = []
        let dummyRule = new Rule(A, A, B)
        let pos = this.binarySearch(this.rulesRightSorted, dummyRule, this.ruleRightCompare)
        if (pos >= 0){
            let posUp = pos
            while (posUp >= 0 && this.rulesRightSorted[posUp].getRightHandSideSize() == 2 && this.rulesRightSorted[posUp].getRightHandSideAt(0).getName() == A.getName() && this.rulesRightSorted[posUp].getRightHandSideAt(1).getName() == B.getName()){
                result.push(this.rulesRightSorted[posUp])
                posUp--
            }
            let posDown = pos + 1
            while (posDown < this.rulesRightSorted.length && this.rulesRightSorted[posDown].getRightHandSideSize() == 2 && this.rulesRightSorted[posDown].getRightHandSideAt(0).getName() == A.getName() && this.rulesRightSorted[posDown].getRightHandSideAt(1).getName() == B.getName()){
                result.push(this.rulesRightSorted[posDown])
                posDown++
            }

        }
        return result
    }

    /**
     * Returns the symbol on the right side of the first rule with one non-terminal symbol on the right hand side, that
     * is it returns S of the first rule such as X -> S. S should also not be in the given removed list.
     * @param removedList Discarded list for symbol S.
     * @return The symbol on the right side of the first rule with one non-terminal symbol on the right hand side. The
     * symbol to be returned should also not be in the given discarded list.
     */
    getSingleNonTerminalCandidateToRemove(removedList: Array<Symbol>): Symbol{
        let removeCandidate = null
        for (let rule of this.rules) {
            if (rule.getType() == RuleType.SINGLE_NON_TERMINAL && !rule.leftRecursive() && !removedList.includes(rule.getRightHandSideAt(0))) {
                removeCandidate = rule.getRightHandSideAt(0)
                break
            }
        }
        return removeCandidate
    }

    /**
     * Returns all rules with more than two non-terminal symbols on the right hand side, that is it returns all
     * non-terminal rules such as X -> ABC...
     * @return All rules with more than two non-terminal symbols on the right hand side.
     */
    getMultipleNonTerminalCandidateToUpdate(): Rule{
        let removeCandidate = null
        for (let rule of this.rules) {
            if (rule.getType() == RuleType.MULTIPLE_NON_TERMINAL) {
                removeCandidate = rule
                break
            }
        }
        return removeCandidate
    }

    /**
     * In conversion to Chomsky Normal Form, rules like X -> Y are removed and new rules for every rule as Y -> beta are
     * replaced with X -> beta. The method first identifies all X -> Y rules. For every such rule, all rules Y -> beta
     * are identified. For every such rule, the method adds a new rule X -> beta. Every Y -> beta rule is then deleted.
     */
    removeSingleNonTerminalFromRightHandSide(){
        let nonTerminalList : Array<Symbol> = []
        let removeCandidate = this.getSingleNonTerminalCandidateToRemove(nonTerminalList)
        while (removeCandidate != null){
            let ruleList = this.getRulesWithRightSideX(removeCandidate)
            for (let rule of ruleList){
                let candidateList = this.getRulesWithLeftSideX(removeCandidate)
                for (let candidate of candidateList){
                    let clone : Array<Symbol> = []
                    for (let symbol of candidate.getRightHandSide()){
                        clone.push(symbol)
                    }
                    this.addRule(new Rule(rule.getLeftHandSide(), clone, candidate.getType()))
                }
                this.removeRule(rule)
            }
            nonTerminalList.push(removeCandidate)
            removeCandidate = this.getSingleNonTerminalCandidateToRemove(nonTerminalList)
        }
    }

    /**
     * In conversion to Chomsky Normal Form, rules like A -> BC... are replaced with A -> X1... and X1 -> BC. This
     * method replaces B and C non-terminals on the right hand side with X1 for all rules in the grammar.
     * @param first Non-terminal symbol B.
     * @param second Non-terminal symbol C.
     * @param _with Non-terminal symbol X1.
     */
    updateAllMultipleNonTerminalWithNewRule(first: Symbol, second: Symbol, _with: Symbol){
        for (let rule of this.rules) {
            if (rule.getType() == RuleType.MULTIPLE_NON_TERMINAL){
                rule.updateMultipleNonTerminal(first, second, _with)
            }
        }
    }

    /**
     * In conversion to Chomsky Normal Form, rules like A -> BC... are replaced with A -> X1... and X1 -> BC. This
     * method determines such rules and for every such rule, it adds new rule X1->BC and updates rule A->BC to A->X1.
     */
    updateMultipleNonTerminalFromRightHandSide(){
        let newVariableCount = 0
        let updateCandidate = this.getMultipleNonTerminalCandidateToUpdate()
        while (updateCandidate != null){
            let newRightHandSide : Array<Symbol> = []
            let newSymbol = new Symbol("X" + newVariableCount)
            newRightHandSide.push(updateCandidate.getRightHandSideAt(0))
            newRightHandSide.push(updateCandidate.getRightHandSideAt(1))
            this.updateAllMultipleNonTerminalWithNewRule(updateCandidate.getRightHandSideAt(0), updateCandidate.getRightHandSideAt(1), newSymbol)
            this.addRule(new Rule(newSymbol, newRightHandSide, RuleType.TWO_NON_TERMINAL))
            updateCandidate = this.getMultipleNonTerminalCandidateToUpdate()
            newVariableCount++
        }
    }

    /**
     * The method converts the grammar into Chomsky normal form. First, rules like X -> Y are removed and new rules for
     * every rule as Y -> beta are replaced with X -> beta. Second, rules like A -> BC... are replaced with A -> X1...
     * and X1 -> BC.
     */
    convertToChomskyNormalForm(){
        this.removeSingleNonTerminalFromRightHandSide()
        this.updateMultipleNonTerminalFromRightHandSide()
        this.rules.sort(this.ruleComparator)
        this.rulesRightSorted.sort(this.ruleRightComparator)
    }

    /**
     * Searches a given rule in the grammar.
     * @param rule Rule to be searched.
     * @return Rule if found, null otherwise.
     */
    searchRule(rule: Rule): Rule{
        let pos = this.binarySearch(this.rules, rule, this.ruleComparator)
        if (pos >= 0){
            return this.rules[pos]
        } else {
            return null
        }
    }

    /**
     * Returns number of rules in the grammar.
     * @return Number of rules in the Context Free Grammar.
     */
    size(): number{
        return this.rules.length
    }
}