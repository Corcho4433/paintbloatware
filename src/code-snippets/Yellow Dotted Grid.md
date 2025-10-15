# Yellow Dotted Grid

Draws yellow dots evenly spaced on a dark background.

Snippet:

```lua
local max = 31
for x = 0, max do
    for y = 0, max do
        if (x % 4 == 0 and y % 4 == 0) then
            grid:set_pixel(x, y, 255, 255, 100)
        else
            grid:set_pixel(x, y, 10, 10, 10)
        end
    end
end
```
