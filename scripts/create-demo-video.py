#!/usr/bin/env python3
"""
Vivaha Product Demo Video Generator
Creates a 30-second promotional video showcasing key features
"""

from moviepy.editor import *
from moviepy.video.tools.segmenting import findObjects
import numpy as np

# Video settings
WIDTH, HEIGHT = 1920, 1080
FPS = 30
DURATION = 30

# Vivaha brand colors
COLORS = {
    'primary': (139, 92, 246),      # Purple
    'pink': (236, 72, 153),         # Pink
    'gradient_start': (168, 85, 247),
    'gradient_end': (236, 72, 153),
    'white': (255, 255, 255),
    'dark': (17, 24, 39),
    'accent': (59, 130, 246)
}

def create_gradient_background(duration, color1, color2):
    """Create a gradient background clip"""
    def make_frame(t):
        y = np.linspace(0, 1, HEIGHT)[:, None]
        gradient = np.zeros((HEIGHT, WIDTH, 3))
        gradient[:, :, 0] = color1[0] + (color2[0] - color1[0]) * y
        gradient[:, :, 1] = color1[1] + (color2[1] - color1[1]) * y
        gradient[:, :, 2] = color1[2] + (color2[2] - color1[2]) * y
        return gradient.astype('uint8')
    
    return VideoClip(make_frame, duration=duration)

def create_text_clip(text, fontsize=80, color='white', duration=3, position='center', 
                     font='Arial-Bold', stroke_color=None, stroke_width=0):
    """Create an animated text clip with entrance effect"""
    txt = TextClip(text, fontsize=fontsize, color=color, font=font,
                   stroke_color=stroke_color, stroke_width=stroke_width)
    
    # Scale up animation (zoom in)
    txt = txt.set_duration(duration).set_position(position)
    txt = txt.resize(lambda t: min(1.0, 0.5 + 0.5 * t / 0.3))
    txt = txt.crossfadein(0.3)
    
    return txt

def create_scene_1():
    """Scene 1: Hero - Two Cultures, One Celebration"""
    bg = create_gradient_background(4, COLORS['gradient_start'], COLORS['gradient_end'])
    
    # Main text with zoom effect
    text1 = create_text_clip("Two Cultures", fontsize=120, duration=4, 
                             position=('center', 350), stroke_color='black', stroke_width=3)
    text2 = create_text_clip("One Celebration", fontsize=120, duration=4,
                             position=('center', 500), stroke_color='black', stroke_width=3)
    
    # Subtext
    subtext = create_text_clip("Vivaha", fontsize=90, duration=4,
                              position=('center', 700), color='white')
    
    scene = CompositeVideoClip([bg, text1.set_start(0.2), text2.set_start(0.5), subtext.set_start(1.0)])
    return scene.set_duration(4)

