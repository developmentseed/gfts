import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useEffect
} from 'react';
import { useLocation } from 'wouter';

interface IndividualContextProps {
  currentPDFIndex: number;
  setCurrentPDFIndex: React.Dispatch<React.SetStateAction<number>>
}

interface AppContextProps {
  individual: IndividualContextProps;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppContextProvider: React.FC<{ children: ReactNode }> = ({
  children
}) => {
  const [location] = useLocation();

  // Individual's context related states.
  const [currentPDFIndex, setCurrentPDFIndex] = useState<number>(0);

  useEffect(() => {
    setCurrentPDFIndex(0);
  }, [location]);

  const individualContextValue = {
    currentPDFIndex,
    setCurrentPDFIndex
  };

  return (
    <AppContext.Provider value={{ individual: individualContextValue }}>
      {children}
    </AppContext.Provider>
  );
};

export const useIndividualContext = (): IndividualContextProps => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error(
      'useIndividualContext must be used within an AppContextProvider context'
    );
  }
  return context.individual;
};
