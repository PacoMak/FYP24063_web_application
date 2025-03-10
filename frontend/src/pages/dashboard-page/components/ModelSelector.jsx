import { Box, MenuItem, Paper, Select } from "@mui/material";
import { memo } from "react";
import { useModelList } from "../../../api";
import styled from "styled-components";

const Wrapper = styled(Paper)`
  border: 1px solid blue;
  padding: 1rem;
  gap: 1rem;
  width: 100%;
  height: 100%;
`;
export const ModelSelector = memo((onSelect) => {
  const { data, isLoading } = useModelList();
  if (isLoading) {
    return <></>;
  }
  return (
    <Wrapper>
      <Box>Select Model</Box>
      <Select>
        {data.map((model) => (
          <MenuItem value={model}>{model}</MenuItem>
        ))}
      </Select>
    </Wrapper>
  );
});

ModelSelector.displayName = "ModelSelector";
