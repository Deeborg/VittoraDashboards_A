import React, { ReactNode } from "react";
import { Container, Box } from "@mui/material";

interface ResponsiveContainerProps {
  children: ReactNode;
}

const ResponsiveContainer: React.FC<ResponsiveContainerProps> = ({ children }) => {
  return (
 <Container maxWidth="xl" sx={{ pt: 2, pb: 4 }}>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 3,
        }}
      >
        {children}
      </Box>
    </Container>
  );
};

export default ResponsiveContainer;