"use client";

import { useMemo, useState } from "react";
import * as XLSX from "xlsx";
import { FileSpreadsheet, Upload } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { Alternative, AlternativeValue, Criteria } from "@/types";

interface ImportModalProps {
  criteria: Criteria[];
  onImport: (alternatives: Alternative[], values: AlternativeValue[]) => void;
}

type RowData = Record<string, string | number>;

function normalize(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function ImportModal({ criteria, onImport }: ImportModalProps) {
  const [open, setOpen] = useState(false);
  const [rows, setRows] = useState<RowData[]>([]);
  const headers = useMemo(() => Object.keys(rows[0] ?? {}), [rows]);
  const [nameColumn, setNameColumn] = useState("");
  const [mapping, setMapping] = useState<Record<string, string>>({});

  async function handleFile(file: File) {
    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const parsed = XLSX.utils.sheet_to_json<RowData>(sheet, { defval: "" });

      if (parsed.length === 0) {
        toast.error("File kosong atau tidak bisa dibaca");
        return;
      }

      const parsedHeaders = Object.keys(parsed[0]);
      const autoName =
        parsedHeaders.find((header) =>
          ["alternatif", "nama", "name"].includes(normalize(header))
        ) ?? parsedHeaders[0];
      const autoMapping = Object.fromEntries(
        criteria.map((criterion) => {
          const target =
            parsedHeaders.find(
              (header) =>
                normalize(header) === normalize(criterion.code) ||
                normalize(header) === normalize(criterion.name)
            ) ?? "";
          return [criterion.id, target];
        })
      );

      setRows(parsed.slice(0, 100));
      setNameColumn(autoName);
      setMapping(autoMapping);
    } catch (error) {
      toast.error(
        error instanceof Error
          ? `Import gagal: ${error.message}`
          : "Import gagal parsing file"
      );
    }
  }

  function applyImport() {
    if (!nameColumn) {
      toast.error("Pilih kolom nama alternatif");
      return;
    }

    const missing = criteria.filter((criterion) => !mapping[criterion.id]);
    if (missing.length > 0) {
      toast.error("Lengkapi mapping semua kriteria");
      return;
    }

    const alternatives: Alternative[] = rows.map((row, index) => ({
      id:
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : Math.random().toString(36).slice(2),
      code: `A${index + 1}`,
      name: String(row[nameColumn] || `Alternatif ${index + 1}`),
    }));
    const values: AlternativeValue[] = alternatives.flatMap((alternative, rowIndex) =>
      criteria.map((criterion) => ({
        alternativeId: alternative.id,
        criteriaId: criterion.id,
        value: Math.max(0, Number(rows[rowIndex]?.[mapping[criterion.id]] ?? 0)),
      }))
    );

    onImport(alternatives, values);
    toast.success("Data berhasil diimport");
    setOpen(false);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <FileSpreadsheet className="size-4" />
          Import Excel/CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Import Excel/CSV</DialogTitle>
        </DialogHeader>
        <div className="space-y-5">
          <Label className="flex min-h-28 cursor-pointer flex-col items-center justify-center rounded-md border border-dashed bg-muted/40 p-6 text-center">
            <Upload className="mb-2 size-6" />
            <span className="font-medium">Pilih file .xlsx, .xls, atau .csv</span>
            <input
              type="file"
              accept=".xlsx,.xls,.csv"
              className="sr-only"
              onChange={(event) => {
                const file = event.target.files?.[0];
                if (file) {
                  void handleFile(file);
                }
              }}
            />
          </Label>

          {rows.length > 0 && (
            <>
              <div className="grid gap-3 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Kolom nama alternatif</Label>
                  <Select value={nameColumn} onValueChange={setNameColumn}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {headers.map((header) => (
                        <SelectItem key={header} value={header}>
                          {header}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {criteria.map((criterion) => (
                  <div key={criterion.id} className="space-y-2">
                    <Label>
                      {criterion.code} - {criterion.name}
                    </Label>
                    <Select
                      value={mapping[criterion.id] ?? ""}
                      onValueChange={(value) =>
                        setMapping((current) => ({
                          ...current,
                          [criterion.id]: value,
                        }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Pilih kolom" />
                      </SelectTrigger>
                      <SelectContent>
                        {headers.map((header) => (
                          <SelectItem key={header} value={header}>
                            {header}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
              <div className="max-h-64 overflow-auto rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {headers.map((header) => (
                        <TableHead key={header}>{header}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {rows.slice(0, 8).map((row, index) => (
                      <TableRow key={index}>
                        {headers.map((header) => (
                          <TableCell key={header}>{String(row[header])}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Batal
          </Button>
          <Button onClick={applyImport} disabled={rows.length === 0}>
            Import
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
