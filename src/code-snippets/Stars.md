# Stars (16 Frames)

Creates a smooth starfield animation with 16 frames using a function.


```lua
function create_star_frame(frame_index, num_stars, min_brightness, max_brightness)
    if frame_index > 0 then
        grid:create_frame()
    end
    grid:switch_frame(frame_index)
    grid:set_area(0, 0, 256, 256, 0, 0, 20)
    for i = 1, num_stars do
        local x = math.random(0, 255)
        local y = math.random(0, 255)
        local brightness = math.random(min_brightness, max_brightness)
        grid:set_pixel(x, y, brightness, brightness, brightness)
    end
end

-- Create 16 frames with varying brightness
for frame = 0, 15 do
    local brightness_cycle = math.sin(frame * math.pi / 8) * 75 + 180
    local min_b = math.max(0, math.floor(brightness_cycle - 50))
    local max_b = math.min(255, math.floor(brightness_cycle + 50))
    create_star_frame(frame, 200, min_b, max_b)
end

grid:switch_frame(0)
```