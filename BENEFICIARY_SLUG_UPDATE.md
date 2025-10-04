# Beneficiary Slug & Way of Flowers Update

## Changes Made

### ✅ **1. Added `slug` Field to Beneficiaries**

Each beneficiary now includes a URL-friendly slug generated from the project title.

**Slug Generation:**
```typescript
// Example transformations:
"Grgich Hills Estate" → "grgich-hills-estate"
"El Globo Habitat Bank" → "el-globo-habitat-bank"
"Jaguar Stewardship in the Pantanal" → "jaguar-stewardship-in-the-pantanal"
"Buena Vista Heights Conservation Area" → "buena-vista-heights-conservation-area"
"Walkers Reserve" → "walkers-reserve"
"Pimlico Farm" → "pimlico-farm"
"Harvey Manning Park Expansion" → "harvey-manning-park-expansion"
"St. Elmo Preservation Project" → "st-elmo-preservation-project"
```

**Algorithm:**
1. Convert to lowercase
2. Replace non-alphanumeric characters with hyphens
3. Remove leading/trailing hyphens

---

### ✅ **2. Populated `wayOfFlowersData`**

Instead of empty strings, `wayOfFlowersData` now uses the first beneficiary's project data:

**`backgroundImageUrl`:**
- Uses the project's `backgroundImage` as-is
- Example: `/project_images/01__GRG.png`

**`seedEmblemUrl`:**
- Converts project background image path to seed emblem path
- Replaces directory: `/project_images/` → `/seeds/`
- Converts filename to lowercase
- Example: `/project_images/01__GRG.png` → `/seeds/01__grg.png`

---

## Updated Response Structure

### **GET `/api/seeds/1` Response:**

```json
{
  "success": true,
  "seed": {
    "id": "1",
    "label": "Seed #1",
    "name": "Digital Flower 1",
    "description": "A beautiful digital flower planted in berlin.",
    "seedImageUrl": "https://wof-flourishing-backup.s3.amazonaws.com/seed1/seed.png",
    "latestSnapshotUrl": "https://wof-flourishing-backup.s3.amazonaws.com/seed1/snap1-12-...png",
    "snapshotCount": 12,
    "owner": "0xc4b3CE8DD17F437ba4d9fc8D8e65E05e047792A8",
    "depositAmount": "1.0211",
    "snapshotPrice": "0.011000",
    "isWithdrawn": false,
    "isLive": false,
    "location": "berlin",
    
    "wayOfFlowersData": {
      "backgroundImageUrl": "/project_images/01__GRG.png",     // ← From first beneficiary's project
      "seedEmblemUrl": "/seeds/01__grg.png",                   // ← Converted path
      "firstText": "",
      "secondText": "",
      "thirdText": "",
      "mainQuote": "",
      "author": ""
    },
    
    "story": {
      "title": "",
      "author": "",
      "story": ""
    },
    
    "beneficiaries": [
      {
        "code": "01-GRG",
        "index": 0,
        "name": "Grgich Hills Estate Regenerative Sheep Grazing",
        "slug": "grgich-hills-estate",                         // ← NEW: URL slug
        "percentage": "1.95",
        "address": "0xd2D7441d36569200bA5b7cE9c90623a364dB1297",
        "allocatedAmount": "0.000000",
        "totalClaimed": "0.000000",
        "claimableAmount": "0.000000",
        "isActive": true,
        "beneficiaryValue": "0.044000",
        "projectData": {
          "title": "Grgich Hills Estate",
          "subtitle": "Regenerative Sheep Grazing",
          "location": "Rutherford, Napa Valley, California",
          "area": "126.6 hectares",
          "description": "...",
          "benefits": [...],
          "moreDetails": "...",
          "backgroundImage": "/project_images/01__GRG.png"
        }
      },
      {
        "code": "02-ELG",
        "index": 1,
        "name": "El Globo Habitat Bank",
        "slug": "el-globo-habitat-bank",                       // ← NEW: URL slug
        "percentage": "14.02",
        "projectData": { ... }
      },
      {
        "code": "03-JAG",
        "index": 2,
        "name": "Jaguar Stewardship in the Pantanal Conservation Network",
        "slug": "jaguar-stewardship-in-the-pantanal",          // ← NEW: URL slug
        "percentage": "27.84",
        "projectData": { ... }
      },
      {
        "code": "04-BUE",
        "index": 3,
        "name": "Buena Vista Heights Conservation Area",
        "slug": "buena-vista-heights-conservation-area",       // ← NEW: URL slug
        "percentage": "16.25",
        "projectData": { ... }
      }
    ]
  },
  "timestamp": 1759480494940
}
```

