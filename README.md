# NBA Shot Search Engine

A natural language search engine for NBA shots, visualized on a court map. Hosted  on GitHub Pages.

Github Pages link: https://arnolda2.github.io/CS410-Final-Project/
Might take a minute to load the data on to the github pages site.


## Project Structure

```
CS410-Final-Project/
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Actions workflow to build & deploy to GitHub Pages
├── data/                   # Raw CSV data files
│   └── NBA_202X_Shots.csv
├── public/
│   └── shots_index.json.gz # Compressed search index 
├── scripts/
│   └── process_data.py     # Python script to clean, merge, and compress raw CSV data
├── src/
│   ├── components/
│   │   ├── SearchBar.tsx   # Search input with player autocomplete and chip filtering
│   │   └── ShotMap.tsx     # D3.js visualization of the basketball court and shots
│   ├── hooks/
│   │   └── useShotSearch.ts # loads data, handles decompression, manages MiniSearch
│   ├── App.tsx             # Main dashboard layout (Stats, Map, Filters)
│   ├── types.ts            # TypeScript interfaces for Shot and Filter data
│   ├── index.css           # Tailwind CSS v4 configuration and global styles
│   └── main.tsx            # React entry point
├── index.html              # HTML entry point
├── package.json            # Node.js dependencies and scripts
├── tsconfig.json           # TypeScript configuration
└── vite.config.ts          # Vite build configuration (base URL setup)
```
