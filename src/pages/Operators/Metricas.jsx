
import { useMemo, useState } from "react";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  LineChart,
  Line
} from "recharts";

// ======================================================
// DATOS SIMULADOS
// En producción serán obtenidos desde FastAPI.
// ======================================================

const BUSINESS_ID = "negocio-001";

const experiences = [
  {
    id: "exp-01",
    businessId: "negocio-001",
    name: "Tour de montaña"
  },
  {
    id: "exp-02",
    businessId: "negocio-001",
    name: "Ruta cultural"
  },
  {
    id: "exp-03",
    businessId: "negocio-002",
    name: "Tour de playa"
  }
];

const slots = [
  {
    id: "slot-01",
    businessId: "negocio-001",
    experienceId: "exp-01",
    date: "2026-11-25",
    total: 12
  },
  {
    id: "slot-02",
    businessId: "negocio-001",
    experienceId: "exp-01",
    date: "2026-11-26",
    total: 12
  },
  {
    id: "slot-03",
    businessId: "negocio-001",
    experienceId: "exp-02",
    date: "2026-11-25",
    total: 8
  },
  {
    id: "slot-04",
    businessId: "negocio-001",
    experienceId: "exp-02",
    date: "2026-11-27",
    total: 10
  }
];

const reservations = [
  {
    id: "R001",
    businessId: "negocio-001",
    slotId: "slot-01",
    experienceId: "exp-01",
    date: "2026-11-25",
    customer: "Carlos Martínez",
    seats: 3,
    status: "Confirmada"
  },
  {
    id: "R002",
    businessId: "negocio-001",
    slotId: "slot-01",
    experienceId: "exp-01",
    date: "2026-11-25",
    customer: "Ana López",
    seats: 2,
    status: "Confirmada"
  },
  {
    id: "R003",
    businessId: "negocio-001",
    slotId: "slot-02",
    experienceId: "exp-01",
    date: "2026-11-26",
    customer: "Roberto Díaz",
    seats: 4,
    status: "Confirmada"
  },
  {
    id: "R004",
    businessId: "negocio-001",
    slotId: "slot-03",
    experienceId: "exp-02",
    date: "2026-11-25",
    customer: "María Flores",
    seats: 3,
    status: "Confirmada"
  },
  {
    id: "R005",
    businessId: "negocio-001",
    slotId: "slot-04",
    experienceId: "exp-02",
    date: "2026-11-27",
    customer: "José Pérez",
    seats: 2,
    status: "Cancelada"
  }
];

// ======================================================
// COMPONENTE PRINCIPAL
// ======================================================

