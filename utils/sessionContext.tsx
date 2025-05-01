// utils/sessionContext.js
import React, { createContext, useContext } from 'react';
import { Session } from '@supabase/supabase-js';

interface SessionContextType {
    session: Session | null;
    setSession: React.Dispatch<React.SetStateAction<Session | null>>;
    isLoadingSession: boolean;
}

export const SessionContext = createContext<SessionContextType | null>(null);

export const SessionProvider: React.FC<{ value: SessionContextType; children: React.ReactNode }> = ({ value, children }) => {
    return (
        <SessionContext.Provider value={value}>
            {children}
        </SessionContext.Provider>
    );
};

export const useSession = (): SessionContextType => {
    const context = useContext(SessionContext);
    if (!context) {
        throw new Error("useSession must be used within a SessionProvider");
    }
    return context as SessionContextType; // Explicitly cast the return type
};