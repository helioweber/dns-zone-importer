
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { AlertCircle, Check, Copy, Eye, EyeOff } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { createDnsZone, createDnsRecords } from '@/utils/api';
import { DnsRecord } from '@/utils/parser';

interface ApiConfigProps {
  records: DnsRecord[] | null;
  onSubmitSuccess: () => void;
}

const ApiConfig: React.FC<ApiConfigProps> = ({ records, onSubmitSuccess }) => {
  const { toast } = useToast();
  const [token, setToken] = useState('');
  const [zoneName, setZoneName] = useState('');
  const [domain, setDomain] = useState('');
  const [showToken, setShowToken] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCopyToken = () => {
    navigator.clipboard.writeText(token);
    toast({
      title: "Token copiado",
      description: "O token foi copiado para a área de transferência.",
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!token || !zoneName || !domain) {
      setError("Todos os campos são obrigatórios");
      return;
    }

    if (!records || records.length === 0) {
      setError("Nenhum registro DNS detectado para importar");
      return;
    }

    try {
      setError(null);
      setIsSubmitting(true);
      
      // Convertendo registros DnsRecord do parser para o formato esperado pela API
      const apiRecords = records.map(record => {
        return {
          record_type: record.type,
          entry: record.name,
          answers_list: [record.value],
          ttl: record.ttl || 3600,
          policy: "simple",
          weight: 255,
          description: ""
        };
      });
      
      // Primeiro, criar a zona de DNS
      const zoneResponse = await createDnsZone(token, {
        name: zoneName,
        domain: domain,
        active: true,
        soa_ttl: 3600,
        refresh: 43200,
        retry: 7200,
        expiry: 1209600,
        nx_ttl: 3600
      });
      
      // Se a criação da zona for bem-sucedida, criar os registros
      if (zoneResponse.id) {
        await createDnsRecords(token, zoneResponse.id, apiRecords);
        
        toast({
          title: "Importação concluída com sucesso",
          description: `Zona '${zoneName}' criada com ${records.length} registros.`,
        });
        
        onSubmitSuccess();
        
        // Limpar o formulário
        setToken('');
        setZoneName('');
        setDomain('');
      }
    } catch (err) {
      console.error('Error importing DNS zone:', err);
      setError(err instanceof Error ? err.message : 'Erro na importação da zona DNS');
      
      toast({
        variant: "destructive",
        title: "Erro na importação",
        description: err instanceof Error ? err.message : 'Erro ao processar a requisição',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = token && zoneName && domain && records && records.length > 0;

  return (
    <Card className={cn(
      "w-full mt-6 transition-all duration-300 animate-slide-up",
      !records && "opacity-50 pointer-events-none"
    )}>
      <CardHeader>
        <CardTitle>Configuração da API Azion</CardTitle>
        <CardDescription>
          Configure as credenciais da API e informações da zona DNS
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-6">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="apiToken">Token da API Azion</Label>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="h-8 w-8"
                  onClick={() => setShowToken(!showToken)}
                >
                  {showToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  <span className="sr-only">
                    {showToken ? "Esconder token" : "Mostrar token"}
                  </span>
                </Button>
              </div>
              <div className="flex">
                <Input
                  id="apiToken"
                  type={showToken ? "text" : "password"}
                  placeholder="Insira seu token de acesso à API"
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                  className="flex-grow"
                />
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  className="ml-2"
                  onClick={handleCopyToken}
                  disabled={!token}
                >
                  <Copy className="h-4 w-4" />
                  <span className="sr-only">Copiar token</span>
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                O token é utilizado somente para fazer requisições à API, nunca é armazenado.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="zoneName">Nome da Zona</Label>
                <Input
                  id="zoneName"
                  placeholder="exemplo.com.br"
                  value={zoneName}
                  onChange={(e) => setZoneName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="domain">Domínio</Label>
                <Input
                  id="domain"
                  placeholder="exemplo.com.br"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                />
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Erro</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </form>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full group"
          disabled={!isFormValid || isSubmitting} 
          onClick={handleSubmit}
        >
          {isSubmitting ? (
            <>
              <div className="mr-2 h-4 w-4 animate-spin rounded-full border-b-2 border-current"></div>
              Enviando...
            </>
          ) : (
            <>
              <Check className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
              Importar Zona DNS
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ApiConfig;