function Metricas() {

  // Estados
  const [report, setReport] = useState("disponibilidad");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [experienceFilter, setExperienceFilter] = useState("todas");

  // Experiencias del negocio del operador
  const operatorExperiences = experiences.filter(
    item => item.businessId === BUSINESS_ID
  );

  // Obtener nombre de experiencia
  const experienceName = (id) =>
    operatorExperiences.find(item => item.id === id)?.name || "Experiencia";

  // ======================================================
  // FILTROS
  // ======================================================

  const filteredSlots = useMemo(() => {
    return slots.filter(slot => {

      if (slot.businessId !== BUSINESS_ID) return false;

      if (startDate && slot.date < startDate) return false;

      if (endDate && slot.date > endDate) return false;

      if (
        experienceFilter !== "todas" &&
        slot.experienceId !== experienceFilter
      ) return false;

      return true;
    });
  }, [startDate, endDate, experienceFilter]);

  // Reservas del negocio, incluyendo canceladas
  const filteredReservations = useMemo(() => {
    return reservations.filter(reservation => {

      if (reservation.businessId !== BUSINESS_ID) return false;

      if (startDate && reservation.date < startDate) return false;

      if (endDate && reservation.date > endDate) return false;

      if (
        experienceFilter !== "todas" &&
        reservation.experienceId !== experienceFilter
      ) return false;

      return true;
    });
  }, [startDate, endDate, experienceFilter]);

  // Reservas que realmente ocupan cupos
  const activeReservations = useMemo(() => {
    return filteredReservations.filter(
      reservation => reservation.status === "Confirmada"
    );
  }, [filteredReservations]);

  // ======================================================
  // CÁLCULOS
  // ======================================================

  // Personas reservadas por cupo/fecha
  const getReserved = (slotId) => {
    return activeReservations
      .filter(item => item.slotId === slotId)
      .reduce((sum, item) => sum + item.seats, 0);
  };

  // Capacidad total
  const totalCapacity = filteredSlots.reduce(
    (sum, slot) => sum + slot.total,
    0
  );

  // Cupos reservados
  const totalReserved = activeReservations.reduce(
    (sum, reservation) => sum + reservation.seats,
    0
  );

  // Cupos disponibles
  const totalAvailable = totalCapacity - totalReserved;

  // Porcentaje de ocupación
  const occupancyPercentage = totalCapacity > 0
    ? (totalReserved / totalCapacity) * 100
    : 0;

  // Disponibilidad agrupada por experiencia
  const availabilityRows = useMemo(() => {

    return operatorExperiences
      .filter(exp =>
        experienceFilter === "todas" ||
        exp.id === experienceFilter
      )
      .map(exp => {

        const experienceSlots = filteredSlots.filter(
          slot => slot.experienceId === exp.id
        );

        const total = experienceSlots.reduce(
          (sum, slot) => sum + slot.total,
          0
        );

        const reserved = experienceSlots.reduce(
          (sum, slot) => sum + getReserved(slot.id),
          0
        );

        return {
          id: exp.id,
          name: exp.name,
          total,
          reserved,
          available: total - reserved
        };
      })
      .filter(row => row.total > 0);

  }, [filteredSlots, activeReservations, experienceFilter]);

  // ======================================================
  // DATOS PARA GRÁFICAS
  // ======================================================

  // Gráfica circular
  const occupancyData = [
    {
      name: "Reservados",
      value: totalReserved
    },
    {
      name: "Disponibles",
      value: totalAvailable
    }
  ];

  // Gráfica de barras por experiencia
  const experienceChartData = availabilityRows.map(item => ({
    name: item.name,
    Reservados: item.reserved,
    Disponibles: item.available
  }));

  // Agrupar reservas confirmadas por fecha
  const reservationsByDate = Object.values(
    activeReservations.reduce((acc, reservation) => {

      if (!acc[reservation.date]) {
        acc[reservation.date] = {
          date: reservation.date,
          reservas: 0
        };
      }

      acc[reservation.date].reservas += reservation.seats;

      return acc;

    }, {})
  ).sort((a, b) => a.date.localeCompare(b.date));

  // ======================================================
  // UTILIDADES
  // ======================================================

  const formatDate = (date) => {

    return new Date(date + "T12:00:00").toLocaleDateString(
      "es-SV",
      {
        day: "2-digit",
        month: "long",
        year: "numeric"
      }
    );
  };

  const formatShortDate = (date) => {

    return new Date(date + "T12:00:00").toLocaleDateString(
      "es-SV",
      {
        day: "2-digit",
        month: "short"
      }
    );
  };

  const clearFilters = () => {
    setStartDate("");
    setEndDate("");
    setExperienceFilter("todas");
  };

  // Botones de reportes
  const reportButtons = [
    {
      id: "disponibilidad",
      label: "Reporte de disponibilidad"
    },
    {
      id: "reservas",
      label: "Reporte de reservas"
    },
    {
      id: "cupos",
      label: "Reporte de cupos por fecha"
    }
  ];

  // ======================================================
  // RENDERIZADO
  // ======================================================

  return (

    <div className="p-6 md:p-8 space-y-8">

      {/* ENCABEZADO */}

      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
          Reportes del operador
        </h1>

        <p className="text-gray-500 mt-2">
          Consulta la disponibilidad y las reservas de tu negocio.
        </p>
      </div>

      {/* NAVEGACIÓN DE REPORTES */}

      <div className="flex flex-wrap gap-3">

        {reportButtons.map(button => (

          <button
            key={button.id}
            onClick={() => setReport(button.id)}
            aria-pressed={report === button.id}
            className={`px-5 py-3 rounded-lg font-semibold transition ${
              report === button.id
                ? "bg-blue-600 text-white shadow-md"
                : "bg-white border border-gray-200 text-gray-700 hover:bg-blue-50"
            }`}
          >
            {button.label}
          </button>

        ))}

      </div>

      {/* FILTROS */}

      <section className="bg-white rounded-xl shadow-sm border p-5">

        <h2 className="font-semibold text-lg text-gray-800 mb-4">
          Filtrar reportes
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

          <div>

            <label className="block text-sm font-medium text-gray-600 mb-2">
              Fecha inicial
            </label>

            <input
              type="date"
              value={startDate}
              max={endDate || undefined}
              onChange={e => setStartDate(e.target.value)}
              className="w-full border rounded-lg p-3"
            />

          </div>

          <div>

            <label className="block text-sm font-medium text-gray-600 mb-2">
              Fecha final
            </label>

            <input
              type="date"
              value={endDate}
              min={startDate || undefined}
              onChange={e => setEndDate(e.target.value)}
              className="w-full border rounded-lg p-3"
            />

          </div>

          <div>

            <label className="block text-sm font-medium text-gray-600 mb-2">
              Experiencia
            </label>

            <select
              value={experienceFilter}
              onChange={e => setExperienceFilter(e.target.value)}
              className="w-full border rounded-lg p-3 bg-white"
            >

              <option value="todas">
                Todas las experiencias
              </option>

              {operatorExperiences.map(exp => (

                <option key={exp.id} value={exp.id}>
                  {exp.name}
                </option>

              ))}

            </select>

          </div>

        </div>

        <button
          onClick={clearFilters}
          className="mt-4 text-blue-600 text-sm font-semibold hover:underline"
        >
          Limpiar filtros
        </button>

      </section>

      {/* RESUMEN GENERAL */}

      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">

        <div className="bg-white border-l-4 border-blue-500 rounded-lg shadow-sm p-5">

          <p className="text-gray-500 text-sm">
            Cupos totales
          </p>

          <p className="text-3xl font-bold text-gray-800 mt-2">
            {totalCapacity}
          </p>

        </div>

        <div className="bg-white border-l-4 border-yellow-500 rounded-lg shadow-sm p-5">

          <p className="text-gray-500 text-sm">
            Cupos reservados
          </p>

          <p className="text-3xl font-bold text-gray-800 mt-2">
            {totalReserved}
          </p>

        </div>

        <div className="bg-white border-l-4 border-green-500 rounded-lg shadow-sm p-5">

          <p className="text-gray-500 text-sm">
            Cupos disponibles
          </p>

          <p className="text-3xl font-bold text-gray-800 mt-2">
            {totalAvailable}
          </p>

        </div>

      </section>

      {/* ==================================================
          ANÁLISIS VISUAL
      ================================================== */}

      <section className="space-y-6">

        <div>
          <h2 className="text-2xl font-bold text-gray-800">
            Análisis visual
          </h2>

          <p className="text-gray-500 text-sm mt-1">
            Indicadores gráficos de tu negocio según los filtros aplicados.
          </p>
        </div>

        {/* GRÁFICA CIRCULAR Y GRÁFICA DE BARRAS */}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* OCUPACIÓN GENERAL */}

          <div className="bg-white rounded-xl border shadow-sm p-5">

            <h3 className="font-bold text-gray-800 mb-2">
              Ocupación general
            </h3>

            <p className="text-sm text-gray-500">
              Relación entre cupos reservados y disponibles.
            </p>

            {totalCapacity === 0 ? (

              <EmptyState />

            ) : (

              <ResponsiveContainer width="100%" height={280}>

                <PieChart>

                  <Pie
                    data={occupancyData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    innerRadius={65}
                    outerRadius={95}
                    paddingAngle={4}
                  >

                    <Cell fill="#2563eb" />
                    <Cell fill="#16a34a" />

                  </Pie>

                  <Tooltip />
                  <Legend />

                </PieChart>

              </ResponsiveContainer>

            )}

            <div className="text-center mt-2">

              <p className="text-3xl font-bold text-blue-600">
                {occupancyPercentage.toFixed(1)}%
              </p>

              <p className="text-sm text-gray-500">
                Tasa de ocupación
              </p>

            </div>

          </div>

          {/* OCUPACIÓN POR EXPERIENCIA */}

          <div className="bg-white rounded-xl border shadow-sm p-5">

            <h3 className="font-bold text-gray-800 mb-2">
              Ocupación por experiencia
            </h3>

            <p className="text-sm text-gray-500">
              Comparación de cupos reservados y disponibles.
            </p>

            {experienceChartData.length === 0 ? (

              <EmptyState />

            ) : (

              <ResponsiveContainer width="100%" height={280}>

                <BarChart
                  data={experienceChartData}
                  margin={{
                    top: 10,
                    right: 10,
                    left: 0,
                    bottom: 10
                  }}
                >

                  <CartesianGrid strokeDasharray="3 3" />

                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 11 }}
                    interval={0}
                  />

                  <YAxis allowDecimals={false} />

                  <Tooltip />

                  <Legend />

                  <Bar
                    dataKey="Reservados"
                    fill="#2563eb"
                    radius={[4, 4, 0, 0]}
                  />

                  <Bar
                    dataKey="Disponibles"
                    fill="#16a34a"
                    radius={[4, 4, 0, 0]}
                  />

                </BarChart>

              </ResponsiveContainer>

            )}

          </div>

        </div>

        {/* EVOLUCIÓN DE RESERVAS */}

        <div className="bg-white rounded-xl border shadow-sm p-5">

          <h3 className="font-bold text-gray-800 mb-2">
            Reservas por fecha
          </h3>

          <p className="text-sm text-gray-500 mb-4">
            Cantidad de personas con reservas confirmadas por día.
          </p>

          {reservationsByDate.length === 0 ? (

            <EmptyState />

          ) : (

            <ResponsiveContainer width="100%" height={300}>

              <LineChart data={reservationsByDate}>

                <CartesianGrid strokeDasharray="3 3" />

                <XAxis
                  dataKey="date"
                  tickFormatter={formatShortDate}
                />

                <YAxis allowDecimals={false} />

                <Tooltip
                  labelFormatter={formatDate}
                />

                <Legend />

                <Line
                  type="monotone"
                  dataKey="reservas"
                  name="Personas reservadas"
                  stroke="#2563eb"
                  strokeWidth={3}
                  activeDot={{ r: 7 }}
                />

              </LineChart>

            </ResponsiveContainer>

          )}

        </div>

      </section>

      {/* ==================================================
          REPORTE DE DISPONIBILIDAD
      ================================================== */}

      {report === "disponibilidad" && (

        <section className="bg-white rounded-xl border shadow-sm p-5">

          <h2 className="text-xl font-bold mb-5 text-gray-800">
            Reporte de disponibilidad
          </h2>

          {availabilityRows.length === 0 ? (

            <EmptyState />

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full text-left">

                <thead className="bg-gray-50 text-gray-600 text-sm">

                  <tr>
                    <th className="p-3">Experiencia</th>
                    <th className="p-3">Cupos totales</th>
                    <th className="p-3">Reservados</th>
                    <th className="p-3">Disponibles</th>
                  </tr>

                </thead>

                <tbody>

                  {availabilityRows.map(row => (

                    <tr key={row.id} className="border-t">

                      <td className="p-3 font-medium">
                        {row.name}
                      </td>

                      <td className="p-3">
                        {row.total}
                      </td>

                      <td className="p-3 text-yellow-700">
                        {row.reserved}
                      </td>

                      <td className="p-3 text-green-700 font-semibold">
                        {row.available}
                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </section>

      )}

      {/* ==================================================
          REPORTE DE RESERVAS
      ================================================== */}

      {report === "reservas" && (

        <section className="bg-white rounded-xl border shadow-sm p-5">

          <h2 className="text-xl font-bold mb-5 text-gray-800">
            Reporte de reservas
          </h2>

          {filteredReservations.length === 0 ? (

            <EmptyState />

          ) : (

            <div className="overflow-x-auto">

              <table className="w-full text-left">

                <thead className="bg-gray-50 text-gray-600 text-sm">

                  <tr>
                    <th className="p-3">Código</th>
                    <th className="p-3">Cliente</th>
                    <th className="p-3">Experiencia</th>
                    <th className="p-3">Fecha</th>
                    <th className="p-3">Personas</th>
                    <th className="p-3">Estado</th>
                  </tr>

                </thead>

                <tbody>

                  {filteredReservations.map(reservation => (

                    <tr key={reservation.id} className="border-t">

                      <td className="p-3 font-medium">
                        {reservation.id}
                      </td>

                      <td className="p-3">
                        {reservation.customer}
                      </td>

                      <td className="p-3">
                        {experienceName(reservation.experienceId)}
                      </td>

                      <td className="p-3">
                        {formatDate(reservation.date)}
                      </td>

                      <td className="p-3">
                        {reservation.seats}
                      </td>

                      <td className="p-3">

                        <span
                          className={`px-2 py-1 rounded-full text-xs ${
                            reservation.status === "Confirmada"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}
                        >
                          {reservation.status}
                        </span>

                      </td>

                    </tr>

                  ))}

                </tbody>

              </table>

            </div>

          )}

        </section>

      )}

      {/* ==================================================
          REPORTE DE CUPOS POR FECHA
      ================================================== */}

      {report === "cupos" && (

        <section className="space-y-5">

          <h2 className="text-xl font-bold text-gray-800">
            Reporte de cupos por fecha
          </h2>

          {filteredSlots.length === 0 ? (

            <EmptyState />

          ) : (

            filteredSlots.map(slot => {

              const slotReservations = filteredReservations.filter(
                item => item.slotId === slot.id
              );

              const reserved = getReserved(slot.id);

              const available = slot.total - reserved;

              return (

                <div
                  key={slot.id}
                  className="bg-white rounded-xl border shadow-sm p-5"
                >

                  <div className="flex flex-wrap justify-between gap-2 mb-4">

                    <div>

                      <h3 className="font-bold text-gray-800 text-lg">
                        {experienceName(slot.experienceId)}
                      </h3>

                      <p className="text-gray-500 text-sm">
                        {formatDate(slot.date)}
                      </p>

                    </div>

                  </div>

                  {/* CUPOS */}

                  <div className="grid grid-cols-3 gap-3 mb-5">

                    <div className="bg-blue-50 p-3 rounded-lg">

                      <p className="text-xs text-blue-700">
                        Totales
                      </p>

                      <p className="text-2xl font-bold">
                        {slot.total}
                      </p>

                    </div>

                    <div className="bg-yellow-50 p-3 rounded-lg">

                      <p className="text-xs text-yellow-700">
                        Reservados
                      </p>

                      <p className="text-2xl font-bold">
                        {reserved}
                      </p>

                    </div>

                    <div className="bg-green-50 p-3 rounded-lg">

                      <p className="text-xs text-green-700">
                        Disponibles
                      </p>

                      <p className="text-2xl font-bold">
                        {available}
                      </p>

                    </div>

                  </div>

                  {/* BARRA DE OCUPACIÓN */}

                  <div className="mb-5">

                    <div className="flex justify-between text-sm mb-2">

                      <span className="text-gray-600">
                        Ocupación
                      </span>

                      <span className="font-semibold">
                        {slot.total > 0
                          ? ((reserved / slot.total) * 100).toFixed(1)
                          : 0}%
                      </span>

                    </div>

                    <div className="w-full bg-gray-100 rounded-full h-3 overflow-hidden">

                      <div
                        className="bg-blue-600 h-3 rounded-full transition-all"
                        style={{
                          width: `${slot.total > 0
                            ? Math.min((reserved / slot.total) * 100, 100)
                            : 0}%`
                        }}
                      />

                    </div>

                  </div>

                  {/* LISTA DE RESERVAS */}

                  <h4 className="font-semibold text-gray-700 mb-3">
                    Reservas de esta fecha
                  </h4>

                  {slotReservations.length === 0 ? (

                    <p className="text-gray-500 text-sm">
                      No hay reservas registradas para esta fecha.
                    </p>

                  ) : (

                    <div className="space-y-2">

                      {slotReservations.map(reservation => (

                        <div
                          key={reservation.id}
                          className="flex justify-between items-center border-b pb-2 text-sm"
                        >

                          <div>

                            <p className="font-medium">
                              {reservation.customer}
                            </p>

                            <p className="text-gray-500">
                              Reserva {reservation.id}
                            </p>

                            {reservation.status === "Cancelada" && (
                              <span className="text-red-600 text-xs">
                                Cancelada
                              </span>
                            )}

                          </div>

                          <span className="font-semibold">
                            {reservation.seats} personas
                          </span>

                        </div>

                      ))}

                    </div>

                  )}

                </div>

              );

            })

          )}

        </section>

      )}

    </div>

  );

}

// ======================================================
// ESTADO VACÍO
// ======================================================

function EmptyState() {

  return (

    <div className="text-center py-12 px-4">

      <div className="text-4xl mb-3">
        📊
      </div>

      <h3 className="font-semibold text-gray-700">
        No hay datos disponibles
      </h3>

      <p className="text-gray-500 text-sm mt-2">
        No se encontraron registros para los filtros seleccionados.
        Intenta modificar el rango de fechas o la experiencia.
      </p>

    </div>

  );

}

export default Metricas;
