#!/bin/bash

# ALL MAX MIND - Pre-Push Quality Gate Hook
# This script runs before git push to ensure code quality
# Install: cp scripts/pre-push-hook.sh .git/hooks/pre-push && chmod +x .git/hooks/pre-push

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}🔍 Running pre-push quality gates...${NC}\n"

FAILED=0

# 1. Check for uncommitted changes
echo -e "${YELLOW}[1/6] Checking for uncommitted changes...${NC}"
if git diff-index --quiet HEAD --; then
  echo -e "${GREEN}✓ No uncommitted changes${NC}\n"
else
  echo -e "${RED}✗ You have uncommitted changes${NC}"
  echo -e "${YELLOW}Hint: Run 'git add .' and 'git commit' first${NC}\n"
  FAILED=1
fi

# 2. TypeScript type checking
echo -e "${YELLOW}[2/6] TypeScript type checking...${NC}"
if npm run typecheck > /dev/null 2>&1; then
  echo -e "${GREEN}✓ TypeScript check passed${NC}\n"
else
  echo -e "${RED}✗ TypeScript check failed${NC}\n"
  npm run typecheck
  FAILED=1
fi

# 3. ESLint code quality
echo -e "${YELLOW}[3/6] ESLint code quality check...${NC}"
if npm run lint > /dev/null 2>&1; then
  echo -e "${GREEN}✓ ESLint check passed${NC}\n"
else
  echo -e "${RED}✗ ESLint check failed${NC}\n"
  npm run lint
  FAILED=1
fi

# 4. Unit tests
echo -e "${YELLOW}[4/6] Running unit tests...${NC}"
if npm test > /dev/null 2>&1; then
  echo -e "${GREEN}✓ All tests passed${NC}\n"
else
  echo -e "${RED}✗ Tests failed${NC}\n"
  npm test
  FAILED=1
fi

# 5. Production build
echo -e "${YELLOW}[5/6] Testing production build...${NC}"
if npm run build > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Production build successful${NC}\n"
else
  echo -e "${RED}✗ Production build failed${NC}\n"
  npm run build
  FAILED=1
fi

# 6. Security audit
echo -e "${YELLOW}[6/6] Security vulnerability scan...${NC}"
if npm audit --audit-level=high > /dev/null 2>&1; then
  echo -e "${GREEN}✓ No high-risk vulnerabilities found${NC}\n"
else
  echo -e "${YELLOW}⚠ Security warnings found (not blocking)${NC}"
  npm audit --audit-level=high || true
  echo ""
fi

# Final status
if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${GREEN}✅ All quality gates passed!${NC}"
  echo -e "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "\n📤 Proceeding with git push...\n"
  exit 0
else
  echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "${RED}❌ Quality gates failed!${NC}"
  echo -e "${RED}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
  echo -e "\n${YELLOW}Fix the issues above and try again.${NC}"
  echo -e "${YELLOW}Use 'npm run lint:fix' to auto-fix linting issues.${NC}\n"
  exit 1
fi
