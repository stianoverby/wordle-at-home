import { useEffect, useState } from "react";
import "./App.css";
import { WORDS } from "./words";
import * as O from "fp-ts/Option";
import * as E from "fp-ts/Either";
import { pipe } from "fp-ts/function";
import { Line } from "./Line";
import { Box } from "./Box";

const MAX_GUESSES = 6;
const WORD_LENGTH = 5;

function App() {
  const [solution, setSolution] = useState<string>("");
  const [guesses, setGuesses] = useState<O.Option<string>[]>(
    Array(MAX_GUESSES).fill(O.none)
  );
  const [currentGuess, setCurrentGuess] = useState<string>("");
  const [isGameOver, setIsGameOver] = useState<boolean>(false);
  const [isShaking, setIsShaking] = useState(false);
  const [alertMessage, setAlertMessage] = useState("");
  const [showAlertbox, setShowAlertbox] = useState(false);

  function triggerShake() {
    setIsShaking(true);

    // Remove the shake class after the animation ends
    setTimeout(() => {
      setIsShaking(false);
    }, 500); // Duration of the shake animation
  }

  function triggerAlertbox(msg: string) {
    setAlertMessage(msg);
    setShowAlertbox(true);

    setTimeout(() => {
      setShowAlertbox(false);
    }, 1500);
  }

  useEffect(() => {
    pipe(
      WORDS,
      E.fromNullable(new Error("Not able to retrieve words")),
      E.map(pickRandomWord),
      E.match(
        (err: Error) => displayError(err),
        (word: string) => setSolution(word)
      )
    );
  }, []);

  useEffect(() => {
    function handleTyping(event: KeyboardEvent) {
      pipe(
        event.key,
        O.fromPredicate(() => !isGameOver),
        O.flatMap(O.fromPredicate(isValid)),
        O.map((key: string) => {
          console.log(key);
          switch (key) {
            case "Backspace":
              if (currentGuess.length == 0) {
                return;
              }

              setCurrentGuess((prevGuess) =>
                prevGuess.slice(0, prevGuess.length - 1)
              );
              break;
            case "Enter":
              if (currentGuess.length !== WORD_LENGTH) {
                return;
              }
              const validWord =
                WORDS.find((w) => currentGuess === w) !== undefined;
              if (!validWord) {
                triggerAlertbox("Not a valid word");
                triggerShake();
                return;
              }

              // Add current guess to guesses
              const newGuesses = [...guesses];
              newGuesses[newGuesses.findIndex((val) => O.isNone(val))] =
                O.some(currentGuess);
              setGuesses(newGuesses);

              // Check if game is finished
              const correctGuess = currentGuess.toLowerCase() === solution;
              if (correctGuess) {
                setIsGameOver(true);
              }
              // Reset current guess
              setCurrentGuess("");
              break;
            default:
              if (!isAlpha(key) || currentGuess.length >= WORD_LENGTH) {
                return;
              }
              setCurrentGuess((prevGuess) => prevGuess + key);
              break;
          }
        })
      );
    }
    window.addEventListener("keydown", handleTyping);
    return () => window.removeEventListener("keydown", handleTyping);
  }, [isGameOver, currentGuess, guesses]);

  return (
    <div className="App center">
      {showAlertbox && <Box message={alertMessage}></Box>}
      <div className="board center">
        {guesses.map((guess: O.Option<string>, i: number) => {
          const isCurrentGuess =
            i === guesses.findIndex((val) => O.isNone(val));
          return (
            <Line
              guess={isCurrentGuess ? O.some(currentGuess) : guess}
              isFinal={!isCurrentGuess && O.isSome(guess)}
              isShaking={isCurrentGuess && isShaking}
              solution={solution}
            ></Line>
          );
        })}
      </div>
    </div>
  );
}

function timestamp(): number{
  const x = +new Date / 1000;
  return x;
}

function pickRandomWord(words: string[]): string {
  return words[timestamp() % words.length];
  return words[Math.floor(Math.random() * words.length)];
}

function isValid(s: string): boolean {
  return isBackspace(s) || isEnter(s) || isAlpha(s);
}

function isBackspace(s: string): boolean {
  return s === "Backspace";
}

function isEnter(s: string): boolean {
  return s === "Enter";
}

function isAlpha(char: string): boolean {
  if (char.length !== 1) {
    return false;
  }

  const charCode = char.charCodeAt(0);
  return (
    (charCode >= 65 && charCode <= 90) || // Uppercase letters (A-Z)
    (charCode >= 97 && charCode <= 122) // Lowercase letters (a-z)
  );
}

function displayError(err: Error): void {
  alert(err.message);
}

export default App;
