import React from "react";
import { Card, CardContent, Divider, Typography } from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import ExcelUpload from "../Excelupload";

type UploadSectionProps = {
  onDataParsed: (data: any[]) => void;
};

const UploadSection: React.FC<UploadSectionProps> = ({ onDataParsed }) => (
  <Card sx={{ mb: 4, borderTop: "4px solid #3f51b5" }}>
    <CardContent>
      <Typography variant="h5" gutterBottom sx={{ display: "flex", alignItems: "center" }}>
        <UploadFileIcon sx={{ mr: 1 }} />
        Upload Trial Balance
      </Typography>
      <Divider sx={{ my: 2 }} />
      <ExcelUpload onDataParsed={onDataParsed} />
    </CardContent>
  </Card>
);

export default UploadSection;
