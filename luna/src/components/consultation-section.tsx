"use client";

import { useState } from "react";
import { ArrowRight, CalendarClock, Check, LoaderCircle, LockKeyhole, MessageCircle, Phone, UserRound, Video } from "lucide-react";
import { FacebookIcon, ZaloIcon } from "@/components/social-icons";
import { Button } from "@/components/ui/button";
import { FieldCheckbox, FieldTextarea, IconField, IconSelect, ValidatedForm } from "@/components/form-field";
import { CONSULT_CHANNELS, CONSULT_NAME_MAX, CONSULT_NOTE_MAX, CONSULT_TIMES, contactError, type ConsultChannel } from "@/lib/consultation";
import { toolGroups } from "@/components/tool-groups";
import { track } from "@/lib/analytics";

/** Tên tính năng để hiện trong câu chữ ("sau phần Xem Tarot cùng AI…"). */
function featureTitle(action: string) {
  for (const group of toolGroups) {
    const tool = group.tools.find((t) => "action" in t && t.action === action);
    if (tool) return tool.title;
  }
  return null;
}

const CHANNEL_LABELS = CONSULT_CHANNELS.map((c) => c.label);

type IconProps = { className?: string; size?: number };

/**
 * Logo từng kênh: hiện cạnh option trong danh sách, và thay icon đầu ô khi đã chọn.
 * `!` vì .tuvi-control-icon (ngoài cascade layer) tô cứng màu tím cho mọi icon đầu ô.
 */
const CHANNEL_ICONS: Record<ConsultChannel, (props: IconProps) => React.ReactElement> = {
  zalo: ({ className, size }) => <ZaloIcon size={size} className={className} />,
  facebook: ({ className, size }) => <FacebookIcon size={size} className={`${className ?? ""} text-[#1877f2]!`} />,
  phone: ({ className, size }) => <Phone size={size} className={`${className ?? ""} text-[#2f9e5b]!`} aria-hidden />,
  video: ({ className, size }) => <Video size={size} className={`${className ?? ""} text-[#1a73e8]!`} aria-hidden />,
};

const CHANNEL_OPTION_ICONS = Object.fromEntries(
  CONSULT_CHANNELS.map((c) => {
    const Icon = CHANNEL_ICONS[c.value];
    return [c.label, <Icon key={c.value} size={18} />];
  }),
);
const TIME_LABELS = CONSULT_TIMES.map((t) => t.label);

/**
 * Form "Tư vấn 1-1 với reader", hiện dưới kết quả của mọi tính năng (qua
 * RelatedToolsSlot, và trực tiếp ở Tử Vi). Ghi vào bảng consultation_requests
 * qua /api/consultation; reader xem và liên hệ lại từ Supabase dashboard.
 */
