"use client";

import type { ReactNode } from "react";
import { ArrowRight, LockKeyhole, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { TopicChips, type TopicChip } from "@/components/topic-chips";

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
  submitDisabled,
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
  submitDisabled: boolean;
  onSubmit: () => void;
}) {
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
              onChange={(event) => onQuestionChange(event.target.value)}
            />
            <Pencil size={18} strokeWidth={1.3} aria-hidden="true" />
          </div>
        </div>
        <div className="tarot-question-suggestions">
          <p>
            {suggestionsLabel} <small>Bấm để điền, bạn có thể sửa lại</small>
          </p>
          <div>
            {suggestions.map((suggestion) => (
              <button
                key={suggestion}
                onClick={() => {
                  onQuestionChange(suggestion);
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
            disabled={submitDisabled}
            onClick={onSubmit}
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
