# Artwork

`moon-landscape.png` is an original asset generated with the built-in ImageGen tool for this project on 2026-10-24. It is not an image from Cece or a reproduction of a Rider–Waite–Smith card.

Prompt: “Wide landscape fine art illustration, dreamy antique lithograph with fine paper grain. A huge pale cream moon above layers of mauve and dusky purple mountains, tiny stars, winding golden river, delicate lavender wildflowers. Muted plum, lavender, warm cream, antique gold; luminous twilight, calm sophisticated literary atmosphere, no lettering or watermark.”

Shared crops serve the home banner, discovery cards, and explicitly labelled symbolic Tarot artwork. UI symbols are Lucide icons from shadcn defaults and text zodiac glyphs.

## Diffui redesign assets — 2026-10-24

Generated via Diffui's build image API from the user's supplied style instructions. Images downloaded locally; auth tokens and remote asset URLs are not used at runtime.

- `celestial-hero.webp`: high-quality 2048×1152 standalone celestial scene based on the supplied design: luminous gold crescent, gold constellation orbits, floating plum cards, lavender/cream clouds and a distant palace. Light negative space reserved for headline.
- `zodiac-bust.png`: high-quality native-alpha sculptural lavender-haired profile, gold halo and cloud base, 816×1024.
- `experience-tarot.webp`: 1024×768 floating celestial Tarot cards among cream clouds.
- `experience-daily.webp`: 1024×768 gold armillary/zodiac ring with moon and lavender clouds.
- `experience-personality.webp`: 1024×768 lavender glass butterfly, gold mirror and clouds.
- `tarot-back.webp`: high-quality 816×1232 front-facing plum card back, fine gold celestial border and crescent moon, without lettering.

No final assets were cropped from the design screenshot. The original `moon-landscape.png` is retained as an unused earlier asset.

## Discovery card refinement

`discovery-tarot.webp`, `discovery-daily.webp`, and `discovery-personality.webp` are standalone 1536×1024 illustrations generated through Diffui using the user's supplied Tarot Reading Experience reference. Each reserves quiet space at left for real UI text and groups its celestial subject at right. Tarot: ornate violet cards and crystals. Daily: zodiac wheel, golden sun and clouds. Personality: gold mirror, celestial journal, lavender and amethyst. No screenshot crops or text baked into card backgrounds. The supplied reference is stored only in `refs/` for design context.

## Full Rider–Waite–Smith card faces

78 local JPEGs now live in `tarot/`. Original artwork by Pamela Colman Smith. Actual downloads are Pam-A historical scans cleaned by Steve P., retrieved from mixvlad/TarotCards with public-domain metadata after direct Wikimedia requests were rate-limited. See `tarot/CREDITS.md` and `tarot/sources.json` for precise original-artwork references, scan origin, mirror URLs and attribution. Existing generated backgrounds remain illustrative discovery-card assets; they are not used as Tarot card faces.

## Intention sanctuary section — 2026-10-25

`intention-sanctuary.webp`: original standalone 1536×1024 background generated through Diffui from the user's Section Khám Phá reference. A lavender-haired woman in an ivory star-patterned gown sits on palace stairs amid clouds, with a gold crescent portal. Quiet areas are reserved for real HTML heading and choice controls. No text, UI or screenshot crops are baked into the background. The source design is retained separately at `refs/intention-reference.png` for design context only. Standard Lucide icons are used for interactive intent options.

## Tarot page sanctuary — 2026-10-25

`tarot-sanctuary.webp`: standalone 2048×1024 high-quality artwork generated through Diffui using the user's Trang Thiết Kế Lại reference. Outer left: pale gold crescent and delicate celestial orbit above lavender clouds. Outer right: plum/gold Tarot card backs, amethyst crystals, dried flowers and lavender velvet. Center reserved for actual accessible HTML form. No text, controls, screenshot crops or reference-page UI included. The design specification is stored separately at `refs/tarot-page-reference.png`.
