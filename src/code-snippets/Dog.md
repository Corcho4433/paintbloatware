# Jake the dog

Draws jake the dog

```lua
-- Jake (estilizado) en 512x512 usando grid:set_pixel(x,y,r,g,b)
local size = 512
local max = size - 1

-- reemplaza esto por tu grid real; aquí hay una función de ejemplo que imprime coordenadas (no necesaria si ya tenés grid)
-- function grid:set_pixel(x, y, r, g, b) ... end

-- colores (valores 0-255)
local Y = {255, 204, 0}     -- amarillo Jake
local DARK_Y = {210, 165, 0} -- sombra/contorno
local WHITE = {255,255,255}
local BLACK = {0,0,0}
local PINK = {230, 120, 120} -- lengua o mejilla
local BG = {30,30,40}        -- fondo

-- Helper: set pixel seguro (comprueba límites)
local function setpx(x,y,c)
    if x >= 0 and x <= max and y >= 0 and y <= max then
        grid:set_pixel(x, y, c[1], c[2], c[3])
    end
end

-- Rellenar fondo
for x = 0, max do
    for y = 0, max do
        setpx(x,y,BG)
    end
end

-- Funciones geométricas
local function fill_circle(cx, cy, r, color)
    local r2 = r*r
    local x0 = math.floor(cx - r)
    local x1 = math.ceil(cx + r)
    for x = x0, x1 do
        local dx = x - cx
        local dx2 = dx*dx
        local h = math.sqrt(math.max(0, r2 - dx2))
        local y0 = math.floor(cy - h)
        local y1 = math.ceil(cy + h)
        for y = y0, y1 do
            setpx(x,y,color)
        end
    end
end

local function fill_ellipse(cx, cy, rx, ry, color)
    local x0 = math.floor(cx - rx)
    local x1 = math.ceil(cx + rx)
    for x = x0, x1 do
        local dx = (x - cx) / rx
        local dx2 = dx*dx
        if dx2 <= 1 then
            local h = math.sqrt(math.max(0, 1 - dx2)) * ry
            local y0 = math.floor(cy - h)
            local y1 = math.ceil(cy + h)
            for y = y0, y1 do
                setpx(x,y,color)
            end
        end
    end
end

-- Dibuja un arco de boca simple (stroke horizontal)
local function draw_arc(cx, cy, rx, ry, angle_from, angle_to, thickness, color)
    -- angle en radianes
    for a = angle_from, angle_to, 0.01 do
        for t = -thickness, thickness do
            local x = math.floor(cx + (rx + t) * math.cos(a))
            local y = math.floor(cy + (ry + t) * math.sin(a))
            setpx(x,y,color)
        end
    end
end

-- Coordenadas principales (centro y proporciones)
local cx, cy = size/2, size/2 - 20

-- CUERPO/BASE (un óvalo grande horizontal)
fill_ellipse(cx, cy + 60, 190, 120, Y)
-- Sombras/contorno suave inferior
fill_ellipse(cx, cy + 120, 170, 40, DARK_Y)

-- CABEZA (óvalo superior, un poco a la derecha para la pose típica de Jake)
fill_ellipse(cx - 10, cy - 40, 120, 110, Y)

-- OJO izquierdo (desde POV del dibujante: ojo derecho de Jake)
fill_circle(cx - 40, cy - 70, 28, WHITE)
-- Ojo derecho
fill_circle(cx + 30, cy - 70, 28, WHITE)

-- Pupilas (centradas con un pequeño offset)
fill_circle(cx - 40 + 4, cy - 70 + 4, 10, BLACK)
fill_circle(cx + 30 + 4, cy - 70 + 4, 10, BLACK)
-- Brillos en pupila
fill_circle(cx - 40 + 7, cy - 70 + 1, 3, WHITE)
fill_circle(cx + 30 + 7, cy - 70 + 1, 3, WHITE)

-- Hocico / nariz pequeña negra
fill_ellipse(cx - 5, cy - 35, 24, 16, BLACK)

-- Boca (arco)
draw_arc(cx + 10, cy - 15, 70, 40, math.rad(200), math.rad(340), 3, BLACK)
-- Lengua interior
fill_ellipse(cx + 25, cy - 5, 20, 10, PINK)

-- Mejillas sutiles (lucecitas)
fill_circle(cx - 80, cy - 40, 12, {255,210,120})
fill_circle(cx + 80, cy - 40, 10, {255,210,120})

-- Orejas / forma (Jake tiene orejas integradas, hacemos leves curvas)
fill_ellipse(cx - 140, cy - 30, 30, 18, Y)
fill_ellipse(cx + 140, cy - 10, 22, 14, Y)

-- Patitas (delante y atrás, simples óvalos)
fill_ellipse(cx - 120, cy + 140, 40, 24, Y) -- pata trasera izquierda
fill_ellipse(cx - 40, cy + 150, 44, 26, Y)  -- pata trasera derecha
fill_ellipse(cx + 80, cy + 140, 46, 28, Y)  -- pata delantera

-- Cola (curva con un óvalo ancho)
fill_ellipse(cx + 180, cy + 40, 40, 18, Y)
fill_ellipse(cx + 200, cy + 60, 28, 14, DARK_Y) -- sombra cola

-- Contornos suaves (líneas simples usando DARK_Y; opcional para darle dibujo)
-- contorno cabeza (borde)
for a = 0, 2*math.pi, 0.01 do
    local x = math.floor((cx - 10) + 120 * math.cos(a))
    local y = math.floor((cy - 40) + 110 * math.sin(a))
    setpx(x, y, DARK_Y)
end
-- contorno cuerpo
for a = 0, 2*math.pi, 0.01 do
    local x = math.floor(cx + 190 * math.cos(a))
    local y = math.floor((cy + 60) + 120 * math.sin(a))
    setpx(x, y, DARK_Y)
end

-- Pequeños retoques: ojo cerrado/arruga (línea)
for i = -6, 6 do
    setpx(math.floor(cx - 40 + i), math.floor(cy - 56 + math.abs(i)/2), DARK_Y)
end

-- Listo: el resultado será un Jake estilizado y reconocible en 512x512.
-- Si querés, puedo:
--  * Reducir a pixel-art más blocky (hacer un sprite pequeño y escalarlo).
--  * Convertir esto a una función que devuelva una tabla de colores (útil para exportar).
--  * Añadir a Finn o un fondo más detallado.
```