// 🔑 Credenciales de tu proyecto en Supabase
const supabaseUrl = 'https://hxkqbszmkxydxxtsvdqb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh4a3Fic3pta3h5ZHh4dHN2ZHFiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU0ODEyMTAsImV4cCI6MjA4MTA1NzIxMH0.Fs504W-L-KqtKcVfLx57BeMomPAMB5NZ_dsrF2YpBw8';
const supabase = supabase.createClient(supabaseUrl, supabaseAnonKey);

// Cargar CCPs al iniciar
document.addEventListener('DOMContentLoaded', async () => {
  const { data, error } = await supabase
    .from('ccps')
    .select('id, nombre, codigo')
    .order('nombre');

  if (error) {
    console.error('Error al cargar CCPs:', error);
    document.getElementById('ccpSelector').innerHTML = '<option>Error al cargar</option>';
    return;
  }

  const select = document.getElementById('ccpSelector');
  data.forEach(ccp => {
    const opt = document.createElement('option');
    opt.value = ccp.codigo;
    opt.textContent = ccp.nombre;
    select.appendChild(opt);
  });
});

// Mostrar estaciones del CCP seleccionado
async function mostrarEstaciones() {
  const codigo = document.getElementById('ccpSelector').value;
  const container = document.getElementById('estacionesContainer');

  if (!codigo) {
    container.innerHTML = '<p class="text-muted text-center">Seleccione un CCP para visualizar sus estaciones policiales.</p>';
    return;
  }

  // Obtener ID del CCP
  const { data: ccpData, error: ccpErr } = await supabase
    .from('ccps')
    .select('id')
    .eq('codigo', codigo)
    .single();

  if (ccpErr) {
    container.innerHTML = '<p class="text-danger">CCP no encontrado.</p>';
    return;
  }

  // Obtener estaciones
  const { data: estaciones, error: estErr } = await supabase
    .from('estaciones')
    .select('nombre, lat, lng')
    .eq('ccp_id', ccpData.id)
    .order('nombre');

  if (estErr) {
    container.innerHTML = '<p class="text-danger">Error al cargar estaciones.</p>';
    return;
  }

  if (estaciones.length === 0) {
    container.innerHTML = '<p class="text-muted">No hay estaciones registradas para este CCP.</p>';
    return;
  }

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
}

// Abrir Google Maps
function abrirMapa(lat, lng) {
  const url = `https://www.google.com/maps?q=${lat},${lng}&z=16`;
  window.open(url, '_blank');
}
