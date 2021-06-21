import { createContext, ReactNode, useContext, useState } from 'react';
import { toast } from 'react-toastify';
import { api } from '../services/api';
import { Product, Stock } from '../types';

interface CartProviderProps {
  children: ReactNode;
}

interface UpdateProductAmount {
  productId: number;
  amount: number;
}

interface CartContextData {
  cart: Product[];
  addProduct: (productId: number) => Promise<void>;
  removeProduct: (productId: number) => void;
  updateProductAmount: ({ productId, amount }: UpdateProductAmount) => void;
}

const CartContext = createContext<CartContextData>({} as CartContextData);

export function CartProvider({ children }: CartProviderProps): JSX.Element {

  const [cart, setCart] = useState<Product[]>(() => {
    const storagedCart = localStorage.getItem('@RocketShoes:cart');

    if (storagedCart) {
      return JSON.parse(storagedCart);
    }

    return [];
  });

  const addProduct = async (productId: number) => {
    try {

      const alreadyCart = cart.find(product => product.id === productId);

      if (!alreadyCart) {
        const { data: product } = await api.get<Product>(`/products/${productId}`);
        const { data: stock } = await api.get<Stock>(`/stock/${productId}`);

        if (stock.amount > 0) {
          setCart([...cart, { ...product, amount: 1 }]);
          localStorage.setItem('@RocketShoes:cart', JSON.stringify([...cart, { ...product }]));
          toast('Produto adicionado com sucesso');

          return;
        }
      }

      if (alreadyCart) {
        const { data: stock } = await api.get<Stock>(`/stock/${productId}`);

        if (stock.amount > alreadyCart.amount) {
          const updateProduct = cart.map(cartItem => cartItem.id === productId ? {
            ...cartItem,
            amount: Number(cartItem.amount) + 1
          } : cartItem)

          setCart(updateProduct);
          localStorage.setItem('@RocketShoes:cart', JSON.stringify([...cart, { ...updateProduct }]));
          toast('Produto adicionado com sucesso');
        }

        else {
          toast.error('Quantidade solicitada insuficiente no estoque');
        }
      }

    } catch {
      toast.error('Erro na adição do produto');
    }
  };

  const removeProduct = (productId: number) => {
    try {

      const productExists = cart.some(cartItem => cartItem.id === productId);

      if(!productExists) {
        toast.error('Erro na remoção do produto');
        return;
      }

      const updateCart = cart.filter(cart => cart.id !== productId);

      setCart(updateCart);
      toast('Produto removido com sucesso');
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(updateCart));
      return;
    } catch {
      toast.error('Erro ao tentar remover o produto do carrinho');
    }
  };

  const updateProductAmount = async ({
    productId,
    amount,
  }: UpdateProductAmount) => {
    try {

      const { data: stock } = await api.get<Stock>(`/stock/${productId}`);

      if (stock.amount < 1 || stock.amount == 0) {
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }

      const stockIsNotAvaiable = amount > stock.amount;

      if (stockIsNotAvaiable) {
        toast.error('Quantidade solicitada fora de estoque');
        return;
      }

      const updateCart = cart.map(cartItem => cartItem.id === productId ? {
        ...cartItem,
        amount: amount
      } : cartItem);

      setCart(updateCart);
      localStorage.setItem('@RocketShoes:cart', JSON.stringify(updateCart));
    } catch {
      toast.error('Erro na alteração de quantidade do produto');
    }
  };

  return (
    <CartContext.Provider
      value={{ cart, addProduct, removeProduct, updateProductAmount }}
    >
      {children}
    </CartContext.Provider>
  );
}

export function useCart(): CartContextData {
  const context = useContext(CartContext);

  return context;
}
