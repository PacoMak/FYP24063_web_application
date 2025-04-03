import { useContext, createContext } from "react";

export const OverlayContext = createContext({
  showSpinner: () => {},
  hideSpinner: () => {},
  showErrorDialog: () => {},
});

export const useOverlay = () => {
  return useContext(OverlayContext);
};
