"use client";

import type { ComponentType } from "react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type IconType = ComponentType<{ className?: string; size?: number; "aria-hidden"?: boolean }>;

/**
 * Ô nhập có icon bên trái — kiểu dáng lấy từ form Tử Vi (`tuvi-input-wrap`,
 * `tuvi-control-icon`, `tuvi-input-with-icon`) để các form dùng chung một look.
 */
export function IconField({
  icon: Icon,
  ...props
}: { icon: IconType } & React.ComponentProps<typeof Input>) {
  return (
    <span className="tuvi-input-wrap">
      <Icon className="tuvi-control-icon" size={17} aria-hidden={true} />
      <Input
        {...props}
        // Ẩn nút chọn mặc định của type="date"/"time" vì đã có icon bên trái.
        // Gõ tay vẫn bình thường; bàn phím vẫn mở được bằng phím mũi tên xuống.
        className="tuvi-input-with-icon [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-inner-spin-button]:hidden"
      />
    </span>
  );
}

/** Select có icon, cùng kiểu dáng với IconField. */
export function IconSelect({
  name,
  placeholder,
  options,
  required = false,
  defaultValue,
  icon: Icon,
}: {
  name: string;
  placeholder: string;
  options: string[];
  required?: boolean;
  defaultValue?: string;
  icon: IconType;
}) {
  return (
    <Select name={name} required={required} defaultValue={defaultValue ?? null}>
      <SelectTrigger className="tuvi-select-trigger" aria-label={placeholder}>
        <Icon className="tuvi-control-icon" size={17} aria-hidden={true} />
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent className="tuvi-select-popup" alignItemWithTrigger={false}>
        {options.map((option) => (
          <SelectItem key={option} value={option} className="tuvi-select-item">
            {option}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
