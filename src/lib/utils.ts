import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatNumber(value: number, decimals = 4) {
  return new Intl.NumberFormat("id-ID", {
    maximumFractionDigits: decimals,
    minimumFractionDigits: decimals,
  }).format(Number.isFinite(value) ? value : 0)
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value))
}

export function weightIsValid(total: number) {
  return Math.abs(total - 1) <= 0.001
}

export function getWeightTotal(criteria: { weight: number }[]) {
  return criteria.reduce((sum, criterion) => sum + Number(criterion.weight), 0)
}
