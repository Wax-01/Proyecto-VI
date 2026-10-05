import ListItems from "../../components/ListItems";
import NavBar from "../../components/NavBar"
import Search from "../../components/Search"
import ShoppingCart from "../../components/ShoppingCart";
import { ItemContext } from "../../context/ItemContext"
import { useContext, useEffect, useState } from "react"
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCartShopping } from '@fortawesome/free-solid-svg-icons'
import { CartContext } from "../../context/CartContext";

function Home (){
    const context=useContext(ItemContext);
    const cartContext=useContext(CartContext);
    const [loading, setLoading] = useState(true);
    const [showCart, setShowCart]= useState(false);
    useEffect(() => {
    async function loadBooks() {
        const data = await context.getBook();

        if (data) {
            context.updateData(data);
            setLoading(false);
        };
    };

    loadBooks();
}, []);
    return(
        <>
        <NavBar></NavBar>
        <Search></Search>
        <div className="home">
            <div id="books">
                {loading ?
                    (<>Cargando...</>)
                    :(
                    <ListItems Books={context.data}></ListItems>
                    )}
            </div>
            <div
                className={`cartOverlay ${showCart ? 'open' : ''}`}
                onClick={() => setShowCart(false)}   
                />
            <button className="cartButton" onClick={() => setShowCart(!showCart)}><FontAwesomeIcon icon={faCartShopping} size="lg" /> {cartContext.Cantidad}/5</button>
            <ShoppingCart isOpen={showCart}></ShoppingCart>
        </div>
        </>
    )
}

export default Home