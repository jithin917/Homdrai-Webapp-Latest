#!/bin/bash

# Test Execution Script
echo "🧪 Starting OMS Quality Assurance Tests"
echo "========================================"

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

# Run different test suites
echo ""
echo "🔍 Running Unit Tests..."
npm run test qa-testing/test-cases/measurement-form-tests.js

echo ""
echo "🔍 Running Customer Search Tests..."
npm run test qa-testing/test-cases/customer-search-tests.js

echo ""
echo "🔍 Running Button Functionality Tests..."
npm run test qa-testing/test-cases/button-functionality-tests.js

echo ""
echo "🔍 Running Integration Tests..."
npm run test qa-testing/test-cases/integration-tests.js

echo ""
echo "♿ Running Accessibility Tests..."
npm run test qa-testing/test-cases/accessibility-tests.js

echo ""
echo "⚡ Running Performance Tests..."
npm run test qa-testing/test-cases/performance-tests.js

echo ""
echo "📊 Generating Coverage Report..."
npm run test:coverage

echo ""
echo "✅ All tests completed!"
echo "📋 Check the coverage report in coverage/index.html"