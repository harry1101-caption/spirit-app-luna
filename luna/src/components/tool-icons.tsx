// Icon công cụ ở section "20 công cụ".
// tarot-ai / lenormand / bat-tu sinh bằng Diffui text-to-SVG; daily-card tự dựng
// theo đúng khung và tỉ lệ của tarot-ai để hai lá bài thành một bộ.
// Giữ màu mực gốc (không currentColor). id gradient thêm tiền tố để không đụng nhau.
import Image from "next/image";
import type { SVGProps } from "react";
type IconProps = SVGProps<SVGSVGElement> & { size?: number; strokeWidth?: number };

export function TarotAiIcon({ size = 24, strokeWidth, ...props }: IconProps) {
  void strokeWidth;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width={size} height={size} fill="none" {...props}>
      <defs>
    <linearGradient id="tarot-ai-indigo-ink" x1="210" y1="160" x2="815" y2="890" gradientUnits="userSpaceOnUse">
      <stop offset="0" stopColor="#393277"/>
      <stop offset="0.5" stopColor="#3e357e"/>
      <stop offset="1" stopColor="#3b337c"/>
    </linearGradient>
  </defs>
  <g transform="translate(4.4375 0) scale(.0625)" fill="url(#tarot-ai-indigo-ink)">
    <path fillRule="evenodd" d="M286 56H731C776 56 813 93 813 138V884C813 929 780 967 735 967H285C240 967 206 932 206 886V138C206 93 241 56 286 56ZM286 93C261 93 242 112 242 138V884C242 911 260 931 286 931H733C759 931 776 911 776 885V138C776 112 757 93 731 93Z"/>
    <path fillRule="evenodd" d="M309 115H709C735 115 754 134 754 160V866C754 891 736 909 711 909H309C283 909 264 891 264 865V160C264 134 283 115 309 115ZM309 135C295 135 284 145 284 160V864C284 880 293 889 309 889H709C724 889 734 880 734 865V160C734 145 724 135 709 135Z"/>
    <path d="M539 342C544 343 546 347 540 350C478 376 440 438 440 499C440 561 477 607 533 622C565 630 602 625 632 608C638 604 641 607 636 614C605 657 556 682 504 682C412 684 342 617 338 528C332 442 389 367 466 346C489 340 516 339 539 342Z"/>
    <path d="M373 220C378 220 381 235 386 241C392 248 410 251 410 257C410 263 392 266 386 272C380 278 378 294 373 294C368 294 365 278 359 272C353 266 336 263 336 257C336 252 353 248 359 242C365 235 368 220 373 220Z"/>
    <path d="M606 205C613 205 620 230 628 239C637 248 663 254 663 262C663 270 638 276 629 284C620 293 613 319 606 319C598 319 592 294 583 285C574 276 549 271 549 263C549 255 574 249 583 240C592 231 598 205 606 205Z"/>
    <path d="M671 641C676 641 680 656 685 662C690 668 705 671 705 676C705 681 690 685 685 690C679 696 676 710 671 710C666 710 663 696 657 690C651 684 637 681 637 676C637 671 651 667 657 662C663 656 666 641 671 641Z"/>
    <path d="M483 737C490 737 496 761 504 769C512 777 535 783 535 789C535 797 512 802 504 810C496 819 490 841 483 841C476 841 470 819 462 811C454 802 431 797 431 789C431 782 454 777 462 768C470 760 476 737 483 737Z"/>
  </g>
    </svg>
  );
}

