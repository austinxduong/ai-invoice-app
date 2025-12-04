import React, { createContext, useContext, useReducer, useEffect } from 'react';
import toast from 'react-hot-toast';

const CartContext = createContext();

// Cart reducer for state management
const cartReducer = (state, action) => {
  switch (action.type) {
    case 'LOAD_CART':
      return {
        ...state,
        items: action.payload,
        isLoaded: true,
      };

    case 'ADD_ITEM':
      const existingItemIndex = state.items.findIndex(
        item => item.id === action.payload.id && 
                item.pricingOption?.weight === action.payload.pricingOption?.weight
      );

      if (existingItemIndex > -1) {
        const updatedItems = state.items.map((item, index) =>
          index === existingItemIndex
            ? { ...item, quantity: item.quantity + action.payload.quantity }
            : item
        );
        return { ...state, items: updatedItems };
      }

      return {
        ...state,
        items: [...state.items, { ...action.payload, cartItemId: `${action.payload.id}-${Date.now()}` }],
      };

    case 'REMOVE_ITEM':
      return {
        ...state,
        items: state.items.filter(item => item.cartItemId !== action.payload),
      };

    case 'UPDATE_QUANTITY':
      return {
        ...state,
        items: state.items.map(item =>
          item.cartItemId === action.payload.cartItemId
            ? { ...item, quantity: Math.max(1, action.payload.quantity) }
            : item
        ),
      };

    case 'CLEAR_CART':
      return { ...state, items: [] };

    case 'TOGGLE_MODAL':
      return { ...state, isModalOpen: !state.isModalOpen };

    default:
      return state;
  }
};

export const CartProvider = ({ children }) => {
  const [state, dispatch] = useReducer(cartReducer, {
    items: [],
    isModalOpen: false,
    isLoaded: false,
  });

  // Load cart from localStorage on mount
  useEffect(() => {
    const savedCart = localStorage.getItem('cannabis_cart');
    if (savedCart) {
      try {
        const cartItems = JSON.parse(savedCart);
        dispatch({ type: 'LOAD_CART', payload: cartItems });
      } catch (error) {
        console.error('Error loading cart:', error);
        dispatch({ type: 'LOAD_CART', payload: [] });
      }
    } else {
      dispatch({ type: 'LOAD_CART', payload: [] });
    }
  }, []);

  // Save cart to localStorage whenever items change
  useEffect(() => {
    if (state.isLoaded) {
      localStorage.setItem('cannabis_cart', JSON.stringify(state.items));
    }
  }, [state.items, state.isLoaded]);

  // Cart actions
  const addToCart = (product, pricingOption, quantity = 1) => {
    const cartItem = {
      id: product._id,
      name: product.name,
      sku: product.sku,
      category: product.category,
      subcategory: product.subcategory,
      image: product.images?.[0]?.url || null,
      pricingOption,
      quantity,
      cannabis: {
        thc: product.cannabinoids?.thcPercentage || 0,
        cbd: product.cannabinoids?.cbdPercentage || 0,
        effects: product.effects || [],
        batchNumber: product.compliance?.batchNumber,
      },
    };

    dispatch({ type: 'ADD_ITEM', payload: cartItem });
    toast.success(`Added ${product.name} to cart!`);
  };

  const removeFromCart = (cartItemId) => {
    dispatch({ type: 'REMOVE_ITEM', payload: cartItemId });
    toast.success('Removed from cart');
  };

  const updateQuantity = (cartItemId, quantity) => {
    if (quantity < 1) {
      removeFromCart(cartItemId);
      return;
    }
    dispatch({ type: 'UPDATE_QUANTITY', payload: { cartItemId, quantity } });
  };

  const clearCart = () => {
    dispatch({ type: 'CLEAR_CART' });
    toast.success('Cart cleared');
  };

  const toggleModal = () => {
    dispatch({ type: 'TOGGLE_MODAL' });
  };

  // Cart totals
  const cartTotal = state.items.reduce(
    (total, item) => total + (item.pricingOption?.price || 0) * item.quantity,
    0
  );

  const itemCount = state.items.reduce((total, item) => total + item.quantity, 0);

  const value = {
    items: state.items,
    isModalOpen: state.isModalOpen,
    itemCount,
    cartTotal,
    addToCart,
    removeFromCart,
    updateQuantity,
    clearCart,
    toggleModal,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};