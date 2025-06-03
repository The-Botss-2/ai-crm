// contexts/CardConnectionContext.tsx
'use client';
import { createContext, useContext, useState, ReactNode } from 'react';

interface CardConnectionContextType {
    isCardConnected: boolean;
    setIsCardConnected: (connected: boolean) => void;
}

const CardConnectionContext = createContext<CardConnectionContextType | undefined>(undefined);

export const useCardConnection = () => {
    const context = useContext(CardConnectionContext);
    if (!context) {
        throw new Error('useCardConnection must be used within CardConnectionProvider');
    }
    return context;
};

interface CardConnectionProviderProps {
    children: ReactNode;
}

export const CardConnectionProvider = ({ children }: CardConnectionProviderProps) => {
    const [isCardConnected, setIsCardConnected] = useState(false);

    return (
        <CardConnectionContext.Provider value={{ isCardConnected, setIsCardConnected }}>
            {children}
        </CardConnectionContext.Provider>
    );
};


