import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Box, Typography, useTheme } from '@mui/material';
import ScrollContainer from 'react-indiana-drag-scroll';

interface DashboardData {
  sources: string[];
  authors: string[];
  dates: Date[];
  sentimentData: {
    author: string;
    source: string;
    sentiment: string;
    count: number;
  }[];
}

interface StackedBarChartProps {
  data: {
    sentimentData: {
      author: string;
      source: string;
      sentiment: string;
      count: number;
    }[];
  };
  options?: any;
}

const StackedBarChart: React.FC<StackedBarChartProps> = ({ data }) => {
  const theme = useTheme();
  const containerRef = React.useRef<HTMLDivElement>(null);

  const authorSentimentMap: Record<
    string,
    Record<string, { total: number; sources: Record<string, number> }>
  > = {};

  if (!data || !data.sentimentData) {
    return (
      <Box sx={{
        height: 400,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        border: '1px solid #E0E0E0',
        borderRadius: '8px',
        overflow: 'hidden'
      }}>
        <Box sx={{
          width: '100%',
          backgroundColor: '#1A237E',
          color: '#FFFFFF',
          p: 1.5,
          textAlign: 'center',
          fontWeight: 'bold',
          fontSize: '1.2rem',
          borderBottom: '1px solid #1A237E'
        }}>
          Articles by Authors
        </Box>
        <Typography sx={{ textAlign: 'center', my: 2 }}>Chart data is missing or invalid.</Typography>
      </Box>
    );
  }

  // Process data
  data.sentimentData.forEach((item) => {
    const author = item.author || 'Unknown Author';
    const sentiment = item.sentiment || 'Unknown Sentiment';
    const source = item.source || 'Unknown Source';

    if (!authorSentimentMap[author]) {
      authorSentimentMap[author] = {};
    }

    if (!authorSentimentMap[author][sentiment]) {
      authorSentimentMap[author][sentiment] = {
        total: 0,
        sources: {},
      };
    }

    authorSentimentMap[author][sentiment].total += item.count;
    authorSentimentMap[author][sentiment].sources[source] =
      (authorSentimentMap[author][sentiment].sources[source] || 0) + item.count;
  });

  // Sort authors by total articles (descending)
  const authors = Object.keys(authorSentimentMap).sort((a, b) => {
    const totalA = Object.values(authorSentimentMap[a]).reduce((sum, s) => sum + s.total, 0);
    const totalB = Object.values(authorSentimentMap[b]).reduce((sum, s) => sum + s.total, 0);
    return totalB - totalA;
  });

  const sentiments = Array.from(
    new Set(data.sentimentData.map((item) => item.sentiment || 'Unknown Sentiment'))
  );

  // Prepare data for Recharts
  const chartData = authors.map(author => {
    const authorData: any = { author };
    Object.entries(authorSentimentMap[author]).forEach(([sentiment, details]) => {
      authorData[sentiment] = details.total;
      // Add source breakdown as custom property for tooltip
      authorData[`${sentiment}_sources`] = Object.entries(details.sources)
        .map(([source, count]) => `${source}: ${count}`)
        .join(', ');
    });
    return authorData;
  });

  const sentimentColorMap: Record<string, string> = {
    'positive': '#12239E', // Green
    'negative': '#118DFF', // Red
    'neutral': '#E66C37',  // Blue
    'mixed': '#9C27B0',    // Purple
    'Unknown Sentiment': '#9E9E9E', // Grey
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <Box sx={{
          backgroundColor: theme.palette.background.paper,
          border: `1px solid ${theme.palette.divider}`,
          borderRadius: '4px',
          padding: '8px',
          boxShadow: theme.shadows[1]
        }}>
          <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>{label}</Typography>
          {payload.map((entry: any, index: number) => {
            const sentiment = entry.dataKey;
            const sources = chartData.find(d => d.author === label)?.[`${sentiment}_sources`];
            return (
              <Box key={`tooltip-item-${index}`} sx={{ mb: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box sx={{
                    width: '12px',
                    height: '12px',
                    backgroundColor: entry.color,
                    mr: 1,
                    borderRadius: '2px'
                  }} />
                  <Typography variant="body2">
                    {sentiment}: {entry.value}
                  </Typography>
                </Box>
                {sources && (
                  <Typography variant="caption" sx={{ display: 'block', ml: 3, color: theme.palette.text.secondary }}>
                    Sources: {sources}
                  </Typography>
                )}
              </Box>
            );
          })}
        </Box>
      );
    }
    return null;
  };

  // Calculate the height needed for each bar
  const barHeight = 40;
  const chartHeight = Math.max(400, authors.length * barHeight + 100);

  return (
    <Box sx={{
      height: 500, // Fixed container height
      width: '100%',
      border: '1px solid #E0E0E0',
      borderRadius: '8px',
      overflow: 'hidden',
      display: 'flex',
      flexDirection: 'column',
    }}>
      

      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        px: 2,
        py: 1,
        borderBottom: '1px solid #f0f0f0',
        backgroundColor: '#f9f9f9'
      }}>
        <Typography variant="caption" sx={{ mr: 1 }}>Sentiment:</Typography>
        {sentiments.map(sentiment => (
          <Box key={sentiment} sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
            <Box sx={{
              width: '12px',
              height: '12px',
              backgroundColor: sentimentColorMap[sentiment] || '#607D8B',
              mr: 0.5,
              borderRadius: '2px'
            }} />
            <Typography variant="caption">{sentiment}</Typography>
          </Box>
        ))}
      </Box>

      {chartData.length > 0 ? (
        <Box ref={containerRef} sx={{
          flex: 1,
          position: 'relative',
          overflow: 'hidden',
          width: '100%',
        }}>
          <ScrollContainer
            style={{
              height: '100%',
              width: '100%',
              position: 'relative',
              overflow: 'auto',
            }}
            hideScrollbars={false}
            vertical={true}
            horizontal={false}
          >
            <Box sx={{
              width: '100%',
              height: `${chartHeight}px`,
              minHeight: '100%',
            }}>
              <ResponsiveContainer width="100%" height={chartHeight}>
                <BarChart
                  data={chartData}
                  layout="vertical"
                  margin={{
                    top: 20,
                    right: 30,
                    left: 50, // Space for author names
                    bottom: 20,
                  }}
                  barCategoryGap={5}
                  barGap={1}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                  <XAxis 
                    type="number" 
                    axisLine={{ stroke: theme.palette.divider }}
                    tickLine={{ stroke: theme.palette.divider }}
                    tick={{ fontSize: 12 }}
                    label={{ 
                      value: '# Articles', 
                      position: 'insideBottom', 
                      offset: -6,
                      fontSize: 'bold'
                    }}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="author" 
                    width={140}
                    axisLine={{ stroke: theme.palette.divider }}
                    tickLine={{ stroke: theme.palette.divider }}
                    tick={{ fontSize: 12 }}
                    label={{
    value: 'Authors',
    angle: -90,
    position: 'insideLeft',
    offset: -10,
    style: { textAnchor: 'middle', fontSize: 'bold' }
  }}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  {/* <Legend 
                    wrapperStyle={{
                      paddingTop: '11px',
                    }}
                  /> */}
                  {sentiments.map(sentiment => (
                    <Bar
                      key={sentiment}
                      dataKey={sentiment}
                      stackId="a"
                      name={sentiment}
                      fill={sentimentColorMap[sentiment] || '#607D8B'}
                    />
                  ))}
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </ScrollContainer>
        </Box>
      ) : (
        <Typography sx={{ textAlign: 'center', my: 2 }}>No data available for chart.</Typography>
      )}
    </Box>
  );
};

export default StackedBarChart;