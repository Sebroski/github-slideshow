document.addEventListener("DOMContentLoaded", function() {
    cargarListasIniciales(); // Puntos 6 y 7
    cargarTabla(); // Punto 2
});

// --- FUNCIONES AJAX GENÉRICAS ---
function enviarPeticion(datos, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "command.php", true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            try {
                var json = JSON.parse(xhr.responseText);
                callback(json);
            } catch (e) {
                console.error("Error parsing JSON", xhr.responseText);
            }
        }
    };
    xhr.send(datos);
}

// --- CARGAS INICIALES (Regiones y Profesiones) ---
function cargarListasIniciales() {
    var datos = new FormData();
    datos.append('cmd', 'cargar_listas');

    enviarPeticion(datos, function(res) {
        if(res.status) {
            // Llenar Profesiones (Punto 6)
            var selProf = document.getElementById('profesion');
            res.profesiones.forEach(function(p) {
                var opt = document.createElement('option');
                opt.value = p.id;
                opt.textContent = p.nombre;
                selProf.appendChild(opt);
            });

            // Llenar Regiones (Punto 7)
            var selReg = document.getElementById('region');
            res.regiones.forEach(function(r) {
                var opt = document.createElement('option');
                opt.value = r.id;
                opt.textContent = r.nombre;
                selReg.appendChild(opt);
            });
        }
    });
}

// --- CARGAR COMUNAS AL CAMBIAR REGION (Punto 7) ---
document.getElementById('region').addEventListener('change', function() {
    var idRegion = this.value;
    var selComuna = document.getElementById('comuna');
    selComuna.innerHTML = '<option value="">Seleccione...</option>';

    if(idRegion) {
        selComuna.disabled = false;
        var datos = new FormData();
        datos.append('cmd', 'cargar_comunas');
        datos.append('id_region', idRegion);

        enviarPeticion(datos, function(res) {
            if(res.status) {
                res.data.forEach(function(c) {
                    var opt = document.createElement('option');
                    opt.value = c.id;
                    opt.textContent = c.nombre;
                    selComuna.appendChild(opt);
                });
            }
        });
    } else {
        selComuna.disabled = true;
    }
});

// --- CARGAR GRILLA (Punto 2) ---
function cargarTabla() {
    var datos = new FormData();
    datos.append('cmd', 'listar_personas');

    enviarPeticion(datos, function(res) {
        var tbody = document.querySelector("#tablaPersonas tbody");
        tbody.innerHTML = ""; // Limpiar tabla

        if(res.status) {
            res.data.forEach(function(persona) {
                var tr = document.createElement('tr');
                tr.innerHTML = 
                    '<td>' + persona.nombre + '</td>' +
                    '<td>' + persona.apellido + '</td>' +
                    '<td>' + persona.nom_region + '</td>' +
                    '<td>' + persona.nom_comuna + '</td>' +
                    '<td>' + persona.nom_profesion + '</td>' +
                    '<td><button class="btn-modificar" onclick=\'prepararEdicion(' + JSON.stringify(persona) + ')\'>Modificar</button></td>';
                tbody.appendChild(tr);
            });
        }
    });
}

// --- PREPARAR EDICIÓN (Puntos 3 y 5) ---
function prepararEdicion(persona) {
    // 1. Subir datos al formulario
    document.getElementById('id_persona').value = persona.id;
    document.getElementById('nombre').value = persona.nombre;
    document.getElementById('apellido').value = persona.apellido;
    document.getElementById('profesion').value = persona.profesion_id;
    
    // Para region y comuna hay que disparar el evento change manualmente para cargar comunas
    document.getElementById('region').value = persona.region_id;
    
    // Simulamos la carga de comunas y luego seleccionamos la correcta
    var datos = new FormData();
    datos.append('cmd', 'cargar_comunas');
    datos.append('id_region', persona.region_id);
    
    enviarPeticion(datos, function(res) {
        var selComuna = document.getElementById('comuna');
        selComuna.innerHTML = '<option value="">Seleccione...</option>';
        selComuna.disabled = false;
        if(res.status) {
            res.data.forEach(function(c) {
                var opt = document.createElement('option');
                opt.value = c.id;
                opt.textContent = c.nombre;
                selComuna.appendChild(opt);
            });
            // Seleccionar la comuna del usuario una vez cargadas
            selComuna.value = persona.comuna_id;
        }
    });

    // 2. Cambiar texto del botón (Punto 5)
    document.getElementById('btnGuardar').textContent = "Actualizar";
}

// --- GUARDAR O ACTUALIZAR (Punto 3) ---
document.getElementById('miFormulario').addEventListener('submit', function(e) {
    e.preventDefault();

    var datos = new FormData(this);
    datos.append('cmd', 'guardar');
    // Añadimos el ID explícitamente
    datos.append('id', document.getElementById('id_persona').value);

    enviarPeticion(datos, function(res) {
        alert(res.msg);
        if(res.status) {
            limpiarFormulario(); // Punto 5 (limpiar tras update)
            cargarTabla();
        }
    });
});

// --- LIMPIAR FORMULARIO (Punto 5) ---
function limpiarFormulario() {
    document.getElementById('miFormulario').reset();
    document.getElementById('id_persona').value = "";
    document.getElementById('comuna').innerHTML = '<option value="">Seleccione Región primero</option>';
    document.getElementById('comuna').disabled = true;
    
    // Restaurar botón a "Enviar"
    document.getElementById('btnGuardar').textContent = "Enviar";
}
