
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
    const response = await fetch(`${API_BASE_URL}/intelligent_dns`, {
      method: 'POST',
      headers: {
        'Authorization': `Token ${token}`,
        'Accept': 'application/json; version=3',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(
        data.error || 
        Object.values(data.errors || {}).flat().join(', ') || 
        `Erro ${response.status}: Falha ao criar zona DNS`
      );
    }
    
    return data;
  } catch (error) {
    console.error('Error creating DNS zone:', error);
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
    // Para cada registro, fazer uma requisição separada
    const results = await Promise.all(
      records.map(async (record) => {
        const response = await fetch(`${API_BASE_URL}/intelligent_dns/${zoneId}/records`, {
          method: 'POST',
          headers: {
            'Authorization': `Token ${token}`,
            'Accept': 'application/json; version=3',
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(record)
        });

        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(
            data.error || 
            Object.values(data.errors || {}).flat().join(', ') || 
            `Erro ${response.status}: Falha ao criar registro DNS`
          );
        }
        
        return data;
      })
    );
    
    return { results };
  } catch (error) {
    console.error('Error creating DNS records:', error);
    throw error;
  }
}
