import {uniqueArray} from "@/utils";

const NEG = (a: number) => !a;
const AND = (a: number, b: number) => a && b;
const OR = (a: number, b: number) => a || b;
const IMP = (a: number, b: number) => !(a && !b);
const EQ = (a: number, b: number) => a == b;
const NAND = (a: number, b: number) => !AND(a, b)
const NOR = (a: number, b: number) => !OR(a, b)


const SYMBOL_MAP = {
    "!": NEG,
    "&": AND,
    "|": OR,
    ">": IMP,
    "=": EQ,
    "@": NAND,
    "#": NOR
} as const;

export const GenCombs = (n: number) => Array(Math.pow(2, n)).fill(0).map((_, i) =>
    Array(n).fill(0).map((_, j) => i >> j & 1).reverse()
)

function isCorrectBraceCount(val: string) {
    let depth = 0;
    for (const c of val) {
        if (c === "(") depth++;
        else if (c === ")") depth--;
        if (depth < 0) return false;
    }
    return depth === 0;
}

function isLogicFormula(formula: string) {
    return new RegExp(`^[a-z${Object.keys(SYMBOL_MAP).join("")}()]+$`).test(formula)
}

function removeSurrFormBrackets(formula:string){
    const rec = (formula:string) =>{
        if (!formula.startsWith("(") && !formula.startsWith(")")) return formula;
        let prior = 0;
        for (const c of formula.substring(0,formula.length-1)) {
            if (c === "(") prior++;
            else if (c === ")") prior--;
            if (prior < 1) return formula;
        }
        return formula.substring(1,formula.length-1);
    }
    let prev = rec(formula);
    while (prev !== rec(prev)) prev = rec(prev)
    return prev;
}

type VyrologicProcessCallbacks<T> = {
    onElemental?: (formula: string) => T | undefined
    onNegation?: (formula: string) => T | undefined
    onCompound?: (formula: string, splitIndex: number) => T | undefined
}


const processFormula = <T,>(formula: string,callbacks: VyrologicProcessCallbacks<T>): T | undefined => {
    if (!isCorrectBraceCount(formula))
        throw Error(`Uncorrectly braced ${formula}`);
    if (!isLogicFormula(formula))
        throw Error(`Invalid characters in formula!`)
    formula = removeSurrFormBrackets(formula);
    if (formula.match(/^[a-z]$/))
        return (callbacks.onElemental ?? (() => undefined))(formula);
    if (formula.match(/^![a-z]$/) || (formula.match(/^!\(.+\)$/) && removeSurrFormBrackets(formula.substring(1))!==formula.substring(1)))
        return (callbacks.onNegation ?? (() => undefined))(formula);
    let [prior,splitIndex] = [0,-1];
    for (let i = 0; i < formula.length; i++){
        const c = formula[i];
        if (c === "(") prior++;
        else if (c === ")") prior--;
        const conns = Object.keys(SYMBOL_MAP).filter(f => f !== "!")
        if (prior !== 0 || !conns.includes(c)) continue;
        if (splitIndex === -1 || (conns.indexOf(c)>=conns.indexOf(formula[splitIndex]))) splitIndex = i;
    }
    if (splitIndex === -1) {
        throw Error(`Invalid formula!`);
    }

    return (callbacks.onCompound ?? (() => undefined))(formula, splitIndex);
}

export function translateFormula(formula:string) {
    const callbacks: VyrologicProcessCallbacks<string> = {
        onElemental: (formula) => formula,
        onNegation: (formula) => `${SYMBOL_MAP["!"].name}(${processFormula(formula.substring(1),callbacks)})`,
        onCompound: (formula: string, splitIndex: number) => {
            return `${SYMBOL_MAP[formula.charAt(splitIndex) as keyof typeof SYMBOL_MAP].name}(${
                processFormula(formula.substring(0,splitIndex),callbacks)
            },${
                processFormula(formula.substring(splitIndex+1),callbacks)
            })`

        }
    }
    return processFormula(formula,callbacks)
}


export function getCompounds(formula: string): string[] {
    const result: string[] = [];
    const callbacks: VyrologicProcessCallbacks<void> = {
        onNegation: (f) => {
            processFormula(f.substring(1), callbacks);
            result.push(f);
        },
        onCompound: (f, splitIndex) => {
            processFormula(f.substring(0,splitIndex), callbacks);
            processFormula(f.substring(splitIndex+1), callbacks);
            if (f !== formula) result.push(f);
        }
    }
    processFormula(formula, callbacks);
    return uniqueArray(result);
}