export function ConsultationSection({ feature, resultTitle }: { feature: string; resultTitle?: string }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [channel, setChannel] = useState("");
  const title = featureTitle(feature);

  async function submit(form: HTMLFormElement) {
    const data = new FormData(form);
    const channelLabel = String(data.get("channel") ?? "");
    const timeLabel = String(data.get("time") ?? "");
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/consultation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feature,
          name: String(data.get("name") ?? ""),
          contact: String(data.get("contact") ?? ""),
          channel: CONSULT_CHANNELS.find((c) => c.label === channelLabel)?.value,
          preferredTime: CONSULT_TIMES.find((t) => t.label === timeLabel)?.value,
          note: String(data.get("note") ?? ""),
          resultTitle,
        }),
      });
      const body = (await response.json().catch(() => ({}))) as { error?: string };
      if (!response.ok) throw new Error(body.error ?? "Chưa gửi được yêu cầu. Bạn thử lại sau ít phút nhé.");
      track("consultation_request", { feature });
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Chưa gửi được yêu cầu. Bạn thử lại sau ít phút nhé.");
    } finally {
      setLoading(false);
    }
  }

  const contactValue = CONSULT_CHANNELS.find((c) => c.label === channel)?.value;
  const isFacebook = contactValue === "facebook";
  const ChannelIcon = contactValue ? CHANNEL_ICONS[contactValue] : MessageCircle;
  const contactLabel = isFacebook
    ? "Link Facebook của bạn"
    : contactValue === "video"
      ? "Số điện thoại (nhận link Google Meet)"
      : "Số điện thoại";

  return (
    <section aria-labelledby={`consult-${feature}-heading`}>
      <p className="text-xs tracking-[0.2em] text-[#6a5c7a] uppercase">Tư vấn 1-1</p>
      <h2 id={`consult-${feature}-heading`} className="mt-1 text-[20px] leading-[1.4] font-medium text-[#281b44]">
        Muốn trò chuyện sâu hơn với một reader?
      </h2>
      <p className="mt-1 text-[13px] leading-[1.7] text-[#5b5276]">
        {title ? `Kết quả ${title} chỉ là điểm bắt đầu. ` : ""}
        Để lại thông tin, một reader của Lunara sẽ liên hệ để hẹn buổi trò chuyện riêng, cùng bạn nhìn kỹ hơn điều đang bận lòng.
      </p>

      {sent ? (
        <div role="status" className="mt-4 flex items-center gap-3 rounded-2xl border border-[#d9ccea] bg-[#faf7ff] p-4">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#6e4a92] text-white">
            <Check size={16} aria-hidden="true" />
          </span>
          <p className="m-0 text-[14px] leading-[1.7] text-[#4a4068]">
            Đã nhận yêu cầu của bạn. Reader sẽ liên hệ trong vòng 24 giờ, đúng khung giờ bạn chọn.
          </p>
        </div>
      ) : (
        <ValidatedForm
          className="tuvi-form mt-4"
          onValidSubmit={(form) => void submit(form)}
          check={(form): Record<string, string> => {
            const data = new FormData(form);
            const errors: Record<string, string> = {};
            const contact = String(data.get("contact") ?? "");
            const problem = contact.trim() ? contactError(contact, contactValue ?? "") : null;
            if (problem) errors.contact = problem;
            if (!data.get("consent")) errors.consent = "Hãy đồng ý để reader có thể liên hệ lại với bạn.";
            return errors;
          }}
        >
          <div className="tuvi-grid">
            <label>
              Tên gọi
              <IconField icon={UserRound} name="name" required maxLength={CONSULT_NAME_MAX} placeholder="Reader nên gọi bạn là gì?" autoComplete="name" />
            </label>
            <label>
              Bạn muốn được liên hệ qua
              <IconSelect icon={ChannelIcon} name="channel" required placeholder="Chọn kênh" options={CHANNEL_LABELS} optionIcons={CHANNEL_OPTION_ICONS} onValueChange={setChannel} />
            </label>
            <label>
              {contactLabel}
              <IconField
                icon={isFacebook ? FacebookIcon : Phone}
                name="contact"
                required
                maxLength={120}
                inputMode={isFacebook ? "url" : "tel"}
                autoComplete={isFacebook ? "url" : "tel"}
                placeholder={isFacebook ? "facebook.com/ten.cua.ban" : "Ví dụ 0901234567"}
              />
            </label>
            <label>
              Khung giờ tiện cho bạn
              <IconSelect icon={CalendarClock} name="time" required placeholder="Chọn khung giờ" options={TIME_LABELS} />
            </label>
          </div>

          <label className="mt-4 block">
            Điều bạn muốn hỏi thêm (không bắt buộc)
            <FieldTextarea name="note" maxLength={CONSULT_NOTE_MAX} placeholder="Ví dụ: mình muốn hiểu rõ hơn về chuyện công việc trong nửa năm tới…" />
          </label>

          <div className="mt-4">
            <FieldCheckbox name="consent">
              Mình đồng ý để Lunara lưu thông tin này và liên hệ lại để hẹn buổi tư vấn.
            </FieldCheckbox>
          </div>

          {error ? <p className="tuvi-form-error" role="alert">{error}</p> : null}

          <Button className="tuvi-submit" type="submit" disabled={loading}>
            {loading ? <LoaderCircle className="spin" size={18} /> : null}
            {loading ? "Đang gửi…" : "Đặt lịch tư vấn 1-1"}
            {loading ? null : <ArrowRight size={18} />}
          </Button>
          <p className="tuvi-provider-note">
            <LockKeyhole size={13} strokeWidth={1.4} className="mr-1 inline align-[-2px]" />
            Thông tin liên hệ chỉ reader của Lunara xem được, không hiện công khai và không dùng để quảng cáo.
          </p>
        </ValidatedForm>
      )}
    </section>
  );
}
