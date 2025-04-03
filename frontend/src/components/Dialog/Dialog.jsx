import {
  Dialog as MuiDialog,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
} from "@mui/material";
import { memo, useMemo } from "react";
import styled from "styled-components";

const ActionButton = styled(Button)`
  font-size: 1rem;
`;

const StyledContent = styled(DialogContent)`
  overflow: auto;
  max-height: 70vh;
`;

export const Dialog = memo(
  ({ children, className, actions = [], handleClose, title, ...props }) => {
    const dialogActions = useMemo(() => {
      if (actions.length > 0) {
        return actions;
      }
      return [
        {
          text: "Cancel",
          value: false,
          variant: "outlined",
        },
        {
          text: "Confirm",
          value: true,
          variant: "contained",
        },
      ];
    }, [actions]);

    return (
      <MuiDialog {...props} className={className} maxWidth={"md"}>
        <DialogTitle>{title}</DialogTitle>
        <StyledContent>{children}</StyledContent>

        <DialogActions>
          {dialogActions.map(({ text, value, variant }) => (
            <ActionButton
              variant={variant}
              onClick={() => {
                handleClose(value);
              }}
              key={text}
            >
              {text}
            </ActionButton>
          ))}
        </DialogActions>
      </MuiDialog>
    );
  }
);

Dialog.displayName = "Dialog";
