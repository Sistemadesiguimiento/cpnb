// script.js

// 🔑 Configura estos valores con los de tu proyecto en Supabase
const supabaseUrl = 'https://hxkqbszmkxydxxtsvdqb.supabase.co'; // ← TU URL
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4a3Fic3pta3h5ZHh4dHN2ZHFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0ODEyMTAsImV4cCI6MjA4MTA1NzIxMH0.Fs504W-L-KqtKcVfLx57BeMomPAMB5NZ_dsrF2YpBw8'; // ← TU ANON KEY

// ✅ Correcto: usa "Supabase" (con mayúscula)
const supabase = Supabase.createClient(supabaseUrl, supabaseAnonKey);

// Elementos del DOM
const ccpSelector = document.getElementById('ccpSelector');
const estacionesContainer = document.getElementById('estacionesContainer');

// Cargar CCPs al iniciar
async function cargarCCPs() {
  const { data, error } = await supabase.from('ccp').select('id, nombre').order('nombre', { ascending: true });

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

// Manejar selección de CCP
ccpSelector.addEventListener('change', async () => {
  const id = ccpSelector.value;
  estacionesContainer.innerHTML = '';

  if (!id) {
    estacionesContainer.innerHTML = '<p class="text-muted text-center">Seleccione un CCP para visualizar sus estaciones policiales.</p>';
    return;
  }

  const { data, error } = await supabase
    .from('estaciones')
    .select('nombre')
    .eq('ccp_id', id)
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

// Iniciar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
  cargarCCPs();
});
