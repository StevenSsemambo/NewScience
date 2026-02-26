#!/usr/bin/env python3
"""Generate MathQuest PWA icons"""
import os, struct, zlib, base64

def create_png(size, bg_color, fg_color):
    """Create a simple PNG icon programmatically"""
    w = h = size
    
    def color_to_rgb(hex_color):
        hex_color = hex_color.lstrip('#')
        return tuple(int(hex_color[i:i+2], 16) for i in (0, 2, 4))
    
    bg = color_to_rgb(bg_color)
    fg = color_to_rgb(fg_color)
    
    # Create pixel data - dark background with gold gradient circle
    pixels = []
    cx = cy = size // 2
    r = size // 2 - size // 10
    
    for y in range(h):
        row = []
        for x in range(w):
            dx = x - cx
            dy = y - cy
            dist = (dx**2 + dy**2) ** 0.5
            
            if dist < r * 0.85:
                # Inner area - gradient from gold to orange
                t = (dx + dy + size) / (size * 2)
                r_val = int(fg[0] * (1-t) + 255 * t)
                g_val = int(fg[1] * (1-t) + 140 * t)
                b_val = int(fg[2] * (1-t) + 0 * t)
                row.extend([min(255,r_val), min(255,g_val), min(255,b_val), 255])
            elif dist < r:
                # Ring
                row.extend([fg[0], fg[1], fg[2], 255])
            else:
                row.extend([bg[0], bg[1], bg[2], 255])
        pixels.append(row)
    
    # Add text pixels for "M" shape in center (simplified)
    m_size = size // 3
    mx = size // 2 - m_size // 2
    my = size // 2 - m_size // 2
    stroke = max(2, size // 20)
    
    for y in range(m_size):
        for x in range(m_size):
            px = mx + x
            py = my + y
            if 0 <= px < w and 0 <= py < h:
                # Draw M shape
                is_m = False
                # Left leg
                if x < stroke: is_m = True
                # Right leg  
                elif x >= m_size - stroke: is_m = True
                # Left diagonal (top)
                elif y < m_size // 2 and abs(x - y) < stroke: is_m = True
                # Right diagonal (top)
                elif y < m_size // 2 and abs(x - (m_size - 1 - y)) < stroke: is_m = True
                
                if is_m:
                    pixels[py][px*4:px*4+4] = [8, 8, 16, 255]  # dark color for M
    
    # Encode as PNG
    def png_chunk(chunk_type, data):
        chunk = chunk_type + data
        return struct.pack('>I', len(data)) + chunk + struct.pack('>I', zlib.crc32(chunk) & 0xffffffff)
    
    # IHDR
    ihdr_data = struct.pack('>IIBBBBB', w, h, 8, 2, 0, 0, 0)
    
    # IDAT - compress pixel data
    raw_data = b''
    for row in pixels:
        raw_data += b'\x00'  # filter type none
        raw_data += bytes(row)
    
    compressed = zlib.compress(raw_data, 9)
    
    # Assemble PNG
    png = b'\x89PNG\r\n\x1a\n'
    png += png_chunk(b'IHDR', ihdr_data)
    png += png_chunk(b'IDAT', compressed)
    png += png_chunk(b'IEND', b'')
    
    return png

os.makedirs('public/icons', exist_ok=True)

for size in [192, 512]:
    png_data = create_png(size, '#080810', '#FFD700')
    with open(f'public/icons/icon-{size}.png', 'wb') as f:
        f.write(png_data)
    print(f"Created icon-{size}.png")

print("Icons generated successfully!")
