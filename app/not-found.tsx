export default function NotFound() {
  return (
    <div className="bg-gray-100 h-screen flex items-center justify-center">
    <div className="text-center">
        <h1 className="text-9xl font-bold text-primary-dark">404</h1>
        <p className="text-2xl font-light text-gray-600 mt-4">Oops! Página não encontrada</p>
        <p className="text-gray-500 mt-4 mb-8 max-w-md mx-auto">A página que você está procurando pode ter sido removida ou está temporariamente indisponível.</p>
        <a href="/" className="px-4 py-2 bg-primary text-white rounded hover:bg-primary-dark transition duration-300">
            Voltar para a página inicial
        </a>
    </div>
    </div>
  );
}