export function getLogicFormulaVariables(formula: string): string[] {
    return uniqueArray(formula.replace(/[^a-z]/gi,"").split(""));
}

export function evaluateFormula(formula:string,params: Record<string,number>){
    const variables = getLogicFormulaVariables(formula);
    formula = translateFormula(formula) ?? "";
    variables.forEach(c => formula = formula.replaceAll(c,`${params[c]}`));
    return eval(formula);
}


export function makeDNF(formula:string): string{
    const variables = getLogicFormulaVariables(formula);
    let result: string[] = [];
    GenCombs(variables.length).forEach(vars => {
        const params: Record<string, number> = {};
        vars.forEach((_,i) => params[variables[i]] = vars[i]);
        if (evaluateFormula(formula,params)==1){
            result.push(`(${vars.map((v,i) => (v==0?"!":"")+variables[i]).join("&")})`)
        }
    })
    return removeSurrFormBrackets(result.join("|"))
}

export function makeCNF(formula: string){
    const variables = getLogicFormulaVariables(formula);
    let result: string[] = [];
    GenCombs(variables.length).forEach(vars => {
        const params: Record<string, number> = {};
        vars.forEach((_,i) => params[variables[i]] = vars[i]);
        if (evaluateFormula(formula,params)==0){
            result.push(`(${vars.map((v,i) => (v==0?"":"!")+variables[i]).join("|")})`)
        }
    })
    return removeSurrFormBrackets(result.join("&"))
}

function isTautology(formula: string){
    const variables = getLogicFormulaVariables(formula);
    for (const vals of GenCombs(variables.length)){
        const params: Record<string, number> = {};
        vals.forEach((_,i) => params[variables[i]] = vals[i]);
        if (evaluateFormula(formula,params) == 0) return false;
    }
    return true;
}

function isContradiction(formula:string){
    const variables = getLogicFormulaVariables(formula);
    for (const vals of GenCombs(variables.length)){
        const params: Record<string, number> = {};
        vals.forEach((_,i) => params[variables[i]] = vals[i]);
        if (evaluateFormula(formula,params) == 1) return false;
    }
    return true;
}


export function toPostFix(formula:string){
    const callbacks: VyrologicProcessCallbacks<string> = {
        onCompound: (f,splitIndex) => `${
            processFormula(f.substring(0,splitIndex),callbacks)
        }${
            processFormula(f.substring(splitIndex+1),callbacks)
        }${f[splitIndex]}`,
        onNegation: (f) => processFormula(f.substring(1),callbacks)+"!",
        onElemental: (f) => f
    }
    return processFormula(formula, callbacks)
}

export function toPreFix(formula: string){
    const callbacks: VyrologicProcessCallbacks<string> = {
        onCompound: (f,splitIndex) => `${f[splitIndex]}${
            processFormula(f.substring(0,splitIndex),callbacks)
        }${
            processFormula(f.substring(splitIndex+1),callbacks)
        }`,
        onNegation: (f) => "!"+processFormula(f.substring(1),callbacks),
        onElemental: (f) => f
    }
    return processFormula(formula, callbacks)
}


export function fromPostFixToInFix(formula:string ){
    let buffer:string[] = [];
    formula.split("").forEach(c => {
        if (c.match(/^[a-z]$/i)) buffer.push(c);
        else if (c === "!") buffer.push(c+buffer.pop())
        else if (Object.keys(SYMBOL_MAP).includes(c)) {
            const [sec,fir] = [buffer.pop(), buffer.pop()];
            buffer.push("("+fir+c+sec+")")
        }
        else {
            throw Error("Invalid postfix formula!")
        }
    })
    if (buffer.length>1) throw Error("Invalid prefix formula")
    return removeSurrFormBrackets(buffer[0]);
}

export function fromPreFixToInFix(formula: string){
    let buffer:string[] = [];
    formula.split("").reverse().forEach(c => {
        if (c.match(/^[a-z]$/i)) buffer.push(c);
        else if (c === "!") buffer.push(c+buffer.pop())
        else if (Object.keys(SYMBOL_MAP).includes(c)) {
            const [sec,fir] = [buffer.pop(), buffer.pop()];
            buffer.push("("+sec+c+fir+")")
        }
        else {
            throw Error("Invalid prefix formula!")
        }
    })
    if (buffer.length>1) throw Error("Invalid prefix formula")
    return removeSurrFormBrackets(buffer[0]);
}