"use client";

import { createContext, useContext, useState, type ComponentType, type FormEvent, type ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
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
  const { errors } = useContext(FormErrors);
  const error = props.name ? errors[props.name] : undefined;
  // Dòng lỗi nằm NGOÀI .tuvi-input-wrap: icon căn giữa theo chiều cao khung bao,
  // để lỗi bên trong thì khung cao thêm và icon tụt xuống.
  return (
    <>
    <span className="tuvi-input-wrap" data-field={props.name}>
      <Icon className="tuvi-control-icon" size={17} aria-hidden={true} />
      <Input
        {...props}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${props.name}-error` : undefined}
        // Ẩn nút chọn mặc định của type="date"/"time" vì đã có icon bên trái.
        // Gõ tay vẫn bình thường; bàn phím vẫn mở được bằng phím mũi tên xuống.
        className={`tuvi-input-with-icon [&::-webkit-calendar-picker-indicator]:hidden [&::-webkit-inner-spin-button]:hidden ${error ? INVALID : ""}`}
      />
    </span>
    {props.name ? <FieldError name={props.name} /> : null}
    </>
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
  const { errors, clear } = useContext(FormErrors);
  const error = errors[name];
  return (
    <span className="contents" data-field={name}>
    <Select name={name} required={required} defaultValue={defaultValue ?? null} onValueChange={() => clear(name)}>
      <SelectTrigger
        className={`tuvi-select-trigger ${error ? INVALID : ""}`}
        aria-label={placeholder}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${name}-error` : undefined}
      >
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
    <FieldError name={name} />
    </span>
  );
}

/**
 * Dòng hướng dẫn đầu form ("Nghĩ rõ một việc đang bận lòng…"). Cùng màu với
 * đoạn giới thiệu bên dưới form, chữ to hơn chú thích ô nhập vì người dùng đọc
 * nó trước khi điền. `!` vì .tuvi-note trong globals.css nằm ngoài cascade layer.
 */
export function FormIntro({ children }: { children: ReactNode }) {
  return (
    <p className="tuvi-note mb-2! text-center! text-[14px]! leading-[1.7]! text-[#735f80]!">
      {children}
    </p>
  );
}

/**
 * QUY TẮC CHUNG CHO MỌI FORM TÍNH NĂNG
 *
 * 1. Nút CTA luôn bấm được. Chỉ khoá khi đang gửi, kèm spinner và nhãn "Đang…".
 *    Không khoá nút để báo "chưa điền đủ" — nút mờ không nói được thiếu gì.
 * 2. Bấm khi còn thiếu: không gửi, báo lỗi tiếng Việt ngay dưới ô sai, viền đỏ
 *    ô đó, đưa con trỏ tới ô sai đầu tiên. Không dùng bong bóng mặc định của
 *    trình duyệt (mỗi trình duyệt một kiểu, có khi bằng tiếng Anh).
 * 3. Lỗi của ô biến mất ngay khi người dùng sửa ô đó.
 * 4. Lỗi từ máy chủ hiện ở một chỗ cố định: ngay trên nút CTA (`tuvi-form-error`).
 *
 * Form dùng `ValidatedForm`; ô nhập dùng `IconField`/`IconSelect` (tự hiện lỗi)
 * hoặc đặt `<FieldError name=… />` dưới ô tự làm. Ràng buộc khai báo bằng thuộc
 * tính HTML (`required`, `minLength`, `min`…); ràng buộc khác truyền qua `check`.
 */

const INVALID = "border-[#c4566a]! ring-0!";

/**
 * Style chung cho MỌI textarea trong form tính năng (Tarot, Lenormand, Giấc mơ,
 * Xin xăm, Kinh Dịch…): cùng nền, viền, bo góc, cỡ chữ với ô nhập một dòng.
 * `!` vì .tarot-question-wrap textarea / .tuvi-form textarea trong globals.css
 * nằm ngoài cascade layer và đặt cứng chiều cao.
 */
export const TEXTAREA = "h-auto! min-h-[120px]! rounded-[8px]! border-[#e5d9eb]! bg-[#fdfafc]! px-4! py-3! text-[13px]! leading-[1.7]! text-[#795e87]!";

type FieldErrors = Record<string, string>;
const FormErrors = createContext<{ errors: FieldErrors; clear: (name: string) => void }>({
  errors: {},
  clear: () => {},
});

type Field = HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement;

