import { Book } from "./listItems";
interface ItemProps {
    data: Book;
}

function Item({data}:ItemProps) {
    console.log(data);
    return ( 
        <div className="item">
            <div className="itemImg">
                <img src={data.imagen_url}/>
            </div>
            <div className="info">
                <b>{data.nombre}</b>
                <p>${data.precio}</p>
                <button>Comprar</button>
            </div>
        </div>
    )
}

export default Item