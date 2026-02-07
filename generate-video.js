const puppeteer = require('puppeteer');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

async function generateVideo() {
    console.log('🎬 Starting video generation...');
    
    // Launch browser
    const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 676 });
    
    // Navigate to the demo page
    const demoPath = path.join(__dirname, 'demo-video.html');
    await page.goto(`file://${demoPath}`, { waitUntil: 'networkidle0' });
    
    console.log('📸 Recording frames...');
    
    // Record for 27 seconds (video duration + 0.5s buffer)
    const fps = 30;
    const duration = 27; // seconds
    const totalFrames = fps * duration;
    const frameDir = path.join(__dirname, 'frames');
    
    // Create frames directory
    if (!fs.existsSync(frameDir)) {
        fs.mkdirSync(frameDir);
    }
    
    // Capture frames
    for (let i = 0; i < totalFrames; i++) {
        const framePath = path.join(frameDir, `frame-${String(i).padStart(5, '0')}.png`);
        await page.screenshot({ path: framePath });
        await new Promise(resolve => setTimeout(resolve, 1000 / fps));
        
        if (i % 30 === 0) {
            console.log(`  Captured ${i}/${totalFrames} frames...`);
        }
    }
    
    await browser.close();
    
    console.log('🎥 Converting frames to video...');
    
    // Use ffmpeg to convert frames to video
    const ffmpeg = spawn('ffmpeg', [
        '-framerate', String(fps),
        '-i', path.join(frameDir, 'frame-%05d.png'),
        '-c:v', 'libx264',
        '-pix_fmt', 'yuv420p',
        '-crf', '23',
        '-y',
        path.join(__dirname, 'vivaha-demo.mp4')
    ]);
    
    ffmpeg.stdout.on('data', (data) => {
        console.log(`  ${data}`);
    });
    
    ffmpeg.stderr.on('data', (data) => {
        console.log(`  ${data}`);
    });
    
    ffmpeg.on('close', (code) => {
        if (code === 0) {
            console.log('✅ Video generated successfully: vivaha-demo.mp4');
            
            // Clean up frames
            console.log('🧹 Cleaning up frames...');
            fs.readdirSync(frameDir).forEach(file => {
                fs.unlinkSync(path.join(frameDir, file));
            });
            fs.rmdirSync(frameDir);
            console.log('✨ Done!');
        } else {
            console.error(`❌ ffmpeg exited with code ${code}`);
        }
    });
}

generateVideo().catch(console.error);
