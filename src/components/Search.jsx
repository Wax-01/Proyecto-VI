import { useContext, useState } from "react"
import { ItemContext } from "../context/ItemContext";

function Search(){
    const context=useContext(ItemContext);
    const [word,setWord]=useState("");
    async function SearchBook(book) {
        const Books= context.getSpecificbook(book);
        context.updateData(Books);
    };

    return(
        <div className="search">
            <input type="text" 
            id="inputSearch"
            onChange={e => setWord(e.target.value)}
            placeholder="Buscar"
            />
            <button onClick={() =>SearchBook(word)}>Buscar</button>

        </div>
        

    )
}

export default Search