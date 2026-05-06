import React from 'react';
import { Users, Download, Upload } from 'lucide-react';
import CalendarioGlobal from './CalendarioGlobal';

export default function VistaDashboard({ 
  anioActual, setAnioActual, empleados, eventos, festivos, estadisticas,
  onSelectEmpleado, onExportDB, onImportDB
}) {
  const currentYear = new Date().getFullYear();
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">Resumen general del año {anioActual}</p>
        </div>
        <div className="flex items-center gap-2">
          <input
            type="number"
            min="2000"
            max={currentYear + 20}
            value={anioActual}
            onChange={(e) => setAnioActual(Number(e.target.value) || currentYear)}
            className="w-24 px-3 py-2 border border-gray-200 rounded-xl text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          />
          <button 
            onClick={onExportDB}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Download size={15} />
            <span className="hidden sm:inline">Backup</span>
          </button>
          <button 
            onClick={onImportDB}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border border-gray-200 text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Upload size={15} />
            <span className="hidden sm:inline">Importar</span>
          </button>
        </div>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">Empleados</span>
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: '#EEF1FB' }}>
              <Users size={16} style={{ color: '#1239AD' }} />
            </div>
          </div>
          <p className="text-3xl font-bold text-gray-900">{estadisticas.totalEmpleados}</p>
          <p className="text-xs text-gray-400 mt-1">activos</p>
        </div>

        {estadisticas.empleados.slice(0, 3).map(stat => (
          <div key={stat.empleado.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm cursor-pointer hover:border-blue-200 transition-colors" onClick={() => onSelectEmpleado(stat.empleado)}>
            <span className="text-xs font-medium text-gray-500 uppercase tracking-wider">{stat.empleado.nombre}</span>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Vac</span>
                <span className="font-semibold" style={{ color: '#1239AD' }}>{stat.vacaciones.disponibles}/{stat.vacaciones.total}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Sáb</span>
                <span className="font-semibold" style={{ color: '#99B9AF' }}>{stat.sabados.usados}/{stat.sabados.porSaldo}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Saldo</span>
                <span className={`font-semibold ${stat.horas.saldo >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                  {stat.horas.saldo > 0 ? '+' : ''}{stat.horas.saldo}h
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Calendario global */}
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <CalendarioGlobal anio={anioActual} empleados={empleados} eventos={eventos} festivos={festivos} />
      </div>

      {/* Resumen empleados */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-5 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">Resumen Empleados</h2>
        </div>
        <div className="divide-y divide-gray-50">
          {estadisticas.empleados.map(stat => (
            <div 
              key={stat.empleado.id} 
              className="flex items-center justify-between p-4 hover:bg-gray-50/80 cursor-pointer transition-colors"
              onClick={() => onSelectEmpleado(stat.empleado)}
            >
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 text-sm">{stat.empleado.nombre}</p>
                <p className="text-xs text-gray-400 mt-0.5">Alta: {stat.empleado.fecha_alta}</p>
              </div>
              <div className="flex gap-5 text-xs">
                <div className="text-center">
                  <p className="text-gray-400 mb-0.5">Vacaciones</p>
                  <p className="font-bold" style={{ color: '#1239AD' }}>{stat.vacaciones.disponibles}/{stat.vacaciones.total}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 mb-0.5">Asuntos</p>
                  <p className="font-bold text-purple-600">{stat.asuntos.disponibles}/{stat.asuntos.total}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 mb-0.5">Sábados</p>
                  <p className="font-bold" style={{ color: '#99B9AF' }}>{stat.sabados.usados}/{stat.sabados.porSaldo}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 mb-0.5">Saldo</p>
                  <p className={`font-bold ${stat.horas.saldo >= 0 ? 'text-emerald-600' : 'text-red-500'}`}>
                    {stat.horas.saldo > 0 ? '+' : ''}{stat.horas.saldo}h
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}