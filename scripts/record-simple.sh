#!/bin/bash

# Simple screen recording script for macOS
# Records the active window in 4K quality

echo "======================================"
echo "Vivaha Demo 4K Screen Recorder"
echo "======================================"
echo ""
echo "Make sure:"
echo "1. Browser is open with demo-video2.html"
echo "2. Browser window is maximized"
echo "3. Demo has started playing"
echo ""
echo "Recording will start in 5 seconds..."
echo "Recording duration: 47 seconds"
echo ""
sleep 5

echo "🔴 RECORDING NOW..."

# Record screen with ffmpeg (requires ffmpeg installed)
ffmpeg -f avfoundation \
  -framerate 30 \
  -video_size 3840x2160 \
  -i "1:none" \
  -t 47 \
  -c:v libx264 \
  -preset slow \
  -crf 18 \
  -pix_fmt yuv420p \
  -y \
  vivaha-demo-4k.mp4

echo ""
echo "✅ Recording complete!"
echo "📁 Saved as: vivaha-demo-4k.mp4"
echo ""
echo "To convert to different format:"
echo "ffmpeg -i vivaha-demo-4k.mp4 -vf scale=1920:1080 vivaha-demo-1080p.mp4"
