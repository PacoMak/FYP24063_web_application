import { useCallback } from "react";
import { useState } from "react";
import { Dialog, Title } from "../components";
import { OverlayContext } from "./useOverlay";

export const OverlayProvider = ({ children, spinnerComponent }) => {
  const [displaySpinner, setDisplaySpinner] = useState(false);
  const [displayErrorDialog, setDisplayErrorDialog] = useState(false);

  const [errorDialogTitle, setErrorDialogTitle] = useState("");
  const [errorDialogContent, setErrorDialogContent] = useState("");

  const showSpinner = useCallback(() => {
    setDisplaySpinner(true);
    setDisplayErrorDialog(false);
  }, [setDisplaySpinner, setDisplayErrorDialog]);

  const hideSpinner = useCallback(() => {
    setDisplaySpinner(false);
  }, [setDisplaySpinner]);

  const showErrorDialog = useCallback(
    (title, content) => {
      setErrorDialogTitle(title);
      setErrorDialogContent(content);
      setDisplayErrorDialog(true);
      setDisplaySpinner(false);
    },
    [
      setDisplayErrorDialog,
      setErrorDialogTitle,
      setErrorDialogContent,
      setDisplaySpinner,
    ]
  );

  const hideErrorDialog = useCallback(() => {
    setDisplayErrorDialog(false);
  }, [setDisplayErrorDialog]);

  const SpinnerComponent = spinnerComponent;
  return (
    <OverlayContext.Provider
      value={{
        showSpinner: showSpinner,
        hideSpinner: hideSpinner,
        showErrorDialog: showErrorDialog,
      }}
    >
      {displaySpinner && <SpinnerComponent />}
      {displayErrorDialog && (
        <Dialog
          title={<Title>{errorDialogTitle}</Title>}
          open
          fullWidth
          actions={[
            {
              text: "OK",
              value: true,
              variant: "contained",
            },
          ]}
          handleClose={() => {
            hideErrorDialog();
          }}
        >
          {errorDialogContent}
        </Dialog>
      )}
      {children}
    </OverlayContext.Provider>
  );
};
