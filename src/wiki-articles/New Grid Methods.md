The `Grid` object provides methods for manipulating pixels and frames in Lua scripts. It is automatically available as a global variable named **`grid`** inside your Lua code.

## Overview

Each `Grid` represents a square pixel canvas with multiple **frames**. Frames can be switched, created, and individually modified pixel-by-pixel.

## Methods

### grid:set_pixel(x, y, r, g, b)

Sets the pixel at `(x, y)` to the specified **RGB** color. The alpha value is automatically set to `255` (fully opaque).

**Parameters:**

- `x` (integer) - X-coordinate of the pixel
- `y` (integer) - Y-coordinate of the pixel
- `r` (integer) - Red component (0–255)
- `g` (integer) - Green component (0–255)
- `b` (integer) - Blue component (0–255)

**Example:**
```lua
grid:set_pixel(10, 10, 255, 0, 0)  -- Draws a red pixel
```



### grid:set_pixel_rgba(x, y, r, g, b, a)

Sets the pixel at `(x, y)` to the specified **RGBA** color.

**Parameters:**

- `x` (integer) - X-coordinate of the pixel
- `y` (integer) - Y-coordinate of the pixel
- `r` (integer) - Red component (0–255)
- `g` (integer) - Green component (0–255)
- `b` (integer) - Blue component (0–255)
- `a` (integer) - Alpha (opacity) value (0–255)

**Example:**
```lua
grid:set_pixel_rgba(5, 5, 0, 255, 0, 128)  -- Semi-transparent green pixel
```



## grid:set_area(left, top, width, height, r, g, b)

Fills a rectangular area of the grid with a solid color.

**Parameters:**

- `left` (integer) - X position of the top-left corner
- `top` (integer) - Y position of the top-left corner
- `width` (integer) - Rectangle width
- `height` (integer) - Rectangle height
- `r` (integer) - Red component (0–255)
- `g` (integer) - Green component (0–255)
- `b` (integer) - Blue component (0–255)

**Example:**
```lua
grid:set_area(0, 0, 64, 64, 0, 0, 255)  -- Fill area with blue
```



## grid:create_frame()

Creates a new empty frame and appends it to the grid's frame list.

**Example:**
```lua
grid:create_frame()
```



## grid:switch_frame(frame_index)

Switches the currently active frame.

**Parameters:**

- `frame_index` (integer) - Index of the frame to switch to (starting from 0)

**Example:**
```lua
grid:switch_frame(1)
```



### Notes

- All pixel operations affect **only the current frame**.
- Coordinates outside the grid bounds are **ignored**.
- The grid is initialized with one frame by default.