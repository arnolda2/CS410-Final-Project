# NBA Shot Search Engine

A natural language search engine for NBA shots, visualized on a court map. Hosted  on GitHub Pages.

Github Pages link: https://arnolda2.github.io/CS410-Final-Project/
Might take a minute to load the data on to the github pages site.


## Project Structure

```
CS410-Final-Project/
├── .github/
│   └── workflows/
│       └── deploy.yml      # GitHub Actions workflow to build and deploy to GitHub Pages
├── data/                   # Raw CSV data files
│   └── NBA_202X_Shots.csv
├── public/
│   └── shots_index.json.gz # Compressed search index 
├── scripts/
│   └── process_data.py     # Python script to clean, merge, and compress raw CSV data
├── src/
│   ├── components/
│   │   ├── SearchBar.tsx   # Search input with filtering
│   │   └── ShotMap.tsx     # Visualization of the basketball court and shots
│   ├── hooks/
│   │   └── useShotSearch.ts # Loads data, decompression, MiniSearch
│   ├── App.tsx             # Dashboard layout
│   ├── types.ts            # TypeScript interfaces for Shot data
│   ├── index.css           
│   └── main.tsx            
├── index.html              
├── package.json            
├── tsconfig.json           
└── vite.config.ts
```