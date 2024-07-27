import {RuleType} from "./RuleType";
import {Symbol} from "nlptoolkit-parsetree/dist/Symbol";

export class Rule {
    protected leftHandSide: Symbol
    protected rightHandSide: Array<Symbol>
    protected type: RuleType

    /**
     * Empty constructor for the rule class.
     */
    constructor1() {
        this.rightHandSide = []
    }

    /**
     * Constructor for the rule X -> Y.
     * @param leftHandSide Non-terminal symbol X
     * @param rightHandSideSymbol Symbol Y (terminal or non-terminal)
     */
    constructor2(leftHandSide: Symbol, rightHandSideSymbol: Symbol){
        this.leftHandSide = leftHandSide
        this.rightHandSide = []
        this.rightHandSide.push(rightHandSideSymbol)
    }

    /**
     * Constructor for the rule X -> YZ.
     * @param leftHandSide Non-terminal symbol X.
     * @param rightHandSideSymbol1 Symbol Y (non-terminal).
     * @param rightHandSideSymbol2 Symbol Z (non-terminal).
     */
    constructor3(leftHandSide: Symbol, rightHandSideSymbol1: Symbol, rightHandSideSymbol2: Symbol){
        this.constructor2(leftHandSide, rightHandSideSymbol1)
        this.rightHandSide.push(rightHandSideSymbol2)
    }

    /**
     * Constructor for the rule X -> beta. beta is a string of symbols from symbols (non-terminal)
     * @param leftHandSide Non-terminal symbol X.
     * @param rightHandSide beta. beta is a string of symbols from symbols (non-terminal)
     */
    constructor4(leftHandSide: Symbol, rightHandSide: Array<Symbol>){
        this.leftHandSide = leftHandSide
        this.rightHandSide = rightHandSide
    }

    /**
     * Constructor for the rule X -> beta. beta is a string of symbols from symbols (non-terminal)
     * @param leftHandSide Non-terminal symbol X.
     * @param rightHandSide beta. beta is a string of symbols from symbols (non-terminal)
     * @param type Type of the rule. TERMINAL if the rule is like X -> a, SINGLE_NON_TERMINAL if the rule is like X -> Y,
     *             TWO_NON_TERMINAL if the rule is like X -> YZ, MULTIPLE_NON_TERMINAL if the rule is like X -> YZT..
     */
    constructor5(leftHandSide: Symbol, rightHandSide: Array<Symbol>, type: RuleType){
        this.leftHandSide = leftHandSide
        this.rightHandSide = rightHandSide
        this.type = type
    }

    /**
     * Constructor for any rule from a string. The string is of the form X -> .... The method constructs left hand
     * side symbol and right hand side symbol(s) from the input string.
     * @param rule String containing the rule. The string is of the form X -> ....
     */
    constructor6(rule: string) {
        let left = rule.substring(0, rule.indexOf("->")).trim()
        let right = rule.substring(rule.indexOf("->") + 2).trim()
        this.leftHandSide = new Symbol(left)
        let rightSide = right.split(" ")
        this.rightHandSide = []
        for (let i = 0; i < rightSide.length; i++){
            this.rightHandSide.push(new Symbol(rightSide[i]))
        }
    }

    constructor(param1?: Symbol | string,
                param2?: Symbol | Array<Symbol>,
                param3?: Symbol | RuleType) {
        if (param1 == undefined){
            this.constructor1()
        } else {
            if (param1 instanceof Symbol && param2 instanceof Symbol && param3 == undefined){
                this.constructor2(param1, param2)
            } else {
                if (param1 instanceof Symbol && param2 instanceof Symbol && param3 instanceof Symbol){
                    this.constructor3(param1, param2, param3)
                } else {
                    if (param1 instanceof Symbol && Array.isArray(param2) && param3 == undefined){
                        this.constructor4(param1, param2)
                    } else {
                        if (param1 instanceof Symbol && Array.isArray(param2) && param3 != undefined){
                            this.constructor5(param1, param2, param3 as RuleType)
                        } else {
                            if (typeof param1 == "string"){
                                this.constructor6(param1)
                            }
                        }
                    }
                }
            }
        }
    }

    /**
     * Checks if the rule is left recursive or not. A rule is left recursive if it is of the form X -> X..., so its
     * first symbol of the right side is the symbol on the left side.
     * @return True, if the rule is left recursive; false otherwise.
     */
    leftRecursive() : boolean{
        return this.rightHandSide[0].getName() == this.leftHandSide.getName() && this.type == RuleType.SINGLE_NON_TERMINAL;
    }

    /**
     * In conversion to Chomsky Normal Form, rules like A -> BC... are replaced with A -> X1... and X1 -> BC. This
     * method replaces B and C non-terminals on the right hand side with X1.
     * @param first Non-terminal symbol B.
     * @param second Non-terminal symbol C.
     * @param _with Non-terminal symbol X1.
     * @return True, if any replacements has been made; false otherwise.
     */
    updateMultipleNonTerminal(first: Symbol, second: Symbol, _with: Symbol) : boolean{
        for (let i = 0; i < this.rightHandSide.length - 1; i++){
            if (this.rightHandSide[i].getName() == first.getName() && this.rightHandSide[i + 1].getName() == second.getName()){
                this.rightHandSide.splice(i + 1, 1)
                this.rightHandSide.splice(i, 1)
                this.rightHandSide.splice(i, 0, _with)
                if (this.rightHandSide.length == 2){
                    this.type = RuleType.TWO_NON_TERMINAL
                }
                return true
            }
        }
        return false
    }

    /**
     * Accessor for the rule type.
     * @return Rule type.
     */
    getType(): RuleType{
        return this.type
    }

    setType(type: RuleType){
        this.type = type
    }

    /**
     * Accessor for the left hand side.
     * @return Left hand side.
     */
    getLeftHandSide(): Symbol{
        return this.leftHandSide
    }

    /**
     * Accessor for the right hand side.
     * @return Right hand side.
     */
    getRightHandSide(): Array<Symbol>{
        return this.rightHandSide
    }

    /**
     * Returns number of symbols on the right hand side.
     * @return Number of symbols on the right hand side.
     */
    getRightHandSideSize(): number{
        return this.rightHandSide.length
    }

    /**
     * Returns symbol at position index on the right hand side.
     * @param index Position of the symbol
     * @return Symbol at position index on the right hand side.
     */
    getRightHandSideAt(index: number): Symbol{
        return this.rightHandSide[index]
    }

    /**
     * Converts the rule to the form X -> ...
     * @return String form of the rule in the form of X -> ...
     */
    toString(): string{
        let result = this.leftHandSide + " -> "
        for (let symbol of this.rightHandSide){
            result = result + " " + symbol
        }
        return result
    }
}