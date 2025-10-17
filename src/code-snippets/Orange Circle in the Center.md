# Orange Circle in the Center

Draws a bright orange circle on a dark bluish background.

Snippet:

```lua
local size = 64
local max = size - 1
local cx, cy = max / 2, max / 2
local radius = 20

for x = 0, max do
    for y = 0, max do
        local dx, dy = x - cx, y - cy
        local dist = math.sqrt(dx*dx + dy*dy)
        if dist < radius then
            grid:set_pixel(x, y, 255, 150, 50)
        else
            grid:set_pixel(x, y, 15, 15, 25)
        end
    end
end
```
