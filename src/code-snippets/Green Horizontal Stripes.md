# Green Horizontal Stripes

Creates alternating green stripes across the image.

Snippet:

```lua
local size = 64
local max = size - 1
for x = 0, max do
    for y = 0, max do
        local g = (y % 6 < 3) and 200 or 30
        grid:set_pixel(x, y, 0, g, 0)
    end
end
```
