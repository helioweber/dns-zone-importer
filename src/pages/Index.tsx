
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import Header from '@/components/Header';
import FileUploader from '@/components/FileUploader';
import RecordsPreview from '@/components/RecordsPreview';
import ApiConfig from '@/components/ApiConfig';
import { DnsRecord } from '@/utils/parser';
import { ArrowDown } from 'lucide-react';

const Index = () => {
  const [parsedRecords, setParsedRecords] = useState<DnsRecord[] | null>(null);
  const [importComplete, setImportComplete] = useState(false);

  const handleParsedData = (data: DnsRecord[] | null) => {
    setParsedRecords(data);
    setImportComplete(false);
  };

  const handleImportSuccess = () => {
    setImportComplete(true);
    setParsedRecords(null);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
        <div className="space-y-8">
          <section>
            <h2 className="text-2xl font-semibold mb-4">Upload de Arquivo</h2>
            <FileUploader onParsedData={handleParsedData} />
          </section>

          {parsedRecords && parsedRecords.length > 0 && (
            <>
              <div className="flex justify-center my-6">
                <div className="animate-bounce bg-muted rounded-full p-2">
                  <ArrowDown className="h-6 w-6 text-muted-foreground" />
                </div>
              </div>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Visualizar Registros</h2>
                <RecordsPreview records={parsedRecords} />
              </section>

              <div className="flex justify-center my-6">
                <div className="animate-bounce bg-muted rounded-full p-2">
                  <ArrowDown className="h-6 w-6 text-muted-foreground" />
                </div>
              </div>

              <section>
                <h2 className="text-2xl font-semibold mb-4">Importar para Azion</h2>
                <ApiConfig 
                  records={parsedRecords} 
                  onSubmitSuccess={handleImportSuccess} 
                />
              </section>
            </>
          )}

          {importComplete && (
            <section className="animate-fade-in">
              <Card className="bg-green-50 border-green-200">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center space-x-4">
                    <div className="h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-medium text-green-900">Importação Concluída</h3>
                      <p className="text-green-700">
                        Todos os registros foram importados com sucesso para a API da Azion.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </section>
          )}
        </div>
      </main>

      <footer className="py-6 border-t">
        <div className="container mx-auto px-4 text-center text-muted-foreground text-sm">
          <p>
            DNS Zone Importer para Azion &copy; {new Date().getFullYear()}
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
