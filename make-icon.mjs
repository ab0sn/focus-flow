import pngToIco from 'png-to-ico';
import fs from 'fs';

try {
  const buf = await pngToIco('build/icon.png');
  fs.writeFileSync('build/icon.ico', buf);
  console.log('✅ icon.ico created successfully!');
} catch (e) {
  console.error('❌ Error:', e.message);
  process.exit(1);
}
