const express = require("express");

const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

let db = null;

const dbPath = path.join(__dirname, "cricketTeam.db");

const initializeDbAndServer = async () => {
  try {
    db = await open({ filename: dbPath, driver: sqlite3.Database });

    app.listen(3001, () => {
      console.log("Server Running at http://localhost:3001/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDbAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

//1 GET get list of all players API

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `SELECT *
    FROM cricket_team`;

  const playersArray = await db.all(getPlayersQuery);
  response.send(
    playersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

//2 POST creates a new player in database

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;

  const addPlayerQuery = `INSERT INTO 
    cricket_team (player_name, jersey_number, role)
    VALUES(${playerName}, ${jerseyNumber}, ${role})
    `;
  const dbResponse = await db.run(addPlayerQuery);

  response.send("Player Added to Team");
});

//3 GET returns a player details based on player_id

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `SELECT *
    FROM cricket_team
    WHERE player_id = ${playerId}`;

  const player = await db.get(getPlayerQuery);

  response.send(convertDbObjectToResponseObject(player));
});

//4 update the player details based on player_id

app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;

  const playerDetails = request.body;

  const { playerName, jerseyNumber, role } = playerDetails;

  const updatePlayerQuery = `UPDATE cricket_team
    SET 
    player_name = ${playerName},
    jersey_number = ${jerseyNumber},
    role = ${role}
    WHERE player_id = ${playerId}`;

  await db.run(updatePlayerQuery);
  response.send("Player Details Updated");
});

//5 DELETE removes a player from the database based on player_id

app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const removesPlayerQuery = `DELETE FROM cricket_team
    WHERE player_id = ${playerId}`;

  await db.run(removesPlayerQuery);
  response.send("Player Removed");
});

module.exports = app;
