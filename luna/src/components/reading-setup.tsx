"use client";

import { useState, type ReactNode } from "react";
import { ArrowRight, LockKeyhole, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TopicChips, type TopicChip } from "@/components/topic-chips";
import { FieldMessage, TEXTAREA } from "@/components/form-field";

/**
 * Form chuẩn bị trải bài, dùng chung cho Tarot và Lenormand để hai trang có
 * cùng layout và cùng một nút bắt đầu.
 *
 * `option` là hàng tuỳ chọn thêm (Tarot: switch "Dùng lá ngược"). Hàng này nằm
 * trên nút, nên khi không có thì nút vẫn chiếm trọn chiều ngang y hệt.
 *
 * Lưu ý: globals.css đặt rule ngoài cascade layer nên Tailwind utilities thua
 * về thứ tự layer — chỗ nào cần ghi đè phải dùng hậu tố `!`.
 */
export function ReadingSetup({
  fieldLabel,
  topics,
  topicColumns,
  topic,
  onTopicChange,
  questionId,
  question,
  onQuestionChange,
  placeholder,
  suggestionsLabel,
  suggestions,
  option,
  submitLabel,
  onSubmit,
}: {
  fieldLabel: string;
  topics: readonly TopicChip[];
  topicColumns: string;
  topic: string;
  onTopicChange: (label: string) => void;
  questionId: string;
  question: string;
  onQuestionChange: (value: string) => void;
  placeholder: string;
  suggestionsLabel: ReactNode;
  suggestions: readonly string[];
  option?: ReactNode;
  submitLabel: string;
  onSubmit: () => void;
}) {
  // Quy tắc form chung (xem form-field.tsx): nút luôn bấm được, thiếu câu hỏi
  // thì báo ngay dưới ô và đưa con trỏ về ô, không khoá nút.
  const [missing, setMissing] = useState(false);
  const change = (value: string) => {
    if (value.trim()) setMissing(false);
    onQuestionChange(value);
  };
  return (
    <>
      <label className="tarot-field-label">{fieldLabel}</label>
      <TopicChips
        topics={topics}
        value={topic}
        columns={topicColumns}
        onSelect={onTopicChange}
      />
      <div className="tarot-question-layout">
        <div className="tarot-question-entry">
          <div className="tarot-question-heading">
            <label htmlFor={questionId}>
              Câu hỏi của bạn <small>bắt buộc</small>
            </label>
            <span>{question.length}/300</span>
          </div>
          <div className="tarot-question-wrap">
            <Textarea
              id={questionId}
              placeholder={placeholder}
              maxLength={300}
              value={question}
              onChange={(event) => change(event.target.value)}
              aria-invalid={missing ? true : undefined}
              aria-describedby={missing ? `${questionId}-error` : undefined}
              className={`${TEXTAREA} pr-10! ${missing ? "border-[#c4566a]!" : ""}`}
            />
            <Pencil size={18} strokeWidth={1.3} aria-hidden="true" />
          </div>
          {missing ? <FieldMessage id={`${questionId}-error`}>Hãy viết câu hỏi bạn muốn hỏi.</FieldMessage> : null}
        </div>
        <div className="tarot-question-suggestions">
          <p>
            {suggestionsLabel}
          </p>
          <div>
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => {
                  change(suggestion);
                  document.getElementById(questionId)?.focus();
                }}
              >
                <span>{suggestion}</span>
                <ArrowRight size={15} />
              </button>
            ))}
          </div>
        </div>
      </div>
      <div className="tarot-setup-actions is-overview-actions grid-cols-1!">
        {option}
        <div className="tarot-begin-row col-span-full!">
          <Button
            className="tarot-begin-button"
            onClick={() => {
              if (question.trim()) return onSubmit();
              setMissing(true);
              document.getElementById(questionId)?.focus();
            }}
          >
            {submitLabel}
            <ArrowRight size={18} />
          </Button>
        </div>
      </div>
      <p className="tarot-private-note">
        <LockKeyhole size={14} strokeWidth={1.4} />
        Riêng tư · Chỉ lưu khi bạn chọn “Lưu kết quả”
      </p>
    </>
  );
}
