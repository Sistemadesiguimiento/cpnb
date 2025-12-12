document.addEventListener('DOMContentLoaded', () => {
  // 🔑 Reemplaza con tus valores reales de Supabase
  const supabaseUrl = 'https://xxxxxxxxxxxxx.supabase.co';
  const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.xxxxx';

  // ⚠️ IMPORTANTE: en la versión UMD global, el nombre correcto es "supabase"
  // pero se expone como propiedad de `window`, y a veces hay confusión.
  // La forma segura es accederlo desde `window.supabase`
  if (typeof window.supabase === 'undefined') {
    console.error('❌ Supabase no está cargado. Verifica el orden de los scripts.');
    return;
  }

  const client = window.supabase.createClient(supabaseUrl, supabaseAnonKey);

  const ccpSelector = document.getElementById('ccpSelector');
  const estacionesContainer = document.getElementById('estacionesContainer');

  async function cargarCCPs() {
    const { data, error } = await client.from('ccp').select('id, nombre').order('nombre', { ascending: true });
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

    const { data, error } = await client
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
