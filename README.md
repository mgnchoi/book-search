# Book Search 
- A web app for searching the Open Library catalog
- Enter a username and a search term to see how many books match and the first ten titles
- Use the List Previous button to show the search history for a given user
    - Search history is sortable by search term or result count

## Stack

Frontend
- TypeScript
- React
- Vite

Backend
- Typescript
- Node
- Express
- SQLite (better-sqlite3)

## Requirements

- Node 22.12 or greater
- npm

## Setup
1. Install both npm projects
    - `npm run install:all`

### Development
2. Run server
    - `cd server`
    - `npm run dev`

3. Run client
    - `cd client`
    - `npm run dev`

4. Open http://localhost:5173 in your browser

### Production
2. Build
    - `npm run build`

3. Run
    - `npm start`

5. Open http://localhost:3000 in your browser

## Database

Database file and table are created on the first server boot