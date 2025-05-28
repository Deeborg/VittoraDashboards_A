import React, { useState, useEffect } from 'react';
import { ResponsiveSankey } from '@nivo/sankey';

interface SankeyNode {
  id: string;
  balance?: number; // Added optional balance property for nodes
}

interface SankeyLink {
  source: string;
  target: string;
  value: number;
  originalValue?: number; // Added to store the actual positive/negative value
}



const Sankey: React.FC = () => {
  const [data, setData] = useState<{ nodes: SankeyNode[]; links: SankeyLink[] } | null>(null);

  useEffect(() => {
    // Manually entered values (in Millions)
    const openingBalance = 4195.3;
    const operatingActivitiesTotal = 5070.8; // Net total for operating activities
    const investingActivitiesTotal = -7051.7; // Net total for investing activities
    const financingActivitiesTotal = 2012.5; // Net total for financing activities

    // Breakdown of Investing Activities
    const purchase = -9624.3;
    const disposal = 83.0;
    const givenToSubsidiaries = -159.2;
    const receivedFromSubsidiaries = 60.0;
    const investments = -36929.5;
    const salesOfInvestments = 36952.5;
    const fd = 1043.5;
    const interestReceived = 1522.3;

    // Breakdown of Financing Activities
    const borrow = 82140.5;
    const repaymentOfBorrow = -54929.6;
    const financeCost = -9.6;
    const dividendPaid = -25188.8;

    const netIncreaseDecrease = 4226.9; // Final net change
    // const closingBalance = openingBalance + netIncreaseDecrease; // Calculated closing balance

    const nodes: SankeyNode[] = [
      { id: 'Opening Balance', balance: openingBalance },
      { id: 'Operating Activities', balance: operatingActivitiesTotal },
      { id: 'Investing Activities', balance: investingActivitiesTotal },
      { id: 'Financing Activities', balance: financingActivitiesTotal },
      // Investing Sub-nodes
      { id: 'Purchase', balance: purchase },
      { id: 'Disposal', balance: disposal },
      { id: 'Given to Subsidiaries', balance: givenToSubsidiaries },
      { id: 'Received from Subsidiaries', balance: receivedFromSubsidiaries },
      { id: 'Investments (Item)', balance: investments }, // Renamed to avoid ID collision
      { id: 'Sales of Investments (Item)', balance: salesOfInvestments }, // Renamed
      { id: 'Fixed Deposits (Item)', balance: fd }, // Renamed
      { id: 'Interest Received (Item)', balance: interestReceived }, // Renamed
      // Financing Sub-nodes
      { id: 'Borrow (Item)', balance: borrow }, // Renamed
      { id: 'Repayment of Borrow (Item)', balance: repaymentOfBorrow }, // Renamed
      { id: 'Finance Cost (Item)', balance: financeCost }, // Renamed
      { id: 'Dividend Paid (Item)', balance: dividendPaid }, // Renamed
      // Final nodes
      { id: 'Closing Balance', balance: netIncreaseDecrease },
      // { id: 'Closing Balance', balance: closingBalance },
    ];

    const links: SankeyLink[] = [
      // Stage 1: From Opening Balance to Main Activity Categories
      // This represents the total cash flow from the beginning that *could be allocated*
      // to these major categories, rather than the net impact.
      // For accurate Sankey, we show magnitude, so using abs() for value.
      // Note: A Sankey might not perfectly sum up this way if negative values mean 'taken out'.
      // For a cash flow, you typically sum inflows/outflows separately from Opening.
      // Here, for visualization, we are distributing 'Opening Balance' to the absolute totals.
      // This might not strictly adhere to accounting definitions but serves the visualization goal.
      // A more robust approach might be to have 'Cash Pool' as an intermediate node.
      { source: 'Opening Balance', target: 'Operating Activities', value: Math.abs(operatingActivitiesTotal), originalValue: operatingActivitiesTotal },
      { source: 'Opening Balance', target: 'Investing Activities', value: Math.abs(investingActivitiesTotal), originalValue: investingActivitiesTotal },
      { source: 'Opening Balance', target: 'Financing Activities', value: Math.abs(financingActivitiesTotal), originalValue: financingActivitiesTotal },

      // Stage 2: Breakdown from Main Activity Categories to their detailed items
      // Investing Activities Breakdown
      { source: 'Investing Activities', target: 'Purchase', value: Math.abs(purchase), originalValue: purchase },
      { source: 'Investing Activities', target: 'Disposal', value: Math.abs(disposal), originalValue: disposal },
      { source: 'Investing Activities', target: 'Given to Subsidiaries', value: Math.abs(givenToSubsidiaries), originalValue: givenToSubsidiaries },
      { source: 'Investing Activities', target: 'Received from Subsidiaries', value: Math.abs(receivedFromSubsidiaries), originalValue: receivedFromSubsidiaries },
      { source: 'Investing Activities', target: 'Investments (Item)', value: Math.abs(investments), originalValue: investments },
      { source: 'Investing Activities', target: 'Sales of Investments (Item)', value: Math.abs(salesOfInvestments), originalValue: salesOfInvestments },
      { source: 'Investing Activities', target: 'Fixed Deposits (Item)', value: Math.abs(fd), originalValue: fd },
      { source: 'Investing Activities', target: 'Interest Received (Item)', value: Math.abs(interestReceived), originalValue: interestReceived },

      // Financing Activities Breakdown
      { source: 'Financing Activities', target: 'Borrow (Item)', value: Math.abs(borrow), originalValue: borrow },
      { source: 'Financing Activities', target: 'Repayment of Borrow (Item)', value: Math.abs(repaymentOfBorrow), originalValue: repaymentOfBorrow },
      { source: 'Financing Activities', target: 'Finance Cost (Item)', value: Math.abs(financeCost), originalValue: financeCost },
      { source: 'Financing Activities', target: 'Dividend Paid (Item)', value: Math.abs(dividendPaid), originalValue: dividendPaid },
      
      // Stage 3: From Individual Breakdown Items (and Operating Activities) to Net Increase/Decrease
      // Each detailed item contributes to the final net change.
      // Operating Activities flow directly as it has no further breakdown here.
      { source: 'Operating Activities', target: 'Closing Balance', value: Math.abs(operatingActivitiesTotal), originalValue: operatingActivitiesTotal },

      { source: 'Purchase', target: 'Closing Balance', value: Math.abs(purchase), originalValue: purchase },
      { source: 'Disposal', target: 'Closing Balance', value: Math.abs(disposal), originalValue: disposal },
      { source: 'Given to Subsidiaries', target: 'Closing Balance', value: Math.abs(givenToSubsidiaries), originalValue: givenToSubsidiaries },
      { source: 'Received from Subsidiaries', target: 'Closing Balance', value: Math.abs(receivedFromSubsidiaries), originalValue: receivedFromSubsidiaries },
      { source: 'Investments (Item)', target: 'Closing Balance', value: Math.abs(investments), originalValue: investments },
      { source: 'Sales of Investments (Item)', target: 'Closing Balance', value: Math.abs(salesOfInvestments), originalValue: salesOfInvestments },
      { source: 'Fixed Deposits (Item)', target: 'Closing Balance', value: Math.abs(fd), originalValue: fd },
      { source: 'Interest Received (Item)', target: 'Closing Balance', value: Math.abs(interestReceived), originalValue: interestReceived },

      { source: 'Borrow (Item)', target: 'Closing Balance', value: Math.abs(borrow), originalValue: borrow },
      { source: 'Repayment of Borrow (Item)', target: 'Closing Balance', value: Math.abs(repaymentOfBorrow), originalValue: repaymentOfBorrow },
      { source: 'Finance Cost (Item)', target: 'Closing Balance', value: Math.abs(financeCost), originalValue: financeCost },
      { source: 'Dividend Paid (Item)', target: 'Closing Balance', value: Math.abs(dividendPaid), originalValue: dividendPaid },

      // Stage 4: From Net Increase/Decrease to Closing Balance
      // This final link represents the change being added to the overall balance.
      // { source: 'Net Increase/Decrease', target: 'Closing Balance', value: Math.abs(netIncreaseDecrease), originalValue: netIncreaseDecrease },
    ];

    setData({ nodes, links });
  }, []);

  return (
    <div
      style={{ marginRight: '2.5rem', marginLeft: '0.001px', padding: '1rem', transition: 'transform 0.3s ease', cursor: 'pointer' }}
      onMouseEnter={(e) => (e.currentTarget.style.transform = 'scale(1.03)')}
      onMouseLeave={(e) => (e.currentTarget.style.transform = 'scale(1)')}
    >
      <div>
        {data ? (
          <div
            style={{
              width: '100%',
              maxWidth: '2000px',
              margin: '0 auto',
              padding: '20px',
              borderRadius: '16px',
              border: '1px solid #ddd',
              backgroundColor: '#ffffff',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
            }}
          >
            <div style={{ height: '60vh', minHeight: '400px' }}>
              <h2 style={{ textAlign: 'center', fontWeight: 'bold', marginBottom: '0.1rem' }}>
                Cash Flow 
              </h2>
              <ResponsiveSankey
                data={data}
                margin={{ top: 40, right: 130, bottom: 70, left: 100 }}
                align="justify" // Nivo will try to align nodes into columns
                colors={{ scheme: 'paired' }}
                nodeOpacity={1}
                nodeThickness={20}
                nodeInnerPadding={3}
                nodeSpacing={24} // Adjust spacing between nodes in the same column
                nodeBorderWidth={1}
                nodeBorderColor={{ from: 'color', modifiers: [['darker', 0.6]] }}
                linkOpacity={0.5}
                linkHoverOpacity={0.9}
                linkHoverOthersOpacity={0.1}
                enableLinkGradient
                labelPosition="outside"
                labelOrientation="horizontal"
                labelPadding={10}
                labelTextColor={{ from: 'color', modifiers: [['darker', 1]] }}
                animate={true}
                motionConfig="wobbly"
                // Node Tooltip
                nodeTooltip={({ node }) => (
                  <div
                    style={{
                      padding: '12px 24px',
                      minWidth: 200,
                      whiteSpace: 'nowrap',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                      background: ' #fff',
                      border: '2px solid #ccc',
                      borderRadius: 10,
                    }}
                  >
                    <strong>{node.id}</strong>
                    {node.balance !== undefined && (
                      <div>Value: ₹{node.balance.toFixed(2)}M</div>
                    )}
                  </div>
                )}
                // Link Tooltip
                linkTooltip={({ link }) => (
                  <div
                    style={{
                      padding: '12px 24px',
                      minWidth: 250,
                      whiteSpace: 'nowrap',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.15)',
                      background: '#fff',
                      border: '2px solid #ccc',
                      borderRadius: 10,
                    }}
                  >
                    <strong>{link.source.id} → {link.target.id}</strong>
                    <div>Value: ₹{(link.originalValue !== undefined ? link.originalValue : link.value).toFixed(2)}M</div>
                    <div>Type: {(link.originalValue !== undefined && link.originalValue < 0) || (link.originalValue === undefined && link.value < 0) ? 'Outflow' : 'Inflow'}</div>
                  </div>
                )}
              />
            </div>
          </div>
        ) : (
          <p>Loading Sankey chart...</p>
        )}
      </div>
    </div>
  );
};

export default Sankey;