import React, { createContext, useContext } from 'react';

export interface WizardState {
  appId: string;
  selectedDeviceIds: string[];
  templateId: string;
  filter: string;
  pickedIds: string[];
}

export interface WizardStateContextValue {
  wizardState: WizardState;
  setWizardState: React.Dispatch<React.SetStateAction<WizardState>>;
}

const WizardStateContext = createContext<WizardStateContextValue | undefined>(undefined);

interface WizardStateProviderProps {
  value: WizardStateContextValue;
  children: React.ReactNode;
}

export const WizardStateProvider: React.FC<WizardStateProviderProps> = ({ value, children }) => {
  return <WizardStateContext.Provider value={value}>{children}</WizardStateContext.Provider>;
};

export const useWizardState = (): WizardStateContextValue => {
  const context = useContext(WizardStateContext);

  if (!context) {
    throw new Error('useWizardState must be used within a WizardStateProvider');
  }

  return context;
};
