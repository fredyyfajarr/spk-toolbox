"use client";

import { useState } from "react";
import { GripVertical, Plus, Trash2 } from "lucide-react";
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import type { Criteria, CriteriaType } from "@/types";

interface CriteriaTableProps {
  criteria: Criteria[];
  onChange: (criteria: Criteria[]) => void;
}

function makeCriterion(index: number): Criteria {
  return {
    id:
      typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : Math.random().toString(36).slice(2),
    code: `C${index + 1}`,
    name: `Kriteria ${index + 1}`,
    type: "benefit",
    weight: 0,
  };
}

function SortableRow({
  criterion,
  index,
  onUpdate,
  onDelete,
}: {
  criterion: Criteria;
  index: number;
  onUpdate: (data: Partial<Criteria>) => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: criterion.id });
  const [weightDraft, setWeightDraft] = useState(String(criterion.weight));

  return (
    <TableRow
      ref={setNodeRef}
      style={{ transform: CSS.Transform.toString(transform), transition }}
      className="group transition-colors border-b border-border hover:bg-muted/30"
    >
      <TableCell className="w-12">
        <Button
          variant="ghost"
          size="icon"
          className="size-8 cursor-grab"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-4" />
        </Button>
      </TableCell>
      <TableCell className="text-muted-foreground">{index + 1}</TableCell>
      <TableCell className="font-medium">{criterion.code}</TableCell>
      <TableCell className="min-w-52">
        <Input
          value={criterion.name}
          onChange={(event) => onUpdate({ name: event.target.value })}
        />
      </TableCell>
      <TableCell className="min-w-36">
        <Select
          value={criterion.type}
          onValueChange={(value: CriteriaType) => onUpdate({ type: value })}
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="benefit">Benefit</SelectItem>
            <SelectItem value="cost">Cost</SelectItem>
          </SelectContent>
        </Select>
      </TableCell>
      <TableCell className="min-w-32">
        <Input
          type="number"
          min={0}
          max={1}
          step={0.01}
          value={weightDraft}
          onBlur={() => {
            if (weightDraft === "") {
              setWeightDraft("0");
            }
          }}
          onChange={(event) => {
            const rawValue = event.target.value;
            setWeightDraft(rawValue);

            if (rawValue === "") {
              onUpdate({ weight: 0 });
              return;
            }

            const next = Number(rawValue);
            if (!Number.isFinite(next)) {
              return;
            }

            const clamped = Math.min(1, Math.max(0, next));
            onUpdate({ weight: clamped });
          }}
        />
      </TableCell>
      <TableCell className="text-right">
        <Button variant="ghost" size="icon" onClick={onDelete}>
          <Trash2 className="size-4" />
        </Button>
      </TableCell>
    </TableRow>
  );
}

export function CriteriaTable({ criteria, onChange }: CriteriaTableProps) {
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  function updateCriterion(id: string, data: Partial<Criteria>) {
    onChange(
      criteria.map((criterion) =>
        criterion.id === id ? { ...criterion, ...data } : criterion
      )
    );
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) {
      return;
    }

    const oldIndex = criteria.findIndex((item) => item.id === active.id);
    const newIndex = criteria.findIndex((item) => item.id === over.id);
    onChange(arrayMove(criteria, oldIndex, newIndex));
  }

  return (
    <div className="space-y-4">
      <div className="overflow-x-auto rounded-md border border-border bg-card shadow-sm">
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={criteria.map((item) => item.id)} strategy={verticalListSortingStrategy}>
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border bg-muted/50 hover:bg-muted/50">
                  <TableHead className="w-12"></TableHead>
                  <TableHead className="w-16">No</TableHead>
                  <TableHead className="w-24">Kode</TableHead>
                  <TableHead>Nama Kriteria</TableHead>
                  <TableHead className="w-40">Tipe</TableHead>
                  <TableHead className="w-32">Bobot</TableHead>
                  <TableHead className="w-16 text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {criteria.map((criterion, index) => (
                  <SortableRow
                    key={criterion.id}
                    criterion={criterion}
                    index={index}
                    onUpdate={(data) => updateCriterion(criterion.id, data)}
                    onDelete={() =>
                      onChange(criteria.filter((item) => item.id !== criterion.id))
                    }
                  />
                ))}
              </TableBody>
            </Table>
          </SortableContext>
        </DndContext>
      </div>
      <Button
        variant="outline"
        className="rounded-md border-dashed border-border w-full sm:w-auto"
        onClick={() => onChange([...criteria, makeCriterion(criteria.length)])}
      >
        <Plus className="size-4" />
        Tambah Kriteria
      </Button>
    </div>
  );
}
