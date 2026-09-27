# YAME.STORE Agent Instructions

## Purpose

This repository is the source for YAME.STORE served from https://yame.store/.

- Repository: lee1431/nr
- Default branch: main
- Production domain: https://yame.store/
- Deployment: GitHub Pages via .github/workflows/static.yml on pushes to main
- Functional app repository: lee1431/stance
- Functional app domain: https://llsshh.com/

## Repository boundary

Keep these roles distinct:

- lee1431/stance = functional apps and AdSense-oriented pages hosted on llsshh.com
- lee1431/nr = YAME.STORE catalog/front-end hosted on yame.store

Do not copy an app into nr merely to register it. The app should normally remain hosted on llsshh.com and YAME.STORE should reference its final URL and thumbnail.

## Working rules

1. Inspect existing files and data structures before editing.
2. Preserve existing UI behavior unless the request explicitly changes it.
3. Make the smallest coherent change needed.
4. Do not invent project schema, API endpoints, backend behavior, tokens, or file paths.
5. When modifying project/catalog data, inspect current examples first.
6. Keep URLs consistent with production domains.
7. Never commit passwords, API keys, tokens, SSH private keys, or other secrets.
8. Avoid unrelated cleanup or formatting changes.

## STANCE integration

When a task involves a new or modified app from lee1431/stance:

1. inspect the stance app first;
2. use the final https://llsshh.com/... URL;
3. use the confirmed thumbnail URL;
4. inspect YAME.STORE's current project/catalog mechanism;
5. update only the required YAME.STORE data or UI;
6. do not create duplicate entries.

Note: lee1431/stance also has a yame-register workflow that can register apps from apps/**/yame.json. Verify the current mechanism before manually duplicating registration work here.

## Git and deployment

The default production flow is:

1. inspect;
2. edit;
3. review changed content;
4. commit to main when deployment is requested;
5. verify the GitHub Actions Pages run;
6. verify https://yame.store/ when possible.

A push to main triggers .github/workflows/static.yml.

Do not claim deployment succeeded solely from a successful commit. Verify the workflow or live site when available.
