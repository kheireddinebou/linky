import { Pool } from "pg";

const pool = new Pool({
  user: process.env.PGUSER,
  password: process.env.PGPASSWORD,
  host: process.env.PGHOST,
  port: Number(process.env.PGPORT),
  database: process.env.PGDATABASE,
});

export default pool;

// docker run -d \
//   --name postgres \
//   -e POSTGRES_USER= \
//   -e POSTGRES_PASSWORD= \
//   -e POSTGRES_DB= \
//   -p 5432:5432 \
