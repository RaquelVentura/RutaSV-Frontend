// Departamentos de El Salvador y una lista inicial de municipios y localidades
// turísticas para el formulario de experiencias. No es el catálogo completo:
// cuando exista la API, se reemplaza por la división político-administrativa oficial.

export const municipalitiesByDepartment = {
  Ahuachapán: ['Ahuachapán', 'Apaneca', 'Atiquizaya', 'Concepción de Ataco', 'Tacuba'],
  'Cabañas': ['Sensuntepeque', 'Ilobasco', 'Victoria', 'Cinquera'],
  Chalatenango: ['Chalatenango', 'La Palma', 'San Ignacio', 'Citalá'],
  Cuscatlán: ['Cojutepeque', 'Suchitoto', 'San Pedro Perulapán'],
  'La Libertad': ['Tamanique', 'Chiltiupán', 'Santa Tecla', 'Comasagua', 'Puerto de La Libertad', 'Zaragoza', 'Jayaque'],
  'La Paz': ['Zacatecoluca', 'Santiago Nonualco', 'San Luis La Herradura', 'Olocuilta'],
  'La Unión': ['La Unión', 'Conchagua', 'Santa Rosa de Lima', 'Intipucá'],
  Morazán: ['San Francisco Gotera', 'Perquín', 'Joateca', 'Cacaopera'],
  'San Miguel': ['San Miguel', 'Chinameca', 'Chirilagua', 'Ciudad Barrios'],
  'San Salvador': ['San Salvador', 'Panchimalco', 'Santo Tomás', 'Apopa', 'Nejapa', 'Ilopango'],
  'San Vicente': ['San Vicente', 'Apastepeque', 'Tecoluca'],
  'Santa Ana': ['Santa Ana', 'Coatepeque', 'Chalchuapa', 'Metapán', 'El Congo'],
  Sonsonate: ['Sonsonate', 'Juayúa', 'Izalco', 'Nahuizalco', 'Salcoatitán', 'Acajutla'],
  Usulután: ['Usulután', 'Alegría', 'Jiquilisco', 'Santiago de María', 'Berlín'],
}

export const departmentNames = Object.keys(municipalitiesByDepartment)
