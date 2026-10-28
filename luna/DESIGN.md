# Luna — Hành Trình Nội Tâm

Reference: user-supplied Diffui Trang_Ch design image, saved in ../refs/diffui-trang-chu.png. Source snapshot is a specification only and never shipped as an asset.

Desktop website, responsive at tablet and mobile browser widths. Full-width celestial cloud landscape, luminous gold crescent, floating violet cards and distant palace; left editorial heading and two primary actions. Floating translucent rounded sticky header. Lavender/cream/gold colors; Cormorant Garamond for Vietnamese editorial headings and Be Vietnam Pro for controls and body copy.

Hero followed by a horizontal daily guidance feature, three illustrated experience cards, intention routing, personal collection, and reflective closing. Existing Tarot, horoscope, personality engines, local history and privacy controls preserved. Experiences use page layouts and two-column reports, instead of small app dialogs. Onboarding retains accessible shadcn Dialog; mobile navigation is a compact menu.

Motion: lazy-loaded GSAP/ScrollTrigger entrance and section reveals. Lenis selected as the only smooth-scroll engine over Locomotive for its lightweight integration; CSS hover and Tarot flip; restrained pointer response on hero. Reduced motion bypasses GSAP, Lenis and pointer movement. No WebGL necessary to faithfully translate the reference's rendered artwork.

Assets: Diffui generated standalone hero, zodiac sculpture, three experience illustrations and card back, served locally. Lucide icons used for UI. Profile control uses a neutral user icon instead of inventing a signed-in person. Community card in reference is adapted to self-connection to preserve the stated MVP scope.

Final testing and further browser QA omitted at the user's explicit request. Earlier screenshot inspection occurred before that instruction; no claim of a final QA pass.

## Tarot page redesign

The user's Trang Thiết Kế Lại reference informs the focused Tarot page: centered title, broad celestial backdrop, two restrained editorial quotes, a warm translucent setup form, icon-led topic options, live question count, illustrated spread selection, reverse toggle, primary start action, and three reflective principles. The setup and drawing phases are separate; actual RWS card data, orientations, selected cards, image zoom, result rendering and explicit save behavior remain intact. No new tests run, following the user's earlier preference.
