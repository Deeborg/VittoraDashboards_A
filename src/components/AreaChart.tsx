import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from "recharts";
interface DataPorts {
  data: Record<string, any>[];
  xKey: string; // Field for categories (X-axis)
  yKey: string; // Field for values to sum (Y-axis)
  areacolor:string;
}
const AreaChart1: React.FC<DataPorts> = ({ data, xKey, yKey,areacolor }) => {
  // const filterColumns = (data: Record<string, any>[], columns: string[]) => {
  //   return data.map(row => {
  //     const filteredRow: Record<string, any> = {};
  //     columns.forEach(col => {
  //       if (row[col] !== undefined) {
  //         filteredRow[col] = row[col];
  //       }
  //     });
  //     return filteredRow;
  //   });
  // };

  // const filteredData = filterColumns(data, [
  //   "Fiscal year","Working capital" 
  // ]);

  console.log("Areachart",data)
  return (
    
    <ResponsiveContainer width={200} height={200}>
    <AreaChart data={data}>
      <CartesianGrid stroke="none" />
      <XAxis dataKey={xKey} hide />
      <YAxis hide />
      <Area
        type="monotone"
        dataKey={yKey}
        stroke={areacolor}
        fill={areacolor}
      />
    </AreaChart>
  </ResponsiveContainer>
);
    

};

export default AreaChart1;
