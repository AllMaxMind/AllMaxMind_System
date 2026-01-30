#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const migrationsDir = path.join(__dirname, '../supabase/migrations');
const migrations = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql')).sort();

let allSQL = '';

migrations.forEach((migrationFile, idx) => {
  const content = fs.readFileSync(path.join(migrationsDir, migrationFile), 'utf-8');

  allSQL += '\n\n' + '='.repeat(100) + '\n';
  allSQL += `-- MIGRATION ${idx + 1}/${migrations.length}: ${migrationFile}\n`;
  allSQL += '='.repeat(100) + '\n\n';

  allSQL += content + '\n';
});

fs.writeFileSync(path.join(__dirname, '../MIGRATIONS_CLEAN.sql'), allSQL);

console.log('✅ Created: MIGRATIONS_CLEAN.sql (cleaned and organized)');
console.log('\n📋 Instructions:');
console.log('   1. Open: https://app.supabase.com/project/cadzxxcowwtqwefcqqsa/sql/new');
console.log('   2. Copy MIGRATIONS_CLEAN.sql content');
console.log('   3. For each "====" section:');
console.log('      • Copy just that migration block (SQL only)');
console.log('      • Paste in Supabase');
console.log('      • Execute');
console.log('      • Move to next\n');

process.exit(0);
