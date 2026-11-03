# Aneeq — Style Guide

Personal portfolio for Aneeq and anyone visiting, human or agent.

## Direction

Simple, elegant, peaceful. Minimal cognitive load. Original and iterative; no reference sites. The homepage is a single screen at ordinary viewport sizes, with a centered, left-aligned content block. Preserve access to content at large text sizes and short viewports by allowing natural overflow.

## Typography

Manrope, self-hosted by Next.js. Heading: 40–48px, medium weight, tight tracking. Body: 16–18px, relaxed 1.8 line height. Navigation: 12px.

## Colors

Light: warm ivory-grey #f4f1e9, charcoal #262623, muted #62625c. A restrained yellow undertone softens the bright page surface; maintain readable text contrast. Hover #eae6dc, borders #dcd7cb.
Dark: near-black #191a18, off-white #eeeee8, muted #aaa9a1.
Borders and hover surfaces are subtle neutral tones. No decorative imagery. The input alone uses a subtle neutral gradient, translucent surface, and inset highlights for an Apple-inspired glass finish.

## Structure and interaction

Home, Blog, Gallery navigation and its theme toggle form a centered group above the content, with the toggle on the right. Homepage heading is “Hello 👋”. Introductory copy is exactly what Aneeq supplied. Agent mention remains plain text. Blog and Gallery have simple empty states until content is supplied.

Use device theme initially; persist manual theme selection. Provide visible keyboard focus, 44px touch targets, active page indication, and a 220ms theme transition. Entrance motion is subtle and disabled for reduced motion. No scrolling effects or continuous animation.

LinkedIn and GitHub brand icons sit below the introduction. Use 20px monochrome icons inside links 32px wide and 44px tall, with no added gap; transition from muted to foreground on hover and keyboard focus.

The homepage has a bottom-centered rounded agent input with two compact suggestion buttons above it. Keep it in document flow so small screens and the mobile keyboard cannot obscure content. Until an agent is connected, submissions show an honest availability notice; the résumé shortcut also offers the existing PDF.

Input: 44px tall, composer max-width 520px, centered. Keep glass highlights restrained in both themes.

Suggestions use flatter surfaces and 12px corners to distinguish them from the glass input. A clipped, cursor-positioned highlight responds within each surface, without backdrop blur or React state updates. Disable reactive gloss for touch and reduced motion.

Desktop homepage: shared 640px content width for introduction, current role, and composer; keep mobile fluid with existing gutters. About uses its independent reading column.

## Résumé checkout modal

The résumé icon opens a custom checkout dialog rather than Stripe’s embedded UI. 420px wide, 20px corners, same ivory surface and hairline borders as the homepage; no order summary, just the “My résumé” heading and Aneeq’s own one-liner (“Ain’t nun free in this world.”). Our own email field sits above Stripe’s card fields, which are styled through Stripe’s Appearance API to match the site inputs (Manrope, 14px radius, 1px `--line` borders, muted focus border). The Payment Element uses the tabs layout, which hides the method picker when only card is enabled, so the card fields start straight at “Card number”. The pay button is 44px, ringed by a 1px border of the same signature gradient as its fill (masked, so corners stay round), 14px radius, filled with a soft four-stop signature gradient that drifts slowly (6s loop, paused when disabled, off under reduced motion). Hover eases it up to 1.03 (180ms, no bounce) and holds; pressing compresses it to 0.95 with `disclosureSpring`, held for as long as the press lasts. Close button is a 34px bordered square (10px radius) that springs on hover and tap with `disclosureSpring`; on hover the background fills with the résumé red and the X goes white. Success stays in the modal: a signature-ringed check mark, receipt copy, and the download button once the webhook confirms. Footer is just “Powered by Stripe”, 11px muted, with “Stripe” clipped in the same purple-to-orange gradient as the “Currently @” card. Entrance is a 220ms fade and lift, disabled for reduced motion.

Checkout loading reserves a stable payment-field region through session creation and Stripe iframe mounting. A subtle neutral skeleton stays visible until PaymentElement onReady, then the fields fade in over 240ms. Short screens scroll within the dialog; reduced motion disables pulsing and fading.

Homepage portrait: clicking flips the existing square through 180° over 650ms, plays the local inline video with audio from the tap gesture. A small top-right sound button allows muting and unmuting during playback. Playback end or a second click flips back. Keep the existing responsive portrait sizes and square cover crop; reduced motion swaps faces immediately.

Projects: MailflowAI is the featured entry, with a fine signature-gradient outline curved into four subtle points. More projects sit in a native swipe-and-snap carousel with arrows and quiet pagination. Existing Manrope typography, real local project images, translucent theme-aware surfaces, and concise copy; no autoplay. Mobile shows one card plus a preview of the next.

Featured projects now rotate manually among MailflowAI, Myriad CRO and B2W. Desktop uses wide previews with Cormorant Garamond titles, signature-lit pointed glass frames, arrows and pagination. Other projects become compact thumbnail rows on desktop; mobile retains stacked feature cards and a swipeable shelf. A slow border glow respects reduced motion.

Projects discovery: About shows only the three featured projects, followed by a compact signature-tinted “Want to see more of my projects?” banner. “Explore with Anike” opens the existing ChatUI with a reusable ProjectExplorer already rendered. The browser uses the same FilterPill component as career filters (All, Web, AI/ML, Systems), compact project rows, and the existing detail dialog. The initial project entry is server-selected with `?explore=projects`; project questions in the simulated chat render the same component. Future agent tool outputs should pass a typed category into this component rather than generate markup. Filtering animates briefly and respects reduced motion; mobile rows fit without horizontal scrolling.

Anike now streams real replies using Vercel AI Gateway. Prose is informal, all lowercase, with no em dashes. Typed server tools render the project browser, compact profile/career cards, and the existing résumé checkout modal. Project searches combine category, keyword/technology, year, and active/completed status. Missing metadata is explained rather than guessed. Project filters operate within the returned search results. Tool-loading states, honest empty states, retry, and stop controls use the existing muted palette and focus styles. Résumé tool completion opens checkout once per call; visitors can reopen it from the message.
