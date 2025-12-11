document.addEventListener('DOMContentLoaded', async () => {
  // ✅ Supabase ya está cargado desde index.html
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

  // ✅ CORREGIDO: usar `data`, no `ccps`
  try {
    const { data, error } = await supabase
      .from('ccps')
      .select('nombre, codigo')
      .order('nombre');

    if (error) throw error;

    select.innerHTML = '<option value="">-- Seleccione un CCP --</option>' +
      data.map(ccp => `<option value="${ccp.codigo}">${ccp.nombre}</option>`).join('');

  } catch (err) {
    console.error('Error al cargar CCPs:', err);
    select.innerHTML = '<option>Error de conexión</option>';
    return;
  }

  select.addEventListener('change', async (e) => {
    const codigo = e.target.value;
    if (!codigo) {
      container.innerHTML = '<p class="text-muted text-center">Seleccione un CCP para visualizar sus estaciones policiales.</p>';
      return;
    }

    container.innerHTML = '<p class="text-muted">Cargando estaciones...</p>';

    try {
      // ✅ CORREGIDO: usar `data` y renombrar
      const {  ccp, error: ccpErr } = await supabase
        .from('ccps')
        .select('id')
        .eq('codigo', codigo)
        .single();

      if (ccpErr) throw ccpErr;

      const {  estaciones, error: estErr } = await supabase
        .from('estaciones')
        .select('nombre, lat, lng')
        .eq('ccp_id', ccp.id)
        .order('nombre');

      if (estErr) throw estErr;

      if (estaciones.length === 0) {
        container.innerHTML = '<p class="text-muted">No hay estaciones registradas para este CCP.</p>';
        return;
      }

      container.innerHTML = `
        <h5 class="mb-3 fw-bold">Estaciones Policiales:</h5>
        ${estaciones.map(est => `
          <div class="estacion-item">
            <span class="fw-medium">${est.nombre}</span>
            <button class="btn-ir" onclick="abrirMapa(${est.lat}, ${est.lng})">Ver en Mapa</button>
          </div>
        `).join('')}
      `;

    } catch (err) {
      console.error('Error al cargar estaciones:', err);
      container.innerHTML = '<p class="text-danger">Error al cargar estaciones.</p>';
    }
  });
});
