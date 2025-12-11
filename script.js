// script.js

// ⚙️ Configura tu cliente de Supabase
const supabaseUrl = 'https://hxkqbszmkxydxxtsvdqb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4a3Fic3pta3h5ZHh4dHN2ZHFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0ODEyMTAsImV4cCI6MjA4MTA1NzIxMH0.Fs504W-L-KqtKcVfLx57BeMomPAMB5NZ_dsrF2YpBw8';
const supabase = supabase.createClient(supabaseUrl, supabaseAnonKey);

const ccpSelector = document.getElementById('ccpSelector');
const estacionesContainer = document.getElementById('estacionesContainer');

// 🔄 Cargar lista de CCP al iniciar
async function cargarCCPs() {
  const { data, error } = await supabase.from('ccp').select('id, nombre').order('nombre', { ascending: true });
  if (error) {
    console.error('Error al cargar CCPs:', error);
    return;
  }

  ccpSelector.innerHTML = '<option value="">-- Seleccione un CCP --</option>';
  data.forEach(ccp => {
    const option = document.createElement('option');
    option.value = ccp.id;
    option.textContent = ccp.nombre;
    ccpSelector.appendChild(option);
  });
}

// 📍 Cargar estaciones al seleccionar un CCP
ccpSelector.addEventListener('change', async () => {
  const ccpId = ccpSelector.value;
  estacionesContainer.innerHTML = '';

  if (!ccpId) {
    estacionesContainer.innerHTML = '<p class="text-muted text-center">Seleccione un CCP para visualizar sus estaciones policiales.</p>';
    return;
  }

  const { data, error } = await supabase
    .from('estaciones')
    .select('nombre')
    .eq('ccp_id', ccpId)
    .order('nombre', { ascending: true });

  if (error) {
    console.error('Error al cargar estaciones:', error);
    estacionesContainer.innerHTML = '<p class="text-danger text-center">Error al cargar estaciones.</p>';
    return;
  }

  if (data.length === 0) {
    estacionesContainer.innerHTML = '<p class="text-muted text-center">Este CCP no tiene estaciones registradas.</p>';
    return;
  }

  const list = document.createElement('ul');
  list.className = 'list-group';
  data.forEach(est => {
    const item = document.createElement('li');
    item.className = 'list-group-item';
    item.textContent = est.nombre;
    list.appendChild(item);
  });
  estacionesContainer.appendChild(list);
});

// ▶️ Iniciar
document.addEventListener('DOMContentLoaded', () => {
  cargarCCPs();
});