---

## Frontend Usage Examples

### **1. Routing to Beneficiary Detail Pages:**

```typescript
// Use the slug for clean URLs
const seed = await getSeed(1);

seed.beneficiaries.forEach(ben => {
  const url = `/beneficiaries/${ben.slug}`;
  // Examples:
  // /beneficiaries/grgich-hills-estate
  // /beneficiaries/el-globo-habitat-bank
  // /beneficiaries/jaguar-stewardship-in-the-pantanal
  // /beneficiaries/buena-vista-heights-conservation-area
});
```

### **2. Using Way of Flowers Data:**

```typescript
const seed = await getSeed(1);

// Background image for the seed
console.log(seed.wayOfFlowersData.backgroundImageUrl);
// Output: "/project_images/01__GRG.png"

// Seed emblem (lowercase, in /seeds directory)
console.log(seed.wayOfFlowersData.seedEmblemUrl);
// Output: "/seeds/01__grg.png"

// Display in frontend:
<div style={{backgroundImage: `url(${seed.wayOfFlowersData.backgroundImageUrl})`}}>
  <img src={seed.wayOfFlowersData.seedEmblemUrl} alt="Seed Emblem" />
</div>
```

### **3. Link to Beneficiary from Seed:**

```typescript
// In seed detail page
<div className="beneficiaries-list">
  {seed.beneficiaries.map(ben => (
    <Link key={ben.code} href={`/beneficiaries/${ben.slug}`}>
      <h3>{ben.projectData.title}</h3>
      <p>{ben.projectData.subtitle}</p>
    </Link>
  ))}
</div>
```

---

## Complete Beneficiary Slugs Reference

| Code | Project Title | Generated Slug |
|------|---------------|----------------|
| 01-GRG | Grgich Hills Estate | `grgich-hills-estate` |
| 02-ELG | El Globo Habitat Bank | `el-globo-habitat-bank` |
| 03-JAG | Jaguar Stewardship in the Pantanal | `jaguar-stewardship-in-the-pantanal` |
| 04-BUE | Buena Vista Heights Conservation Area | `buena-vista-heights-conservation-area` |
| 05-WAL | Walkers Reserve | `walkers-reserve` |
| 06-PIM | Pimlico Farm | `pimlico-farm` |
| 07-HAR | Harvey Manning Park Expansion | `harvey-manning-park-expansion` |
| 08-STE | St. Elmo Preservation Project | `st-elmo-preservation-project` |

---

## Image Path Conversions

| Project Background Image | Seed Emblem Path |
|-------------------------|------------------|
| `/project_images/01__GRG.png` | `/seeds/01__grg.png` |
| `/project_images/02__ELG.png` | `/seeds/02__elg.png` |
| `/project_images/03__JAG.png` | `/seeds/03__jag.png` |
| `/project_images/04__BUE.png` | `/seeds/04__bue.png` |
| `/project_images/05__WAL.png` | `/seeds/05__wal.png` |
| `/project_images/06__PIM.png` | `/seeds/06__pim.png` |
| `/project_images/07__HAR.png` | `/seeds/07__har.png` |
| `/project_images/08__STE.png` | `/seeds/08__ste.png` |

---

## Benefits

1. **SEO-Friendly URLs:** Clean, readable URLs for beneficiary pages
2. **Easy Routing:** Simple mapping from slug to beneficiary detail page
3. **Consistent Naming:** Slugs derived from official project titles
4. **Way of Flowers Populated:** Uses real project data instead of empty strings
5. **Image Path Convention:** Clear separation between project images and seed emblems

---

**Test it out:** Restart your server and hit `/api/seeds/1` to see the new structure! 🎉

