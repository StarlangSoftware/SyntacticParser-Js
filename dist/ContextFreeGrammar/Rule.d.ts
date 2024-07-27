import { RuleType } from "./RuleType";
import { Symbol } from "nlptoolkit-parsetree/dist/Symbol";
export declare class Rule {
    protected leftHandSide: Symbol;
    protected rightHandSide: Array<Symbol>;
    protected type: RuleType;
    /**
     * Empty constructor for the rule class.
     */
    constructor1(): void;
    /**
     * Constructor for the rule X -> Y.
     * @param leftHandSide Non-terminal symbol X
     * @param rightHandSideSymbol Symbol Y (terminal or non-terminal)
     */
    constructor2(leftHandSide: Symbol, rightHandSideSymbol: Symbol): void;
    /**
     * Constructor for the rule X -> YZ.
     * @param leftHandSide Non-terminal symbol X.
     * @param rightHandSideSymbol1 Symbol Y (non-terminal).
     * @param rightHandSideSymbol2 Symbol Z (non-terminal).
     */
    constructor3(leftHandSide: Symbol, rightHandSideSymbol1: Symbol, rightHandSideSymbol2: Symbol): void;
    /**
     * Constructor for the rule X -> beta. beta is a string of symbols from symbols (non-terminal)
     * @param leftHandSide Non-terminal symbol X.
     * @param rightHandSide beta. beta is a string of symbols from symbols (non-terminal)
     */
    constructor4(leftHandSide: Symbol, rightHandSide: Array<Symbol>): void;
    /**
     * Constructor for the rule X -> beta. beta is a string of symbols from symbols (non-terminal)
     * @param leftHandSide Non-terminal symbol X.
     * @param rightHandSide beta. beta is a string of symbols from symbols (non-terminal)
     * @param type Type of the rule. TERMINAL if the rule is like X -> a, SINGLE_NON_TERMINAL if the rule is like X -> Y,
     *             TWO_NON_TERMINAL if the rule is like X -> YZ, MULTIPLE_NON_TERMINAL if the rule is like X -> YZT..
     */
    constructor5(leftHandSide: Symbol, rightHandSide: Array<Symbol>, type: RuleType): void;
    /**
     * Constructor for any rule from a string. The string is of the form X -> .... The method constructs left hand
     * side symbol and right hand side symbol(s) from the input string.
     * @param rule String containing the rule. The string is of the form X -> ....
     */
    constructor6(rule: string): void;
    constructor(param1?: Symbol | string, param2?: Symbol | Array<Symbol>, param3?: Symbol | RuleType);
    /**
     * Checks if the rule is left recursive or not. A rule is left recursive if it is of the form X -> X..., so its
     * first symbol of the right side is the symbol on the left side.
     * @return True, if the rule is left recursive; false otherwise.
     */
    leftRecursive(): boolean;
    /**
     * In conversion to Chomsky Normal Form, rules like A -> BC... are replaced with A -> X1... and X1 -> BC. This
     * method replaces B and C non-terminals on the right hand side with X1.
     * @param first Non-terminal symbol B.
     * @param second Non-terminal symbol C.
     * @param _with Non-terminal symbol X1.
     * @return True, if any replacements has been made; false otherwise.
     */
    updateMultipleNonTerminal(first: Symbol, second: Symbol, _with: Symbol): boolean;
    /**
     * Accessor for the rule type.
     * @return Rule type.
     */
    getType(): RuleType;
    setType(type: RuleType): void;
    /**
     * Accessor for the left hand side.
     * @return Left hand side.
     */
    getLeftHandSide(): Symbol;
    /**
     * Accessor for the right hand side.
     * @return Right hand side.
     */
    getRightHandSide(): Array<Symbol>;
    /**
     * Returns number of symbols on the right hand side.
     * @return Number of symbols on the right hand side.
     */
    getRightHandSideSize(): number;
    /**
     * Returns symbol at position index on the right hand side.
     * @param index Position of the symbol
     * @return Symbol at position index on the right hand side.
     */
    getRightHandSideAt(index: number): Symbol;
    /**
     * Converts the rule to the form X -> ...
     * @return String form of the rule in the form of X -> ...
     */
    toString(): string;
}
