
// Interface para a criação de zonas DNS
interface CreateZonePayload {
  name: string;
  domain: string;
  is_active: boolean;
}

// Interface para resposta da API
interface ApiResponse {
  id?: number;
  results?: any;
  error?: string;
  errors?: Record<string, string[]>;
}

// Base URL da API
const API_BASE_URL = 'https://api.azionapi.net';

// Função para criar uma zona DNS
export async function createDnsZone(
  token: string, 
  payload: CreateZonePayload
): Promise<ApiResponse> {
  try {
    console.log('[VERBOSE] Iniciando criação de zona DNS');
    console.log('[VERBOSE] Payload:', JSON.stringify(payload, null, 2));
    console.log('[VERBOSE] URL:', `${API_BASE_URL}/intelligent_dns`);
    
    const headers = {
      'Authorization': `Token ${token}`,
      'Accept': 'application/json; version=3',
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    };
    
    console.log('[VERBOSE] Headers:', JSON.stringify(headers, null, 2));
    console.log('[VERBOSE] Token (parcial):', token.substring(0, 5) + '...' + token.substring(token.length - 5));
    
    const response = await fetch(`${API_BASE_URL}/intelligent_dns`, {
      method: 'POST',
      headers,
      body: JSON.stringify(payload)
    });

    console.log('[VERBOSE] Resposta status:', response.status);
    console.log('[VERBOSE] Resposta status text:', response.statusText);
    console.log('[VERBOSE] Resposta headers:', JSON.stringify(Object.fromEntries([...response.headers.entries()]), null, 2));
    
    if (!response.ok) {
      console.error('[VERBOSE] Resposta não-OK recebida');
      let errorMessage = `Erro ${response.status}: Falha ao criar zona DNS`;
      
      // Tenta obter detalhes do erro do corpo da resposta
      try {
        const errorData = await response.json();
        console.error('[VERBOSE] Corpo do erro:', JSON.stringify(errorData, null, 2));
        
        if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.errors) {
          errorMessage = Object.values(errorData.errors).flat().join(', ');
        }
      } catch (parseError) {
        console.error('[VERBOSE] Erro ao processar resposta de erro:', parseError);
        console.error('[VERBOSE] Texto da resposta:', await response.text().catch(() => 'Não foi possível ler o corpo da resposta'));
      }
      
      throw new Error(errorMessage);
    }
    
    try {
      const responseText = await response.text();
      console.log('[VERBOSE] Resposta texto completo:', responseText);
      
      const data = JSON.parse(responseText);
      console.log('[VERBOSE] Zona DNS criada com sucesso:', JSON.stringify(data, null, 2));
      return data;
    } catch (parseError) {
      console.error('[VERBOSE] Erro ao processar resposta JSON:', parseError);
      throw new Error('Resposta inválida da API');
    }
  } catch (error) {
    console.error('[VERBOSE] Erro durante a criação de zona DNS:', error);
    
    if (error instanceof TypeError) {
      console.error('[VERBOSE] Tipo de erro:', 'TypeError');
      if (error.message.includes('Failed to fetch')) {
        console.error('[VERBOSE] Detalhe do erro: Failed to fetch - possível problema de CORS ou conexão');
        throw new Error('Falha na conexão com a API. Verifique sua conexão com a internet ou se há problemas de CORS.');
      }
    }
    
    throw error;
  }
}

// Função para criar registros DNS
export async function createDnsRecords(
  token: string,
  zoneId: number,
  records: any[]
): Promise<ApiResponse> {
  try {
    console.log(`[VERBOSE] Iniciando criação de ${records.length} registros DNS para zona ID ${zoneId}`);
    
    // Para cada registro, fazer uma requisição separada
    const results = await Promise.all(
      records.map(async (record, index) => {
        console.log(`[VERBOSE] Processando registro #${index + 1}:`, JSON.stringify(record, null, 2));
        console.log(`[VERBOSE] URL para registro #${index + 1}:`, `${API_BASE_URL}/intelligent_dns/${zoneId}/records`);
        
        const headers = {
          'Authorization': `Token ${token}`,
          'Accept': 'application/json; version=3',
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        };
        
        console.log(`[VERBOSE] Headers para registro #${index + 1}:`, JSON.stringify(headers, null, 2));
        
        const response = await fetch(`${API_BASE_URL}/intelligent_dns/${zoneId}/records`, {
          method: 'POST',
          headers,
          body: JSON.stringify(record)
        });

        console.log(`[VERBOSE] Resposta para registro #${index + 1} status:`, response.status);
        console.log(`[VERBOSE] Resposta para registro #${index + 1} status text:`, response.statusText);
        console.log(`[VERBOSE] Resposta para registro #${index + 1} headers:`, 
          JSON.stringify(Object.fromEntries([...response.headers.entries()]), null, 2));
        
        if (!response.ok) {
          console.error(`[VERBOSE] Resposta não-OK recebida para registro #${index + 1}`);
          let errorMessage = `Erro ${response.status}: Falha ao criar registro DNS`;
          
          // Tenta obter detalhes do erro do corpo da resposta
          try {
            const errorData = await response.json();
            console.error(`[VERBOSE] Corpo do erro para registro #${index + 1}:`, JSON.stringify(errorData, null, 2));
            
            if (errorData.error) {
              errorMessage = errorData.error;
            } else if (errorData.errors) {
              errorMessage = Object.values(errorData.errors).flat().join(', ');
            }
          } catch (parseError) {
            console.error(`[VERBOSE] Erro ao processar resposta de erro para registro #${index + 1}:`, parseError);
            console.error(`[VERBOSE] Texto da resposta para registro #${index + 1}:`, 
              await response.text().catch(() => 'Não foi possível ler o corpo da resposta'));
          }
          
          throw new Error(errorMessage);
        }
        
        try {
          const responseText = await response.text();
          console.log(`[VERBOSE] Resposta texto completo para registro #${index + 1}:`, responseText);
          
          const data = JSON.parse(responseText);
          console.log(`[VERBOSE] Registro DNS #${index + 1} criado com sucesso:`, JSON.stringify(data, null, 2));
          return data;
        } catch (parseError) {
          console.error(`[VERBOSE] Erro ao processar resposta JSON para registro #${index + 1}:`, parseError);
          throw new Error('Resposta inválida da API');
        }
      })
    );
    
    console.log('[VERBOSE] Todos os registros DNS criados com sucesso');
    return { results };
  } catch (error) {
    console.error('[VERBOSE] Erro durante a criação de registros DNS:', error);
    
    if (error instanceof TypeError) {
      console.error('[VERBOSE] Tipo de erro:', 'TypeError');
      if (error.message.includes('Failed to fetch')) {
        console.error('[VERBOSE] Detalhe do erro: Failed to fetch - possível problema de CORS ou conexão');
        throw new Error('Falha na conexão com a API. Verifique sua conexão com a internet ou se há problemas de CORS.');
      }
    }
    
    throw error;
  }
}
