# Water Wave Animation (Improved)
Creates smoother water with gentle waves and reflections across 16 frames.
```lua
function create_water_frame(frame_index)
    if frame_index > 0 then
        grid:create_frame()
    end
    grid:switch_frame(frame_index)
    
    local time = frame_index / 15
    
    -- Draw water
    for x = 0, 255 do
        for y = 0, 255 do
            -- Gentler wave patterns
            local wave1 = math.sin(x * 0.02 + time * math.pi * 2) * 5
            local wave2 = math.sin(x * 0.03 - time * math.pi * 1.5 + y * 0.01) * 3
            
            local wave_offset = wave1 + wave2
            local adjusted_y = y + wave_offset
            
            -- Smoother depth gradient
            local depth_factor = adjusted_y / 256
            depth_factor = math.max(0, math.min(1, depth_factor))
            
            -- More natural water colors
            local r = math.floor(15 + depth_factor * 25)
            local g = math.floor(100 + depth_factor * 40)
            local b = math.floor(180 + depth_factor * 30)
            
            -- Subtle light reflection near surface
            if y < 80 then
                local surface_factor = (80 - y) / 80
                local shimmer = math.sin(x * 0.1 + time * math.pi * 3) * 0.5 + 0.5
                local light_add = surface_factor * shimmer * 40
                
                r = math.floor(r + light_add)
                g = math.floor(g + light_add)
                b = math.floor(b + light_add * 0.5)
            end
            
            -- Clamp values
            r = math.max(0, math.min(255, r))
            g = math.max(0, math.min(255, g))
            b = math.max(0, math.min(255, b))
            
            grid:set_pixel(x, y, r, g, b)
        end
    end
end

-- Create 16 frames of water animation
for frame = 0, 15 do
    create_water_frame(frame)
end

grid:switch_frame(0)
```