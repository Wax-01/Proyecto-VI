import { createContext, useEffect, useState } from "react";
import { supabase } from "../utils/Supabase";
import { Book } from "../components/ListItems";
interface ItemsContextProps {
    data: Book[],
    getBook: () => Promise<any[]>,
    getSpecificbook: (word:String) => Promise<any[]>,
    updateData:(books:Book[])=> void,
    getShoppingCartBooks: (IDs:number [])=>Promise<Book[]>
}
export const ItemContext = createContext ({} as ItemsContextProps);
export const ItemProvider = ({ children }: any) => {

    const [data,setData]= useState <Book[]>([]);
    const updateData= (books:Book[])=>{
        if(books!==null){
            setData(books);           
        };
    };
    const getBook= async () =>{
try {
            const { data, error } = await supabase
                .from("libros")
                .select("*");

            if (!error) {
                return data;
            }
        } catch (error) {
            console.log(error)
        }
        return [];
    }
    const getSpecificbook = async (word: String)  =>{
try {
            const { data, error } = await supabase
                .from("libros")
                .select("*")
                .ilike("nombre", `%${word}%`);

            if (!error) {
                return data;
            }
        } catch (error) {
            console.log(error)
        }
        return [];
    }
    const getShoppingCartBooks= async(IDs:number[])=>{
        try {
            const { data, error } = await supabase
                .from("libros")
                .select("*")
                .in("id", IDs);

            if (!error) {
                return data;
            }
        } catch (error) {
            console.log(error)
        }
        return [];
    }
    return <ItemContext.Provider value={
        {
            data,
            updateData,
            getBook,
            getSpecificbook,
            getShoppingCartBooks,
        }
    }>
        {children}
    </ItemContext.Provider>
}