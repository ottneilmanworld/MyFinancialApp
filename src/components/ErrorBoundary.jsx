import React from 'react';

// Atrapa cualquier error de render en los componentes hijos y muestra una
// pantalla de recuperación en vez de dejar la app en blanco. Sin esto, un
// solo error (ej. undefined.map()) tumba la app completa para un usuario
// que está pagando por ella.
export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // TODO: cuando agregues analítica/monitoreo (ej. Sentry), reporta aquí:
    // Sentry.captureException(error, { extra: errorInfo });
    console.error('Error capturado por ErrorBoundary:', error, errorInfo);
  }

  handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-black text-white flex items-center justify-center p-6">
          <div className="max-w-md text-center bg-gray-900 border border-gray-700 rounded-xl p-8">
            <p className="text-5xl mb-4">⚠️</p>
            <h1 className="text-2xl font-bold text-red-400 mb-2">Algo salió mal</h1>
            <p className="text-gray-400 text-sm mb-6">
              Tus datos están a salvo (se guardan en la nube y en tu dispositivo).
              Intenta recargar la página. Si el problema persiste, contáctanos.
            </p>
            <button
              onClick={this.handleReload}
              className="bg-green-600 hover:bg-green-700 text-white font-bold px-6 py-3 rounded-lg transition-all"
            >
              Recargar aplicación
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}