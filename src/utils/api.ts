
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
    console.log('Creating DNS zone with payload:', payload);
    
    const response = await fetch(`${API_BASE_URL}/intelligent_dns`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${token}`,
        'Accept': 'application/json; version=3',
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      let errorMessage = `Erro ${response.status}: Falha ao criar zona DNS`;
      
      // Tenta obter detalhes do erro do corpo da resposta
      try {
        const errorData = await response.json();
        if (errorData.error) {
          errorMessage = errorData.error;
        } else if (errorData.errors) {
          errorMessage = Object.values(errorData.errors).flat().join(', ');
        }
      } catch (parseError) {
        console.error('Erro ao processar resposta de erro:', parseError);
      }
      
      throw new Error(errorMessage);
    }
    
    const data = await response.json();
    console.log('DNS zone created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error creating DNS zone:', error);
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new Error('Falha na conexão com a API. Verifique sua conexão com a internet ou se há problemas de CORS.');
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
    console.log(`Creating ${records.length} DNS records for zone ID ${zoneId}`);
    
    // Para cada registro, fazer uma requisição separada
    const results = await Promise.all(
      records.map(async (record) => {
        console.log('Creating DNS record:', record);
        
        const response = await fetch(`${API_BASE_URL}/intelligent_dns/${zoneId}/records`, {
          method: 'POST',
          headers: {
            'Authorization': `Token ${token}`,
            'Accept': 'application/json; version=3',
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
          },
          body: JSON.stringify(record)
        });

        if (!response.ok) {
          let errorMessage = `Erro ${response.status}: Falha ao criar registro DNS`;
          
          // Tenta obter detalhes do erro do corpo da resposta
          try {
            const errorData = await response.json();
            if (errorData.error) {
              errorMessage = errorData.error;
            } else if (errorData.errors) {
              errorMessage = Object.values(errorData.errors).flat().join(', ');
            }
          } catch (parseError) {
            console.error('Erro ao processar resposta de erro para registro:', parseError);
          }
          
          throw new Error(errorMessage);
        }
        
        const data = await response.json();
        console.log('DNS record created successfully:', data);
        return data;
      })
    );
    
    return { results };
  } catch (error) {
    console.error('Error creating DNS records:', error);
    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
      throw new Error('Falha na conexão com a API. Verifique sua conexão com a internet ou se há problemas de CORS.');
    }
    throw error;
  }
}
