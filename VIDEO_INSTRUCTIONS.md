# Vivaha Demo Video Generation

## Quick Start

### Option 1: Record from HTML (Recommended)

1. Open `demo-video.html` in Chrome/Firefox:
   ```bash
   open demo-video.html
   ```

2. Press F11 for fullscreen

3. Use screen recording software:
   - **macOS**: QuickTime Player (File > New Screen Recording) or Cmd+Shift+5
   - **Windows**: Xbox Game Bar (Win+G) or OBS Studio
   - **Linux**: OBS Studio or SimpleScreenRecorder

4. Record for 30 seconds (video auto-loops)

5. Save as `vivaha-demo.mp4`

### Option 2: Use FFmpeg to Convert (Advanced)

If you want to automate:

```bash
# Install FFmpeg
brew install ffmpeg  # macOS
# sudo apt install ffmpeg  # Linux

# Record browser with FFmpeg (requires browser automation)
# Or use Puppeteer script (see below)
```

### Option 3: Puppeteer Automation (Best Quality)

```bash
cd /Users/pratiktanikella/Vivaha_repo
npm install puppeteer puppeteer-screen-recorder

node record-demo.js
```

## What's Included

**7 Scenes - 30 seconds total:**

1. **Hero** (4s) - "Two Cultures, One Celebration"
2. **Dashboard** (4s) - Feature overview with icons
3. **Budget** (4s) - Smart budgeting & Vivaha Split
4. **Cultural** (4s) - Multi-faith ceremony support  
5. **VivahaPost** (4s) - Community features
6. **Share** (4s) - One link, auto-updates
7. **CTA** (6s) - Logo + website

## Features

- ✅ Smooth scene transitions (0.5s crossfade)
- ✅ Animated text (scale, slide, fade)
- ✅ Brand-accurate gradients
- ✅ 1920x1080 HD resolution
- ✅ Auto-looping for easy recording
- ✅ No dependencies (pure HTML/CSS/JS)

## Tips for Best Results

- Use Chrome/Firefox for best CSS support
- Record at 60fps if possible
- Ensure 1920x1080 window size
- Disable mouse cursor (done automatically)
- Add background music in post-production (optional)

## Post-Production (Optional)

Add music or compress:

```bash
# Add background music
ffmpeg -i vivaha-demo.mp4 -i background-music.mp3 -c:v copy -c:a aac -map 0:v:0 -map 1:a:0 -shortest vivaha-demo-final.mp4

# Compress for web
ffmpeg -i vivaha-demo.mp4 -vcodec libx264 -crf 28 vivaha-demo-compressed.mp4
```

## Ready to Use

The HTML file is self-contained and ready to record. Just open it in a browser and start recording!
