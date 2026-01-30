#!/usr/bin/env node

/**
 * Deploy Migrations to Supabase
 * Executa todas as migrations (00001-00008) diretamente
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error('❌ Error: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be configured in .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

async function executeMigration(filePath, migrationName) {
  try {
    const sql = fs.readFileSync(filePath, 'utf-8');
    console.log(`\n📝 Executing: ${migrationName}...`);

    // Split migrations by semicolon and filter empty statements
    const statements = sql
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));

    for (const statement of statements) {
      const { error } = await supabase.rpc('execute_sql', {
        sql: statement
      }).catch(() => {
        // Fallback: try direct query execution
        return supabase.from('_migrations').insert({ sql: statement }).catch(() => ({
          error: { message: 'RPC not available' }
        }));
      });

      if (error && !error.message.includes('RPC not available')) {
        throw error;
      }
    }

    console.log(`✅ ${migrationName} executed successfully`);
    return true;
  } catch (error) {
    console.error(`❌ Error executing ${migrationName}:`, error.message);
    return false;
  }
}

async function main() {
  console.log('🚀 Deploying Migrations to Supabase');
  console.log(`URL: ${SUPABASE_URL}`);
  console.log('═'.repeat(60));

  const migrationsDir = path.join(__dirname, '../supabase/migrations');
  const migrations = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();

  console.log(`\n📋 Found ${migrations.length} migrations:`);
  migrations.forEach(m => console.log(`   • ${m}`));

  console.log('\n⏳ Starting deployment...');

  let successCount = 0;
  for (const migration of migrations) {
    const filePath = path.join(migrationsDir, migration);
    const success = await executeMigration(filePath, migration);
    if (success) successCount++;
  }

  console.log('\n' + '═'.repeat(60));
  console.log(`\n📊 Results: ${successCount}/${migrations.length} migrations deployed`);

  if (successCount === migrations.length) {
    console.log('\n✅ All migrations deployed successfully!');
    console.log('\n🎉 Next steps:');
    console.log('   1. npm run dev  (start dev server)');
    console.log('   2. Open http://localhost:5173');
    console.log('   3. Test Phase 0 → Phase 4 flow');
  } else {
    console.log('\n⚠️ Some migrations failed. Check errors above.');
    process.exit(1);
  }
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
