export const sidebarData = [
  {
    title: "FP&A",
    children: [
      {
        title: "Forecast Intelligence",
        children: [
          { title: "Forecast", path: "/forecast" },
          { title: "Scenario Analysis", path: "/scenario" },
          { title: "Flux Analysis", path: "/flux" },
        ],
      },
      {
        title: "Profitability Intelligence",
        children: [
          { title: "ROI", path: "/roi" },
          { title: "Sentiment Analysis", path: "/sentiment" },
        ],
      },
      {
        title: "Strategic Metrics",
        children: [
          { title: "ESG", path: "/esg" },
        ],
      },
      {
        title: "Financial Monitoring",
        children: [
          { title: "Sales Analytics", path: "/sales" },
          { title: "Expense Analytics", path: "/expense" },
          { title: "Ageing (AR/AP)", path: "/ageing" },
          { title: "Investor Relations", path: "/investor" },
          { title: "Exception Reporting", path: "/exception" },
        ],
      },
    ],
  },

  {
    title: "AuTM",
    children: [
      { title: "Working Capital Optimization", path: "/dashboard" },
      { title: "Forex & Risk Analytics", path: "/forex" },
      {
        title: "Capital Strategy Intelligence",
        children: [
          { title: "Treasury", path: "/treasury" },
          { title: "Loans & Borrowing", path: "/loans" },
        ],
      },
    ],
  },

  {
    title: "SCM",
    children: [
      { title: "Demand Forecasting", path: "/demand" },
      { title: "Procurement Planning", path: "/procurement" },
      { title: "Production Planning", path: "/production" },
      { title: "Inventory Management", path: "/inventory" },
      {
        title: "Supply Chain Finance",
        children: [
          { title: "Fixed Assets", path: "/fixed-assets" },
        ],
      },
    ],
  },

  {
    title: "CPX",
    children: [
      { title: "Customer Intelligence", path: "/customer" },
      { title: "Pricing Optimization", path: "/pricing" },
      { title: "Discount Strategy", path: "/discount" },
      { title: "Promotion Analytics", path: "/promotion" },
      {
        title: "Commercial Governance",
        children: [
          { title: "Related Party Transactions", path: "/related-party" },
          { title: "Compliance & Risk Management", path: "/compliance" },
        ],
      },
    ],
  },
];