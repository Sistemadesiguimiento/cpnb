document.addEventListener('DOMContentLoaded', async () => {
  const { createClient } = window.supabase;
  const supabase = createClient(
    'https://hxkqbszmkxydxxtsvdqb.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4a3Fic3pta3h5ZHh4dHN2ZHFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0ODEyMTAsImV4cCI6MjA4MTA1NzIxMH0.Fs504W-L-KqtKcVfLx57BeMomPAMB5NZ_dsrF2YpBw8'
  );

  window.abrirMapa = (lat, lng) => {
    window.open(`https://www.google.com/maps?q=${lat},${lng}&z=16`, '_blank');
  };

  const select = document.getElementById('ccpSelector');
  const container = document.getElementById('estacionesContainer');

  if (!select || !container) return;

  // Cargar lista de CCPs
  try {
    const { data, error } = await supabase
      .from('ccps')
      .select('nombre, codigo')
      .order('nombre', { ascending: true });

    if (error) throw error;

    select.innerHTML = '<option value="">-- Seleccione un CCP --</option>';
    data.forEach(ccp => {
      const option = document.createElement('option');
      option.value = ccp.codigo;
      option.textContent = ccp.nombre;
      select.appendChild(option);
    });
  } catch (err) {
    console.error('Error al cargar CCPs:', err.message);
    select.innerHTML = '<option>Error de conexión</option>';
    return;
  }

  // Manejar selección de CCP
  select.addEventListener('change', async (e) => {
    const codigo = e.target.value;
    if (!codigo) {
      container.innerHTML = '<p class="text-muted text-center">Seleccione un CCP para visualizar sus estaciones policiales.</p>';
      return;
    }

    container.innerHTML = '<p class="text-muted">Cargando estaciones...</p>';

    try {
      // Obtener ID del CCP seleccionado
      const { data: ccpData, error: ccpErr } = await supabase
        .from('ccps')
        .select('id')
        .eq('codigo', codigo)
        .single();

      if (ccpErr) throw ccpErr;

      // Cargar estaciones asociadas
      const { data: estaciones, error: estErr } = await supabase
        .from('estaciones')
        .select('nombre, lat, lng')
        .eq('ccp_id', ccpData.id)
        .order('nombre', { ascending: true });

      if (estErr) throw estErr;

      if (!estaciones || estaciones.length === 0) {
        container.innerHTML = '<p class="text-muted">No hay estaciones registradas para este CCP.</p>';
        return;
      }

      // Renderizar estaciones
      const html = estaciones.map(est => `
        <div class="d-flex justify-content-between align-items-center py-2 border-bottom">
          <span class="fw-medium">${est.nombre}</span>
          <button 
            class="btn btn-sm btn-outline-primary"
            onclick="abrirMapa(${est.lat}, ${est.lng})"
          >
            Ver en Mapa
          </button>
        </div>
      `).join('');

      container.innerHTML = `
        <h5 class="mb-3 fw-bold">Estaciones Policiales:</h5>
        ${html}
      `;
    } catch (err) {
      console.error('Error al cargar estaciones:', err.message);
      container.innerHTML = '<p class="text-danger">Error al cargar estaciones. Intente nuevamente.</p>';
    }
  });
});
