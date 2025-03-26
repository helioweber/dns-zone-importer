
import React from 'react';

const Header = () => {
  return (
    <header className="w-full py-6 animate-slide-down">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-medium mb-3 animate-fade-in">
            Importador de Zonas DNS
          </div>
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
            DNS Zone Importer
          </h1>
          <p className="text-muted-foreground max-w-[700px]">
            Ferramenta para importar zonas de DNS através de arquivos .txt e enviar para a API da Azion.
          </p>
        </div>
      </div>
    </header>
  );
};

export default Header;
