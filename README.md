# NBA Shot Search Engine

A natural language search engine for NBA shots, visualized on a court map. Hosted  on GitHub Pages.

Github Pages link: https://arnolda2.github.io/CS410-Final-Project/
Might take a minute to load the data on to the github pages site.

In this project I built an interactive application for searching through NBA shot data for the past few seasons. The entire application runs in the browser and can be accessed via the GitHub pages link. In this application the user is able to filter and visualize thousands of shots that have been put up in the many games in the NBA.

In order to use NBA Shot Search Engine Application, start by navigating to the GitHub pages url: https://arnolda2.github.io/CS410-Final-Project/, it might take a minute to load up. Also at the top of the screen, there is a button that says “How it works”, this can give you some suggestions on things to search and a brief overview of how it works, and at the bottom of this popup, it lists some of the searchable terms so you can see the different shot types in basketball, and the different court zones, and the court zones and the shot types are usually connected as you can only take certain shots from certain zones. So on the left side of the application is the shot chart, which is an interactive court model, so this will populate based on your search and based on what the data set provides. The green dots show shots that were made, and the red dots are missed shots. So you can search what you are looking for in the search bar, for example if you search “Stephen Curry, corner 3” it will show you the corner three shots he took over the past few seasons. Then the stats on the right side of the screen will populate accordingly, and if you click on the “Recent Shots” tab, you can see some of the latest shots he took in the 2023-2024 season. There are a few filter options as well, to the right of the search bar you can designate which data you want to look at, for example if you only want to see data from a specific season, you can select that season, or if you only want to see made shots or even missed shots, that is a filter option as well, and the stats will update accordingly. 

So to use the data, I use process_data.py, to clean up and standardize the data. Also, since there was a lot of data we condensed it to the past few seasons and compressed it in order to display it on the GitHub pages. Then made a react app for the visualization, with the court visualization that plots the shots, and added a search bar and some other features to display the stats. The application also takes care of data decompression, indexing, search logic, and calculating stats. 

So for retrieval and text mining, the search uses information retrieval and text mining which is implemented through MiniSearch. So first I had to convert the data to unstructured text documents in order to search it. Then we make an inverted index in the browser to look up the different player tokens and retrieve the data for that player, and there is more logic implemented in order to search the particular shot type and group it with the player, and using BM25 to score and rank the shots also in order to rank certain more popular players, also based on the data as well. There is also more done to get it working functionally and with the court graphic. Also adding the stats and calculating the stats and comparisons based on the selected players. 


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