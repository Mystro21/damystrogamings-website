# Da Mystro Gamings Website

Static website for Da Mystro Gamings LLC.

## Local preview

```powershell
node server.mjs
```

Open:

```text
http://127.0.0.1:4173/
```

## Current pages

- `/`
- `/games/`
- `/about/`
- `/education/`
- `/updates/`
- `/support/`
- `/privacy/`

## Launch notes

- Use `damystrogamings.com` as the public domain.
- Enable HTTPS through the hosting provider.
- Point both `damystrogamings.com` and `www.damystrogamings.com` to the site, with one redirecting to the other.
- Review `/privacy/` before public launch and before each App Store submission.
- Do not add analytics, tracking, player accounts, Firebase, forms, or mailing lists without updating the privacy page.

## App Store Connect URLs

Use these once `damystrogamings.com` is connected and HTTPS is active:

```text
Company Support URL:
https://damystrogamings.com/support/

Company Privacy Policy URL:
https://damystrogamings.com/privacy/

Bank Co Support URL:
https://damystrogamings.com/support/bank-co/

Bank Co Privacy Policy URL:
https://damystrogamings.com/privacy/bank-co/

Da Conquer Support URL:
https://damystrogamings.com/support/da-conquer/

Da Conquer Privacy Policy URL:
https://damystrogamings.com/privacy/da-conquer/

Injera Be Wote Support URL:
https://damystrogamings.com/support/injera-be-wote/

Injera Be Wote Privacy Policy URL:
https://damystrogamings.com/privacy/injera-be-wote/
```

Before submitting an app to Apple, make sure the privacy page for that app
matches the exact app build, including any analytics, crash reporting, accounts,
cloud saves, ads, Firebase services, or third-party SDKs.

## Good hosting choices

- Cloudflare Pages
- Netlify
- Vercel static deployment
- GitHub Pages

## GitHub Pages deployment

This repository includes a GitHub Pages workflow at:

```text
.github/workflows/pages.yml
```

If GitHub Pages is enabled for this repository, pushes to `main` will deploy the
static website automatically.

In GitHub:

1. Open the repository settings.
2. Go to **Pages**.
3. Set **Source** to **GitHub Actions**.
4. Save, then run the Pages workflow or push a new commit.

## Fastest launch path

1. Create a free Netlify account.
2. Drag the generated deployment package into Netlify's manual deploy area.
3. Add `damystrogamings.com` as the custom domain.
4. Follow Netlify's DNS instructions from the domain registrar.
5. Confirm HTTPS is active.

## Consent-aware marketing analytics (review branch; not deployed)

The homepage and games page load `assets/dmg-analytics.v1.js`. The privacy page
loads the same module only to manage consent; it does not start Google Analytics.
No game builds or other game buttons have been instrumented.

- Consent is opt-in. Before acceptance, no Google tag loads and no events queue.
- Consent preference is stored locally for 180 days. Withdrawal disables collection,
  removes this site's GA cookies, and propagates to other open tabs.
- Google Signals, ad personalization, ad storage, and ad user data are disabled.
- Disable enhanced measurement in the stream; page views are sent explicitly once.
- Never add another gtag/GTM loader without reviewing duplicate measurement.
- Localhost/127.0.0.1 automatically use debug_mode. Production does not.
- No user IDs, email addresses, free text, or arbitrary query strings are collected.
- Only approved Meta source values and cdk_launch/lion_30s UTMs enter page_location.
  Unknown campaign values are omitted; register future campaign vocabulary in code.
- Referrer is reduced to origin. Store URLs remain unchanged, including Google
  Play's required package query. No campaign UTMs are added to destination links.

### Event contract

| Event | Meaning | Parameters |
| --- | --- | --- |
| page_view | Consented homepage/games page load | sanitized page_location/page_referrer |
| game_landing | /games/ loaded with #capture-the-king | game, placement |
| store_click | Approved store link activated | game, store, placement, link_url |
| web_play | Approved browser-game link activated, NOT confirmed launch | game, placement, link_url |

`game`: capture_da_king. Reserved (not instrumented): da_conquer, injera_be_wote,
da_boxem_up. `store`: google_play or apple_app_store.
`placement`: home_feature or games_detail. Register game, store, and placement
as event-scoped custom dimensions in GA4. Use built-in link URL and acquisition
source/medium/campaign/manual-ad-content, device category, and operating system.
Native GA session attribution persists through consented marketing-page events;
there is no cross-domain launch or app-install measurement in this change.
No pre-consent history is reconstructed.

### Validation and release gate

Run `node --test tests/analytics.test.cjs` and `node server.mjs`.
Use the real property DebugView from the local preview, with the existing campaign
parameters before the fragment. Local debug traffic must not be treated as
production results. Verify actual mobile devices separately from viewport tests.
Do not infer iOS/Android OS detection from desktop viewport resizing.

Before deployment: review privacy text, verify stream settings/custom dimensions,
verify DebugView delivery and duplicate prevention, approve the final diff, and
record the actual deployment UTC timestamp. Reporting before that timestamp is
setup/test activity. No go-live timestamp exists until deployment is authorized.
Pushes to main deploy automatically; do not merge or push main during review.

### Prepared GA4 configuration

Account: Da Mystro Gamings (409493891), owner damystrogamings21@gmail.com.
Property: Da Mystro Gamings Website (556020678), New York timezone, USD.
Web stream: DMG Marketing Website (15846472672), G-83DQZCLF27.
Optional account sharing and email communications: all off.
Google Signals and user-provided data: off. Ads personalization: 0/307 regions.
Enhanced measurement: off; verify after initial setup because creation did not
persist the initial selection. Custom dimensions: Game/game, Store/store,
Placement/placement, all event-scoped.
Retention defaults: event data 2 months; user data 14 months, reset on activity.
