import React, { createContext, useContext, useReducer, useEffect, useRef, useCallback } from 'react';
import toast from 'react-hot-toast';
import { calculateCartTax } from '../utils/cannabisTax';
const POSTransactionContext = createContext();

const transactionReducer = (state, action) => {

    switch (action.type) {
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
                items: [...state.items, { ...action.payload, transactionItemId: Date.now() }]
            };

        case 'REMOVE_ITEM':
            return {
                ...state,
                items: state.items.filter(item => item.transactionItemId !== action.payload)
            };

        case 'UPDATE_QUANTITY':
            return {
                ...state,
                items: state.items.map(item =>
                    item.transactionItemId === action.payload.id
                    ? { ...item, quantity: Math.max(0, action.payload.quantity) }
                    : item
                ).filter(item => item.quantity > 0)
            };

        case 'APPLY_DISCOUNT':
            return {
                ...state,
                discount: action.payload
            };
        
        case 'SET_CUSTOMER_INFO':
            return {
                ...state,
                customerInfo: action.payload
            };
        
        case 'SET_PAYMENT_METHOD':
            return {
                ...state,
                paymentMethod: action.payload
            };
        
        case 'COMPLETE_TRANSACTION':
            return {
                ...state,
                completedTransactions: [...state.completedTransactions, action.payload], // FIXED: missing comma
                items: [],
                discount: null,
                customerInfo: null, // FIXED: added missing field
                paymentMethod: 'cash',
                cashReceived: 0
            };

        case 'CLEAR_TRANSACTION':
            return {
                ...state,
                items: [],
                discount: null,
                customerInfo: null,
                cashReceived: 0
            };

        case 'SET_CASH_RECEIVED':
            return {
                ...state,
                cashReceived: action.payload
            };
        
        case 'LOAD_TRANSACTIONS':
            return {
                ...state,
                completedTransactions: action.payload
            };
        default:
            return state;
    }
};



export const POSTransactionProvider = ({ children }) => {
    const [state, dispatch] = useReducer(transactionReducer, {
        items: [],
        discount: null,
        customerInfo: null,
        paymentMethod: 'cash',
        cashReceived: 0,
        completedTransactions: []
    });

        // Load saved transactions from localStorage on component mount
    useEffect(() => {
        console.log('🔍 POSTransaction: Loading saved transactions...');
        const savedTransactions = localStorage.getItem('completedTransactions');
        console.log('🔍 POSTransaction: localStorage data:', savedTransactions);
        if (savedTransactions) {
            try {
                const parsedTransactions = JSON.parse(savedTransactions);
                console.log('🔍 POSTransaction: Parsed transactions:', parsedTransactions);
                dispatch({ type: 'LOAD_TRANSACTIONS', payload: parsedTransactions });
            } catch (error) {
                console.error('Error loading saved transactions:', error);
            }
        }
    }, []);

        // Save transactions to localStorage whenever completedTransactions changes
    const isInitialLoad = useRef(true);

    useEffect(() => {
        if (isInitialLoad.current) {
            isInitialLoad.current = false;
            return; // Skip saving on initial load
        }
        console.log('💾 POSTransaction: Saving to localStorage:', state.completedTransactions);
        localStorage.setItem('completedTransactions', JSON.stringify(state.completedTransactions));
    }, [state.completedTransactions]);


    // Calculate totals with tax
    const calculateTotals = () => {
        const subtotal = state.items.reduce(
            (total, item) => total + (item.pricingOption?.price || 0) * item.quantity,
            0
        );

        const discountAmount = state.discount
            ? (state.discount.type === 'percentage' // FIXED: typo 'discrount'
                ? subtotal * (state.discount.value / 100)
                : state.discount.value)
            : 0;

        const discountedSubtotal = subtotal - discountAmount;

        const taxCalculation = calculateCartTax(state.items);
        const taxAmount = taxCalculation.taxes.total;

        const grandTotal = discountedSubtotal + taxAmount;
        const changeAmount = Math.max(0, state.cashReceived - grandTotal);

        return {
            subtotal,
            discountAmount,
            discountedSubtotal,
            taxAmount,
            grandTotal,
            changeAmount,
            taxBreakdown: taxCalculation.taxes
        };
    };

    // Transaction actions
    const addItem = (product, pricingOption, quantity = 1) => {
        const transactionItem = {
            id: product._id, // FIXED: was 'product_id'
            name: product.name,
            sku: product.sku,
            category: product.category,
            subcategory: product.subcategory,
            pricingOption,
            quantity,
            cannabis: {
                thc: product.cannabinoids?.thcPercentage || 0,
                cbd: product.cannabinoids?.cbdPercentage || 0,
                batchNumber: product.compliance?.batchNumber
            }
        };

        dispatch({ type: 'ADD_ITEM', payload: transactionItem });
        toast.success(`Added ${product.name} to transaction`);
    };

    const removeItem = (transactionItemId) => {
        dispatch({ type: 'REMOVE_ITEM', payload: transactionItemId });
        toast.success('Item removed from transaction');
    };

    const updateQuantity = (transactionItemId, quantity) => {
        dispatch({ type: 'UPDATE_QUANTITY', payload: { id: transactionItemId, quantity } });
    };

    const applyDiscount = (discount) => {
        dispatch({ type: 'APPLY_DISCOUNT', payload: discount });
        toast.success(`${discount.name} applied`);
    };

    const setCashReceived = useCallback((amount) =>{
        dispatch({type: 'SET_CASH_RECEIVED', payload:amount }); 
    },[]);

    const completeTransaction = (receiptData) => {
        const transaction = {
            id: `TXN-${Date.now()}`,
            timestamp: new Date(),
            items: state.items,
            totals: calculateTotals(), // FIXED: was 'total'
            paymentMethod: state.paymentMethod,
            customerInfo: state.customerInfo,
            receiptData
        };

        dispatch({ type: 'COMPLETE_TRANSACTION', payload: transaction }); // FIXED: typo 'TRANSACTINO'
        toast.success('Transaction completed successfully');
        return transaction;
    };

    const clearTransaction = () => {
        dispatch({ type: 'CLEAR_TRANSACTION' });
        toast.success('Transaction cleared');
    };

    const totals = calculateTotals();

    const value = {
        // State
        items: state.items,
        discount: state.discount,
        customerInfo: state.customerInfo,
        paymentMethod: state.paymentMethod,
        cashReceived: state.cashReceived,
        completedTransactions: state.completedTransactions,
        totals,

        // Actions
        addItem,
        removeItem,
        updateQuantity,
        applyDiscount,
        setCashReceived,
        completeTransaction,
        clearTransaction,

        // Computed values
        itemCount: state.items.reduce((total, item) => total + item.quantity, 0),
        hasItems: state.items.length > 0
    };

    return (
        <POSTransactionContext.Provider value={value}>
            {children}
        </POSTransactionContext.Provider>
    );
};

export const usePOSTransaction = () => {
    const context = useContext(POSTransactionContext);
    if (!context) {
        throw new Error('usePOSTransaction must be used within a POSTransactionProvider');
    }
    return context;
};