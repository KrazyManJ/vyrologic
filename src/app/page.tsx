'use client';

import TruthTable from "@/components/TruthTable";
import {useEffect, useState} from "react";
import Math from "@/components/Math";
import {fromPostFixToInFix, fromPreFixToInFix, makeCNF, makeDNF, translateFormula} from "@/logic";

import {logicToLatex} from "@/latex";


const DNFAndCNF = ({formula}:{formula:string}) => {
    try {
        return <>
            <div>DNF:&nbsp;
                <Math inline>{logicToLatex(makeDNF(formula))}</Math>
            </div>
            <div>CNF:&nbsp;
                <Math inline>{logicToLatex(makeCNF(formula))}</Math>
            </div>
        </>
    } catch (e) {
        return <div></div>
    }
}

export default function Home() {
    const [formula, setFormula] = useState("(!p|q)=(!q&r)")
    const [reversed, setReversed] = useState(false)

    useEffect(() => {
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
                console.log(`IT IS NOT ${type}`);
            }

        })
    }, [formula]);

    return (
        <main className={"p-10"}>
            <form>
                <label>
                    Formula:
                    <input
                        type="text"
                        className={"mx-2"}
                        value={formula}
                        placeholder={"(p&!q)|!(q@r)"}
                        onInput={(event) => setFormula(event.currentTarget.value)}
                    />
                </label>
                <label>
                    Start truth table with 1s
                    <input
                        type="checkbox"
                        className={"mx-2"}
                        checked={reversed}
                        onChange={() => setReversed(prev => !prev)}
                    />
                </label>
            </form>
            <div className={"my-4"}>
                <TruthTable formula={formula} reversed={reversed}/>
            </div>
            <DNFAndCNF formula={formula}/>
        </main>
    )
}
