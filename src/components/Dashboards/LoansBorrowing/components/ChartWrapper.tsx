import React from 'react';
import { Bar, Line, Pie, Doughnut } from 'react-chartjs-2';
import 'chart.js/auto'; // This ensures charts are registered once

// Re-export the chart components
export const ChartBar = Bar;
export const ChartLine = Line;
export const ChartPie = Pie;
export const ChartDoughnut = Doughnut;