/** Câu báo lỗi theo loại vi phạm, thay cho câu mặc định của trình duyệt. */
function messageFor(field: Field) {
  const v = field.validity;
  const isChoice = field instanceof HTMLSelectElement || field.closest("[data-field]")?.querySelector("[data-slot=select-trigger]");
  if (v.valueMissing) return isChoice ? "Hãy chọn một mục." : "Mục này cần được điền.";
  if (v.tooShort) return `Cần ít nhất ${field.getAttribute("minlength")} ký tự.`;
  if (v.badInput) return "Giá trị chưa đúng định dạng.";
  if (v.rangeUnderflow || v.rangeOverflow) return "Giá trị nằm ngoài khoảng cho phép.";
  return "Giá trị chưa hợp lệ.";
}

/** Đưa con trỏ tới ô sai: ô nhập thật, nút mở select, hoặc nút tự làm trong vùng data-field. */
function focusField(form: HTMLFormElement, name: string) {
  const zone = form.querySelector<HTMLElement>(`[data-field="${CSS.escape(name)}"]`);
  const target =
    zone?.querySelector<HTMLElement>("[data-slot=select-trigger], input:not([type=hidden]):not([aria-hidden=true]), textarea, button") ??
    form.querySelector<HTMLElement>(`[name="${CSS.escape(name)}"]`);
  target?.focus({ preventScroll: true });
  (zone ?? target)?.scrollIntoView({ block: "center", behavior: "smooth" });
}

export function ValidatedForm({
  onValidSubmit,
  check,
  className,
  children,
}: {
  onValidSubmit: (form: HTMLFormElement) => void;
  /** Ràng buộc không khai báo được bằng HTML, trả về { tên ô: câu báo lỗi }. */
  check?: (form: HTMLFormElement) => FieldErrors;
  className?: string;
  children: ReactNode;
}) {
  const [errors, setErrors] = useState<FieldErrors>({});
  const clear = (name: string) =>
    setErrors((current) => {
      if (!(name in current)) return current;
      const next = { ...current };
      delete next[name];
      return next;
    });

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const found: FieldErrors = {};
    for (const element of Array.from(form.elements)) {
      const field = element as Field;
      if (!field.name || !("validity" in field) || field.validity.valid || field.disabled) continue;
      found[field.name] ??= messageFor(field);
    }
    Object.assign(found, check?.(form));
    setErrors(found);
    // Ô sai đầu tiên theo thứ tự xuất hiện trên trang, không theo thứ tự khai báo.
    const first = Array.from(form.querySelectorAll<HTMLElement>("[data-field], [name]"))
      .map((el) => el.dataset.field ?? el.getAttribute("name") ?? "")
      .find((name) => name in found);
    if (first) return focusField(form, first);
    onValidSubmit(form);
  }

  return (
    <FormErrors.Provider value={{ errors, clear }}>
      <form
        noValidate
        className={className}
        onSubmit={submit}
        onInput={(event) => clear((event.target as Partial<Field>).name ?? "")}
        onChange={(event) => clear((event.target as Partial<Field>).name ?? "")}
      >
        {children}
      </form>
    </FormErrors.Provider>
  );
}

/** Câu báo lỗi dưới một ô. Không có lỗi thì không chiếm chỗ. */
export function FieldError({ name }: { name: string }) {
  const { errors } = useContext(FormErrors);
  return errors[name] ? <FieldMessage id={`${name}-error`}>{errors[name]}</FieldMessage> : null;
}

/** Kiểu chữ báo lỗi dưới ô, dùng cả cho form không đi qua ValidatedForm (Tarot, Xin xăm…). */
export function FieldMessage({ id, children }: { id?: string; children: ReactNode }) {
  return (
    <span id={id} role="alert" className="mt-2 block text-[13px] leading-[1.5] font-normal text-[#b4475a]">
      {children}
    </span>
  );
}

/** Dùng cho ô tự làm (chọn ngày Tử vi, ô ảnh Chỉ tay) để biết ô mình có đang lỗi không. */
export function useFieldError(name: string) {
  return useContext(FormErrors).errors[name];
}

/** Ô tự làm không phát sự kiện input/change (chọn ngày bằng lịch) tự xoá lỗi khi có giá trị mới. */
export function useClearFieldError() {
  return useContext(FormErrors).clear;
}

/** Textarea trong ValidatedForm: viền đỏ và trỏ tới câu báo lỗi khi ô đang sai. */
export function FieldTextarea({ name, className = "", ...props }: { name: string } & React.ComponentProps<typeof Textarea>) {
  const error = useFieldError(name);
  return (
    <span className="contents" data-field={name}>
      <Textarea
        {...props}
        name={name}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? `${name}-error` : undefined}
        className={`${TEXTAREA} ${className} ${error ? INVALID : ""}`}
      />
      <FieldError name={name} />
    </span>
  );
}
