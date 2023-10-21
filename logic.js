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
function correctBraceCount(val) {
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
 * @param {string} formula
 * @returns {string}
 */
function translateFormula(formula) {
    if (!correctBraceCount(formula)) throw Error(`Uncorrectly braced ${formula}`);
    if (!isLogicFormula(formula)) throw Error(`Invalid characters in formula!`)
    formula = removeSurrFormBrackets(formula);
    if (formula.match(/^[a-z]$/)) return formula;
    if (formula.match(/^![a-z]$|^!\(.+\)$/)) return `${SYMBOL_MAP["!"].name}(${translateFormula(formula.substring(1))})`;
    let [prior,splitIndex] = [0,-1];
    for (let i = 0; i < formula.length; i++){
        const c = formula[i];
        if (c === "(") prior++;
        else if (c === ")") prior--;
        if (prior === 0 && Object.keys(SYMBOL_MAP).filter(f => f !== "!").includes(c)){
            if (splitIndex === -1) splitIndex = i;
            else if (
                Object.keys(SYMBOL_MAP).findIndex(v => v === c)
                <=
                Object.keys(SYMBOL_MAP).findIndex(v => v === formula[splitIndex])
            )
                splitIndex = i;
        }
    }
    if (splitIndex === -1) {
        throw Error(`Invalid formula!`);
    }

    return `${SYMBOL_MAP[formula[splitIndex]].name}(${
        translateFormula(formula.substring(0,splitIndex))
    },${
        translateFormula(formula.substring(splitIndex+1))
    })`;
}


/**
 * @param {string} formula 
 */
function getCompounds(formula) {
    const compounds = [];
    const rec = (formula) => {
        if (!correctBraceCount(formula)) throw Error(`Uncorrectly braced ${formula}`);
        if (!isLogicFormula(formula)) throw Error(`Invalid characters in formula!`)
        formula = removeSurrFormBrackets(formula);
        if (formula.match(/^[a-z]$/)) return formula;
        if (formula.match(/^![a-z]$|^!\(.+\)$/)) {
            compounds.push(formula);
            rec(formula.substring(1));
            return;
        }
        compounds.push(formula)
        let [prior,splitIndex] = [0,-1];
        for (let i = 0; i < formula.length; i++){
            const c = formula[i];
            if (c === "(") prior++;
            else if (c === ")") prior--;
            if (prior === 0 && Object.keys(SYMBOL_MAP).filter(f => f !== "!").includes(c)){
                if (splitIndex === -1) splitIndex = i;
                else if (
                    Object.keys(SYMBOL_MAP).findIndex(v => v === c)
                    <=
                    Object.keys(SYMBOL_MAP).findIndex(v => v === formula[splitIndex])
                ) splitIndex = i;
                
            }
        }
        if (splitIndex === -1) {
            throw Error(`Invalid formula!`);
        }
        Array.of(formula.substring(0,splitIndex),formula.substring(splitIndex+1)).forEach(f => rec(f))
    }
    rec(formula);
    return compounds.map(c => removeSurrFormBrackets(c)).slice(1).reverse();
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
 * @param {object} params 
 */
function evaluateFormula(formula,params){
    const variables = getLogicFormulaVariables(formula);
    formula = translateFormula(formula);
    variables.forEach(c => formula = formula.replaceAll(c,params[c]));
    return eval(formula);
}