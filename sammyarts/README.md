# SammyArts

SammyArts is a React and Vite portfolio site for an artist. The public-facing
site includes a home-page featured-work carousel and a gallery with a
full-screen image viewer.

## Backend handoff: owner-managed gallery

Build backend functionality that lets the site owner (the client/admin) manage
the portfolio works shown in the gallery. This is an owner-only content
management feature: regular visitors must not be able to create, edit, or
delete works. Visitors can view the published gallery and open its images, but
they do not manage portfolio content.

### Required behavior

- Provide secure admin authentication for the site owner.
- Restrict all create, update, delete, and upload operations to the
  authenticated, authorized owner/admin. Enforce authorization on the server,
  not only by hiding controls in the frontend.
- Let the owner add, edit, reorder, publish/unpublish, and delete works.
- Support uploading an image and storing its URL or storage key with the work.
- Store the work's title, medium, year, image, and a stable unique ID. Validate
  inputs and reject invalid image uploads.
- Provide a public read-only endpoint that returns published works in the
  owner's chosen order. Do not expose draft works through public endpoints.
- Keep the home-page carousel and gallery page backed by the same work records:
  the carousel should feature works from this shared collection, not a
  separately maintained portfolio dataset.

### Suggested API

Adapt route names and response formats to the backend stack, but preserve the
public-read/admin-write boundary:

- `GET /api/works` — list published works in display order.
- `POST /api/admin/works` — create a work (admin only).
- `PATCH /api/admin/works/:id` — update work details, image, order, or
  publication status (admin only).
- `DELETE /api/admin/works/:id` — delete a work (admin only).
- `POST /api/admin/uploads` — upload an image and return its persisted URL or
  storage key (admin only).

The frontend currently uses `src/data/galleryData.js` as its shared gallery
dataset. Replace that static source with the public works API when backend
integration is ready, and connect owner-only management UI to the admin routes.
Do not make a frontend-only data edit the production content-management
solution.

## Frontend development

Requirements: Node.js and npm.

```sh
npm install
npm run dev
```

Available scripts:

- `npm run dev` — start the Vite development server.
- `npm run build` — create a production build in `dist`.
- `npm run preview` — preview the production build.
- `npm run lint` — run ESLint.
