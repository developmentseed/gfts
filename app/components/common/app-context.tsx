import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
  useLayoutEffect
} from 'react';
import { useLocation } from 'wouter';
import { SpeciesGroup } from '$utils/api';

interface IndividualContextProps {
  currentPDFIndex: number;
  setCurrentPDFIndex: React.Dispatch<React.SetStateAction<number>>;
}

interface SpeciesContextProps {
  group: SpeciesGroup | null;
  setGroup: React.Dispatch<React.SetStateAction<SpeciesGroup | null>>;
}

interface AppContextProps {
  individual: IndividualContextProps;
  species: SpeciesContextProps;
}

const AppContext = createContext<AppContextProps | undefined>(undefined);

export const AppContextProvider: React.FC<{ children: ReactNode }> = ({
  children
}) => {
  const [location] = useLocation();

  // Individual's context related states.
  const [currentPDFIndex, setCurrentPDFIndex] = useState<number>(0);

  const individualContextValue = {
    currentPDFIndex,
    setCurrentPDFIndex
  };

  const [speciesGroup, setSpeciesGroup] = useState<SpeciesGroup | null>(null);

  const speciesContextValue = {
    group: speciesGroup,
    setGroup: setSpeciesGroup
  };

  useLayoutEffect(() => {
    setCurrentPDFIndex(0);
    setSpeciesGroup(null);
  }, [location]);

  return (
    <AppContext.Provider
      value={{
        individual: individualContextValue,
        species: speciesContextValue
      }}
    >
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

export const useSpeciesContext = (): SpeciesContextProps => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error(
      'useSpeciesContext must be used within an AppContextProvider context'
    );
  }
  return context.species;
};