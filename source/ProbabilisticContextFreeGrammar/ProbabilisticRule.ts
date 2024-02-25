import {Rule} from "../ContextFreeGrammar/Rule";
import {Symbol} from "nlptoolkit-parsetree/dist/Symbol";
import {RuleType} from "../ContextFreeGrammar/RuleType";

export class ProbabilisticRule extends Rule {

    private probability: number = 0.0
    private count: number = 0

    constructor6(rule: string) {
        let prob = rule.substring(rule.indexOf('[') + 1, rule.indexOf(']'))
        let left = rule.substring(0, rule.indexOf("->")).trim()
        let right = rule.substring(rule.indexOf("->") + 2, rule.indexOf('[')).trim()
        this.leftHandSide = new Symbol(left)
        let rightSide = right.split(" ")
        this.rightHandSide = []
        for (let i = 0; i < rightSide.length; i++){
            this.rightHandSide.push(new Symbol(rightSide[i]))
        }
        this.probability = parseFloat(prob)
    }

    constructor(param1?: Symbol | string,
                param2?: Array<Symbol>,
                param3?: RuleType,
                param4?: number) {
        super()
        if (param1 instanceof Symbol && Array.isArray(param2) && param3 == undefined) {
            super(param1, param2)
        } else {
            if (param1 instanceof Symbol && Array.isArray(param2) && param3 != undefined) {
                super(param1, param2, param3 as RuleType)
                this.probability = param4
            } else {
                if (typeof param1 == "string") {
                    this.constructor6(param1)
                }
            }
        }
    }

    getProbability(): number{
        return this.probability
    }

    increment(){
        this.count++
    }

    normalizeProbability(total: number){
        this.probability = this.count / total
    }

    getCount(): number{
        return this.count
    }

    toString(): string{
        return super.toString() + " [" + this.probability + "]"
    }

}