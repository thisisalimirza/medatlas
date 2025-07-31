const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  
  // Skip the first empty line and get headers from line 2
  const headers = lines[1].split(',').map(h => h.trim());
  console.log('Headers found:', headers);
  
  const programs = [];
  
  for (let i = 2; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;
    
    // Parse CSV line handling commas within quotes
    const values = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        values.push(current.trim().replace(/^"(.*)"$/, '$1')); // Remove surrounding quotes
        current = '';
      } else {
        current += char;
      }
    }
    values.push(current.trim().replace(/^"(.*)"$/, '$1')); // Add the last value and remove quotes
    
    if (values.length >= 7) { // Ensure we have all required fields
      const program = {
        program_name: values[0] || '',
        host_institution: values[1] || '',
        description: values[2] || '',
        eligibility: values[3] || '',
        application_deadline: values[4] || '',
        stipend_funding: values[5] || '',
        duration: values[6] || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      programs.push(program);
      console.log(`Parsed program ${programs.length}: ${program.program_name}`);
    } else {
      console.log(`Skipping line ${i}: insufficient columns (${values.length})`);
    }
  }
  
  return programs;
}

async function createTable() {
  console.log('Creating summer_programs table...');
  
  // Note: You'll need to run this SQL in your Supabase SQL editor first:
  const createTableSQL = `
    CREATE TABLE IF NOT EXISTS summer_programs (
      id SERIAL PRIMARY KEY,
      program_name TEXT NOT NULL,
      host_institution TEXT NOT NULL,
      description TEXT,
      eligibility TEXT,
      application_deadline TEXT,
      stipend_funding TEXT,
      duration TEXT,
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );

    -- Enable RLS
    ALTER TABLE summer_programs ENABLE ROW LEVEL SECURITY;

    -- Create policies
    CREATE POLICY "Allow read access for everyone" ON summer_programs
      FOR SELECT USING (true);

    CREATE POLICY "Allow insert for authenticated users" ON summer_programs
      FOR INSERT WITH CHECK (auth.role() = 'authenticated');

    CREATE POLICY "Allow update for authenticated users" ON summer_programs
      FOR UPDATE USING (auth.role() = 'authenticated');
  `;

  console.log('Please run this SQL in your Supabase SQL editor:');
  console.log(createTableSQL);
  console.log('\nPress Enter when done...');
  
  // Wait for user input
  await new Promise(resolve => {
    process.stdin.once('data', resolve);
  });
}

async function importData() {
  try {
    console.log('Reading CSV file...');
    const csvContent = fs.readFileSync('./medical_student_summer_programs.csv', 'utf8');
    
    console.log('Parsing CSV data...');
    const programs = parseCSV(csvContent);
    
    console.log(`Found ${programs.length} programs to import`);
    
    // Clear existing data (optional)
    console.log('Clearing existing data...');
    const { error: deleteError } = await supabase
      .from('summer_programs')
      .delete()
      .neq('id', 0); // Delete all records
    
    if (deleteError) {
      console.log('Note: Could not clear existing data (table might not exist yet):', deleteError.message);
    }
    
    // Insert data in batches
    const batchSize = 50;
    for (let i = 0; i < programs.length; i += batchSize) {
      const batch = programs.slice(i, i + batchSize);
      console.log(`Inserting batch ${Math.floor(i/batchSize) + 1}/${Math.ceil(programs.length/batchSize)}...`);
      
      const { data, error } = await supabase
        .from('summer_programs')
        .insert(batch);
      
      if (error) {
        console.error('Error inserting batch:', error);
        throw error;
      }
    }
    
    console.log('✅ Successfully imported all summer programs!');
    
    // Verify the import
    const { data: count, error: countError } = await supabase
      .from('summer_programs')
      .select('id', { count: 'exact', head: true });
    
    if (!countError) {
      console.log(`✅ Verified: ${count} programs in database`);
    }
    
  } catch (error) {
    console.error('❌ Error importing data:', error);
    process.exit(1);
  }
}

async function main() {
  console.log('🚀 Starting Summer Programs Import');
  console.log('=====================================\n');
  
  console.log('✅ Table already created via Supabase migration');
  await importData();
  
  console.log('\n🎉 Import completed successfully!');
  process.exit(0);
}

if (require.main === module) {
  main();
}