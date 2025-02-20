import { memo } from "react";
import styled from "styled-components";

const StyledBox = styled.span`
  border-bottom: 4px solid black;
  padding-bottom: 2px;
  padding-right: 5px;
  font-size: 1rem;
`;

export const Title = memo(({ children }) => {
  return <StyledBox>{children}</StyledBox>;
});

Title.displayName = "Title";
