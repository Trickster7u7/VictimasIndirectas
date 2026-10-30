-- ETAPA 5B (MANUAL): ejecutar SOLO después de desplegar el backend nuevo,
-- y de confirmar que /historico/{id_registro} ya exige
-- el permiso registros.detalle.consultar en TODOS los entornos.
-- No es una migración Tortoise. Requiere respaldo y comprobación previa.

BEGIN;

DO $$
BEGIN
    IF current_database() <> 'vi_test' THEN
        RAISE EXCEPTION 'Base incorrecta: esperado vi_test';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM usuarios u
        JOIN usuario_roles ur ON ur.usuario_id = u.id
        JOIN roles r ON r.id = ur.rol_id
        WHERE u.id = 1 AND u.estado = 'ACTIVO'
          AND r.codigo = 'ADMINISTRADOR' AND r.activo = TRUE
    ) THEN
        RAISE EXCEPTION 'No se confirmó administrador activo con rol directo';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM permisos WHERE codigo = 'registros.detalle.consultar'
    ) THEN
        RAISE EXCEPTION 'Falta aplicar la etapa 5A';
    END IF;

    IF (
        SELECT COUNT(*) FROM rol_permisos rp
        JOIN roles r ON r.id = rp.rol_id
        WHERE r.codigo = 'CONSULTA'
    ) <> 2 THEN
        RAISE EXCEPTION 'CONSULTA no conserva los dos permisos iniciales; revisar';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM roles WHERE codigo = 'CONSULTA' AND activo = TRUE
    ) THEN
        RAISE EXCEPTION 'El rol CONSULTA está inactivo o no existe';
    END IF;
END $$;

INSERT INTO rol_permisos (rol_id, permiso_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permisos p
WHERE r.codigo = 'CONSULTA'
  AND p.codigo IN ('registros.consultar', 'victimas.consultar')
ON CONFLICT (rol_id, permiso_id) DO NOTHING;

DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM rol_permisos rp
        JOIN roles r ON r.id = rp.rol_id
        JOIN permisos p ON p.id = rp.permiso_id
        WHERE r.codigo = 'CONSULTA'
          AND p.codigo NOT IN (
              'estadisticas.consultar', 'registros.resumen.consultar',
              'registros.consultar', 'victimas.consultar'
          )
    ) OR (
        SELECT COUNT(*) FROM rol_permisos rp
        JOIN roles r ON r.id = rp.rol_id
        WHERE r.codigo = 'CONSULTA'
    ) <> 4 THEN
        RAISE EXCEPTION 'CONSULTA no tiene exactamente sus cuatro permisos previstos';
    END IF;
END $$;

COMMIT;

SELECT r.codigo AS rol, p.codigo AS permiso
FROM roles r JOIN rol_permisos rp ON rp.rol_id = r.id
JOIN permisos p ON p.id = rp.permiso_id
WHERE r.codigo = 'CONSULTA'
ORDER BY p.codigo;
