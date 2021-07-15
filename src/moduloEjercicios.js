import basededatos from './basededatos.js';

/**
 * Clone object.
 *
 * @template T
 * @param {T} o
 * @returns {T}
 * @private
 */
const _clone = (o) => JSON.parse(JSON.stringify(o));

/**
 * @param {Array<number>} valores
 * @returns {number}
 * @private
 */
const _promedio = (valores) =>
  Array.isArray(valores)
    ? valores.reduce((prev, valor) => valor + prev, 0) / valores.length
    : 0;

/**
 * @returns {Array<import('./basededatos').ModelPelicula & {
 *    promedio: {
 *      promedio: number,
 *      total: number,
 *    },
 *  }>}
 * @private
 */
const _peliculasPromedios = () => {
  const resultado = basededatos.calificaciones.reduce(
    (acc, c) =>
      acc.set(
        c.pelicula,
        (acc.has(c.pelicula) ? acc.get(c.pelicula) : 0) + c.puntuacion
      ),
    new Map()
  );

  return basededatos.peliculas.map((pelicula) => {
    // Clone object
    const r = _clone(pelicula);

    r.promedio = {
      promedio: 0,
      total: 0,
    };

    if (resultado.has(pelicula.id)) {
      const sum = resultado.get(pelicula.id);
      const total = basededatos.calificaciones.filter(
        (c) => c.pelicula === pelicula.id
      ).length;

      r.promedio.promedio = sum / total;
      r.promedio.total = total;
    }

    return r;
  });
};

/**
 * @template T
 * @param {T} dbTable
 * @param {keyof T[number]} searchField
 * @param {string} searchText
 * @returns {T[number] | null}
 * @private
 */
const _filterBy = (dbTable, searchField, searchText) => {
  const searchStrClean = searchText.replace(/[^\w\d\-_]+/g, ' ').trim();

  if (searchStrClean) {
    const searchQ = searchStrClean.toLowerCase().split(/\s+/);

    return dbTable.find((row) => {
      const fldValue = row[searchField].toLowerCase();
      return !searchQ.some((q) => !fldValue.includes(q));
    });
  }

  return null;
};

/**
 * Devuelve el promedio de anios de estreno de todas las peliculas de la base de datos.
 */
export const promedioAnioEstreno = () =>
  _promedio(basededatos.peliculas.map(({ anio }) => anio));

/**
 * Devuelve la lista de peliculas con promedio de critica mayor al numero que llega
 * por parametro.
 * @param {number} promedio
 */
export const pelicuasConCriticaPromedioMayorA = (promedio) =>
  _peliculasPromedios().filter((pp) => pp.promedio.promedio > promedio);

/**
 * Devuelve la lista de peliculas de un director
 * @param {string} nombreDirector
 */
export const peliculasDeUnDirector = (nombreDirector) => {
  const director = _filterBy(basededatos.directores, 'nombre', nombreDirector);

  if (director) {
    return basededatos.peliculas.filter((p) =>
      p.directores.includes(director.id)
    );
  }

  return [];
};

/**
 * Devuelve el promdedio de critica segun el id de la pelicula.
 * @param {number} peliculaId
 */
export const promedioDeCriticaBypeliculaId = (peliculaId) => {
  const pp = _peliculasPromedios().find(({ id }) => id === peliculaId);
  return pp ? pp.promedio.promedio : 0;
};

/**
 * Obtiene la lista de peliculas con alguna critica con
 * puntuacion excelente (critica >= 9).
 * En caso de no existir el criticas que cumplan, devolver un array vacio [].
 * Ejemplo del formato del resultado: 
 *  [
        {
            id: 1,
            nombre: 'Back to the Future',
            anio: 1985,
            direccionSetFilmacion: {
                calle: 'Av. Siempre viva',
                numero: 2043,
                pais: 'Colombia',
            },
            directores: [1],
            generos: [1, 2, 6]
        },
        {
            id: 2,
            nombre: 'Matrix',
            anio: 1999,
            direccionSetFilmacion: {
                calle: 'Av. Roca',
                numero: 3023,
                pais: 'Argentina'
            },
            directores: [2, 3],
            generos: [1, 2]
        },
    ],
 */
export const obtenerPeliculasConPuntuacionExcelente = (promedioExcelente = 9) =>
  _peliculasPromedios().filter(
    (pp) => pp.promedio.promedio >= promedioExcelente
  );

/**
 * Devuelve informacion ampliada sobre una pelicula.
 * Si no existe la pelicula con dicho nombre, devolvemos undefined.
 * Ademas de devolver el objeto pelicula,
 * agregar la lista de criticas recibidas, junto con los datos del critico y su pais.
 * Tambien agrega informacion de los directores y generos a los que pertenece.
 * Ejemplo de formato del resultado para 'Indiana Jones y los cazadores del arca perdida':
 * {
            id: 3,
            nombre: 'Indiana Jones y los cazadores del arca perdida',
            anio: 2012,
            direccionSetFilmacion: {
                calle: 'Av. Roca',
                numero: 3023,
                pais: 'Camboya'
            },
            directores: [
                { id: 5, nombre: 'Steven Spielberg' },
                { id: 6, nombre: 'George Lucas' },
            ],
            generos: [
                { id: 2, nombre: 'Accion' },
                { id: 6, nombre: 'Aventura' },
            ],
            criticas: [
                { critico: 
                    { 
                        id: 3, 
                        nombre: 'Suzana Mendez',
                        edad: 33,
                        pais: 'Argentina'
                    }, 
                    puntuacion: 5 
                },
                { critico: 
                    { 
                        id: 2, 
                        nombre: 'Alina Robles',
                        edad: 21,
                        pais: 'Argentina'
                    }, 
                    puntuacion: 7
                },
            ]
        },
 * @param {string} nombrePelicula
 */
export const expandirInformacionPelicula = (nombrePelicula) => {
  const peliculaDB = _filterBy(basededatos.peliculas, 'nombre', nombrePelicula);

  if (peliculaDB) {
    const pelicula = _clone(peliculaDB);

    pelicula.directores = pelicula.directores.map((id) =>
      _clone(basededatos.directores.find((d) => d.id === id))
    );

    pelicula.generos = pelicula.generos.map((id) =>
      _clone(basededatos.generos.find((d) => d.id === id))
    );

    pelicula.criticas = basededatos.calificaciones
      .filter((calif) => calif.pelicula === pelicula.id)
      .map((calif) => {
        const critico = _clone(
          basededatos.criticos.find((d) => d.id === calif.critico)
        );

        critico.pais = basededatos.paises.find(
          (d) => d.id === critico.pais
        ).nombre;

        return {
          critico,
          puntuacion: calif.puntuacion,
        };
      });

    return pelicula;
  }

  return undefined;
};
