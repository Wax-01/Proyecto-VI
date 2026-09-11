import AppRouter from "./routers/AppRouters"
import { AuthProvider } from "./context/authcontext"
import { ItemProvider } from "./context/ItemContext"
import { CartProvider } from "./context/CartContext"
import { ThemeProvider } from "./context/ThemeContext"
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <ItemProvider>
          <CartProvider>
            <AppRouter></AppRouter>
          </CartProvider>
        </ItemProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
