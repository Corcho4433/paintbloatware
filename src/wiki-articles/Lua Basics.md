Welcome to **Lua Basics**! This guide will help you get started with Lua, the lightweight scripting language we use to create images in PaintBloatware.

## 1. Variables and Data Types

Lua is dynamically typed. You don’t need to declare types explicitly.

```lua
-- Numbers
x = 10
y = 3.5

-- Strings
name = "Pixel"

-- Booleans
isActive = true

-- Array
colors = {255, 128, 0}

-- Dictionary
pixel = {r = 255, g = 128, b = 0}

-- Access elements
print(colors[1])   -- 255
print(pixel.r)     -- 255

-- For loop
for i = 1, 5 do
  print(i)
end

-- While loop
count = 1
while count <= 5 do
  print(count)
  count = count + 1
end

```
