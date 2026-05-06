import React from 'react';
import ModalGenerico from './ModalGenerico';
import { Smartphone, Monitor } from 'lucide-react';

export default function ModalInstall({ isOpen, onClose }) {
  return (
    <ModalGenerico isOpen={isOpen} onClose={onClose} title="📲 Instalar en tu dispositivo">
      <div className="space-y-5 text-sm">
        <p className="text-gray-600">Esta aplicación funciona como una <strong>PWA (App Web Progresiva)</strong>. Puedes instalarla en cualquier dispositivo y usarla como una app nativa, sin necesidad de descarga desde ninguna tienda.</p>

        {/* iOS */}
        <div className="border border-gray-100 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 font-semibold text-gray-800">
            <Smartphone size={18} style={{ color: '#1239AD' }} />
            iPhone / iPad (Safari)
          </div>
          <ol className="list-decimal list-inside space-y-1 text-gray-600 ml-1">
            <li>Abre la app en <strong>Safari</strong></li>
            <li>Toca el botón <strong>Compartir</strong> <span className="font-mono bg-gray-100 px-1 rounded">⬆</span> en la barra inferior</li>
            <li>Desplázate y selecciona <strong>"Añadir a pantalla de inicio"</strong></li>
            <li>Escribe el nombre y pulsa <strong>Añadir</strong></li>
          </ol>
          <p className="text-xs text-gray-400 mt-1">✅ Aparecerá como una app en tu pantalla de inicio</p>
        </div>

        {/* Android */}
        <div className="border border-gray-100 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 font-semibold text-gray-800">
            <Smartphone size={18} style={{ color: '#99B9AF' }} />
            Android (Chrome)
          </div>
          <ol className="list-decimal list-inside space-y-1 text-gray-600 ml-1">
            <li>Abre la app en <strong>Chrome</strong></li>
            <li>Toca los <strong>3 puntos</strong> (menú) en la esquina superior derecha</li>
            <li>Selecciona <strong>"Instalar aplicación"</strong> o <strong>"Añadir a pantalla de inicio"</strong></li>
            <li>Confirma pulsando <strong>Instalar</strong></li>
          </ol>
          <p className="text-xs text-gray-400 mt-1">✅ Se instala automáticamente sin pasar por Play Store</p>
        </div>

        {/* Ordenador */}
        <div className="border border-gray-100 rounded-xl p-4 space-y-2">
          <div className="flex items-center gap-2 font-semibold text-gray-800">
            <Monitor size={18} style={{ color: '#7C3AED' }} />
            Ordenador (Windows / Mac / Linux)
          </div>
          <ol className="list-decimal list-inside space-y-1 text-gray-600 ml-1">
            <li>Abre la app en <strong>Chrome</strong> o <strong>Edge</strong></li>
            <li>Haz clic en el icono de <strong>instalar</strong> <span className="font-mono bg-gray-100 px-1 rounded">⊕</span> en la barra de dirección (extremo derecho)</li>
            <li>O entra en el menú <strong>⋮ → Instalar Farmacia Control</strong></li>
            <li>Confirma la instalación</li>
          </ol>
          <p className="text-xs text-gray-400 mt-1">✅ Se abre como ventana propia, sin barra del navegador</p>
        </div>

        <div className="bg-blue-50 rounded-xl p-3 text-blue-800 text-xs">
          <strong>💡 Consejo:</strong> Los datos se guardan en la nube y están disponibles en todos tus dispositivos al iniciar sesión. Sin internet funciona en modo lectura.
        </div>
      </div>
    </ModalGenerico>
  );
}