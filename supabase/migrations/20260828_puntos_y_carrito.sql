-- ============================================================
-- Migración: puntos de usuario + checkout de carrito
-- Fecha: 2026-08-28
--
-- Corrige RLS faltante en perfiles/ventas/detalle_venta (estaban
-- con RLS activado pero SIN políticas, por lo que login/registro
-- no podían leer ni crear el perfil) y agrega:
--   1) columna `puntos` en perfiles
--   2) políticas RLS para que cada usuario vea/cree su propio perfil
--      y su propio historial de compras
--   3) función `checkout_cart` (SECURITY DEFINER) que crea la venta,
--      el detalle y otorga puntos de forma atómica y segura:
--      el precio se toma siempre de la tabla `libros`, nunca del
--      cliente, y los puntos solo se pueden ganar a través de esta
--      función (no hay policy de UPDATE directa sobre perfiles.puntos).
-- ============================================================

ALTER TABLE public.perfiles
  ADD COLUMN IF NOT EXISTS puntos integer NOT NULL DEFAULT 0;

-- --- perfiles ---
CREATE POLICY "Los usuarios pueden ver su propio perfil"
  ON public.perfiles FOR SELECT
  TO authenticated
  USING (id = auth.uid());

CREATE POLICY "Los usuarios pueden crear su propio perfil"
  ON public.perfiles FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid());

-- --- ventas / detalle_venta (historial de compras propio) ---
CREATE POLICY "Los usuarios ven sus propias ventas"
  ON public.ventas FOR SELECT
  TO authenticated
  USING (usuario_id = auth.uid());

CREATE POLICY "Los usuarios ven el detalle de sus propias ventas"
  ON public.detalle_venta FOR SELECT
  TO authenticated
  USING (venta_id IN (SELECT id FROM public.ventas WHERE usuario_id = auth.uid()));

-- --- checkout_cart: crea venta + detalle + otorga puntos de forma atómica ---
CREATE OR REPLACE FUNCTION public.checkout_cart(p_items jsonb)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_total integer := 0;
  v_venta_id bigint;
  v_item jsonb;
  v_libro_id bigint;
  v_cantidad integer;
  v_precio integer;
  v_puntos_ganados integer;
  v_puntos_totales integer;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Debes iniciar sesión para comprar.';
  END IF;

  IF p_items IS NULL OR jsonb_array_length(p_items) = 0 THEN
    RAISE EXCEPTION 'El carrito está vacío.';
  END IF;

  INSERT INTO ventas (usuario_id, total, estado)
  VALUES (v_user_id, 0, 'PENDIENTE')
  RETURNING id INTO v_venta_id;

  FOR v_item IN SELECT * FROM jsonb_array_elements(p_items)
  LOOP
    v_libro_id := (v_item->>'libro_id')::bigint;
    v_cantidad := (v_item->>'cantidad')::integer;

    IF v_cantidad IS NULL OR v_cantidad <= 0 THEN
      RAISE EXCEPTION 'Cantidad inválida para el libro %', v_libro_id;
    END IF;

    SELECT precio INTO v_precio FROM libros WHERE id = v_libro_id;
    IF v_precio IS NULL THEN
      RAISE EXCEPTION 'Libro % no encontrado', v_libro_id;
    END IF;

    INSERT INTO detalle_venta (venta_id, libro_id, cantidad, precio_unitario)
    VALUES (v_venta_id, v_libro_id, v_cantidad, v_precio);

    v_total := v_total + (v_precio * v_cantidad);
  END LOOP;

  -- 1 punto por cada 1.000 COP gastados
  v_puntos_ganados := floor(v_total / 1000);

  UPDATE ventas SET total = v_total, estado = 'COMPLETADA' WHERE id = v_venta_id;

  UPDATE perfiles SET puntos = puntos + v_puntos_ganados
  WHERE id = v_user_id
  RETURNING puntos INTO v_puntos_totales;

  RETURN json_build_object(
    'venta_id', v_venta_id,
    'total', v_total,
    'puntos_ganados', v_puntos_ganados,
    'puntos_totales', v_puntos_totales
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.checkout_cart(jsonb) TO authenticated;
