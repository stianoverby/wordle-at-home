import * as O from "fp-ts/Option";
import {pipe} from "fp-ts/function";
import { map, mapWithIndex } from 'fp-ts/Array'
import { range } from "./utilities";
const WORD_LENGTH = 5;

interface LineProps {
    guess : O.Option<string>,
    isFinal: boolean,
    isShaking: boolean,
    solution: string
}

export function Line({ guess, isFinal, isShaking, solution} : LineProps){
    const tiles = pipe(
        guess,
        O.map(w => w.padEnd(WORD_LENGTH)),
        O.map(w => Array.from(w)),
        O.map(
            mapWithIndex((i: number, char: string) => {
                const className = constructClassName(
                    isShaking,
                    isFinal,
                    char,
                    solution,
                    i
                );
                return <div className={className} key={i}>{char}</div>
            }
            )
        ),
        O.getOrElse(
            () => pipe(
                range(0, WORD_LENGTH),
                map((i: number) => <div className="tile" key={i}></div>)
            )
        )
    );
    return (
        <div className="line"> 
            {tiles} 
        </div>
    )
}

function constructClassName(
    isShaking: boolean,
    isFinal: boolean,
    char: string,
    solution: string,
    solutionIndex: number
){
    return pipe(
        "tile",
        (className) => (isShaking) 
            ? className + " shake"
            : className,
        (className) => {
            if(!isFinal){
                return className;
            } else if(char === solution[solutionIndex]){
                return className + " correct";
            } else if (solution.includes(char)) {
                return className + " close";
            } else {
                return className + " incorrect";
            }
        }
    );
}