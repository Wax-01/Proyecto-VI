import { Book } from "./listItems";
interface ItemProps {
    data: Book;
}

function Item({data}:ItemProps) {
    return ( 
        <div className="item">
            <img src={data.imagen_url}/>
            <b>{data.nombre}</b>
            <p>${data.precio}</p>
            <button>Comprar</button>
        </div>
    )
}

export default Item