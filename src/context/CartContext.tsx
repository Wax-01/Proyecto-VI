import { createContext, useRef, useState } from "react";
import { Book } from "../components/ListItems";
interface cartContextProps{
    Cart: number[];
    CartReducer: (id:number)=>void;
    isVisible: boolean;
    setIsVisible: (value: boolean) => void;
    deleteElement:(id:number)=>void;
    Cantidad:number;
}
export const CartContext= createContext ({} as cartContextProps);
export const CartProvider = ({ children }: any) => {
    const [isVisible, setIsVisible] = useState(false);
    const [Cart, setCart] = useState<number[]>([0, 0, 0, 0, 0]);
    const Actual = useRef<number>(0);
    const [Cantidad, setCantidad]=useState(0);
    function CartReducer(Id: number) {
        const newCart = [...Cart]; 
        if (Id==0){
            newCart[Actual.current]=0;
            if (Actual.current>0) {
                Actual.current--;
            }
        }
        else {
            if (Actual.current>=4) {
                Actual.current=4;
                return;
            }  
            newCart[Actual.current]=Id;
            Actual.current++;
        }
        newCart.sort((a, b) => b - a);
        setCart(newCart);
        setCantidad(Actual.current+1);
    }
    function deleteElement(id: number){
        const newCart = [...Cart]; 
        for (let i = 0; i < newCart.length-1; i++){
            if (newCart[i]==id){
                newCart[i]=0;
            }
        }
        newCart.sort((a, b) => b - a);
        setCart(newCart);
        setCantidad(Actual.current+1);
    }
   return <CartContext.Provider value={
           {
               Cart,
               CartReducer,
               isVisible,
               setIsVisible,
               deleteElement,
               Cantidad,
           }
       }>
           {children}
       </CartContext.Provider>
}
