document.addEventListener('DOMContentLoaded', async () => {
  const supabaseUrl = 'https://hxkqbszmkxydxxtsvdqb.supabase.co';
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4a3Fic3pta3h5ZHh4dHN2ZHFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0ODEyMTAsImV4cCI6MjA4MTA1NzIxMH0.Fs504W-L-KqtKcVfLx57BeMomPAMB5NZ_dsrF2YpBw8';

  if (typeof window.supabase === 'undefined') {
    document.getElementById('estacionesContainer').innerHTML =
      '<p class="text-danger text-center">❌ Error: Supabase no se cargó. Verifique conexión o bloqueo de scripts.</p>';
    console.error('window.supabase no está definido. ¿Está el CDN cargado antes de script.js?');
    return;
  }

  const client = window.supabase.createClient(supabaseUrl, supabaseAnonKey);

  const ccpSelector = document.getElementById('ccpSelector');
  const estacionesContainer = document.getElementById('estacionesContainer');

  // Cargar CCPs
  const { data: ccps, error: ccpError } = await client
    .from('ccp')
    .select('id, nombre')
    .order('nombre', { ascending: true });

  if (ccpError) {
    estacionesContainer.innerHTML = `<p class="text-danger">Error al cargar CCPs: ${ccpError.message}</p>`;
    return;
  }

  ccpSelector.innerHTML = '<option value="">-- Seleccione un CCP --</option>';
  ccps.forEach(ccp => {
    const opt = document.createElement('option');
    opt.value = ccp.id;
    opt.textContent = ccp.nombre;
    ccpSelector.appendChild(opt);
  });

  // Manejar selección
  ccpSelector.addEventListener('change', async () => {
    const id = ccpSelector.value;
    estacionesContainer.innerHTML = '';

    if (!id) {
      estacionesContainer.innerHTML = '<p class="text-muted text-center">Seleccione un CCP para visualizar sus estaciones policiales.</p>';
      return;
    }

    const { data: estaciones, error: estError } = await client
      .from('estaciones')
      .select('nombre')
      .eq('ccp_id', id)
      .order('nombre', { ascending: true });

    if (estError) {
      estacionesContainer.innerHTML = `<p class="text-danger text-center">Error al cargar estaciones: ${estError.message}</p>`;
      return;
    }

    if (estaciones.length === 0) {
      estacionesContainer.innerHTML = '<p class="text-muted text-center">Este CCP no tiene estaciones registradas.</p>';
      return;
    }

    const ul = document.createElement('ul');
    ul.className = 'list-group';
    estaciones.forEach(e => {
      const li = document.createElement('li');
      li.className = 'list-group-item';
      li.textContent = e.nombre;
      ul.appendChild(li);
    });
    estacionesContainer.appendChild(ul);
  });
});
