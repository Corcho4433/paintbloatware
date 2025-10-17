# Blue-Red Diagonal Gradient

Creates a diagonal gradient shifting from red to blue.

```lua
local size = 64
local max = size - 1
for x = 0, max do
    for y = 0, max do
        grid:set_pixel(x, y, x * 4, 0, y * 4)
    end
end
```
