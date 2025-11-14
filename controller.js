document.addEventListener('DOMContentLoaded', function() {
    cargarCiudad();
    cargarHorario();
    cargarGrilla();
    cargarGrillaPorcentaje();

    const ciudadSelect = document.getElementById('ciudad');
    if (ciudadSelect) {
        ciudadSelect.addEventListener('change', function() {
            recargaComuna(this.value);
        });
    }

    const formulario = document.querySelector('form');
    if (formulario) {
        formulario.addEventListener('submit', function(e) {
            e.preventDefault();
            ingresarReserva(this);
        });
    }
});

function cargarGrilla() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'command.php?cmd=verReserva', true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            const tbody = document.querySelector('#id_reservas tbody');
            tbody.innerHTML = '';

            if (data.resultado && data.verReserva) {
                data.verReserva.forEach(function(reserva) {
                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td>${reserva.nombre}</td>
                        <td>${reserva.nombremascota}</td>
                        <td>${reserva.fechaconsulta}</td>
                        <td>${reserva.horarioconsulta}</td>
                        <td>
                            <button onclick="eliminarReserva(${reserva.idreserva})">Eliminar</button>
                            <button onclick="recordarReserva('${reserva.idreserva}', '${reserva.email}', '${reserva.fechaconsulta}')">Recordar</button>
                        </td>
                    `;
                    tbody.appendChild(row);
                });
            }
        }
    };
    xhr.send();
}

function cargarGrillaPorcentaje() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'command.php?cmd=verPorcentajesHorario', true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            const tbody = document.querySelector('#tabla_porcentajes tbody') || document.querySelector('table:last-of-type tbody');
            
            if (tbody) {
                tbody.innerHTML = '';
                if (data.resultado && data.horariosPorcentaje) {
                    data.horariosPorcentaje.forEach(function(item) {
                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${item.horario}</td>
                            <td>${item.cantidad}</td>
                            <td>${item.porcentaje}%</td>
                        `;
                        tbody.appendChild(row);
                    });
                }
            }
        }
    };
    xhr.send();
}

function eliminarReserva(idreserva) {
    if (!confirm('¿Está seguro de eliminar esta reserva?')) return;

    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'command.php', true);
    xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            alert(data.mensaje);
            if (data.resultado) {
                cargarGrilla();
                cargarGrillaPorcentaje();
            }
        }
    };
    xhr.send('cmd=eliminarReserva&idreserva=' + idreserva);
}

function cargarCiudad() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'command.php?cmd=valorRegiones', true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            const select = document.getElementById('ciudad');
            select.innerHTML = '<option value="">Seleccione Ciudad</option>';
            
            if (data.resultado && data.valorRegiones) {
                data.valorRegiones.forEach(function(region) {
                    const option = document.createElement('option');
                    option.value = region.idregion;
                    option.textContent = region.nombre;
                    select.appendChild(option);
                });
            }
        }
    };
    xhr.send();
}

function recargaComuna(idciudad) {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'command.php?cmd=buscarComuna&idcomuna=' + idciudad, true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            const select = document.getElementById('comuna');
            select.innerHTML = '<option value="">Seleccione Comuna</option>';
            
            if (data.resultado && data.data) {
                data.data.forEach(function(comuna) {
                    const option = document.createElement('option');
                    option.value = comuna.idcomuna;
                    option.textContent = comuna.nombre;
                    select.appendChild(option);
                });
            }
        }
    };
    xhr.send();
}

function cargarHorario() {
    const xhr = new XMLHttpRequest();
    xhr.open('GET', 'command.php?cmd=valorHorarios', true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            const select = document.getElementById('horario');
            select.innerHTML = '<option value="">Seleccione Horario</option>';
            
            if (data.resultado && data.valorHorarios) {
                data.valorHorarios.forEach(function(horario) {
                    const option = document.createElement('option');
                    option.value = horario.idhorario;
                    option.textContent = horario.descripcion; 
                    select.appendChild(option);
                });
            }
        }
    };
    xhr.send();
}

function recordarReserva(idreserva, email, fechaConsulta) {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    // Convertir string fecha (YYYY-MM-DD) a objeto Date
    // Asumiendo formato standard de date input o base de datos
    const fechaParts = fechaConsulta.split('-');
    const consulta = new Date(fechaParts[0], fechaParts[1] - 1, fechaParts[2]);
    consulta.setHours(0, 0, 0, 0);
    
    const diferenciaTiempo = consulta.getTime() - hoy.getTime();
    const diferenciaDias = Math.ceil(diferenciaTiempo / (1000 * 3600 * 24));

    if (diferenciaDias === 1) {
        alert('Se debe recordar reserva a email ' + email);
    } else if (diferenciaDias <= 0) {
        alert('Ya es muy tarde para recordar reserva');
    } else {
        alert('Aún no es tiempo de recordar la reserva');
    }
}

function ingresarReserva(form) {
    const formData = new FormData(form);
    
    if (!formData.has('recordatorio')) {
        formData.append('recordatorio', '0');
    }
    
    formData.append('cmd', 'ingresarReserva');

    const xhr = new XMLHttpRequest();
    xhr.open('POST', 'command.php', true);
    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4 && xhr.status === 200) {
            const data = JSON.parse(xhr.responseText);
            alert(data.mensaje);
            if (data.resultado) {
                form.reset();
                cargarGrilla();
                cargarGrillaPorcentaje();
            }
        }
    };
    xhr.send(formData);
}
