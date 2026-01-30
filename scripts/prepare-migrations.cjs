#!/usr/bin/env node

/**
 * Prepare Migrations for Manual Deployment
 * Gera um arquivo consolidado com todas as migrations
 */

const fs = require('fs');
const path = require('path');

const migrationsDir = path.join(__dirname, '../supabase/migrations');
const outputFile = path.join(__dirname, '../MIGRATIONS_TO_RUN.sql');

console.log('📋 Preparando migrations para deploy...\n');

const migrations = fs.readdirSync(migrationsDir)
  .filter(f => f.endsWith('.sql'))
  .sort();

let consolidatedSQL = `-- All Max Mind System - Database Migrations
-- Generated: ${new Date().toISOString()}
-- Deploy Instructions:
-- 1. Go to: https://app.supabase.com/project/cadzxxcowwtqwefcqqsa/sql/new
-- 2. Copy each migration block below (separated by comments)
-- 3. Execute each one in order

`;

migrations.forEach((migration, index) => {
  const filePath = path.join(migrationsDir, migration);
  const content = fs.readFileSync(filePath, 'utf-8');

  consolidatedSQL += `\n${'='.repeat(80)}\n`;
  consolidatedSQL += `-- MIGRATION ${index + 1}/${migrations.length}: ${migration}\n`;
  consolidatedSQL += `${'='.repeat(80)}\n\n`;
  consolidatedSQL += content;
  consolidatedSQL += '\n\n';
});

fs.writeFileSync(outputFile, consolidatedSQL);

console.log(`✅ Consolidated migrations file created: MIGRATIONS_TO_RUN.sql`);
console.log(`\n📊 Summary:`);
console.log(`   • Total migrations: ${migrations.length}`);
migrations.forEach((m, i) => console.log(`   ${i + 1}. ${m}`));

console.log(`\n📝 Next steps:`);
console.log(`   1. Open: https://app.supabase.com/project/cadzxxcowwtqwefcqqsa/sql/new`);
console.log(`   2. Open file: MIGRATIONS_TO_RUN.sql`);
console.log(`   3. For each migration block (separated by ====):`);
console.log(`      • Copy the SQL (without the header comments)`);
console.log(`      • Paste in Supabase SQL Editor`);
console.log(`      • Click "Execute"`);
console.log(`      • Wait for ✅ success before moving to next`);
console.log(`\n⚠️  IMPORTANT ORDER:`);
console.log(`   • 00001 (pgvector) - FIRST (enables vector extension)`);
console.log(`   • 00002 (problem_embeddings) - SECOND (needs pgvector)`);
console.log(`   • 00003-00008 - In order\n`);

console.log(`💡 Or open MIGRATIONS_TO_RUN.sql directly for copy/paste\n`);
