const NEG = (a) => !a;
const AND = (a,b) => a && b;
const OR = (a,b) => a || b;
const IMP = (a,b) => !(a && !b);
const EQ = (a,b) => a == b;
const NAND = (a,b) => !AND(a,b)
const NOR = (a,b) => !OR(a,b)

const SYMBOL_MAP = {
    "!": NEG,
    "&": AND,
    "|": OR,
    ">": IMP,
    "=": EQ,
    "@": NAND,
    "#": NOR
}

/**
 * @param {number} n
 * @returns 
 */
const GenCombs = (n) => Array(Math.pow(2,n)).fill(0).map((_,i)=>
    Array(n).fill(0).map((_,j)=> i>>j&1).reverse()
)

/**
 * @param {string} val 
 * @returns {boolean}
 */
function isCorrectBraceCount(val) {
    let depth = 0;
    for (const c of val) {
        if (c === "(") depth++;
        else if (c === ")") depth--;
        if (depth < 0) return false;
    }
    return depth === 0;
}

/**
 * @param {string} formula 
 * @returns {boolean}
 */
function isLogicFormula(formula){
    return new RegExp(`^[a-z${Object.keys(SYMBOL_MAP).join("")}()]+$`).test(formula)
}

/**
 * @param {string} formula 
 * @returns {string}
 */
function removeSurrFormBrackets(formula){
    const rec = (formula) =>{
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

/**
 * @template T
 * @typedef {{
* onElemental?: (formula: string) => T | undefined
* onNegation?:  (formula: string) => T | undefined
* onCompound?:  (formula: string, splitIndex: int) => T | undefined
* }} VyrologicProcessCallbacks
*/

/**
* @param {string} formula 
* @param {VyrologicProcessCallbacks} callbacks
* @returns {string|undefined}
*/
const processFormula = (formula,callbacks) => {
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

/**
 * @param {string} formula
 * @returns {string}
 */
function translateFormula(formula) {
    /** @type {VyrologicProcessCallbacks<string>} */
    const callbacks = {
        onElemental: (formula) => formula,
        onNegation: (formula) => `${SYMBOL_MAP["!"].name}(${processFormula(formula.substring(1),callbacks)})`,
        onCompound: (formula, splitIndex) => 
            `${SYMBOL_MAP[formula[splitIndex]].name}(${
                processFormula(formula.substring(0,splitIndex),callbacks)
            },${
                processFormula(formula.substring(splitIndex+1),callbacks)
            })`
    }
    return processFormula(formula,callbacks)
}


/**
 * @param {string} formula
 * @returns {string[]}
 */
function getCompounds(formula) {
    /** @type {VyrologicProcessCallbacks<string[]>} */
    const callbacks = {
        onElemental: () => [],
        onNegation: (f) => [f,...processFormula(f.substring(1),callbacks)],
        onCompound: (f,splitIndex) => [
            ...processFormula(f.substring(0,splitIndex),callbacks),
            f,
            ...processFormula(f.substring(splitIndex+1),callbacks)
        ]   
    }
    return [...new Set(processFormula(formula,callbacks).filter(f => f !== removeSurrFormBrackets(formula))).values()]
}

/**
 * @param {string} formula 
 * @returns {string[]}
 */
function getLogicFormulaVariables(formula) {
    return [...(new Set([...formula.replace(/[^a-z]/gi,"")])).values()].sort();
}

/**
 * @param {string} formula 
 * @param {Record<string,number>} params 
 */
function evaluateFormula(formula,params){
    const variables = getLogicFormulaVariables(formula);
    formula = translateFormula(formula);
    variables.forEach(c => formula = formula.replaceAll(c,params[c]));
    return eval(formula);
}

/**
 * @param {string} formula 
 */
function makeDNF(formula){
    const variables = getLogicFormulaVariables(formula);
    let result = [];
    GenCombs(variables.length).forEach(vars => {
        const params = {};
        vars.forEach((_,i) => params[variables[i]] = vars[i]);
        if (evaluateFormula(formula,params)==1){
            result.push(`(${vars.map((v,i) => (v==0?"!":"")+variables[i]).join("&")})`)
        }
    })
    return removeSurrFormBrackets(result.join("|"))
}

/**
 * @param {string} formula 
 */
function makeKNF(formula){
    const variables = getLogicFormulaVariables(formula);
    let result = [];
    GenCombs(variables.length).forEach(vars => {
        const params = {};
        vars.forEach((_,i) => params[variables[i]] = vars[i]);
        if (evaluateFormula(formula,params)==0){
            result.push(`(${vars.map((v,i) => (v==0?"":"!")+variables[i]).join("|")})`)
        }
    })
    return removeSurrFormBrackets(result.join("&"))
}

function isTautology(formula){
    const variables = getLogicFormulaVariables(formula);
    for (const vals of GenCombs(variables.length)){
        const params = {};
        vals.forEach((_,i) => params[variables[i]] = vals[i]);
        if (evaluateFormula(formula,params) == 0) return false;
    }
    return true;
}

function isContradiction(formula){
    const variables = getLogicFormulaVariables(formula);
    for (const vals of GenCombs(variables.length)){
        const params = {};
        vals.forEach((_,i) => params[variables[i]] = vals[i]);
        if (evaluateFormula(formula,params) == 1) return false;
    }
    return true;
}