def create_scene_2():
    """Scene 2: Dashboard Overview"""
    bg = ColorClip(size=(WIDTH, HEIGHT), color=COLORS['white'], duration=4)
    
    # Dashboard mockup (simplified)
    title = create_text_clip("One Dashboard", fontsize=100, color='#111827', duration=4,
                            position=('center', 200))
    
    features = [
        ("📊 Budget Tracking", 400),
        ("👥 Guest Management", 500),
        ("💒 Ceremony Planning", 600),
        ("🎵 Music & Sound", 700),
    ]
    
    feature_clips = []
    for i, (feature, y_pos) in enumerate(features):
        clip = create_text_clip(feature, fontsize=60, color='#374151', duration=4,
                               position=(WIDTH//2 - 300, y_pos))
        feature_clips.append(clip.set_start(0.3 * (i + 1)))
    
    scene = CompositeVideoClip([bg, title.set_start(0.2)] + feature_clips)
    return scene.set_duration(4)

def create_scene_3():
    """Scene 3: Budget & Split"""
    bg = create_gradient_background(4, (59, 130, 246), (147, 51, 234))
    
    title = create_text_clip("Smart Budgeting", fontsize=100, duration=4,
                            position=('center', 250), stroke_color='black', stroke_width=2)
    
    subtitle = create_text_clip("Split costs fairly", fontsize=70, duration=4,
                                position=('center', 450))
    
    price = create_text_clip("Vivaha Split™", fontsize=80, duration=4,
                            position=('center', 600), color='#FCD34D')
    
    scene = CompositeVideoClip([bg, title.set_start(0.2), subtitle.set_start(0.5), price.set_start(0.8)])
    return scene.set_duration(4)

def create_scene_4():
    """Scene 4: Cultural Planning"""
    bg = create_gradient_background(4, (236, 72, 153), (239, 68, 68))
    
    title = create_text_clip("Honor Both Traditions", fontsize=90, duration=4,
                            position=('center', 300), stroke_color='black', stroke_width=2)
    
    features = [
        "🕉️ Multi-faith ceremonies",
        "📿 Custom rituals",
        "🌍 Cultural guidance"
    ]
    
    feature_clips = []
    for i, feature in enumerate(features):
        clip = create_text_clip(feature, fontsize=65, duration=4,
                               position=('center', 500 + i * 100))
        feature_clips.append(clip.set_start(0.3 * (i + 1)))
    
    scene = CompositeVideoClip([bg, title.set_start(0.2)] + feature_clips)
    return scene.set_duration(4)

def create_scene_5():
    """Scene 5: VivahaPost Community"""
    bg = ColorClip(size=(WIDTH, HEIGHT), color=(249, 250, 251), duration=4)
    
    title = create_text_clip("VivahaPost", fontsize=110, color='#9333EA', duration=4,
                            position=('center', 250))
    
    subtitle = create_text_clip("Real couples, real stories", fontsize=70, color='#6B7280', duration=4,
                                position=('center', 450))
    
    stats = create_text_clip("💕 Share your journey", fontsize=60, color='#EC4899', duration=4,
                            position=('center', 650))
    
    scene = CompositeVideoClip([bg, title.set_start(0.2), subtitle.set_start(0.5), stats.set_start(0.8)])
    return scene.set_duration(4)

def create_scene_6():
    """Scene 6: Share Everything"""
    bg = create_gradient_background(4, (16, 185, 129), (5, 150, 105))
    
    title = create_text_clip("One Shareable Link", fontsize=100, duration=4,
                            position=('center', 350), stroke_color='black', stroke_width=2)
    
    subtitle = create_text_clip("Auto-updates for everyone", fontsize=70, duration=4,
                                position=('center', 500))
    
    scene = CompositeVideoClip([bg, title.set_start(0.2), subtitle.set_start(0.6)])
    return scene.set_duration(4)

def create_scene_7():
    """Scene 7: CTA"""
    bg = create_gradient_background(6, COLORS['gradient_start'], COLORS['gradient_end'])
    
    logo = create_text_clip("Vivaha", fontsize=140, duration=6,
                           position=('center', 350), stroke_color='black', stroke_width=4)
    
    tagline = create_text_clip("Plan your perfect celebration", fontsize=70, duration=6,
                               position=('center', 550))
    
    cta = create_text_clip("vivahaplan.com", fontsize=80, duration=6,
                          position=('center', 700), color='#FCD34D')
    
    scene = CompositeVideoClip([bg, logo.set_start(0.3), tagline.set_start(0.7), cta.set_start(1.2)])
    return scene.set_duration(6)

def create_demo_video():
    """Compile all scenes into final video"""
    print("🎬 Creating Vivaha demo video...")
    
    scenes = [
        create_scene_1(),
        create_scene_2(),
        create_scene_3(),
        create_scene_4(),
        create_scene_5(),
        create_scene_6(),
        create_scene_7()
    ]
    
    # Concatenate scenes with crossfade transitions
    final_clips = []
    for i, scene in enumerate(scenes):
        if i > 0:
            scene = scene.crossfadein(0.3)
        final_clips.append(scene)
    
    final_video = concatenate_videoclips(final_clips, method="compose")
    
    # Add background music (if available)
    # audio = AudioFileClip("background_music.mp3").set_duration(final_video.duration)
    # final_video = final_video.set_audio(audio)
    
    print("💾 Rendering video...")
    output_path = "/Users/pratiktanikella/Vivaha_repo/vivaha-demo.mp4"
    final_video.write_videofile(
        output_path,
        fps=FPS,
        codec='libx264',
        audio_codec='aac',
        temp_audiofile='temp-audio.m4a',
        remove_temp=True,
        preset='medium',
        threads=4
    )
    
    print(f"✅ Video created successfully: {output_path}")
    print(f"📊 Duration: {final_video.duration:.1f} seconds")
    print(f"📐 Resolution: {WIDTH}x{HEIGHT}")

if __name__ == "__main__":
    create_demo_video()
