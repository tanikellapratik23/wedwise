const puppeteer = require('puppeteer');
const { exec } = require('child_process');
const path = require('path');

async function recordDemo() {
  console.log('Starting browser...');
  
  const browser = await puppeteer.launch({
    headless: false,
    args: [
      '--window-size=3840,2160', // 4K resolution
      '--start-maximized',
      '--disable-web-security',
      '--disable-features=IsolateOrigins,site-per-process'
    ]
  });

  const page = await browser.newPage();
  
  // Set 4K viewport
  await page.setViewport({
    width: 3840,
    height: 2160,
    deviceScaleFactor: 1
  });

  console.log('Loading demo page...');
  await page.goto('http://localhost:8080/demo-video2.html', {
    waitUntil: 'networkidle0'
  });

  console.log('\n=====================================================');
  console.log('RECORDING READY!');
  console.log('=====================================================');
  console.log('\nTo record in 4K:');
  console.log('1. Use QuickTime Player (Mac):');
  console.log('   - Open QuickTime Player');
  console.log('   - File > New Screen Recording');
  console.log('   - Select the browser window');
  console.log('   - Record for 45 seconds');
  console.log('   - Save as vivaha-demo-4k.mov');
  console.log('\n2. Or use OBS Studio (Mac/Windows/Linux):');
  console.log('   - Set canvas to 3840x2160');
  console.log('   - Add Window Capture source');
  console.log('   - Select Puppeteer browser window');
  console.log('   - Record for 45 seconds');
  console.log('   - File > Remux Recordings to MP4');
  console.log('\n3. Or use this script with ffmpeg:');
  console.log('   - Press Enter to start automatic recording...');
  console.log('=====================================================\n');

  // Wait for user input
  await new Promise(resolve => {
    process.stdin.once('data', resolve);
  });

  console.log('Recording will start in 3 seconds...');
  await new Promise(r => setTimeout(r, 3000));

  // Start ffmpeg screen recording (macOS)
  const outputPath = path.join(__dirname, 'vivaha-demo-4k.mp4');
  console.log(`Recording to: ${outputPath}`);
  
  const recordCommand = process.platform === 'darwin' 
    ? `ffmpeg -f avfoundation -framerate 30 -i "1:none" -t 47 -vf "scale=3840:2160" -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p "${outputPath}"`
    : `ffmpeg -video_size 3840x2160 -framerate 30 -f x11grab -i :0.0 -t 47 -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p "${outputPath}"`;

  const recording = exec(recordCommand);
  
  recording.stdout.on('data', (data) => console.log(data.toString()));
  recording.stderr.on('data', (data) => console.log(data.toString()));

  recording.on('close', async (code) => {
    console.log(`\n✅ Recording complete! Saved to: ${outputPath}`);
    await browser.close();
    process.exit(0);
  });

  // Keep alive
  await new Promise(() => {});
}

recordDemo().catch(console.error);
