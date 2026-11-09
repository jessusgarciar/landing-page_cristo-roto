import { existsSync } from 'node:fs';

if (!existsSync('build/index.html')) {
  console.error('❌ build/index.html not found. Run "astro build" first.');
  process.exit(1);
}

console.log('✅ Astro admin build ready.');
console.log('✅ Ready for "firebase deploy --only hosting"');
