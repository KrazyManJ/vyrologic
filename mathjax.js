const reloadMathJax = () => MathJax.Hub.Queue(["Typeset",MathJax.Hub]);

/**
 * @param {string} formula
 * @returns {string}
 */
const logicToMathJax = (formula) => {
    const MAP = {
        "!":"\\neg ",
        "|":"\\vee ",
        "&":"\\wedge ",
        "=":"\\iff ",
        ">":"\\implies ",
        "@":"\\uparrow ",
        "#":"\\downarrow ",
    }
    Object.entries(MAP).forEach(([k,v])=>formula = formula.replaceAll(k,v))
    return formula;
}
