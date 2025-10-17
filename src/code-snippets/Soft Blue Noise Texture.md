# Soft Blue Noise Texture

Generates a fog-like blue noise texture with random brightness.

```lua
local size = 64
local max = size - 1
math.randomseed(os.time())

for x = 0, max do
    for y = 0, max do
        local c = math.random(50, 200)
        grid:set_pixel(x, y, c, c, 255)
    end
end
```
