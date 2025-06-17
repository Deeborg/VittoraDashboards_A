import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { Card, CardContent, Typography, Box, useMediaQuery, IconButton, Tooltip, Avatar, Divider } from '@mui/material';
import {
  InsertChart as InsertChartIcon,
  People as PeopleIcon,
  Timeline as TimelineIcon,
  Article as ArticleIcon,
  AutoAwesome as AutoAwesomeIcon,
  Palette as PaletteIcon,
  DataArray as DataArrayIcon,
  Cloud as CloudIcon,
  BarChart as BarChartIcon,
  PieChart as PieChartIcon
} from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useTheme } from '@mui/material/styles';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
// import PeopleIcon from '@mui/icons-material/People';
import SunburstChart from './Sentiment_sunburstchart';
import StackedAreaChart from './Sentiment_stackedareachart';
import StackedBarChart from './Sentiment_stackedbarchart';
import LineChart from './sentiment_linechart';
import WordCloudChart from './Sentiment_wordcloud';
// Changed logo import to the new file name
// import logo from '../asset/Picture1-Picsart-BackgroundRemover.png';

interface ExcelRow {
  [key: string]: any;
  Source?: string;
  Author?: string;
  Date?: string | number | Date;
  date?: string | number | Date;
  Sentiment?: string;
  sentiment?: string;
  score?: number;
  'Stock Price'?: number;
  'article_text'?: string; // Standardized to lower case
  'Article Text'?: string; // For flexibility in column names
}

interface ProcessedRow {
  date: Date;
  source: string;
  author: string;
  sentiment: string;
  score: number;
  stockPrice: number;
  articleText: string;
}

interface DashboardData {
  sources: string[];
  authors: string[];
  dates: Date[];
  rowCount: number;
  sentimentData: {
    source: string;
    sentiment: string;
    authorCount: number;
    author?: string;
  }[];
  scores: number[];
  stockPrices: number[];
  wordCloudData: { text: string; value: number }[];
}


const InteractiveStackedBarChart = ({ data }: { data: DashboardData }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box sx={{
      height: isMobile ? '300px' : '500px',
      width: '100%',
      position: 'relative',
      '&:hover': {
        transform: 'translateY(-5px)',
        transition: 'transform 0.3s ease-in-out'
      }
    }}>
      <StackedBarChart
        data={{
          sentimentData: data.sentimentData.map(item => ({
            author: item.author || '',
            source: item.source,
            sentiment: item.sentiment,
            count: 1
          }))
        }}
      />
    </Box>
  );
};

