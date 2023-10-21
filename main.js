const removeParentheses = (val) => val.startsWith("(") && val.endsWith(")") ? val.substring(1,val.length-1) : val;

const reloadMathJax = () => MathJax.Hub.Queue(["Typeset",MathJax.Hub]);

const inputEl = document.getElementById("input");
const outputEl = document.getElementById("output");

inputEl.oninput = () => {
    calc()
    MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
}


/**
 * Random ass metoda
 * @param {string} v 
 * @returns {string}
 */
const logicToMathJax = (v) => v
    .replaceAll("!","\\neg ")
    .replaceAll("|","\\vee ")
    .replaceAll("&","\\wedge ")
    .replaceAll("=","\\iff ")
    .replaceAll(">","\\implies ")




function calc(){
    let table = "<table><tr>"
    const formula = inputEl.value;
    const compounds = getCompounds(formula);
    const constants = getLogicFormulaVariables(formula)
    constants.forEach(c => table += `<th>$${c}$</th>`);
    [...compounds,formula].forEach(v => 
        table += `<th>$${logicToMathJax(v)}$</th>`
    )
    table += "</tr>"
    GenCombs(constants.length).forEach(vals => {
        table += "<tr>";
        vals.forEach(c => table += `<td>$${c}$</td>`);
        [...compounds,formula].forEach(form => {
            const params = {};
            vals.forEach((_,i) => params[constants[i]] = vals[i]);
            table += `<td>${evaluateFormula(form,params)?1:0}</td>`
        })
        table += "</tr>"
    })
    outputEl.innerHTML = table+"</table>"
}
calc()