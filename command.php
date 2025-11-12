<?php
require_once 'conexion.php';

// Recibir el comando
$cmd = isset($_POST['cmd']) ? $_POST['cmd'] : '';

// Respuesta por defecto
$response = array('status' => false, 'msg' => 'Comando no reconocido');

try {
    $db = Conexion::conectar();

    switch ($cmd) {
        case 'cargar_listas':
            // Carga Profesiones y Regiones para los Selects (Puntos 6 y 7)
            $profesiones = $db->query("SELECT id, nombre FROM profesion")->fetchAll(PDO::FETCH_ASSOC);
            $regiones = $db->query("SELECT id, nombre FROM region")->fetchAll(PDO::FETCH_ASSOC);
            
            $response = array(
                'status' => true,
                'profesiones' => $profesiones,
                'regiones' => $regiones
            );
            break;

        case 'cargar_comunas':
            // Carga comunas dependientes (Punto 7)
            $id_region = $_POST['id_region'];
            $stmt = $db->prepare("SELECT id, nombre FROM comuna WHERE region_id = ?");
            $stmt->execute(array($id_region));
            $response = array('status' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC));
            break;

        case 'listar_personas':
            // Grilla (Punto 2)
            $sql = "SELECT p.id, p.nombre, p.apellido, p.region_id, p.comuna_id, p.profesion_id,
                           r.nombre as nom_region, c.nombre as nom_comuna, pr.nombre as nom_profesion
                    FROM personas p
                    LEFT JOIN region r ON p.region_id = r.id
                    LEFT JOIN comuna c ON p.comuna_id = c.id
                    LEFT JOIN profesion pr ON p.profesion_id = pr.id
                    ORDER BY p.id DESC";
            $stmt = $db->query($sql);
            $response = array('status' => true, 'data' => $stmt->fetchAll(PDO::FETCH_ASSOC));
            break;

        case 'guardar':
            // Lógica de Insertar/Actualizar (Puntos 3, 4 y 8)
            $id = isset($_POST['id']) && $_POST['id'] != '' ? $_POST['id'] : 0;
            $nombre = trim($_POST['nombre']);
            $apellido = trim($_POST['apellido']);
            $region = $_POST['region'];
            $comuna = $_POST['comuna'];
            $profesion = $_POST['profesion'];

            // --- VALIDACIÓN DE UNICIDAD (Punto 4) ---
            if ($id == 0) {
                // Insertando: Verificar si ya existe Nombre + Apellido
                $check = $db->prepare("SELECT COUNT(*) FROM personas WHERE nombre = ? AND apellido = ?");
                $check->execute(array($nombre, $apellido));
            } else {
                // Actualizando: Verificar si existe en OTRO registro diferente al actual
                $check = $db->prepare("SELECT COUNT(*) FROM personas WHERE nombre = ? AND apellido = ? AND id <> ?");
                $check->execute(array($nombre, $apellido, $id));
            }

            if ($check->fetchColumn() > 0) {
                $response = array('status' => false, 'msg' => 'El nombre y apellido ya están registrados.');
            } else {
                // --- USO DE FUNCIÓN DE BASE DE DATOS (Punto 8) ---
                $stmt = $db->prepare("SELECT fn_gestionar_persona(?, ?, ?, ?, ?, ?)");
                // En PostgreSQL los parámetros deben ser del tipo correcto. (Int, Str, Str, Int, Int, Int)
                $stmt->execute(array(
                    (int)$id, 
                    $nombre, 
                    $apellido, 
                    (int)$region, 
                    (int)$comuna, 
                    (int)$profesion
                ));
                
                $msg = ($id == 0) ? "Registrado correctamente" : "Actualizado correctamente";
                $response = array('status' => true, 'msg' => $msg);
            }
            break;
    }

} catch (Exception $e) {
    $response = array('status' => false, 'msg' => 'Error en el servidor: ' . $e->getMessage());
}

// Devolver JSON
header('Content-Type: application/json');
echo json_encode($response);
?>
