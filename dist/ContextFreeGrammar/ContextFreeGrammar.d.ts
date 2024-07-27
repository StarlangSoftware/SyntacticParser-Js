import { Rule } from "./Rule";
import { Symbol } from "nlptoolkit-parsetree/dist/Symbol";
import { CounterHashMap } from "nlptoolkit-datastructure/dist/CounterHashMap";
import { TreeBank } from "nlptoolkit-parsetree/dist/TreeBank";
import { ParseTree } from "nlptoolkit-parsetree/dist/ParseTree";
import { Sentence } from "nlptoolkit-corpus/dist/Sentence";
import { ParseNode } from "nlptoolkit-parsetree/dist/ParseNode";
export declare class ContextFreeGrammar {
    protected dictionary: CounterHashMap<string>;
    protected rules: Array<Rule>;
    protected rulesRightSorted: Array<Rule>;
    protected minCount: number;
    /**
     * Empty constructor for the ContextFreeGrammar class.
     */
    constructor1(): void;
    /**
     * Constructor for the ContextFreeGrammar class. Reads the rules from the rule file, lexicon rules from the
     * dictionary file and sets the minimum frequency parameter.
     * @param ruleFileName File name for the rule file.
     * @param dictionaryFileName File name for the lexicon file.
     * @param minCount Minimum frequency parameter.
     */
    constructor2(ruleFileName: string, dictionaryFileName: string, minCount: number): void;
    /**
     * Another constructor for the ContextFreeGrammar class. Constructs the lexicon from the leaf nodes of the trees
     * in the given treebank. Extracts rules from the non-leaf nodes of the trees in the given treebank. Also sets the
     * minimum frequency parameter.
     * @param treeBank Treebank containing the constituency trees.
     * @param minCount Minimum frequency parameter.
     */
    constructor3(treeBank: TreeBank, minCount: number): void;
    constructor(param1?: string | TreeBank, param2?: string | number, param3?: number);
    /**
     * Reads the lexicon for the grammar. Each line consists of two items, the terminal symbol and the frequency of
     * that symbol. The method fills the dictionary counter hash map according to this data.
     * @param dictionaryFileName File name of the lexicon.
     */
    readDictionary(dictionaryFileName: string): void;
    /**
     * Constructs the lexicon from the given treebank. Reads each tree and for each leaf node in each tree puts the
     * symbol in the dictionary.
     * @param treeBank Treebank containing the constituency trees.
     */
    constructDictionary(treeBank: TreeBank): void;
    ruleLeftComparator: (ruleA: Rule, ruleB: Rule) => number;
    ruleRightComparator: (ruleA: Rule, ruleB: Rule) => number;
    ruleComparator: (ruleA: Rule, ruleB: Rule) => number;
    ruleRightCompare(ruleA: Rule, ruleB: Rule): number;
    /**
     * Updates the types of the rules according to the number of symbols on the right hand side. Rule type is TERMINAL
     * if the rule is like X -> a, SINGLE_NON_TERMINAL if the rule is like X -> Y, TWO_NON_TERMINAL if the rule is like
     * X -> YZ, MULTIPLE_NON_TERMINAL if the rule is like X -> YZT...
     */
    updateTypes(): void;
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
    updateTree(parseTree: ParseTree, minCount: number): void;
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
    removeExceptionalWordsFromSentence(sentence: Sentence): void;
    /**
     * After constructing the constituency tree with a parser for a sentence, it contains exceptional words such as
     * rare words and numbers, which are represented as _rare_ and _num_ symbols in the tree. Those words should be
     * converted to their original forms. This method replaces the exceptional symbols to their original forms by
     * replacing _rare_ and _num_ symbols.
     * @param parseTree Parse tree to be updated.
     * @param sentence Original sentence for which constituency tree is generated.
     */
    reinsertExceptionalWordsFromSentence(parseTree: ParseTree, sentence: Sentence): void;
    /**
     * Converts a parse node in a tree to a rule. The symbol in the parse node will be the symbol on the leaf side of the
     * rule, the symbols in the child nodes will be the symbols on the right hand side of the rule.
     * @param parseNode Parse node for which a rule will be created.
     * @param trim If true, the tags will be trimmed. If the symbol's data contains '-' or '=', this method trims all
     *             characters after those characters.
     * @return A new rule constructed from a parse node and its children.
     */
    static toRule(parseNode: ParseNode, trim: boolean): Rule;
    /**
     * Recursive method to generate all rules from a subtree rooted at the given node.
     * @param parseNode Root node of the subtree.
     */
    addRules(parseNode: ParseNode): void;
    binarySearch(rules: Array<Rule>, rule: Rule, comparator: (a: Rule, b: Rule) => number): number;
    /**
     * Inserts a new rule into the correct position in the sorted rules and rulesRightSorted array lists.
     * @param newRule Rule to be inserted into the sorted array lists.
     */
    addRule(newRule: Rule): void;
    /**
     * Removes a given rule from the sorted rules and rulesRightSorted array lists.
     * @param rule Rule to be removed from the sorted array lists.
     */
    removeRule(rule: Rule): void;
    /**
     * Returns rules formed as X -> ... Since there can be more than one rule, which have X on the left side, the method
     * first binary searches the rule to obtain the position of such a rule, then goes up and down to obtain others
     * having X on the left side.
     * @param X Left side of the rule
     * @return Rules of the form X -> ...
     */
    getRulesWithLeftSideX(X: Symbol): Array<Rule>;
    /**
     * Returns all symbols X from terminal rules such as X -> a.
     * @return All symbols X from terminal rules such as X -> a.
     */
    partOfSpeechTags(): Array<Symbol>;
    /**
     * Returns all symbols X from all rules such as X -> ...
     * @return All symbols X from all rules such as X -> ...
     */
    getLeftSide(): Array<Symbol>;
    /**
     * Returns all rules with the given terminal symbol on the right hand side, that is it returns all terminal rules
     * such as X -> s
     * @param S Terminal symbol on the right hand side.
     * @return All rules with the given terminal symbol on the right hand side
     */
    getTerminalRulesWithRightSideX(S: Symbol): Array<Rule>;
    /**
     * Returns all rules with the given non-terminal symbol on the right hand side, that is it returns all non-terminal
     * rules such as X -> S
     * @param S Non-terminal symbol on the right hand side.
     * @return All rules with the given non-terminal symbol on the right hand side
     */
    getRulesWithRightSideX(S: Symbol): Array<Rule>;
    /**
     * Returns all rules with the given two non-terminal symbols on the right hand side, that is it returns all
     * non-terminal rules such as X -> AB.
     * @param A First non-terminal symbol on the right hand side.
     * @param B Second non-terminal symbol on the right hand side.
     * @return All rules with the given two non-terminal symbols on the right hand side
     */
    getRulesWithTwoNonTerminalsOnRightSide(A: Symbol, B: Symbol): Array<Rule>;
    /**
     * Returns the symbol on the right side of the first rule with one non-terminal symbol on the right hand side, that
     * is it returns S of the first rule such as X -> S. S should also not be in the given removed list.
     * @param removedList Discarded list for symbol S.
     * @return The symbol on the right side of the first rule with one non-terminal symbol on the right hand side. The
     * symbol to be returned should also not be in the given discarded list.
     */
    getSingleNonTerminalCandidateToRemove(removedList: Array<Symbol>): Symbol;
    /**
     * Returns all rules with more than two non-terminal symbols on the right hand side, that is it returns all
     * non-terminal rules such as X -> ABC...
     * @return All rules with more than two non-terminal symbols on the right hand side.
     */
    getMultipleNonTerminalCandidateToUpdate(): Rule;
    /**
     * In conversion to Chomsky Normal Form, rules like X -> Y are removed and new rules for every rule as Y -> beta are
     * replaced with X -> beta. The method first identifies all X -> Y rules. For every such rule, all rules Y -> beta
     * are identified. For every such rule, the method adds a new rule X -> beta. Every Y -> beta rule is then deleted.
     */
    removeSingleNonTerminalFromRightHandSide(): void;
    /**
     * In conversion to Chomsky Normal Form, rules like A -> BC... are replaced with A -> X1... and X1 -> BC. This
     * method replaces B and C non-terminals on the right hand side with X1 for all rules in the grammar.
     * @param first Non-terminal symbol B.
     * @param second Non-terminal symbol C.
     * @param _with Non-terminal symbol X1.
     */
    updateAllMultipleNonTerminalWithNewRule(first: Symbol, second: Symbol, _with: Symbol): void;
    /**
     * In conversion to Chomsky Normal Form, rules like A -> BC... are replaced with A -> X1... and X1 -> BC. This
     * method determines such rules and for every such rule, it adds new rule X1->BC and updates rule A->BC to A->X1.
     */
    updateMultipleNonTerminalFromRightHandSide(): void;
    /**
     * The method converts the grammar into Chomsky normal form. First, rules like X -> Y are removed and new rules for
     * every rule as Y -> beta are replaced with X -> beta. Second, rules like A -> BC... are replaced with A -> X1...
     * and X1 -> BC.
     */
    convertToChomskyNormalForm(): void;
    /**
     * Searches a given rule in the grammar.
     * @param rule Rule to be searched.
     * @return Rule if found, null otherwise.
     */
    searchRule(rule: Rule): Rule;
    /**
     * Returns number of rules in the grammar.
     * @return Number of rules in the Context Free Grammar.
     */
    size(): number;
}
