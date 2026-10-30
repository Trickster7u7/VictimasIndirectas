-- CAMBIO DE DATOS, NO DE ESQUEMA. NO es una migracion Tortoise ejecutable.
-- Ejecutar MANUALMENTE en pgAdmin SOLO despues de revisar los usuarios/grupos
-- asignados al rol VALIDADOR y de contar con respaldo reciente de vi_test.
-- NO llamar sembrar_catalogo_inicial() antes de aplicar esta actualizacion.
-- Se conserva la fila VALIDADOR inactiva y se renombra CAPTURISTA -> OPERADOR,
-- preservando sus claves foraneas. No se modifican sesiones ni usuarios.

BEGIN;

DO $$
DECLARE
    v_admin INT;
    v_capturista INT;
    v_operador INT;
    v_validador INT;
    v_consulta INT;
BEGIN
    SELECT id INTO v_admin FROM roles
    WHERE codigo = 'ADMINISTRADOR' FOR UPDATE;
    SELECT id INTO v_capturista FROM roles
    WHERE codigo = 'CAPTURISTA' FOR UPDATE;
    SELECT id INTO v_operador FROM roles
    WHERE codigo = 'OPERADOR' FOR UPDATE;
    SELECT id INTO v_validador FROM roles
    WHERE codigo = 'VALIDADOR' FOR UPDATE;
    SELECT id INTO v_consulta FROM roles
    WHERE codigo = 'CONSULTA' FOR UPDATE;

    IF v_admin IS NULL OR v_consulta IS NULL THEN
        RAISE EXCEPTION 'Faltan los roles ADMINISTRADOR o CONSULTA.';
    END IF;
    IF v_operador IS NOT NULL AND v_capturista IS NOT NULL THEN
        RAISE EXCEPTION 'Existen simultaneamente OPERADOR y CAPTURISTA; revisar antes.';
    END IF;
    IF v_operador IS NULL AND v_capturista IS NULL THEN
        RAISE EXCEPTION 'No existe el rol CAPTURISTA ni OPERADOR.';
    END IF;
    IF v_validador IS NOT NULL AND (
        EXISTS (SELECT 1 FROM usuario_roles WHERE rol_id = v_validador)
        OR EXISTS (SELECT 1 FROM grupo_roles WHERE rol_id = v_validador)
    ) THEN
        RAISE EXCEPTION 'VALIDADOR tiene asignaciones: revisarlas antes de desactivar.';
    END IF;

    INSERT INTO permisos (codigo, nombre, modulo, descripcion)
    VALUES
        ('estadisticas.consultar', 'Consultar indicadores agregados', 'Estadísticas', NULL),
        ('registros.resumen.consultar', 'Consultar tabla agregada por periodo', 'Registros', NULL)
    ON CONFLICT (codigo) DO NOTHING;

    IF v_capturista IS NOT NULL THEN
        UPDATE roles SET codigo = 'OPERADOR', nombre = 'Operador',
            activo = TRUE, fecha_actualizacion = NOW()
        WHERE id = v_capturista;
        v_operador := v_capturista;
    ELSE
        UPDATE roles SET nombre = 'Operador', activo = TRUE,
            fecha_actualizacion = NOW()
        WHERE id = v_operador;
    END IF;

    UPDATE roles SET nombre = 'Consulta', activo = TRUE,
        fecha_actualizacion = NOW()
    WHERE id = v_consulta;

    IF v_validador IS NOT NULL THEN
        UPDATE roles SET activo = FALSE, fecha_actualizacion = NOW()
        WHERE id = v_validador;
    END IF;

    -- Reducir expresamente los permisos de OPERADOR y CONSULTA.
    -- Los permisos viejos no se eliminan usando el sembrador aditivo.
    DELETE FROM rol_permisos
    WHERE rol_id IN (v_operador, v_consulta);

    INSERT INTO rol_permisos (rol_id, permiso_id)
    SELECT v_operador, id FROM permisos
    WHERE codigo IN (
        'registros.consultar', 'registros.exportar',
        'registros.resumen.consultar',
        'victimas.consultar', 'victimas.gestionar',
        'estadisticas.consultar'
    )
    ON CONFLICT (rol_id, permiso_id) DO NOTHING;

    INSERT INTO rol_permisos (rol_id, permiso_id)
    SELECT v_consulta, id FROM permisos
    WHERE codigo IN (
        'estadisticas.consultar', 'registros.resumen.consultar'
    )
    ON CONFLICT (rol_id, permiso_id) DO NOTHING;

    -- El administrador conserva todos los permisos registrados.
    INSERT INTO rol_permisos (rol_id, permiso_id)
    SELECT v_admin, id FROM permisos
    ON CONFLICT (rol_id, permiso_id) DO NOTHING;

    IF (SELECT COUNT(*) FROM rol_permisos WHERE rol_id = v_operador) <> 6
       OR (SELECT COUNT(*) FROM rol_permisos WHERE rol_id = v_consulta) <> 2 THEN
        RAISE EXCEPTION 'El catalogo de permisos no coincide con la matriz prevista.';
    END IF;

    RAISE NOTICE 'Catalogo actualizado: ADMINISTRADOR, OPERADOR y CONSULTA activos.';
END $$;

COMMIT;