export function LenormandIcon({ size = 24, strokeWidth, ...props }: IconProps) {
  void strokeWidth;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width={size} height={size} fill="none" {...props}>
      <defs>
    <linearGradient id="lenormand-purple-ink" x1="80" y1="95" x2="929" y2="614" gradientUnits="userSpaceOnUse">
      <stop stopColor="#482052"/>
      <stop offset=".5" stopColor="#4C2356"/>
      <stop offset="1" stopColor="#482050"/>
    </linearGradient>
  </defs>
  <g transform="translate(0 10.84375) scale(.0625)" fill="url(#lenormand-purple-ink)">
    <g>
      <path d="M317 93C307 88 294 92 282 95L98 153C76 160 62 171 53 189C46 203 45 216 50 233L160 587C166 608 178 621 196 627C207 631 219 630 231 626L370 582C354 578 343 570 334 561L223 595C207 600 197 591 192 576L82 221C77 205 83 194 98 188L303 124C308 122 315 125 316 120Z"/>
      <path d="M225 335C209 322 192 315 182 302C171 288 171 273 178 261C187 247 206 243 222 255C227 241 241 235 253 237C271 238 280 251 278 273C277 289 265 311 258 325C255 331 259 330 263 326C281 307 296 294 311 295C315 295 316 297 316 302L316 389C316 394 313 396 307 395C292 393 279 383 264 368C260 364 258 366 260 371C270 396 275 421 266 445C262 458 256 464 248 460C240 457 246 445 249 435C256 416 253 395 247 374C246 369 244 370 242 376C236 397 230 423 214 430C199 438 181 431 176 418C173 410 173 403 175 394C159 391 151 383 149 372C145 356 154 342 169 337C182 331 202 335 220 339C225 340 228 338 225 335Z"/>
    </g>
    <g>
      <path d="M707 96C712 89 722 90 734 94L927 154C950 161 964 173 972 191C978 204 978 217 973 233L864 587C859 604 848 620 832 626C820 631 805 631 792 627L639 582C658 582 676 571 689 561L799 595C814 600 826 592 831 577L941 222C946 205 941 194 927 188L722 124C716 123 709 125 708 121Z"/>
      <path d="M708 284C708 280 710 279 715 280L768 291L801 241C806 233 817 234 818 244L823 307L878 324C886 327 886 337 879 341L825 366L826 428C827 439 816 442 810 434L771 389L716 409C712 410 708 410 708 407L708 390L736 343L709 305C707 302 708 298 708 295Z"/>
    </g>
    <g>
      <path fillRule="evenodd" d="M387 48L636 48C670 48 696 72 696 107L696 511C696 546 671 571 636 571L387 571C352 571 328 548 328 513L328 108C328 73 352 48 387 48ZM387 82C372 82 363 93 363 108L363 511C363 527 373 536 388 536L635 536C651 536 661 527 661 511L661 108C661 92 652 82 637 82Z"/>
      <path fillRule="evenodd" d="M460 175C469 152 488 138 511 138C534 138 554 152 563 175C587 185 604 206 604 232C604 259 587 281 559 290C553 306 542 316 528 321L528 373L568 373C574 373 576 375 576 381L576 396C576 402 574 404 568 404L550 404L550 421L568 421C574 421 576 423 576 429L576 444C576 450 574 452 568 452L528 452L528 460C528 473 522 480 510 480C497 480 490 473 490 460L490 321C475 315 465 305 460 290C435 282 419 260 419 234C418 207 435 185 460 175ZM486 205C466 201 451 214 450 231C449 248 464 263 486 259C483 279 495 294 511 294C528 294 539 280 536 259C557 263 572 250 572 232C572 214 558 201 536 205C540 184 527 170 512 170C496 169 482 184 486 205Z"/>
    </g>
  </g>
    </svg>
  );
}

export function BatTuIcon({ size = 24, strokeWidth, ...props }: IconProps) {
  void strokeWidth;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width={size} height={size} fill="none" {...props}>
      <g fill="#3e357e" transform="scale(0.0651068159 0.0625)">
    <path fillRule="evenodd" d="M492 53C733 53 929 255 929 505C929 755 733 957 492 957C251 957 55 755 55 505C55 255 251 53 492 53ZM492 86C270 86 90 274 90 505C90 706 227 873 409 912C336 873 287 808 287 731C287 612 380 515 492 515C612 515 710 419 710 302C710 183 612 86 492 86ZM492 659C454 659 423 690 423 728C423 767 454 798 492 798C530 798 561 767 561 728C561 690 530 659 492 659Z"/>
    <path d="M573 306C573 350 538 386 494 386C450 386 414 350 414 306C414 262 450 226 494 226C538 226 573 262 573 306Z"/>
  </g>
    </svg>
  );
}

