import { useContext } from "react";
import { CartContext } from "../context/CartContext";
import { Book } from "./ListItems";
interface ItemProps {
    data: Book;
    CartItem: boolean;   
}

function Item({ data, CartItem }: ItemProps) {
    const context=useContext(CartContext);
    function Add(){
        context.CartReducer(data.id);

    };
    function remove() {
        context.deleteElement(data.id);
    };
    return ( 
        <div className="item">
            <div className="itemImg">
                <img src={data.imagen_url}/>
            </div>
            <div className="info">
                <b>{data.nombre}</b>
                <p>${data.precio}</p>
                {CartItem ?
                    (<><button onClick={remove}>Eliminar</button></>)
                    :(
                    <button onClick={Add}>Comprar</button>
                    )}
                
            </div>
        </div>
    )
}

export default Item
