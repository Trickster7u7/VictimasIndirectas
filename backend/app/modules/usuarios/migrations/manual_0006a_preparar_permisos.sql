-- ETAPA 5A (MANUAL): aplicar antes de desplegar las rutas nuevas.
-- Solo agrega permiso de detalle y prepara OPERADOR/ADMINISTRADOR.
-- NO abre todavía las tablas sensibles a CONSULTA.
-- No es una migración de Tortoise; ejecutar en pgAdmin tras respaldo.

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

    IF (
        SELECT COUNT(*) FROM roles
        WHERE codigo IN ('ADMINISTRADOR', 'OPERADOR', 'CONSULTA')
          AND activo = TRUE
    ) <> 3 THEN
        RAISE EXCEPTION 'Deben existir los tres roles activos';
    END IF;

    -- Impedir apertura anticipada de tablas y detalles a CONSULTA.
    IF EXISTS (
        SELECT 1 FROM rol_permisos rp
        JOIN roles r ON r.id = rp.rol_id
        JOIN permisos p ON p.id = rp.permiso_id
        WHERE r.codigo = 'CONSULTA'
          AND p.codigo IN (
              'registros.consultar', 'victimas.consultar',
              'registros.detalle.consultar', 'registros.sincronizar',
              'registros.exportar', 'victimas.gestionar'
          )
    ) THEN
        RAISE EXCEPTION 'CONSULTA ya tiene permisos que requieren revisión antes del despliegue';
    END IF;
END $$;

INSERT INTO permisos (codigo, nombre, modulo, descripcion)
VALUES (
    'registros.detalle.consultar',
    'Consultar detalle completo de registros',
    'Registros',
    'Ver los campos completos de un registro individual de víctimas'
)
ON CONFLICT (codigo) DO NOTHING;

-- ADMINISTRADOR conserva todos los permisos registrados.
INSERT INTO rol_permisos (rol_id, permiso_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permisos p
WHERE r.codigo = 'ADMINISTRADOR'
ON CONFLICT (rol_id, permiso_id) DO NOTHING;

-- OPERADOR gana permiso de detalle y sincronización.
INSERT INTO rol_permisos (rol_id, permiso_id)
SELECT r.id, p.id FROM roles r CROSS JOIN permisos p
WHERE r.codigo = 'OPERADOR'
  AND p.codigo IN ('registros.sincronizar', 'registros.detalle.consultar')
ON CONFLICT (rol_id, permiso_id) DO NOTHING;

DO $$
BEGIN
    IF (
        SELECT COUNT(*) FROM rol_permisos rp
        JOIN roles r ON r.id = rp.rol_id
        WHERE r.codigo = 'OPERADOR'
    ) <> 8 THEN
        RAISE EXCEPTION 'OPERADOR no tiene los ocho permisos esperados';
    END IF;

    IF (
        SELECT COUNT(*) FROM rol_permisos rp
        JOIN roles r ON r.id = rp.rol_id
        WHERE r.codigo = 'CONSULTA'
    ) <> 2 THEN
        RAISE EXCEPTION 'CONSULTA debe conservar solo sus dos permisos iniciales';
    END IF;

    IF (
        SELECT COUNT(*) FROM rol_permisos rp
        JOIN roles r ON r.id = rp.rol_id
        WHERE r.codigo = 'ADMINISTRADOR'
    ) <> (SELECT COUNT(*) FROM permisos) THEN
        RAISE EXCEPTION 'ADMINISTRADOR no tiene el catálogo completo';
    END IF;
END $$;

COMMIT;

SELECT r.codigo AS rol, COUNT(*) AS numero_permisos
FROM rol_permisos rp JOIN roles r ON r.id = rp.rol_id
WHERE r.codigo IN ('ADMINISTRADOR','OPERADOR','CONSULTA')
GROUP BY r.codigo ORDER BY r.codigo;
