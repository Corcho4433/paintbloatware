# Draw cirle

Draws a circle starting at the midle of the screen, variables hange the radious, origin point and pixel color.
apagalolo.

Snippet:
-- Fill diagonal
for i = 0, 31 do
grid:set_pixel(i, i, 255, 0, 0)
end

-- Clear grid
for x = 0, 31 do
for y = 0, 31 do
grid:set_pixel(x, y, 0, 0, 0)
end
end

-- Checker pattern
for x = 0, 31 do
for y = 0, 31 do
if (x + y) % 2 == 0 then
grid:set_pixel(x, y, 255, 255, 255)
else
grid:set_pixel(x, y, 0, 0, 0)
end
end
end
