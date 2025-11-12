case 'listarProfesiones':
    // 1. Activar reporte de errores temporalmente para ver si falla la conexión
    error_reporting(E_ALL);
    ini_set('display_errors', 1);

    // 2. Verificar que la conexión exista
    if (!$conn) {
        echo json_encode(array("resultado" => false, "mensaje" => "Error: No hay conexión a BD"));
        break;
    }

    // 3. Forzar la conexión a UTF8 para que json_encode no falle con tildes
    pg_set_client_encoding($conn, "UTF8");

    $query = "SELECT nombre FROM ejercicio.profesion";
    $result = pg_query($conn, $query);

    if (!$result) {
        echo json_encode(array("resultado" => false, "mensaje" => "Error en la query SQL"));
        break;
    }

    $profesiones = pg_fetch_all($result);

    // 4. Si pg_fetch_all devuelve false (tabla vacía), lo convertimos a array vacío
    if ($profesiones === false) {
        $profesiones = array();
    }

    pg_close($conn);

    // Enviamos la respuesta
    echo json_encode(array(
        "mensaje" => 'Desplegando lista de profesiones', 
        "resultado" => true, 
        "listaProfesiones" => $profesiones
    ));
    break;
