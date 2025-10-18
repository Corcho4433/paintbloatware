# Sine Waves

Generates colorful sine wave patterns across the grid.

```lua
local size = 64
local max = size - 1
local cx, cy = max / 2, max / 2
for x = 0, max do
    for y = 0, max do
        local value = math.sin(x / 4) + math.sin(y / 4) + math.sin((x + y) / 6)
        local c = (value + 3) / 6 * 255
        grid:set_pixel(x, y, c, 255 - c, 200)
    end
end
```