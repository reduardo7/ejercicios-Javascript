import {
  expandirInformacionPelicula,
  obtenerPeliculasConPuntuacionExcelente,
  pelicuasConCriticaPromedioMayorA,
  peliculasDeUnDirector,
  promedioAnioEstreno,
  promedioDeCriticaBypeliculaId,
} from '../src/moduloEjercicios.js';

const _log = (label, data) =>
  console.info(label, JSON.stringify(data, null, 2));

console.log('------------------------------------------------------');
console.log('Ejecutando ejercicios de peliculas.');

const promedioAnio = promedioAnioEstreno();
_log('Promedio de Anios de estreno de toda la base de datos:', promedioAnio);

const pelicuasConCriticaPromedioMayorA5 = pelicuasConCriticaPromedioMayorA(5);
_log(
  'Peliculas con criticas promedio mayores a 5:',
  pelicuasConCriticaPromedioMayorA5
);

const promedioDeCriticaDeMatrix = promedioDeCriticaBypeliculaId(2);
_log('Promedio de criticas de Matrix (id 2):', promedioDeCriticaDeMatrix);

const peliculasDeSpielberg = peliculasDeUnDirector('Steven Spielberg');
_log('Peliculas dirigidas por Spielberg:', peliculasDeSpielberg);

const peliculasCriticasExcelentes = obtenerPeliculasConPuntuacionExcelente(/* 6 */);
_log('Peliculas con criticas excelentes:', peliculasCriticasExcelentes);

console.log('------------------------------------------------------');
console.log('Ejecutando ejercicios expandir informacion de pelicula.');

const infoBackToTheFuture = expandirInformacionPelicula('Back to the Future');
_log('Informacion de Back to the Future:', infoBackToTheFuture);

const infoMatrix = expandirInformacionPelicula('Matrix');
_log('Informacion de Matrix', infoMatrix);
