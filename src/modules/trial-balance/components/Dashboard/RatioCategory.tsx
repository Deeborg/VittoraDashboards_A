import React from 'react';
import { Card, CardActionArea, CardContent, Typography, Box } from '@mui/material';
import { styled, keyframes } from '@mui/material/styles';

// Keyframe for a smooth entry animation
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// The main card container
const StyledCard = styled(Card)(({ theme }) => ({
  position: 'relative',
  height: '100%',
  // FIX 1: Use a static value or theme.spacing() for type safety.
  // theme.shape.borderRadius is a 'number' but TypeScript can't guarantee that in all contexts.
  borderRadius: '20px', 
  overflow: 'visible',
  animation: `${fadeInUp} 0.5s ease-out forwards`,
  backgroundColor: theme.palette.mode === 'dark' ? theme.palette.grey[800] : `${theme.palette.primary.main}0D`,
  boxShadow: '0 4px 20px rgba(0,0,0,0.05)',
  transition: 'transform 0.3s ease-out, box-shadow 0.3s ease-out',

  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: `0 12px 30px -5px ${theme.palette.primary.main}40`,
    zIndex: 10,
  },
}));

// The circular container for the icon
const IconWrapper = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: '50%',
  transform: 'translate(-50%, -50%)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  width: 72,
  height: 72,
  borderRadius: '50%',
  backgroundColor: theme.palette.background.paper,
  boxShadow: '0 6px 16px rgba(0,0,0,0.07)',
  color: theme.palette.primary.main,
  transition: 'background-color 0.3s ease-out, color 0.3s ease-out, transform 0.3s ease-out',
  zIndex: 2,

  '& .MuiSvgIcon-root': {
    fontSize: 40,
  },
}));

// The clickable area, which orchestrates the hover effects
// FIX 2: The entire style object must be inside a callback to get access to 'theme'.
const StyledCardActionArea = styled(CardActionArea)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'center',
  alignItems: 'center',
  paddingTop: '56px',
  paddingBottom: '24px',
  paddingLeft: '24px',
  paddingRight: '24px',

  // The 'theme' object is now correctly in scope here.
  '&:hover .icon-wrapper': {
    transform: 'translate(-50%, -50%) scale(1.1)',
    backgroundColor: theme.palette.primary.main, // This now works
    color: theme.palette.primary.contrastText,   // This now works
  }
}));

interface RatioCategoryCardProps {
  title: string;
  description: string;
  icon: React.ReactElement;
  onClick: () => void;
}

export const RatioCategoryCard: React.FC<RatioCategoryCardProps> = ({
  title,
  description,
  icon,
  onClick,
}) => {
  return (
    <StyledCard>
      <StyledCardActionArea onClick={onClick}>
        <IconWrapper className="icon-wrapper">
          {icon}
        </IconWrapper>
        
        <CardContent sx={{ textAlign: 'center', p: 0 }}>
          <Typography gutterBottom variant="h5" component="div" fontWeight="600">
            {title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {description}
          </Typography>
        </CardContent>
      </StyledCardActionArea>
    </StyledCard>
  );
};