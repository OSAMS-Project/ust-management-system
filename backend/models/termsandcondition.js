const pool = require('../config/database');

// Create table query
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS terms_and_conditions (
    id SERIAL PRIMARY KEY,
    borrowing_guidelines TEXT[],
    documentation_requirements TEXT[],
    usage_policy TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
  );
`;

// Initialize table
(async () => {
  try {
    await pool.query(createTableQuery);
    console.log('Terms and conditions table created successfully');
  } catch (error) {
    console.error('Error creating terms and conditions table:', error);
  }
})();

const TermsAndConditions = {
  async findOne() {
    try {
      const query = 'SELECT * FROM terms_and_conditions ORDER BY id DESC LIMIT 1';
      const result = await pool.query(query);
      return result.rows[0] || null;
    } catch (error) {
      console.error('Error finding terms:', error);
      throw error;
    }
  },

  async findOneAndUpdate(_, data) {
    try {
      const query = `
        INSERT INTO terms_and_conditions 
          (borrowing_guidelines, documentation_requirements, usage_policy)
        VALUES ($1, $2, $3)
        RETURNING *;
      `;
      
      const values = [
        data.borrowing_guidelines,
        data.documentation_requirements,
        data.usage_policy
      ];
      
      const result = await pool.query(query, values);
      return result.rows[0];
    } catch (error) {
      console.error('Database error:', error);
      throw error;
    }
  }
};

module.exports = TermsAndConditions;
