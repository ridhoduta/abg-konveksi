import { ReactNode } from "react";
import { CartProvider } from "./context/CartContext";

export default function KasirLayout({ children }: { children: ReactNode }) {
  return (
    <CartProvider>
      {children}
    </CartProvider>
  );
}