export function DailyCardIcon({ size = 24, strokeWidth, ...props }: IconProps) {
  void strokeWidth;
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width={size} height={size} fill="none" {...props}>
      <defs>
    <linearGradient id="daily-card-indigo-ink" x1="210" y1="160" x2="815" y2="890" gradientUnits="userSpaceOnUse">
      <stop offset="0" stopColor="#393277"/>
      <stop offset="0.5" stopColor="#3e357e"/>
      <stop offset="1" stopColor="#3b337c"/>
    </linearGradient>
  </defs>
  <g transform="translate(4.4375 0) scale(.0625)" fill="url(#daily-card-indigo-ink)">
    <path fillRule="evenodd" d="M286 56H731C776 56 813 93 813 138V884C813 929 780 967 735 967H285C240 967 206 932 206 886V138C206 93 241 56 286 56ZM286 93C261 93 242 112 242 138V884C242 911 260 931 286 931H733C759 931 776 911 776 885V138C776 112 757 93 731 93Z"/>
    <path fillRule="evenodd" d="M309 115H709C735 115 754 134 754 160V866C754 891 736 909 711 909H309C283 909 264 891 264 865V160C264 134 283 115 309 115ZM309 135C295 135 284 145 284 160V864C284 880 293 889 309 889H709C724 889 734 880 734 865V160C734 145 724 135 709 135Z"/>
    <path d="M509 352A100 100 0 1 1 508 352Z"/>
    <path d="M491 325L509 247L527 325ZM557 333L593 307L588 351ZM610 373L687 350L628 404ZM636 434L677 452L636 470ZM628 500L687 554L610 531ZM588 553L593 597L557 571ZM527 579L509 657L491 579ZM461 571L425 597L430 553ZM408 531L331 555L390 500ZM382 470L341 452L382 434ZM390 404L331 350L408 373ZM430 351L425 307L461 333Z"/>
    <path d="M350 196C354.68 214.2 357.8 217.32 376 222C357.8 226.68 354.68 229.8 350 248C345.32 229.8 342.2 226.68 324 222C342.2 217.32 345.32 214.2 350 196ZM372 754C378.48 779.2 382.8 783.52 408 790C382.8 796.48 378.48 800.8 372 826C365.52 800.8 361.2 796.48 336 790C361.2 783.52 365.52 779.2 372 754ZM655 736C659.68 754.2 662.8 757.32 681 762C662.8 766.68 659.68 769.8 655 788C650.32 769.8 647.2 766.68 629 762C647.2 757.32 650.32 754.2 655 736Z"/>
  </g>
    </svg>
  );
}


/**
 * Icon dạng ảnh PNG nền trong suốt. Dùng kèm cờ `bare` trong toolGroups để bỏ
 * vòng tròn nền — các ảnh này đã có bố cục riêng, đặt trong vòng tròn sẽ chật.
 * Chữ ký props khớp lucide nên thay trực tiếp được.
 */
function imageIcon(src: string, name: string, cover = false) {
  function ToolImageIcon({ size = 24 }: { size?: number; strokeWidth?: number }) {
    return (
      <Image
        src={src}
        alt=""
        width={size}
        height={size}
        className={cover ? "h-full w-full object-cover" : "object-contain"}
      />
    );
  }
  ToolImageIcon.displayName = name;
  return ToolImageIcon;
}

export const TarotCardsIcon = imageIcon("/icons/tools/tarot-cards.png", "TarotCardsIcon");
export const LenormandCardsIcon = imageIcon("/icons/tools/lenormand-cards.png", "LenormandCardsIcon");
export const NumerologyIcon = imageIcon("/icons/tools/numerology.png", "NumerologyIcon");
export const ZodiacWheelIcon = imageIcon("/icons/tools/zodiac-wheel.png", "ZodiacWheelIcon");
export const AstrologyIcon = imageIcon("/icons/tools/astrology.png", "AstrologyIcon");
export const PalmistryIcon = imageIcon("/icons/tools/palmistry.png", "PalmistryIcon");
export const FaceReadingIcon = imageIcon("/icons/tools/face-reading.png", "FaceReadingIcon");
export const HumanDesignIcon = imageIcon("/icons/tools/human-design.png", "HumanDesignIcon");
export const PlayingCardsIcon = imageIcon("/icons/tools/playing-cards.png", "PlayingCardsIcon");
/** Ảnh phủ kín khung, không có rìa trong suốt → cắt tròn thay vì thả nổi. */
export const PastLifeIcon = imageIcon("/icons/tools/past-life.png", "PastLifeIcon", true);
export const PhacHoaIcon = imageIcon("/icons/tools/phac-hoa-nguoi-ay.png", "PhacHoaIcon");
export const XinXamIcon = imageIcon("/icons/tools/xin-xam.png", "XinXamIcon");
export const IChingIcon = imageIcon("/icons/tools/i-ching.png", "IChingIcon");
export const MoonSignIcon = imageIcon("/icons/tools/moon-sign.png", "MoonSignIcon");
export const DreamIcon = imageIcon("/icons/tools/dream.png", "DreamIcon");
export const BatTuEmblemIcon = imageIcon("/icons/tools/bat-tu.png", "BatTuEmblemIcon");
export const DailyCardImgIcon = imageIcon("/icons/tools/daily-card-img.png", "DailyCardImgIcon");
