# Moi Madi's Thrift

Online store for Moi Madi's Thrift in Gumani, Tamale. Customers browse the collection, build an order, and send it to the shop on WhatsApp.

Built by **Bright Vission Digital Design** · 0599 035 746

## Files

| Path | What it is |
| --- | --- |
| `index.html` | The store page |
| `products.js` | Shop details and product list (edit this to change items) |
| `app.js` | Shop grid, search, order drawer, WhatsApp checkout |
| `p01.jpg` to `p18.jpg` | Product photos |
| `.nojekyll` | Tells GitHub Pages to serve the files as they are |

## Edit the products

Open `products.js`:

- To set a price, change `price: null` to a number, for example `price: 45`.
- To add an item, copy one block, give it a new `id`, and add its photo to this folder.
- To remove an item, delete its block.
- Shop details (name, WhatsApp number, location, hours) are at the top of the same file.

Photos work best at about 800 × 1000 px, portrait.

## Run it locally

Open `index.html` in a browser. No install needed.

## Deploy on GitHub Pages

1. Create a new repository on GitHub (for example `moi-madis-thrift`).
2. Upload everything in this folder, or push it with git:

   ```bash
   git init
   git add .
   git commit -m "Initial store"
   git branch -M main
   git remote add origin https://github.com/YOUR-USERNAME/moi-madis-thrift.git
   git push -u origin main
   ```

3. On GitHub, go to **Settings → Pages**.
4. Under **Build and deployment**, set **Source** to *Deploy from a branch*, choose `main` and `/ (root)`, then save.
5. After about a minute the store is live at `https://YOUR-USERNAME.github.io/moi-madis-thrift/`.

## Custom domain (optional)

Buy a domain (for example `moimadisthrift.com`), add it under **Settings → Pages → Custom domain**, and point the DNS records as GitHub shows.

---

Website designed and built by **Bright Vission Digital Design**. Phone: 0599 035 746.
