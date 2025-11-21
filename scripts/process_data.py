import pandas as pd
import json
import os
import gzip

# Configuration
DATA_DIR = 'data'
OUTPUT_FILE = 'public/shots_index.json.gz'
SEASONS = [2021, 2022, 2023, 2024]

def process_data():
    all_shots = []
    
    for season in SEASONS:
        file_path = os.path.join(DATA_DIR, f'NBA_{season}_Shots.csv')
        if not os.path.exists(file_path):
            print(f"Warning: {file_path} not found. Skipping.")
            continue
            
        print(f"Processing {season}...")
        df = pd.read_csv(file_path)
        
        # Filter regular season if possible
        
        # Convert date to YYYY-MM-DD for string sorting
        df['GAME_DATE'] = pd.to_datetime(df['GAME_DATE']).dt.strftime('%Y-%m-%d')
        
        # Create search_text
        # Combine Player, Team, Action Type, Zone info, Shot Type
        # Handle NaN values by replacing with empty string
        
        text_cols = ['PLAYER_NAME', 'TEAM_NAME', 'ACTION_TYPE', 'BASIC_ZONE', 'ZONE_NAME', 'ZONE_RANGE', 'SHOT_TYPE']
        for col in text_cols:
            df[col] = df[col].fillna('')
            
        df['search_text'] = (
            df['PLAYER_NAME'] + ' ' + 
            df['TEAM_NAME'] + ' ' + 
            df['ACTION_TYPE'] + ' ' + 
            df['BASIC_ZONE'] + ' ' + 
            df['ZONE_NAME'] + ' ' + 
            df['ZONE_RANGE'] + ' ' + 
            df['SHOT_TYPE']
        )
        
        df['made'] = df['SHOT_MADE'].apply(lambda x: 1 if str(x).upper() == 'TRUE' else 0)
        
        df_selected = df[[
            'PLAYER_NAME', 
            'TEAM_NAME', 
            'LOC_X', 
            'LOC_Y', 
            'made', 
            'SEASON_1', 
            'search_text',
            'GAME_DATE',
            'SHOT_DISTANCE',
            'BASIC_ZONE'
        ]].copy()
        
        df_selected.rename(columns={
            'PLAYER_NAME': 'player',
            'TEAM_NAME': 'team',
            'LOC_X': 'x',
            'LOC_Y': 'y',
            'SEASON_1': 'year',
            'GAME_DATE': 'date',
            'SHOT_DISTANCE': 'dist',
            'BASIC_ZONE': 'zone'
        }, inplace=True)
        
        df_selected['x'] = df_selected['x'].round(1)
        df_selected['y'] = df_selected['y'].round(1)
        
        all_shots.append(df_selected)
    
    if not all_shots:
        print("No data found.")
        return

    combined_df = pd.concat(all_shots, ignore_index=True)
    
    shots_list = combined_df.to_dict(orient='records')
    
    # Add an ID to each shot for search indexing
    for idx, shot in enumerate(shots_list):
        shot['id'] = idx
        
    print(f"Total shots: {len(shots_list)}")
    print(f"Saving to {OUTPUT_FILE}...")
    
    with gzip.open(OUTPUT_FILE, 'wt', encoding='utf-8') as f:
        json.dump(shots_list, f)
        
    print("Done.")

if __name__ == '__main__':
    process_data()

