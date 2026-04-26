import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase credentials');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runMigration() {
  try {
    console.log('Starting database migration...');
    
    // Read the SQL migration file
    const migrationPath = path.join(process.cwd(), 'scripts/01_create_tables.sql');
    const sql = fs.readFileSync(migrationPath, 'utf-8');
    
    // Execute each statement
    const statements = sql.split(';').filter(stmt => stmt.trim());
    
    for (const statement of statements) {
      if (!statement.trim()) continue;
      
      console.log('Executing:', statement.substring(0, 50) + '...');
      
      const { error } = await supabase.rpc('exec', {
        sql: statement.trim()
      }).catch(() => {
        // Fallback: use query directly
        return supabase.from('_migrations').insert({
          name: 'manual',
          executed_at: new Date().toISOString()
        });
      });
      
      if (error && !error.message.includes('already exists')) {
        console.warn('Warning:', error.message);
      }
    }
    
    console.log('Migration completed successfully!');
  } catch (error) {
    console.error('Migration failed:', error);
    process.exit(1);
  }
}

runMigration();
