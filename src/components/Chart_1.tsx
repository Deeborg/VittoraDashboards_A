import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import HorizontalBarChartSlid from "./BarChartHoriSlid";
import ExcelTable from "./ExcelTable";
import "./Chart_1.css";
// import logo from "../Asset/ajalabs.png";
// import back from "../Asset/back.png";

const Chart_P1: React.FC = () => {
  const [data, setData] = useState<Array<Record<string, any>>>([]);
  const [desc, setDesc] = useState<Array<Record<string, any>>>([]);
  const [desc1, setDesc1] = useState<Array<Record<string, any>>>([]);

  const [originaldata, setDataorg] = useState<Array<Record<string, any>>>([]);
  const [groupedData, setGroupedData] = useState<Array<Record<string, any>>>(
    []
  );
  const [level, setLevel] = useState<string>("Level 1 Desc");
  const [category, setCategory] = useState<string>("");
  const [category1, setCategory1] = useState<string>("");
  const [category2, setCategory2] = useState<string>("");
  const [category3, setCategory3] = useState<string>("");
  const [category4, setCategory4] = useState<string>("");

  useEffect(() => {
    const readExcel = async () => {
      try {
        const response = await fetch("/Accounts.xlsx");
        if (!response.ok) throw new Error("Failed to fetch the file");

        const blob = await response.blob();
        const file = await blob.arrayBuffer();
        const workbook = XLSX.read(file, { type: "array" });

        // Read first sheet (main data)
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData: Array<Record<string, any>> =
          XLSX.utils.sheet_to_json(sheet);

        // Read second sheet (description data)
        if (workbook.SheetNames.length > 1) {
          const sheetName1 = workbook.SheetNames[1];
          const sheet1 = workbook.Sheets[sheetName1];

          if (sheet1) {
            const jsonData1: Array<Record<string, any>> =
              XLSX.utils.sheet_to_json(sheet1);
            setDesc([...jsonData1]); // Ensure state change
          } else {
            console.warn("⚠️ Second sheet is empty or undefined");
          }
        } else {
          console.warn("⚠️ Workbook does not contain a second sheet");
        }

        setData(jsonData);
        setDataorg(jsonData);
      } catch (error) {
        console.error("❌ Error reading Excel file:", error);
      }
    };

    readExcel();
  }, []);

  const groupBySum = (
    data1: Array<Record<string, any>>,
    level1: string,
    columnsToSum: string[]
  ) => {
    const groupedMap = new Map();

    data1.forEach((row) => {
      const key = row[level1];
      if (!groupedMap.has(key)) {
        groupedMap.set(key, {
          [level1]: key,
          ...Object.fromEntries(columnsToSum.map((col) => [col, 0])),
        });
      }
      const group = groupedMap.get(key);
      columnsToSum.forEach((col) => {
        group[col] += Number(row[col]) || 0;
      });
    });

    return Array.from(groupedMap.values());
  };

  useEffect(() => {
    if (data.length === 0) return;

    const groupedData1 = groupBySum(data, level, [
      "Mapped amount Q1FY23",
      "Mapped amount Q4FY22",
    ]);

    const processedData = groupedData1.map((row) => {
      const q1 = Number(row["Mapped amount Q1FY23"]) || 0;
      const q4 = Number(row["Mapped amount Q4FY22"]) || 0;
      return {
        ...row,
        "Flux Amount": q1 - q4,

        // "Flux Amount": Math.abs(q1) - Math.abs(q4),
      };
    });

    const finalData = processedData.map((row) => {
      const fluxAmount = row["Flux Amount"];
      const q4fy22_1 =
        row["Mapped amount Q4FY22"] === 0 ? 1 : row["Mapped amount Q4FY22"];

      return {
        ...row,
        "Flux Percentage": ((fluxAmount / q4fy22_1) * 100).toFixed(2),
      };
    });

    setGroupedData(finalData);
  }, [data, level]);

  function handleChartFilterChange(filters: any): void {
    const filteredData = originaldata.filter(
      (row) => row[filters.CategoryColumn] === filters.Category
    );
    setData(filteredData);
    const filteredDesc = desc.filter(
      (row) =>
        row["Level"] === filters.CategoryColumn &&
        row["Description"] === filters.Category
    );
    setCategory(filters.Category);
    setDesc1(filteredDesc);
    // console.log(filters)

    let newLevel = level;
    if (filters.CategoryColumn === "Level 1 Desc") {
      newLevel = "Level 2 Desc";
      setCategory1(filters.Category);
    } else if (filters.CategoryColumn === "Level 2 Desc") {
      newLevel = "Level 3 Desc";
      setCategory2(filters.Category);
    } else if (filters.CategoryColumn === "Level 3 Desc") {
      newLevel = "G/L Acct Long Text";
      setCategory3(filters.Category);
    } else {
      newLevel = "G/L Acct Long Text";
      setCategory4(filters.Category);
    }
    setLevel(newLevel);
  }

  function handleBackClick(filters: any): void {
    let newLevel = level;
    let oldLevel = level;
    if (newLevel === "Level 2 Desc") {
      newLevel = "Level 1 Desc";
      setData(originaldata);
    } else if (newLevel === "Level 3 Desc") {
      newLevel = "Level 2 Desc";
      const filteredData = originaldata.filter(
        (row) => row["Level 1 Desc"] === category1
      );
      setData(filteredData);
    } else if (category4 != "") {
      console.log("item level");
      newLevel = "G/L Acct Long Text";
      const filteredData = originaldata.filter(
        (row) => row["Level 3 Desc"] === category3
      );
      setData(filteredData);
      setCategory4("");
    } else if (newLevel === "G/L Acct Long Text") {
      newLevel = "Level 3 Desc";
      const filteredData = originaldata.filter(
        (row) => row["Level 2 Desc"] === category2
      );
      setData(filteredData);
    } else {
      newLevel = "Level 1 Desc";
      setData(originaldata);
    }

    setLevel(newLevel);
  }
  return (
    <div>
      <div className="heading-container">
        <h1 className="vittora-icon">Vittora</h1>
        <h3 className="main-heading">Flux Analysis</h3>
        <img src=".\asset\back.png" onClick={handleBackClick} alt="Logo" width="100px" />
        <img src=".\asset\vittora.png" alt="Logo" width="100px" />
      </div>

      <div className="chart-container">
        <HorizontalBarChartSlid
          data2={groupedData}
          CategoryColumn={level}
          ValueColumns={[
            "Mapped amount Q1FY23",
            "Mapped amount Q4FY22",
            "Flux Amount",
            "Flux Percentage",
          ]}
          Labels={["Q1FY23", "Q4FY22", "Flux Amount", "Flux %"]}
          yLabel={level}
          onFilterChange1={handleChartFilterChange}
        />
      </div>

      {desc1.length > 0 ? (
        <ExcelTable
          EXdata={desc1}
          EXdata1={groupedData}
          visibleColumns={["Flux Analysis"]}
          category={category}
        />
      ) : (
        <p></p>
      )}
    </div>
  );
};

export default Chart_P1;
