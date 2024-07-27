import {ContextFreeGrammar} from "../ContextFreeGrammar/ContextFreeGrammar";
import {TreeBank} from "nlptoolkit-parsetree/dist/TreeBank";
import * as fs from "fs";
import {ProbabilisticRule} from "./ProbabilisticRule";
import {ParseNode} from "nlptoolkit-parsetree/dist/ParseNode";
import {Symbol} from "nlptoolkit-parsetree/dist/Symbol";
import {RuleType} from "../ContextFreeGrammar/RuleType";
import {ParseTree} from "nlptoolkit-parsetree/dist/ParseTree";

export class ProbabilisticContextFreeGrammar extends ContextFreeGrammar{

    /**
     * Constructor for the ProbabilisticContextFreeGrammar class. Reads the rules from the rule file, lexicon rules from
     * the dictionary file and sets the minimum frequency parameter.
     * @param ruleFileName File name for the rule file.
     * @param dictionaryFileName File name for the lexicon file.
     * @param minCount Minimum frequency parameter.
     */
    constructor2(ruleFileName: string, dictionaryFileName: string, minCount: number) {
        let data = fs.readFileSync(ruleFileName, 'utf8')
        let lines = data.split("\n")
        for (let line of lines) {
            let newRule = new ProbabilisticRule(line)
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
     * Another constructor for the ProbabilisticContextFreeGrammar class. Constructs the lexicon from the leaf nodes of
     * the trees in the given treebank. Extracts rules from the non-leaf nodes of the trees in the given treebank. Also
     * sets the minimum frequency parameter.
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
        let variables = this.getLeftSide()
        for (let variable of variables){
            let candidates = this.getRulesWithLeftSideX(variable)
            let total = 0;
            for (let candidate of candidates){
                total += (candidate as ProbabilisticRule).getCount()
            }
            for (let candidate of candidates){
                (candidate as ProbabilisticRule).normalizeProbability(total)
            }
        }
        this.updateTypes()
        this.minCount = minCount
    }

    constructor(param1?: string | TreeBank,
                param2?: string | number,
                param3?: number) {
        if (param1 == undefined) {
            super()
        } else {
            if (typeof param1 == "string" && typeof param2 == "string") {
                super()
                this.constructor2(param1, param2, param3)
            } else {
                if (param1 instanceof TreeBank && typeof param2 == "number"){
                    super()
                    this.constructor3(param1, param2)
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
    static toRule(parseNode: ParseNode, trim: boolean): ProbabilisticRule{
        let right: Array<Symbol> = []
        let left: Symbol
        if (trim)
            left = parseNode.getData().trimSymbol()
        else
            left = parseNode.getData()
        for (let i = 0; i < parseNode.numberOfChildren(); i++) {
            let childNode = parseNode.getChild(i)
            if (childNode.getData() != null){
                if (childNode.getData().isTerminal()){
                    right.push(childNode.getData())
                } else {
                    right.push(childNode.getData().trimSymbol())
                }
            } else {
                return null
            }
        }
        return new ProbabilisticRule(left, right)
    }

    /**
     * Recursive method to generate all rules from a subtree rooted at the given node.
     * @param parseNode Root node of the subtree.
     */
    addRules(parseNode: ParseNode){
        let newRule = ProbabilisticContextFreeGrammar.toRule(parseNode, true)
        if (newRule != null){
            let existedRule = this.searchRule(newRule)
            if (existedRule == null){
                this.addRule(newRule)
                newRule.increment()
            } else {
                (existedRule as ProbabilisticRule).increment()
            }
        }
        for (let i = 0; i < parseNode.numberOfChildren(); i++) {
            let childNode = parseNode.getChild(i)
            if (childNode.numberOfChildren() > 0){
                this.addRules(childNode)
            }
        }
    }

    /**
     * Calculates the probability of a parse node.
     * @param parseNode Parse node for which probability is calculated.
     * @return Probability of a parse node.
     */
    probabilityOfParseNode(parseNode: ParseNode): number{
        let sum = 0.0
        if (parseNode.numberOfChildren() > 0){
            let rule = ProbabilisticContextFreeGrammar.toRule(parseNode, true)
            let existedRule = this.searchRule(rule)
            sum = Math.log((existedRule as ProbabilisticRule).getProbability())
            if (existedRule.getType() != RuleType.TERMINAL){
                for (let i = 0; i < parseNode.numberOfChildren(); i++){
                    let childNode = parseNode.getChild(i)
                    sum += this.probabilityOfParseNode(childNode)
                }
            }
        }
        return sum
    }

    /**
     * Calculates the probability of a parse tree.
     * @param parseTree Parse tree for which probability is calculated.
     * @return Probability of the parse tree.
     */
    probabilityOfParseTree(parseTree: ParseTree): number{
        return this.probabilityOfParseNode(parseTree.getRoot())
    }

    /**
     * In conversion to Chomsky Normal Form, rules like X -> Y are removed and new rules for every rule as Y -> beta are
     * replaced with X -> beta. The method first identifies all X -> Y rules. For every such rule, all rules Y -> beta
     * are identified. For every such rule, the method adds a new rule X -> beta. Every Y -> beta rule is then deleted.
     * The method also calculates the probability of the new rules based on the previous rules.
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
                    this.addRule(new ProbabilisticRule(rule.getLeftHandSide(), clone, candidate.getType(), (rule as ProbabilisticRule).getProbability() * (candidate as ProbabilisticRule).getProbability()))
                }
                this.removeRule(rule)
            }
            nonTerminalList.push(removeCandidate)
            removeCandidate = this.getSingleNonTerminalCandidateToRemove(nonTerminalList)
        }
    }

    /**
     * In conversion to Chomsky Normal Form, rules like A -> BC... are replaced with A -> X1... and X1 -> BC. This
     * method determines such rules and for every such rule, it adds new rule X1->BC and updates rule A->BC to A->X1.
     * The method sets the probability of the rules X1->BC to 1, and calculates the probability of the rules A -> X1...
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
            this.addRule(new ProbabilisticRule(newSymbol, newRightHandSide, RuleType.TWO_NON_TERMINAL, 1.0))
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
}