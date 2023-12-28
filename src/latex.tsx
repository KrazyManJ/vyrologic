export const logicToLatex = (formula: string): string => {
    const MAP = {
        "!": "\\neg ",
        "|": "\\vee ",
        "&": "\\wedge ",
        "=": "\\iff ",
        ">": "\\implies ",
        "@": "\\uparrow ",
        "#": "\\downarrow ",
    }
    Object.entries(MAP).forEach(([k, v]) => formula = formula.replaceAll(k, v))
    return formula;
}
const TAUTOLOGY_SYMBOL = "\\top"
const CONTRADICTION_SYMBOL = "\\bot"