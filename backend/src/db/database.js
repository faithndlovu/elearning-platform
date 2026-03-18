const { Pool } = require('pg')

const pool = new Pool({
  user:     'postgres',
  host:     'localhost',
  database: 'elearning',
  password: '092005',
  port:     5432,
})

// Test the connection
pool.connect((err, client, release) => {
  if (err) {
    console.error('Database connection failed:', err.message)
  } else {
    console.log('Connected to PostgreSQL')
    release()
  }
})

module.exports = pool