const KPICard = ({
  title,
  value,
  description,
  icon,
  color
}: {
  title: string;
  value: string | number;
  description?: string;
  icon?: React.ReactNode;
  color?: string;
}) => {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      style={{
        flex: isSmall ? '1 1 100%' : '1 1 500px', // Take full width on small, flex basis 300px otherwise
        maxWidth: isSmall ? '100%' : 'calc(50% - 16px)', // Max width to ensure 2 per row on small-medium screens if needed
        boxSizing: 'border-box' // Important for flex basis
      }}
      
      
    >
      <Card sx={{
        // minWidth: 718,
        boxShadow: '0px 10px 20px rgba(0,0,0,0.1)',
        height: '100%',
        flex: '1 1 500px',
        margin: '8px',
        background: `linear-gradient(135deg, ${color || theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        color: theme.palette.common.white,
        borderRadius: '12px',
        position: 'relative',
        overflow: 'hidden',
        '&:before': {
          content: '""',
          position: 'absolute',
          width: '150px',
          height: '150px',
          background: 'rgba(255,255,255,0.1)',
          borderRadius: '50%',
          top: '-50px',
          right: '-50px'
        }
      }}>
        <CardContent sx={{ position: 'relative', zIndex: 1 }}>
          <Typography variant="h6" gutterBottom sx={{ opacity: 0.8 }}>
            {title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Typography variant={isSmall ? 'h5' : 'h3'} component="div" sx={{ fontWeight: 'bold' }}>
              {value}
            </Typography>
            {icon && (
              <Avatar sx={{
                bgcolor: 'rgba(255,255,255,0.2)',
                width: isSmall ? 48 : 56,
                height: isSmall ? 48 : 56,
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
              }}>
                {icon}
              </Avatar>
            )}
          </Box>
          {description && (
            <Typography sx={{ mt: 1.5, opacity: 0.8,fontSize: isSmall ? '0.8rem' : '0.9rem' }}>
              {description}
            </Typography>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
};

const ChartContainer = ({
  title,
  children,
  height = '100%',
  icon
}: {
  title: string;
  children: React.ReactNode;
  height?: string;
  icon?: React.ReactNode;
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      sx={{
        flex: 1,
        backgroundColor: theme.palette.background.paper,
        p: { xs: 2, sm: 3 }, 
        borderRadius: '16px',
        boxShadow: '0 8px 32px rgba(0,0,0,0.05)',
        border: `1px solid ${theme.palette.divider}`,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        minHeight: isMobile ? '300px' : (height === '100%' ? 'auto' : height),
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: '0 12px 48px rgba(0,0,0,0.1)',
          transform: 'translateY(-5px)'
        }
      }}
    >
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        mb: { xs: 2, sm: 3 },
        borderBottom: `1px solid ${theme.palette.divider}`,
        pb: 2
      }}>
        {icon && (
          <Avatar sx={{
            bgcolor: theme.palette.primary.main,
            mr: 2,
             width: isMobile ? 32 : 40,
             height: isMobile ? 32 : 40
          }}>
            {icon}
          </Avatar>
        )}
        <Typography
          variant="h6"
          sx={{
            color: theme.palette.text.primary,
            fontWeight: 600,
            textTransform: 'uppercase',
            letterSpacing: 1,
            fontSize: isMobile ? '1rem' : '1.1rem'
          }}
        >
          {title}
        </Typography>
      </Box>
      <Box sx={{
        flex: 1,
        position: 'relative',
        '& canvas': {
          transition: 'all 0.3s ease',
          '&:hover': {
            transform: 'scale(1.02)'
          }
        },
        width: '100%',
        height: '100%',
      }}>
        {children}
      </Box>
    </Box>
  );
};


const SentimentDashboard = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  // const [activeTab, setActiveTab] = useState('overview');
  // const [darkMode, setDarkMode] = useState(false);

  const excelFilePath = '/JKC_NEWS_MC_X.xlsx';

  const parseDate = (dateValue: string | number | Date | undefined): Date => {
    if (!dateValue && typeof dateValue !== 'number') {
      console.warn('Date value is missing or empty, using current date as fallback.');
      return new Date();
    }

    if (typeof dateValue === 'number') {
      const parsedComponents = XLSX.SSF.parse_date_code(dateValue);
      if (parsedComponents) {
        return new Date(
          parsedComponents.y,
          parsedComponents.m - 1,
          parsedComponents.d,
          parsedComponents.H || 0,
          parsedComponents.M || 0,
          parsedComponents.S || 0
        );
      }
      console.warn(`Failed to parse Excel serial date: ${dateValue}. Using current date as fallback.`);
      return new Date();
    }

    if (typeof dateValue === 'string') {
      // Handle specific date format (dd-MM-yyyy HH:mm:ss)
      const specificFormatParts = dateValue.match(/^(\d{2})-(\d{2})-(\d{4})\s+(\d{2}):(\d{2}):(\d{2})$/);
      if (specificFormatParts) {
        const [_, day, month, year, hours, minutes, seconds] = specificFormatParts;
        const parsedDate = new Date(
          parseInt(year),
          parseInt(month) - 1,
          parseInt(day),
          parseInt(hours),
          parseInt(minutes),
          parseInt(seconds)
        );

        if (!isNaN(parsedDate.getTime())) {
          return parsedDate;
        }
      }

      // Fallback to native Date parsing
      const parsedDate = new Date(dateValue);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate;
      }
    }

    console.warn(`Unrecognized date type or value: ${JSON.stringify(dateValue)}. Using current date as fallback.`);
    return new Date();
  };

  /**
   * Processes an array of article texts to generate word counts suitable for a word cloud.
   * It handles case normalization, basic tokenization, and optional stop word removal.
   *
   * @param articleTexts An array of strings, where each string is the content of an article.
   * @param minWordLength Minimum length for a word to be included (e.g., 3 to exclude "a", "an", "is").
   * @param customStopWords An optional array of additional words to exclude (beyond common ones).
   * @returns An array of WordData objects, sorted by frequency (descending).
   */
  const processArticleTextsForWordCloud = (
    articleTexts: string[],
    minWordLength: number = 3,
    customStopWords: string[] = []
  ): { text: string; value: number }[] => {
    const wordCounts = new Map<string, number>();

    const defaultStopWords = new Set([
      'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with', 'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'we', 'say', 'her', 'she', 'or', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up', 'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time', 'no', 'just', 'him', 'know', 'take', 'person', 'into', 'year', 'good', 'some', 'could', 'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'also', 'new', 'these', 'most', 'any', 'such', 'many', 'much', 'more', 'very', 'been', 'had', 'has', 'was', 'were', 'is', 'are', 'an', 'said', 'about', 'through', 'wasn', // Added common ones like 'said', 'this', 'that' from your example
      'bank', 'next', 'good', 'will', 'this', 'from', 'crore', 'over', 'four', 'unit' // Explicitly added words from your "less words" image if they are indeed generic.
    ]);

    const allStopWords = new Set([
      ...Array.from(defaultStopWords),
      ...customStopWords
    ]);

    articleTexts.forEach(text => {
      if (!text) return;

      const cleanedText = text.toLowerCase().replace(/[\W_]+/g, ' ');

      const wordsInArticle = cleanedText.split(/\s+/)
        .filter(word => word.length >= minWordLength);

      wordsInArticle.forEach(word => {
        if (!allStopWords.has(word)) {
          wordCounts.set(word, (wordCounts.get(word) || 0) + 1);
        }
      });
    });

    const finalWords: { text: string; value: number }[] = Array.from(wordCounts.entries()).map(([text, value]) => ({
      text: text,
      value: value
    }));

    finalWords.sort((a, b) => b.value - a.value);

    return finalWords;
  };


  useEffect(() => {
    const loadExcelData = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(excelFilePath);
        if (!response.ok) {
          throw new Error(`Failed to fetch Excel file: ${response.statusText}`);
        }

        const arrayBuffer = await response.arrayBuffer();
        const excelData = new Uint8Array(arrayBuffer);
        const workbook = XLSX.read(excelData, { type: 'array' });

        const firstSheetName = workbook.SheetNames[0];
        const firstSheet = workbook.Sheets[firstSheetName];
        const jsonData: ExcelRow[] = XLSX.utils.sheet_to_json(firstSheet);

        if (jsonData.length === 0) {
          throw new Error('Excel file is empty or the first sheet has no data.');
        }

        // Process and sort data by date
        const processedRows: ProcessedRow[] = jsonData.map(row => ({
          date: parseDate(row.Date || row.date),
          source: String(row.Source || row.source || 'Unknown Source').trim(),
          author: String(row.Author || row.author || 'Unknown Author').trim(),
          sentiment: String(row.Sentiment || row.sentiment || 'Unknown Sentiment').trim(),
          score: Number(row.score || row.Score || 0),
          stockPrice: Number(row['Stock Price'] || row['stock price'] || 0),
          // Prioritize 'Article Text' then 'article_text'
          articleText: String(row['Article Text'] || row['article_text'] || '')
        })).sort((a, b) => a.date.getTime() - b.date.getTime());

        // Extract all article texts for processing
        const allArticleTexts = processedRows.map(row => row.articleText);

        // Prepare word cloud data using the new function
        const wordCloudData = processArticleTextsForWordCloud(allArticleTexts, 3, []); // Adjust minWordLength and customStopWords as needed

        // You might want to slice the wordCloudData here if you want to limit the number of words
        // For example, to show only the top 100 words:
        const topNWordCloudData = wordCloudData.slice(0, 100);

        // Prepare other dashboard data aggregations
        const sourceSentimentAuthorAgg: Record<string, Record<string, Set<string>>> = {};
        processedRows.forEach(row => {
          if (!sourceSentimentAuthorAgg[row.source]) {
            sourceSentimentAuthorAgg[row.source] = {};
          }
          if (!sourceSentimentAuthorAgg[row.source][row.sentiment]) {
            sourceSentimentAuthorAgg[row.source][row.sentiment] = new Set();
          }
          sourceSentimentAuthorAgg[row.source][row.sentiment].add(row.author);
        });

        const finalProcessedData: DashboardData = {
          sources: processedRows.map(row => row.source),
          authors: processedRows.map(row => row.author),
          dates: processedRows.map(row => row.date),
          rowCount: processedRows.length,
          sentimentData: processedRows.map(row => ({
            source: row.source,
            sentiment: row.sentiment,
            authorCount: 1, // This might need re-evaluation if you meant unique authors per source/sentiment
            author: row.author
          })),
          scores: processedRows.map(row => row.score),
          stockPrices: processedRows.map(row => row.stockPrice),
          wordCloudData: topNWordCloudData // Use the processed and potentially sliced data
        };

        console.log('Processed data:', finalProcessedData);
        setData(finalProcessedData);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : String(err);
        setError(`Failed to load or process Excel file: ${errorMessage}`);
        console.error('Error loading Excel file:', err);
      } finally {
        setLoading(false);
      }
    };

    loadExcelData();
  }, [excelFilePath]);

  const distinctSources = data ? new Set(data.sources.filter(s => s && s !== 'Unknown Source')).size : 0;
  const distinctAuthors = data ? new Set(data.authors.filter(a => a && a !== 'Unknown Author')).size : 0;

  return (
    <Box sx={{
      p: { xs: 1, sm: 3 },
    //   background: theme.palette.mode === 'dark' ? '#121212' : '#f5f7fa',
      minHeight: '100vh'
    }}>
      {/* Header with Title and Logo */}
      <Box sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between', // This will push items to the ends
        flexDirection: { xs: 'column', sm: 'row' },
       mb: { xs: 2, sm: 4 }, // Responsive margin-bottom
        p: { xs: 2, sm: 3 }, // Responsive padding
        borderRadius: '12px',
        background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        color: theme.palette.common.white
      }}>
        {/* Title */}
        <Typography
          variant="h4"
          sx={{
            fontFamily: 'Roboto, sans-serif',
            fontWeight: 'bold',
            textShadow: '0 6px 12px rgba(0,0,0,0.2)',
            fontSize: { xs: '1.25rem', sm: '1.5rem', md: '2rem' },
            textAlign: { xs: 'center', sm: 'left' },
            mb: { xs: 1.5, sm: 0 }, // Margin below title when stacked
            flexGrow: 1 // Allows title to take available space
          }}
        >
          Sentiment Snapshot : Trends in Public and Media
        </Typography>

        {/* Logo (Image) - Placed on the right, no round shape */}
        <Box
          sx={{
            ml: { xs: 0, sm: 2 }, // No left margin on xs, then 2 on sm+
            mt: { xs: 1.5, sm: 0 }, // Top margin on xs when stacked 
            // boxShadow: '0 6px 16px rgba(0,0,0,0.3)', // Enhanced shadow for depth
            // border: '3px solid white', // Thicker white border for prominence
            // bgcolor: 'white', // Explicit white background for high contrast
            padding: '4px', // Add some internal padding if logo content is close to the edge
            display: 'flex', // Use flex to center the image if needed
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden' // Ensures the image stays within the border even if it's large
          }}
        >
          {/* <img
            src={logo}
            alt="Company Logo"
            style={{
              height: 'auto', // Maintain aspect ratio
              maxWidth: '100%', // Ensure it fits within the box
              maxHeight: '70px', // Set a max height to control size, adjust as needed
              display: 'block' // Removes extra space below the image
            }}
          /> */}
        </Box>
      </Box>
      {loading && (
        <Box sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '300px',
          flexDirection: 'column'
        }}>
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
            style={{ fontSize: '3rem' }}
          >
            <AutoAwesomeIcon color="primary" fontSize="inherit" />
          </motion.div>
          <Typography sx={{ mt: 2, textAlign: 'center' }}>
            Loading your data...
          </Typography>
        </Box>
      )}

      {error && (
        <Box sx={{
          backgroundColor: theme.palette.error.light,
          p: 3,
          borderRadius: '8px',
          mb: 4,
          display: 'flex',
          alignItems: 'center'
        }}>
          <Typography color="error" sx={{ whiteSpace: 'pre-wrap' }}>
            {error}
          </Typography>
        </Box>
      )}

      {data && !loading && !error && (
        <>
          {/* KPI Cards */}
          <Box sx={{
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            gap: { xs: 1.5, sm: 2 },
            mb: { xs: 2, sm: 4 }
          }}>
            <KPICard
              title="Articles/Posts"
              value={data.rowCount}
              description="Count of Articles/Posts"
              icon={<ArticleIcon />}
              color="#4e79a7"
            />
            <KPICard
              title="Authors"
              value={distinctAuthors}
              description="Content creators identified"
              icon={<PeopleIcon />}
              color="#e15759"
            />
            {/* <KPICard
              title="Sentiment Score"
              value={(data.scores.reduce((a, b) => a + b, 0) / data.scores.length || 0).toFixed(2)}
              description="Average sentiment"
              icon={<InsertChartIcon />}
              color="#f28e2b"
            />
            <KPICard
              title="Total Stock Value"
              value={(data.stockPrices.reduce((a, b) => a + b, 0)/data.stockPrices.length || 0).toFixed(2)}
              description="Average of stock prices"
              icon={<TimelineIcon />}
              color="#4e79a7"
            /> */}
          </Box>

          {/* Main Charts Section */}
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(auto-fit, minmax(280px, 1fr))', // Allows 2-3 columns dynamically
              md: '1fr 1fr', // Explicitly 2 columns on medium screens
              lg: '1fr 1fr' // Explicitly 3 columns on large screens
            },
            gap: { xs: 2, sm: 3 }, // Responsive gap
            mb: { xs: 2, sm: 4 }
          }}>
            <ChartContainer title="Sentiment Summary" icon={<PieChartIcon />}>
  {data && data.sentimentData.length > 0 ? (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.2 }}
      style={{ width: '100%', height: '100%' }}
    >
      <SunburstChart data={data.sentimentData} />
    </motion.div>
  ) : (
    <Typography sx={{ textAlign: 'center', my: 2 }}>
      No sentiment data available
    </Typography>
  )}
</ChartContainer>

            <ChartContainer title="No of Articles by Publishing Date" icon={<TimelineIcon />}>
              {data.dates.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <StackedAreaChart data={data} />
                </motion.div>
              ) : (
                <Typography sx={{ textAlign: 'center', my: 2 }}>
                  No date data available
                </Typography>
              )}
            </ChartContainer>
          </Box>

          {/* Full Width Line Chart */}
          <ChartContainer title="Stock Price Vs Sentiment" icon={<BarChartIcon />} height="400px">
            {data.dates.length > 0 && data.scores.length > 0 && data.stockPrices.length > 0 ? (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6 }}
              >
                <LineChart
                  dates={data.dates}
                  sentimentScores={data.scores}
                  stockPrices={data.stockPrices}
                />
              </motion.div>
            ) : (
              <Typography sx={{ textAlign: 'center', my: 2 }}>
                No sentiment score or stock price data available
              </Typography>
            )}
          </ChartContainer>

          {/* Bottom Charts Section */}
          <Box sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(auto-fit, minmax(280px, 1fr))', // Allows 2-3 columns dynamically
              md: '1fr 1fr', // Explicitly 2 columns on medium screens
              lg: '1fr 1fr' // Explicitly 3 columns on large screens
            },
            gap: { xs: 2, sm: 3 }, // Responsive gap
            mb: { xs: 2, sm: 4 }
          }}>
            <ChartContainer title="Articles by Authors" icon={<BarChartIcon />}>
              {data.sentimentData.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  <InteractiveStackedBarChart data={data} />
                </motion.div>
              ) : (
                <Typography sx={{ textAlign: 'center', my: 2 }}>
                  No sentiment data available
                </Typography>
              )}
            </ChartContainer>

            <ChartContainer title="Word Cloud" icon={<CloudIcon />}>
              {data.wordCloudData.length > 0 ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                  style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                >
                  <WordCloudChart
                    words={data.wordCloudData}
                    width={isMobile ? 300 : 500}
                    height={isMobile ? 250 : 400}
                  />
                </motion.div>
              ) : (
                <Typography sx={{ textAlign: 'center', my: 2 }}>
                  No article text data available
                </Typography>
              )}
            </ChartContainer>
          </Box>

          {/* Footer */}
          <Box sx={{
            mt: { xs: 2, sm: 4 }, // Responsive margin-top
            p: { xs: 1, sm: 2 },
            textAlign: 'center',
            color: 'white',
            fontSize: { xs: '0.8rem', sm: '0.9rem' },
            // bottom: -4,
          }}>
            <Divider sx={{ mb: { xs: 1, sm: 2 }, borderColor: 'white' }} />
            <Typography>
              Data last updated: {'06/02/2025'}
            </Typography>
          </Box>
        </>
      )}
    </Box>
  );
}

export default SentimentDashboard;