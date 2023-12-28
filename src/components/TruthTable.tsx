'use client';

import React from 'react';
import {evaluateFormula, GenCombs, getCompounds, getLogicFormulaVariables, translateFormula} from "@/logic";
import Math from "@/components/Math";

import {logicToLatex} from "@/latex";

type TruthTableProps = {
    formula: string
    reversed?: boolean
}


const TruthTable = ({formula, reversed}: TruthTableProps) => {

    try {
        translateFormula(formula)
    }
    catch (e){
        if (e instanceof Error){
            return <div className={"text-red-600"}>Error while parsing: {e.message}</div>

        }
        return <div className={"text-red-600"}>Unknown Error</div>
    }

    const compounds = getCompounds(formula);
    const variables = getLogicFormulaVariables(formula);

    const combs = GenCombs(variables.length);
    if (reversed) combs.reverse();

    return (
        <table className={"border-collapse"}>
            <thead>
            <tr>
                {[...variables, ...compounds, formula].map((v, i) =>
                    <th className={"border-black border p-1"} key={i}>
                        <Math inline>{logicToLatex(v)}</Math>
                    </th>)}
            </tr>
            </thead>
            <tbody>

            {combs.map((row, rI) =>
                <tr key={rI}>
                    {row.map((col, cI) => <td className={"border border-black p-1"} key={cI}><Math inline>{col}</Math></td>)}
                    {[...compounds,formula].map((form,i) => {
                        const params: Record<string,number> = {};
                        row.forEach((_,i) => params[variables[i]]=row[i]);
                        return <td className={"border border-black p-1 text-center"} key={i}>
                            <Math inline>
                            {evaluateFormula(form,params) ? 1 : 0}
                            </Math>
                        </td>
                    })}
                </tr>
            )}
            </tbody>
        </table>
    );
};

export default TruthTable;