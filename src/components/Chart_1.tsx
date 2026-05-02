import React, { useState, useEffect } from "react";
import * as XLSX from "xlsx";
import HorizontalBarChartSlid from "./BarChartHoriSlid";
import ExcelTable from "./ExcelTable";
import "./Chart_1.css";
import { useNavigate } from "react-router-dom";
import { HiArrowLeft, HiHome } from "react-icons/hi";

const Chart_P1: React.FC = () => {
  const navigate = useNavigate();

  const [data, setData] = useState<Array<Record<string, any>>>([]);
  const [desc, setDesc] = useState<Array<Record<string, any>>>([]);
  const [desc1, setDesc1] = useState<Array<Record<string, any>>>([]);
  const [originaldata, setDataorg] = useState<Array<Record<string, any>>>([]);
  const [groupedData, setGroupedData] = useState<Array<Record<string, any>>>([]);
  const [level, setLevel] = useState<string>("Level 1 Desc");
  const [category, setCategory] = useState<string>("");
  const [category1, setCategory1] = useState<string>("");
  const [category2, setCategory2] = useState<string>("");
  const [category3, setCategory3] = useState<string>("");
  const [category4, setCategory4] = useState<string>("");

  useEffect(() => {
    const readExcel = async () => {
      try {
        const response = await fetch("/Accounts_flux.xlsx");
        if (!response.ok) throw new Error("Failed to fetch the file");

        const blob = await response.blob();
        const file = await blob.arrayBuffer();
        const workbook = XLSX.read(file, { type: "array" });

        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const jsonData: Array<Record<string, any>> =
          XLSX.utils.sheet_to_json(sheet);

        if (workbook.SheetNames.length > 1) {
          const sheetName1 = workbook.SheetNames[1];
          const sheet1 = workbook.Sheets[sheetName1];

          if (sheet1) {
            const jsonData1: Array<Record<string, any>> =
              XLSX.utils.sheet_to_json(sheet1);
            setDesc([...jsonData1]);
          }
        }

        setData(jsonData);
        setDataorg(jsonData);
      } catch (error) {
        console.error("Error reading Excel file:", error);
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
      };
    });

    const finalData = processedData.map((row) => {
      const fluxAmount = row["Flux Amount"];

      const q4fy22_1 =
        row["Mapped amount Q4FY22"] === 0
          ? 1
          : row["Mapped amount Q4FY22"];

      return {
        ...row,
        "Flux Percentage": (
          (fluxAmount / Math.abs(q4fy22_1)) *
          100
        ).toFixed(2),
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

  function handleBackClick(): void {
    let newLevel = level;

    if (newLevel === "Level 2 Desc") {
      newLevel = "Level 1 Desc";
      setData(originaldata);
    } else if (newLevel === "Level 3 Desc") {
      newLevel = "Level 2 Desc";

      const filteredData = originaldata.filter(
        (row) => row["Level 1 Desc"] === category1
      );

      setData(filteredData);
    } else if (category4 !== "") {
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
      {/* HEADER */}
      <div
        style={{
          background: "#fff",
          borderRadius: "16px",
          boxShadow: "0 4px 18px rgba(0,0,0,0.08)",
          padding: "20px 28px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          margin: "32px auto 24px auto",
          width: "100%",
          boxSizing: "border-box",
        }}
      >
        {/* LEFT BUTTONS */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
            minWidth: "140px",
          }}
        >
          <button
            onClick={handleBackClick}
            title="Back within Flux"
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "14px",
              border: "none",
              background:
                "linear-gradient(135deg, #4f8cff, #2563eb)",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow:
                "0 6px 14px rgba(37,99,235,0.25)",
              transition: "all 0.3s ease",
            }}
          >
            <HiArrowLeft size={28} />
          </button>

          <button
            onClick={() =>
              navigate("/modules", {
                state: { scrollToModule: "finance" },
              })
            }
            title="Back to Finance Planning & Analysis"
            style={{
              width: "52px",
              height: "52px",
              borderRadius: "14px",
              border: "none",
              background: "#04041f",
              color: "#fff",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              boxShadow:
                "0 6px 14px rgba(0,0,0,0.18)",
              transition: "all 0.3s ease",
            }}
          >
            <HiHome size={24} />
          </button>
        </div>

        {/* TITLE */}
        <h2
          style={{
            margin: 0,
            fontWeight: 700,
            fontSize: "2rem",
            color: "#1a237e",
            flex: 1,
            textAlign: "center",
          }}
        >
          Flux Analysis
        </h2>

        {/* LOGO */}
        <img
          src="./asset/vittora_grey.png"
          alt="Vittora Logo"
          style={{
            height: 48,
            minWidth: "140px",
            objectFit: "contain",
          }}
        />
      </div>

      {/* CHART */}
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
          Labels={[
            "Q1FY23",
            "Q4FY22",
            "Flux Amount",
            "Flux %",
          ]}
          yLabel={level}
          onFilterChange1={handleChartFilterChange}
        />
      </div>

      {/* TABLE */}
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