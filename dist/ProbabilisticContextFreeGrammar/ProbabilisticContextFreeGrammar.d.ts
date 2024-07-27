import { ContextFreeGrammar } from "../ContextFreeGrammar/ContextFreeGrammar";
import { TreeBank } from "nlptoolkit-parsetree/dist/TreeBank";
import { ProbabilisticRule } from "./ProbabilisticRule";
import { ParseNode } from "nlptoolkit-parsetree/dist/ParseNode";
import { ParseTree } from "nlptoolkit-parsetree/dist/ParseTree";
export declare class ProbabilisticContextFreeGrammar extends ContextFreeGrammar {
    /**
     * Constructor for the ProbabilisticContextFreeGrammar class. Reads the rules from the rule file, lexicon rules from
     * the dictionary file and sets the minimum frequency parameter.
     * @param ruleFileName File name for the rule file.
     * @param dictionaryFileName File name for the lexicon file.
     * @param minCount Minimum frequency parameter.
     */
    constructor2(ruleFileName: string, dictionaryFileName: string, minCount: number): void;
    /**
     * Another constructor for the ProbabilisticContextFreeGrammar class. Constructs the lexicon from the leaf nodes of
     * the trees in the given treebank. Extracts rules from the non-leaf nodes of the trees in the given treebank. Also
     * sets the minimum frequency parameter.
     * @param treeBank Treebank containing the constituency trees.
     * @param minCount Minimum frequency parameter.
     */
    constructor3(treeBank: TreeBank, minCount: number): void;
    constructor(param1?: string | TreeBank, param2?: string | number, param3?: number);
    /**
     * Converts a parse node in a tree to a rule. The symbol in the parse node will be the symbol on the leaf side of the
     * rule, the symbols in the child nodes will be the symbols on the right hand side of the rule.
     * @param parseNode Parse node for which a rule will be created.
     * @param trim If true, the tags will be trimmed. If the symbol's data contains '-' or '=', this method trims all
     *             characters after those characters.
     * @return A new rule constructed from a parse node and its children.
     */
    static toRule(parseNode: ParseNode, trim: boolean): ProbabilisticRule;
    /**
     * Recursive method to generate all rules from a subtree rooted at the given node.
     * @param parseNode Root node of the subtree.
     */
    addRules(parseNode: ParseNode): void;
    /**
     * Calculates the probability of a parse node.
     * @param parseNode Parse node for which probability is calculated.
     * @return Probability of a parse node.
     */
    probabilityOfParseNode(parseNode: ParseNode): number;
    /**
     * Calculates the probability of a parse tree.
     * @param parseTree Parse tree for which probability is calculated.
     * @return Probability of the parse tree.
     */
    probabilityOfParseTree(parseTree: ParseTree): number;
    /**
     * In conversion to Chomsky Normal Form, rules like X -> Y are removed and new rules for every rule as Y -> beta are
     * replaced with X -> beta. The method first identifies all X -> Y rules. For every such rule, all rules Y -> beta
     * are identified. For every such rule, the method adds a new rule X -> beta. Every Y -> beta rule is then deleted.
     * The method also calculates the probability of the new rules based on the previous rules.
     */
    removeSingleNonTerminalFromRightHandSide(): void;
    /**
     * In conversion to Chomsky Normal Form, rules like A -> BC... are replaced with A -> X1... and X1 -> BC. This
     * method determines such rules and for every such rule, it adds new rule X1->BC and updates rule A->BC to A->X1.
     * The method sets the probability of the rules X1->BC to 1, and calculates the probability of the rules A -> X1...
     */
    updateMultipleNonTerminalFromRightHandSide(): void;
    /**
     * The method converts the grammar into Chomsky normal form. First, rules like X -> Y are removed and new rules for
     * every rule as Y -> beta are replaced with X -> beta. Second, rules like A -> BC... are replaced with A -> X1...
     * and X1 -> BC.
     */
    convertToChomskyNormalForm(): void;
}
