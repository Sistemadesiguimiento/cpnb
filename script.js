document.addEventListener('DOMContentLoaded', async () => {
  // 🔑 Reemplaza con tus valores reales de Supabase
  const supabaseUrl = 'https://hxkqbszmkxydxxtsvdqb.supabase.co';
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4a3Fic3pta3h5ZHh4dHN2ZHFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0ODEyMTAsImV4cCI6MjA4MTA1NzIxMH0.Fs504W-L-KqtKcVfLx57BeMomPAMB5NZ_dsrF2YpBw8';

  // ✅ El CDN de Supabase exporta una función global llamada `supabase`
  // (minúscula) en la versión UMD
  if (typeof window.supabase === 'undefined') {
    document.getElementById('estacionesContainer').innerHTML =
      '<p class="text-danger text-center">❌ Error: Supabase no se cargó. Verifique la conexión a internet o el bloqueo de scripts.</p>';
    console.error('Supabase no está disponible en window.supabase');
    return;
  }

  const client = window.supabase.createClient(supabaseUrl, supabaseAnonKey);

  const ccpSelector = document.getElementById('ccpSelector');
  const estacionesContainer = document.getElementById('estacionesContainer');

  // Cargar CCPs desde la tabla `ccp`
  const { data: ccps, error: ccpError } = await client
    .from('ccp')
    .select('id, nombre')
    .order('nombre', { ascending: true });

  if (ccpError) {
    estacionesContainer.innerHTML = `<p class="text-danger">Error al cargar CCPs: ${ccpError.message}</p>`;
    console.error(ccpError);
    return;
  }

  // Llenar el selector de CCP
  ccpSelector.innerHTML = '<option value="">-- Seleccione un CCP --</option>';
  ccps.forEach(ccp => {
    const option = document.createElement('option');
    option.value = ccp.id;
    option.textContent = ccp.nombre;
    ccpSelector.appendChild(option);
  });

  // Manejar selección de CCP
  ccpSelector.addEventListener('change', async () => {
    const ccpId = ccpSelector.value;
    estacionesContainer.innerHTML = '';

    if (!ccpId) {
      estacionesContainer.innerHTML = '<p class="text-muted text-center">Seleccione un CCP para visualizar sus estaciones policiales.</p>';
      return;
    }

    const { data: estaciones, error: estError } = await client
      .from('estaciones')
      .select('nombre')
      .eq('ccp_id', ccpId)
      .order('nombre', { ascending: true });

    if (estError) {
      estacionesContainer.innerHTML = `<p class="text-danger text-center">Error al cargar estaciones: ${estError.message}</p>`;
      console.error(estError);
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
