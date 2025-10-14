# Blue-Red Diagonal Gradient

Creates a diagonal gradient shifting from red to blue.

Snippet:

```lua
local max = 31
for x = 0, max do
    for y = 0, max do
        grid:set_pixel(x, y, x * 8, 0, y * 8)
    end
end
```
