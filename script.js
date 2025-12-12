// script.js — ¡Este debe ser un archivo .js puro!

document.addEventListener('DOMContentLoaded', () => {
  // 🔑 Reemplaza con tus credenciales reales de Supabase
  const supabaseUrl = 'https://hxkqbszmkxydxxtsvdqb.supabase.co';
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4a3Fic3pta3h5ZHh4dHN2ZHFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0ODEyMTAsImV4cCI6MjA4MTA1NzIxMH0.Fs504W-L-KqtKcVfLx57BeMomPAMB5NZ_dsrF2YpBw8';

  // ✅ Correcto: el CDN define un objeto global llamado `supabase` (minúscula en v2+ UMD)
  // ¡NO "Supabase"! En la versión UMD global, se llama `supabase`
  const _supabase = supabase.createClient(supabaseUrl, supabaseAnonKey);

  const ccpSelector = document.getElementById('ccpSelector');
  const estacionesContainer = document.getElementById('estacionesContainer');

  async function cargarCCPs() {
    const { data, error } = await _supabase.from('ccp').select('id, nombre').order('nombre', { ascending: true });
    if (error) {
      console.error('Error al cargar CCPs:', error);
      return;
    }

    ccpSelector.innerHTML = '<option value="">-- Seleccione un CCP --</option>';
    data.forEach(ccp => {
      const opt = document.createElement('option');
      opt.value = ccp.id;
      opt.textContent = ccp.nombre;
      ccpSelector.appendChild(opt);
    });
  }

  ccpSelector.addEventListener('change', async () => {
    const ccpId = ccpSelector.value;
    estacionesContainer.innerHTML = '';

    if (!ccpId) {
      estacionesContainer.innerHTML = '<p class="text-muted text-center">Seleccione un CCP para visualizar sus estaciones policiales.</p>';
      return;
    }

    const { data, error } = await _supabase
      .from('estaciones')
      .select('nombre')
      .eq('ccp_id', ccpId)
      .order('nombre', { ascending: true });

    if (error) {
      estacionesContainer.innerHTML = '<p class="text-danger text-center">Error al cargar estaciones.</p>';
      console.error(error);
      return;
    }

    if (data.length === 0) {
      estacionesContainer.innerHTML = '<p class="text-muted text-center">Este CCP no tiene estaciones registradas.</p>';
      return;
    }

    const ul = document.createElement('ul');
    ul.className = 'list-group';
    data.forEach(e => {
      const li = document.createElement('li');
      li.className = 'list-group-item';
      li.textContent = e.nombre;
      ul.appendChild(li);
    });
    estacionesContainer.appendChild(ul);
  });

  cargarCCPs();
});
