# Checkerboard Pattern

Draws a classic checkerboard pattern using alternating blocks.

```lua
local size = 64
local max = size - 1
local size_block = 8
for x = 0, max do
    for y = 0, max do
        local c = ((x // size_block + y // size_block) % 2 == 0) and 255 or 50
        grid:set_pixel(x, y, c, c, c)
    end
end
```