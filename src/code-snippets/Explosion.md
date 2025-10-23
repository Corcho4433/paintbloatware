# Explosion Animation
Creates a realistic explosion effect with 16 frames showing expansion, brightness, and particle dispersion.
```lua
function create_explosion_frame(frame_index)
    if frame_index > 0 then
        grid:create_frame()
    end
    grid:switch_frame(frame_index)
    grid:set_area(0, 0, 256, 256, 0, 0, 0)
    
    local center_x = 128
    local center_y = 128
    local progress = frame_index / 15
    
    -- Explosion radius grows over time
    local max_radius = 20 + progress * 100
    
    -- Core brightness decreases over time
    local core_brightness = math.floor((1 - progress) * 255)
    
    -- Draw explosion particles
    for i = 1, 500 do
        local angle = math.random() * math.pi * 2
        local distance = math.random() * max_radius
        
        -- Particles move outward over time
        local x = math.floor(center_x + math.cos(angle) * distance)
        local y = math.floor(center_y + math.sin(angle) * distance)
        
        if x >= 0 and x < 256 and y >= 0 and y < 256 then
            -- Distance from center affects color
            local dist_factor = distance / max_radius
            
            -- Hot core (white/yellow) to cooler edges (red/orange)
            local r, g, b
            if dist_factor < 0.3 then
                -- White hot center
                r = 255
                g = 255
                b = math.floor(200 + (1 - dist_factor) * 55)
            elseif dist_factor < 0.6 then
                -- Yellow/orange
                r = 255
                g = math.floor(200 - dist_factor * 100)
                b = math.floor(50 - dist_factor * 50)
            else
                -- Red/dark edges
                r = math.floor(255 - (dist_factor - 0.6) * 400)
                g = math.floor(50 - (dist_factor - 0.6) * 100)
                b = 0
            end
            
            -- Fade out over time
            local fade = 1 - progress * 0.7
            r = math.max(0, math.min(255, math.floor(r * fade)))
            g = math.max(0, math.min(255, math.floor(g * fade)))
            b = math.max(0, math.min(255, math.floor(b * fade)))
            
            grid:set_pixel(x, y, r, g, b)
        end
    end
    
    -- Add bright core in early frames
    if frame_index < 8 then
        local core_size = math.floor(10 - progress * 8)
        for dx = -core_size, core_size do
            for dy = -core_size, core_size do
                local dist = math.sqrt(dx*dx + dy*dy)
                if dist <= core_size then
                    local cx = center_x + dx
                    local cy = center_y + dy
                    if cx >= 0 and cx < 256 and cy >= 0 and cy < 256 then
                        local intensity = (1 - dist/core_size) * core_brightness
                        grid:set_pixel(cx, cy, 255, math.floor(intensity), math.floor(intensity * 0.5))
                    end
                end
            end
        end
    end
end

-- Create 16 frames of explosion
for frame = 0, 15 do
    create_explosion_frame(frame)
end

grid:switch_frame(0)
```