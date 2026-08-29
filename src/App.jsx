import AppRouter from "./routers/AppRouters"
import { AuthProvider } from "./context/authcontext"
import { ItemProvider } from "./context/ItemContext"
import { CartProvider } from "./context/CartContext"
function App() {
  return (
    <AuthProvider>
      <ItemProvider>
        <CartProvider>
          <AppRouter></AppRouter>
        </CartProvider>
      </ItemProvider>
    </AuthProvider>
  )
}

export default App
