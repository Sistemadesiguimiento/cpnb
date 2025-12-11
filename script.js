// 🔑 Inicialización de Supabase (primera línea ejecutable)
const supabaseUrl = 'https://hxkqbszmkxydxxtsvdqb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4a3Fic3pta3h5ZHh4dHN2ZHFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0ODEyMTAsImV4cCI6MjA4MTA1NzIxMH0.Fs504W-L-KqtKcVfLx57BeMomPAMB5NZ_dsrF2YpBw8';
const supabase = supabase.createClient(supabaseUrl, supabaseAnonKey);

// Función global para abrir Google Maps (segura, sin dependencia de Supabase)
function abrirMapa(lat, lng) {
  const url = `https://www.google.com/maps?q=${lat},${lng}&z=16`;
  window.open(url, '_blank');
}

// Todo el código que usa Supabase debe estar DENTRO de DOMContentLoaded
document.addEventListener('DOMContentLoaded', async () => {
  const select = document.getElementById('ccpSelector');
  const container = document.getElementById('estacionesContainer');

  if (!select || !container) {
    console.error('Elementos del DOM no encontrados. ¿Está el HTML correcto?');
    return;
  }

  try {
    // Cargar CCPs desde Supabase
    const { data: ccps, error: ccpError } = await supabase
      .from('ccps')
      .select('id, nombre, codigo')
      .order('nombre');

    if (ccpError) throw ccpError;

    // Llenar el selector
    ccps.forEach(ccp => {
      const option = document.createElement('option');
      option.value = ccp.codigo;
      option.textContent = ccp.nombre;
      select.appendChild(option);
    });

    // Escuchar cambios en el selector
    select.addEventListener('change', async (event) => {
      const codigo = event.target.value;
      if (!codigo) {
        container.innerHTML = '<p class="text-muted text-center">Seleccione un CCP para visualizar sus estaciones policiales.</p>';
        return;
      }

      // Obtener ID del CCP
      const { data: ccpData, error: idError } = await supabase
        .from('ccps')
        .select('id')
        .eq('codigo', codigo)
        .single();

      if (idError) {
        container.innerHTML = '<p class="text-danger">No se pudo encontrar el CCP seleccionado.</p>';
        return;
      }

      // Obtener estaciones
      const { data: estaciones, error: estError } = await supabase
        .from('estaciones')
        .select('nombre, lat, lng')
        .eq('ccp_id', ccpData.id)
        .order('nombre');

      if (estError) {
        container.innerHTML = '<p class="text-danger">Error al cargar las estaciones.</p>';
        return;
      }

      if (estaciones.length === 0) {
        container.innerHTML = '<p class="text-muted">No hay estaciones registradas para este CCP.</p>';
        return;
      }

      // Renderizar estaciones
      let html = '<h5 class="mb-3 fw-bold">Estaciones Policiales:</h5>';
      estaciones.forEach(est => {
        html += `
          <div class="estacion-item">
            <span class="fw-medium">${est.nombre}</span>
            <button class="btn-ir" onclick="abrirMapa(${est.lat}, ${est.lng})">Ver en Mapa</button>
          </div>
        `;
      });
      container.innerHTML = html;
    });

  } catch (error) {
    console.error('Error durante la inicialización:', error);
    select.innerHTML = '<option>Error al conectar con la base de datos</option>';
    container.innerHTML = '<p class="text-danger">No se pudieron cargar los datos. Verifique la conexión.</p>';
  }
});
