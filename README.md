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
- Review `/privacy/` before public launch.
- Do not add analytics, tracking, player accounts, Firebase, forms, or mailing lists without updating the privacy page.

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
