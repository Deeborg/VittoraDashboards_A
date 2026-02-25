import React from "react";
import { Box, Typography, useTheme, useMediaQuery } from "@mui/material";

type HeaderProps = {
  darkMode: boolean;
};

const Header: React.FC<HeaderProps> = ({ darkMode }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <Box
      sx={{
        backgroundImage: darkMode
          ? "linear-gradient(135deg, rgba(40, 45, 60, 0.95) 0%, rgba(25, 30, 45, 0.95) 100%)"
          : "linear-gradient(135deg, rgba(69, 75, 248, 0.95) 0%, rgba(38, 5, 167, 0.95) 100%)",
        color: "#fff",
        py: { xs: 6, md: 8 },
        px: { xs: 3, md: 6 },
        borderRadius: { xs: 2, md: 3 },
        mb: 5,
        boxShadow: "0 8px 32px rgba(0, 0, 0, 0.15)",
        position: "relative",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        textAlign: "center",
        overflow: "hidden",
        "&::before": {
          content: '""',
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "url('/asset/subtle-pattern.png')",
          opacity: 0.05,
          zIndex: 0,
        },
      }}
    >
      {/* Background decorative elements */}
      <Box
        sx={{
          position: "absolute",
          top: -50,
          right: -50,
          width: 200,
          height: 200,
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.05)",
          zIndex: 0,
        }}
      />
      <Box
        sx={{
          position: "absolute",
          bottom: -30,
          left: -30,
          width: 150,
          height: 150,
          borderRadius: "50%",
          background: "rgba(255, 255, 255, 0.05)",
          zIndex: 0,
        }}
      />

      {/* Logos */}
      <Box
        sx={{
          position: "absolute",
          top: 16,
          left: 16,
          right: 16,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          zIndex: 2,
        }}
      >
        <Box
          sx={{
            p: 1,
            display: "flex",
            alignItems: "center",
          }}
        >
          {/* <Box component="a" href="https://ajalabs.ai" target="_blank">
            <img
              src="/asset/ajalabs.png"
              alt="AJA Labs Logo"
              style={{ height: 28,  }} 
            />
          </Box> */}
        </Box>
        <Box
          sx={{
            p: 1,
            display: "flex",
            alignItems: "center",
          }}
        >
          {/* <Box component="a" href="https://www.yokogawa.com" target="_blank">
            <img
              src="/asset/Yokogawa-Logo W.png"
              alt="Yokogawa Logo"
              style={{ height: 36 }}
            />
          </Box> */}
        </Box>
      </Box>

      {/* Main content */}
      <Box sx={{ position: "relative", zIndex: 1, mt: { xs: 4, md: 0 } }}>
        <Typography
          variant={isMobile ? "h4" : "h3"}
          sx={{
            fontWeight: 700,
            mb: 2,
            textShadow: "0 2px 4px rgba(0,0,0,0.2)",
            background: "linear-gradient(90deg, #fff, #e0e7ff)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
          }}
        >
          Financial Statement Generator
        </Typography>
        <Typography
          variant="subtitle1"
          sx={{
            maxWidth: 600,
            color: "rgba(255,255,255,0.85)",
            fontSize: { xs: "0.9rem", md: "1rem" },
            lineHeight: 1.6,
            px: { xs: 1, md: 0 },
          }}
        >
          Upload your Trial Balance, map your columns, and instantly visualize
          your Income Statement, Balance Sheet & Cash Flow.
        </Typography>
      </Box>

      {/* Decorative bottom element */}
      <Box
        sx={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "4px",
          background: "linear-gradient(90deg, #4f46e5, #8b5cf6)",
          borderBottomLeftRadius: 12,
          borderBottomRightRadius: 12,
        }}
      />
    </Box>
  );
};

export default Header;