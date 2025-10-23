# Beating Heart Animation

Creates a pulsating heart effect across three frames.

```lua
-- Frame 0: Corazón pequeño
grid:switch_frame(0)
grid:set_area(0, 0, 16, 16, 0, 0, 0)
local heart1 = {{6,4},{7,4},{9,4},{10,4},{5,5},{11,5},{5,6},{11,6},{5,7},{11,7},{6,8},{10,8},{7,9},{9,9},{8,10}}
for _, pos in ipairs(heart1) do
    grid:set_pixel(pos[1], pos[2], 255, 50, 100)
end

-- Frame 1: Corazón grande
grid:create_frame()
grid:switch_frame(1)
grid:set_area(0, 0, 16, 16, 0, 0, 0)
local heart2 = {{5,3},{6,3},{7,3},{9,3},{10,3},{11,3},{4,4},{8,4},{12,4},{4,5},{12,5},{4,6},{12,6},{4,7},{12,7},{4,8},{12,8},{5,9},{11,9},{6,10},{10,10},{7,11},{9,11},{8,12}}
for _, pos in ipairs(heart2) do
    grid:set_pixel(pos[1], pos[2], 255, 0, 80)
end

-- Frame 2: Corazón mediano
grid:create_frame()
grid:switch_frame(2)
grid:set_area(0, 0, 16, 16, 0, 0, 0)
local heart3 = {{5,4},{6,4},{7,4},{9,4},{10,4},{11,4},{4,5},{12,5},{4,6},{12,6},{4,7},{12,7},{5,8},{11,8},{6,9},{10,9},{7,10},{9,10},{8,11}}
for _, pos in ipairs(heart3) do
    grid:set_pixel(pos[1], pos[2], 255, 20, 90)
end

grid:switch_frame(0)
```