
export interface DnsRecord {
  record_type: string;
  entry?: string;
  answers_list: string[] | string;
  ttl: number;
  policy?: string;
  weight?: number;
  description?: string;
}

// Parser para arquivos de zona DNS
export function parseDnsZoneFile(content: string): DnsRecord[] {
  const lines = content.split('\n');
  const records: DnsRecord[] = [];
  let currentOrigin = '';

  for (let line of lines) {
    // Remover comentários
    line = line.replace(/;.*$/, '').trim();
    
    // Ignorar linhas vazias
    if (line === '') continue;
    
    // Controles especiais como $ORIGIN, $TTL, etc
    if (line.startsWith('$ORIGIN')) {
      currentOrigin = line.split(/\s+/)[1];
      continue;
    }
    
    if (line.startsWith('$') || line.startsWith('@')) {
      // Processar outras diretivas como $TTL ou registros SOA
      continue;
    }
    
    // Parseando registros regulares
    try {
      const parsedRecord = parseRecordLine(line, currentOrigin);
      if (parsedRecord) {
        records.push(parsedRecord);
      }
    } catch (error) {
      console.warn(`Failed to parse line: ${line}`, error);
    }
  }
  
  return records;
}

function parseRecordLine(line: string, currentOrigin: string): DnsRecord | null {
  // Dividir a linha em tokens, considerando espaços em branco como separadores
  const tokens = line.split(/\s+/).filter(Boolean);
  
  if (tokens.length < 3) return null;
  
  let i = 0;
  let entry = tokens[i++];
  
  // Se o primeiro token for um TTL numérico, ajustar o índice
  if (/^\d+$/.test(entry)) {
    entry = tokens[i++];
  }
  
  // Lidar com "IN" class (Internet) que pode estar presente ou não
  if (tokens[i].toUpperCase() === 'IN') {
    i++;
  }
  
  // O tipo de registro (A, AAAA, CNAME, etc.)
  const recordType = tokens[i++];
  
  // Resto da linha como resposta
  const answersData = tokens.slice(i).join(' ');
  let answers: string[] | string = answersData;
  
  // Para alguns tipos de registros, processar respostas específicas
  if (['MX', 'SRV'].includes(recordType)) {
    // MX e SRV geralmente têm prioridades/pesos
    answers = answersData;
  } else if (['TXT'].includes(recordType)) {
    // TXT pode ter conteúdo com espaços e aspas
    answers = answersData.replace(/^"(.*)"$/, '$1');
  } else if (answersData.includes(' ')) {
    // Múltiplas respostas para o mesmo registro
    answers = answersData.split(/\s+/);
  }
  
  // Se entry for "@", substituir pelo domínio atual
  if (entry === '@') {
    entry = currentOrigin || '';
  }
  
  // Processar registros baseado no tipo
  return {
    record_type: recordType,
    entry: entry === currentOrigin ? '' : entry,
    answers_list: answers,
    ttl: 3600, // Valor padrão, poderia ser extraído do arquivo se especificado
  };
}

// Função auxiliar para detectar o tipo de arquivo e adequar o parser
export function detectAndParse(content: string): DnsRecord[] {
  // Aqui poderíamos adicionar lógica para detectar diferentes formatos
  // Por enquanto, vamos apenas usar o parser padrão
  return parseDnsZoneFile(content);
}
