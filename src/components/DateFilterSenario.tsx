import React, { useState, useEffect } from "react";
import { Slider, Typography, Box, TextField, Stack } from "@mui/material";
import dayjs from "dayjs";

const formatDate = (timestamp: number) => dayjs(timestamp).format("YYYY-MM-DD");
const parseDate = (dateStr: string) => new Date(dateStr).getTime();

interface DataPorts {
  heading:string;
  startDate: Date;
  endDate: Date;
  dateRange: [number, number] | null;
  setDateRange: React.Dispatch<React.SetStateAction<[number, number] | null>>;
}

const DateRangeSlider: React.FC<DataPorts> = ({ heading,startDate, endDate, dateRange, setDateRange }) => {
  const [localRange, setLocalRange] = useState<[number, number]>([
    startDate.getTime(),
    endDate.getTime(),
  ]);

  useEffect(() => {
    if (dateRange) setLocalRange(dateRange);
  }, [dateRange]);

  const handleSliderChange = (event: Event, newValue: number | number[]) => {
    const newRange = newValue as [number, number];
    setLocalRange(newRange);
    setDateRange(newRange);
  };

  const handleManualChange = (index: 0 | 1, value: string) => {
    const newTimestamp = new Date(value).getTime();
    const updatedRange = [...localRange] as [number, number];
    updatedRange[index] = newTimestamp;
    setLocalRange(updatedRange);
    setDateRange(updatedRange);
  };

  return (
    <Box sx={{ width: "100%", margin: "auto", mt: 5, }}>
      <Typography variant="h6" gutterBottom>
        {/* <h3>{heading}</h3> */}
      </Typography>
      <Stack direction="row" spacing={2} mt={2}>
        <TextField
          type="date"
          label="Start Date"
          value={dayjs(localRange[0]).format("YYYY-MM-DD")}
          onChange={(e) => handleManualChange(0, e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          type="date"
          label="End Date"
          value={dayjs(localRange[1]).format("YYYY-MM-DD")}
          onChange={(e) => handleManualChange(1, e.target.value)}
          InputLabelProps={{ shrink: true }}
        />
      </Stack>
      <Slider
        value={localRange}
        onChange={handleSliderChange}
        min={startDate.getTime()}
        max={endDate.getTime()}
        step={24 * 60 * 60 * 1000}
        valueLabelDisplay="auto"
        valueLabelFormat={(value) => dayjs(value).format("YYYY-MM-DD")}
      />
    </Box>
  );
};

export default DateRangeSlider;
