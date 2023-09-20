const pg = require('pg');
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');

const client = new pg.Client('postgress://localhost/block33');
const app = express();
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

app.get('/api/players', async (req, res, next) => {
    try {
        const SQL = `
            SELECT * FROM players;
        `;
        const response = await client.query(SQL);
        res.send(response.rows);
    } catch (error) {
        next(error)
    }
});

app.get('/api/players/:id', async (req, res, next) => {
    try {
        const SQL = `
            SELECT *
            FROM players
            WHERE id = $1;
        `
        const response = await client.query(SQL, [req.params.id]);
        res.send(response.rows);
    } catch (error) {
        next(error);
    }
});

app.delete('/api/players/:id', async (req, res, next) => {
    try {
        const SQL = `
        DELETE FROM players
        WHERE id = $1;
    `;
        const response = await client.query(SQL, [req.params.id]);
        res.sendStatus(204);
    } catch (error) {
        next(error);
    }
});

app.post('/api/players', async (req, res, next) => {
    try {
        const SQL = `
            INSERT INTO players(name, team, position)
            VALUES ($1, $2, $3)
            RETURNING *
        `
        const response = await client.query(SQL, [req.body.name, req.body.team, req.body.position]);
        res.send(response.rows);
    } catch (error) {
        next(error);
    }
});

app.put('/api/players/:id', async (req, res, next) => {
    try {
        const SQL = `
            UPDATE players
            SET name = $1, team = $2, position = $3
            WHERE id = $4
            Returning *
        `
        const response = await client.query(SQL, [req.body.name, req.body.team, req.body.position, req.params.id]);
        res.send(response.rows);
    } catch (error) {
        next(error);
    }
});

const start = async () => {
    await client.connect();
    console.log('database connected');
    const SQL = `
        DROP TABLE IF EXISTS players;
        CREATE TABLE players(
            id SERIAL PRIMARY KEY,
            name VARCHAR(100),
            team VARCHAR(100),
            position VARCHAR(100)
        );
        INSERT INTO players (name, team, position) VALUES ('Patrick Mahomes', 'Kansas City Chiefs', 'Quarterback');
        INSERT INTO players (name, team, position) VALUES ('Travis Kelce', 'Kansas City', 'Tight End');
        INSERT INTO players (name, team, position) VALUES ('Clyde Edwards-Helaire', 'Kansas City', 'Running Back');
        INSERT INTO players (name, team, position) VALUES ('Nick Bolton', 'Kansas City', 'Linebacker');
        INSERT INTO players (name, team, position) VALUES ('Nick Bosa', 'San Francisco', 'Defensive End');
        INSERT INTO players (name, team, position) VALUES ('Derrick Henry', 'Tennessee', 'Running Back');
        INSERT INTO players (name, team, position) VALUES ('Justin Jefferson', 'Minnesota', 'Wide Receiver');
    `;

    await client.query(SQL);
    console.log('tables created and data seeded');

    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`listening on port ${PORT}`)
    });

}

start();