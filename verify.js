#!/usr/bin/env node

/**
 * IronQuest Verification Script
 * Run this after scaffolding or making changes to verify the app can start
 *
 * Usage: node verify.js
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

let hasErrors = false;

function log(section) {
  console.log(`\n${'='.repeat(60)}`);
  console.log(`  ${section}`);
  console.log('='.repeat(60));
}

function check(name, fn) {
  try {
    const result = fn();
    if (result === false) {
      console.log(`❌ ${name}: FAILED`);
      hasErrors = true;
    } else {
      console.log(`✅ ${name}: OK`);
    }
    return result;
  } catch (error) {
    console.log(`❌ ${name}: ERROR - ${error.message}`);
    hasErrors = true;
    return false;
  }
}

// 1. Check required files exist
log('Checking Required Files');
check('package.json exists', () => fs.existsSync('package.json'));
check('app.json exists', () => fs.existsSync('app.json'));
check('tsconfig.json exists', () => fs.existsSync('tsconfig.json'));
check('babel.config.js exists', () => fs.existsSync('babel.config.js'));
check('metro.config.js exists', () => fs.existsSync('metro.config.js'));
check('app/_layout.tsx exists', () => fs.existsSync('app/_layout.tsx'));
check('node_modules exists', () => fs.existsSync('node_modules'));

// 2. Check TypeScript compilation
log('Checking TypeScript');
check('TypeScript compiles', () => {
  try {
    execSync('npx tsc --noEmit', { stdio: 'pipe' });
    return true;
  } catch (error) {
    console.log('   TypeScript errors found - run: npm run typecheck');
    return false;
  }
});

// 3. Check Expo config
log('Checking Expo Configuration');
check('Expo config valid', () => {
  try {
    execSync('npx expo config --type public', { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
});

// 4. Check for missing babel plugins
log('Checking Babel Configuration');
check('Babel plugins installed', () => {
  const babelPath = path.resolve('./babel.config.js');
  delete require.cache[require.resolve(babelPath)];
  const babelConfigModule = require(babelPath);
  const plugins = babelConfigModule({ cache: () => {} }).plugins || [];

  for (const plugin of plugins) {
    const pluginName = typeof plugin === 'string' ? plugin : plugin[0];
    try {
      if (pluginName === 'react-native-reanimated/plugin') {
        require.resolve('react-native-reanimated/plugin');
      } else if (pluginName === 'module-resolver') {
        require.resolve('babel-plugin-module-resolver');
      }
    } catch (e) {
      console.log(`   Missing: ${pluginName}`);
      return false;
    }
  }
  return true;
});

// 5. Check for common missing dependencies
log('Checking Common Dependencies');
const criticalDeps = [
  'expo',
  'expo-router',
  'react',
  'react-native',
  'react-native-reanimated',
  'react-native-gesture-handler',
  'react-native-screens',
  'react-native-safe-area-context',
  'zustand',
  'react-native-mmkv',
  'react-native-worklets',
];

for (const dep of criticalDeps) {
  check(`${dep} installed`, () => {
    try {
      require.resolve(dep);
      return true;
    } catch {
      return false;
    }
  });
}

// 6. Try bundling (catches module resolution errors)
log('Testing Metro Bundler');
check('Metro can resolve entry', () => {
  try {
    // This tests if the entry point can be resolved without actually starting
    require.resolve('expo-router/entry');
    return true;
  } catch (error) {
    console.log(`   Entry resolution failed: ${error.message}`);
    return false;
  }
});

// Summary
log('Verification Summary');
if (hasErrors) {
  console.log('\n❌ Verification FAILED - fix errors above before running npm start\n');
  process.exit(1);
} else {
  console.log('\n✅ All checks passed - app should start correctly\n');
  console.log('Run: npm start');
  process.exit(0);
}
