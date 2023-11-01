const inputEl = document.getElementById("input");
const outputEl = document.getElementById("output");
const reverseEl = document.getElementById("reverse-table");
const dnfEl = document.getElementById("dnf")
const knfEl = document.getElementById("knf")
const md = document.getElementById("md")

inputEl.oninput = () => {
    calc()
    reloadMathJax()
}
reverseEl.oninput = () => {
    calc()
    reloadMathJax()
}

function calc(){
    let table = "<table><tr>"
    const formula = inputEl.value;

    const NOTATIONS = {
        "INFIX":translateFormula,
        "POSTFIX":fromPostFixToInFix,
        "PREFIX":fromPreFixToInFix
    }

    Object.entries(NOTATIONS).forEach(([type,fct]) => {
        try {
            fct(formula);
            console.log(formula,type)
        }
        catch(e){
            console.warn(`IT IS NOT ${type}`);
        }
    
    })
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
    // console.log("pos",toPostFix(formula))
    // console.log("pre",toPreFix(formula))
    // console.log(translateFormula(formula))
    // console.log("pos to inf",fromPostFixToInFix(toPostFix(formula)))
    // console.log("pre to inf",fromPreFixToInFix(toPreFix(formula)))



}
calc()