import {RuleType} from "./RuleType";
import {Symbol} from "nlptoolkit-parsetree/dist/Symbol";

export class Rule {
    protected leftHandSide: Symbol
    protected rightHandSide: Array<Symbol>
    protected type: RuleType

    constructor1() {
        this.rightHandSide = []
    }

    constructor2(leftHandSide: Symbol, rightHandSideSymbol: Symbol){
        this.leftHandSide = leftHandSide
        this.rightHandSide = []
        this.rightHandSide.push(rightHandSideSymbol)
    }

    constructor3(leftHandSide: Symbol, rightHandSideSymbol1: Symbol, rightHandSideSymbol2: Symbol){
        this.constructor2(leftHandSide, rightHandSideSymbol1)
        this.rightHandSide.push(rightHandSideSymbol2)
    }

    constructor4(leftHandSide: Symbol, rightHandSide: Array<Symbol>){
        this.leftHandSide = leftHandSide
        this.rightHandSide = rightHandSide
    }

    constructor5(leftHandSide: Symbol, rightHandSide: Array<Symbol>, type: RuleType){
        this.leftHandSide = leftHandSide
        this.rightHandSide = rightHandSide
        this.type = type
    }

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

    leftRecursive() : boolean{
        return this.rightHandSide[0].getName() == this.leftHandSide.getName() && this.type == RuleType.SINGLE_NON_TERMINAL;
    }

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

    getType(): RuleType{
        return this.type
    }

    setType(type: RuleType){
        this.type = type
    }

    getLeftHandSide(): Symbol{
        return this.leftHandSide
    }

    getRightHandSide(): Array<Symbol>{
        return this.rightHandSide
    }

    getRightHandSideSize(): number{
        return this.rightHandSide.length
    }

    getRightHandSideAt(index: number): Symbol{
        return this.rightHandSide[index]
    }

    toString(): string{
        let result = this.leftHandSide + " -> "
        for (let symbol of this.rightHandSide){
            result = result + " " + symbol
        }
        return result
    }
}