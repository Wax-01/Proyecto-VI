import { createContext } from "react";
import { Book } from "../components/ListItems";
interface cartContextProps{
    Cart: number[];
}
export const CartContext= createContext ({} as cartContextProps);
export const CartProvider = ({ children }: any) => {

    var Cart:  number[] = [0, 0, 0, 0, 0];
    function CartReducer() {
        
    }
   return <CartContext.Provider value={
           {
               Cart,
           }
       }>
           {children}
       </CartContext.Provider>
}
