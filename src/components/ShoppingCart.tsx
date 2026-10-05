import { useContext, useEffect, useState } from "react";
import ListItems, { Book } from "./ListItems";
import { CartContext } from "../context/CartContext";
import { ItemContext } from "../context/ItemContext";
function ShoppingCart({ isOpen }: { isOpen: boolean }){
    const cartContext=useContext(CartContext);
    const itemsContext=useContext(ItemContext);
    const [data,setData]=useState<Book[]>([]);
    useEffect(() => {
    itemsContext.getShoppingCartBooks(cartContext.Cart).then(setData);
}, [cartContext.Cart]);
    
    function Buy() {
        
    }
    return(
        <div className={`car ${isOpen ? 'open' : ''}`}>
            <h2>Carrito de compras</h2>
            <ListItems Books={data} ></ListItems>
            <button onClick={()=>Buy}>  
                Comprar
            </button>
        </div>
    )
}

export default ShoppingCart