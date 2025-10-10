/********************************************************************************
 * Copyright (c) 2025 Contributors to the Eclipse Foundation
 *
 * See the NOTICE file(s) distributed with this work for additional
 * information regarding copyright ownership.
 *
 * This program and the accompanying materials are made available under the
 * terms of the Eclipse Public License v. 2.0 which is available at
 * http://www.eclipse.org/legal/epl-2.0, or the W3C Software Notice and
 *
 * SPDX-License-Identifier: EPL-2.0 OR W3C-20150513
 ********************************************************************************/
import Papa from "papaparse";

export type CsvData = {
  name: string;
  title?: string;
  description?: string;
  type: string;
  minimum?: string;
  maximum?: string;
  unit?: string;
  href: string;
  "modbus:unitID": number;
  "modbus:address": string;
  "modbus:quantity": string;
  "modbus:type"?: string;
  "modbus:zeroBasedAddressing": string;
  "modbus:entity": string;
  "modbus:pollingTime"?: string;
  "modbus:function": string;
  "modbus:mostSignificantByte": string;
  "modbus:mostSignificantWord": string;
  "modbus:timeout"?: string;
};

type PropertyForm = {
  op: string | string[];
  href: string;
  "modbus:unitID": number;
  "modbus:address": number;
  "modbus:quantity": number;
  "modbus:type"?: string;
  "modbus:zeroBasedAddressing": boolean;
  "modbus:entity": string;
  "modbus:pollingTime"?: string;
  "modbus:function"?: string;
  "modbus:mostSignificantByte": boolean;
  "modbus:mostSignificantWord": boolean;
  "modbus:timeout"?: string;
};

type Property = {
  type?: string;
  readOnly?: boolean;
  title?: string;
  description?: string;
  minimum?: number;
  maximum?: number;
  unit?: string;
  forms: PropertyForm[];
};

type Properties = {
  [key: string]: Property;
};

/**
 * Parses a CSV string into an array of objects of type CsvData.
 * @param csvContent - The CSV content as a string.
 * @param hasHeaders - Whether the CSV has headers (default: true).
 * @param character - The character used to separate values (default: ",").
 * @returns An array of objects (if headers are present) or arrays (if no headers).
 */
export const parseCsv = (
  csvContent: string,
  hasHeaders: boolean = true
): CsvData[] => {
  if (csvContent === "") throw new Error("CSV content is empty");

  const res = Papa.parse<CsvData>(csvContent, {
    header: true,
    quoteChar: '"',
    skipEmptyLines: true,
    dynamicTyping: false,
    transformHeader: (h) => h.trim(),
    transform: (value) => (typeof value === "string" ? value.trim() : value),
    complete: (results) => {
      console.log(results.data, results.errors, results.meta);
    },
  });

  if (res.errors.length) {
    // Gather first few errors for context
    const msg = res.errors
      .slice(0, 3)
      .map(
        (e) =>
          `Row ${e.row ?? "?"}: ${e.message}${
            e.code ? ` (code=${e.code})` : ""
          }`
      )
      .join("; ");
    throw new Error(`CSV parse failed: ${msg}`);
  }

  return res.data.filter((row) =>
    Object.values(row).some((v) => v !== "" && v != null)
  );
};

/**
 *  Helper to safely parse optional numeric CSV fields:
 *
 */
const parseOptionalNumber = (value?: string): number | undefined => {
  if (value == null) return undefined;
  const trimmed = value.trim();
  if (trimmed === "") return undefined;
  const num = Number(trimmed);
  return Number.isFinite(num) ? num : undefined;
};

/**
 *
 * @param row
 * @returns
 */
export const mapRowToProperty = (row: CsvData): Property => ({
  ...(row.type ? { type: row.type } : {}),
  readOnly: true,
  ...(row.title ? { title: row.title } : {}),
  ...(row.description ? { description: row.description } : {}),
  ...(parseOptionalNumber(row.minimum) !== undefined
    ? { minimum: parseOptionalNumber(row.minimum)! }
    : {}),
  ...(parseOptionalNumber(row.maximum) !== undefined
    ? { maximum: parseOptionalNumber(row.maximum)! }
    : {}),
  ...(row.unit ? { unit: row.unit } : {}),
  forms: [
    {
      op: "readproperty",
      href: !row.href ? "/" : row.href,
      "modbus:unitID": Number(row["modbus:unitID"]) ?? 1,
      "modbus:address": Number(row["modbus:address"]),
      "modbus:quantity": Number(row["modbus:quantity"]) ?? 1,
      ...(row["modbus:type"] ? { "modbus:type": row["modbus:type"] } : {}),
      "modbus:zeroBasedAddressing":
        Boolean(row["modbus:zeroBasedAddressing"]) ?? false,
      "modbus:entity": row["modbus:entity"],
      ...(row["modbus:pollingTime"]
        ? { "modbus:pollingTime": row["modbus:pollingTime"] }
        : {}),
      ...(row["modbus:function"]
        ? { "modbus:function": row["modbus:function"] }
        : {}),
      "modbus:mostSignificantByte":
        row["modbus:mostSignificantByte"]?.toLowerCase() === "true"
          ? true
          : false,
      "modbus:mostSignificantWord":
        row["modbus:mostSignificantWord"]?.toLowerCase() === "true"
          ? true
          : false,
      ...(row["modbus:timeout"]
        ? { "modbus:timeout": row["modbus:timeout"] }
        : {}),
    },
  ],
});

/**
 *
 * @param data
 * @returns
 */
export const mapCsvToProperties = (data: CsvData[]): Properties =>
  data.reduce((acc, row) => {
    if (!row.name || row.name.trim() === "") {
      throw new Error("Error on CSV file: Row name is required");
    }
    if (!row["modbus:address"] || row["modbus:address"].trim() === "") {
      throw new Error(
        `Error on CSV file: "modbus:address" value is required for row: "${row.name}"`
      );
    }
    if (!row["modbus:entity"] || row["modbus:entity"].trim() === "") {
      throw new Error(
        `Error on CSV file: "modbus:entity" value is required for row: "${row.name}"`
      );
    }
    acc[row.name] = mapRowToProperty(row);
    return acc;
  }, {} as Properties);
