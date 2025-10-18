# Color Gradient

Creates a smooth color gradient from corner to corner.

```lua
local size = 64
local max = size - 1
for x = 0, max do
    for y = 0, max do
        local r = (x / max) * 255
        local g = (y / max) * 255
        local b = 255 - ((x + y) / (2 * max)) * 255
        grid:set_pixel(x, y, r, g, b)
    end
end
```