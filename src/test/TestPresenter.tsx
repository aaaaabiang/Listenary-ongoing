import { useState } from "react";
import { DictionaryAPI } from "../api/dictionaryAPI";

function TestPresenter() {
    const [word, setWord] = useState(""); 

    function testDictionaryAPI() {
        DictionaryAPI.getWord('Test')
            .then(data => {
                setWord(data);
            })
            .catch(error => {
                console.error('Query Failed:', error);
            });
    }

    testDictionaryAPI();

    return (
        <div>
            <h1>{JSON.stringify(word)}</h1>
        </div>
    )
}

export default TestPresenter;