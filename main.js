const removeParentheses = (val) => val.startsWith("(") && val.endsWith(")") ? val.substring(1,val.length-1) : val;

const reloadMathJax = () => MathJax.Hub.Queue(["Typeset",MathJax.Hub]);

const inputEl = document.getElementById("input");
const outputEl = document.getElementById("output");
const reverseEl = document.getElementById("reverse-table");
const dnfEl = document.getElementById("dnf")
const knfEl = document.getElementById("knf")

inputEl.oninput = () => {
    calc()
    MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
}
reverseEl.oninput = () => {
    calc()
    MathJax.Hub.Queue(["Typeset",MathJax.Hub]);
}

/**
 * @param {string} v 
 * @returns {string}
 */
const logicToMathJax = (v) => v
    .replaceAll("!","\\neg ")
    .replaceAll("|","\\vee ")
    .replaceAll("&","\\wedge ")
    .replaceAll("=","\\iff ")
    .replaceAll(">","\\implies ")
    .replaceAll("@","\\uparrow ")
    .replaceAll("#","\\downarrow ")




function calc(){
    let table = "<table><tr>"
    const formula = inputEl.value;
    const compounds = getCompounds(formula);
    const variables = getLogicFormulaVariables(formula)
    variables.forEach(c => table += `<th>$${c}$</th>`);
    [...compounds,formula].forEach(v => 
        table += `<th>$${logicToMathJax(v)}$</th>`
    )
    table += "</tr>"
    const combs = GenCombs(variables.length);
    if (reverseEl.checked) combs.reverse()
    combs.forEach(vals => {
        table += "<tr>";
        vals.forEach(c => table += `<td>$${c}$</td>`);
        [...compounds,formula].forEach(form => {
            const params = {};
            vals.forEach((_,i) => params[variables[i]] = vals[i]);
            table += `<td>${evaluateFormula(form,params)?1:0}</td>`
        })
        table += "</tr>"
    })
    outputEl.innerHTML = table+"</table>"
    dnfEl.innerHTML = `$${logicToMathJax(makeDNF(formula))}$`
    knfEl.innerHTML = `$${logicToMathJax(makeKNF(formula))}$`
}
calc()