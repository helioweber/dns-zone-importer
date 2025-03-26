
import React, { useMemo } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { DnsRecord } from '@/utils/parser';

interface RecordsPreviewProps {
  records: DnsRecord[] | null;
}

const RecordsPreview: React.FC<RecordsPreviewProps> = ({ records }) => {
  const recordTypes = useMemo(() => {
    if (!records) return [];
    const types = [...new Set(records.map(r => r.record_type))];
    return ['Todos', ...types];
  }, [records]);

  if (!records || records.length === 0) {
    return null;
  }

  return (
    <Card className="w-full mt-6 animate-slide-up">
      <CardHeader>
        <CardTitle>Registros DNS Encontrados</CardTitle>
        <CardDescription>
          {records.length} registros detectados no arquivo
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="Todos">
          <TabsList className="mb-4">
            {recordTypes.map(type => (
              <TabsTrigger key={type} value={type}>{type}</TabsTrigger>
            ))}
          </TabsList>
          
          {recordTypes.map(type => (
            <TabsContent key={type} value={type}>
              <ScrollArea className="h-[400px]">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Entrada</TableHead>
                      <TableHead>Respostas</TableHead>
                      <TableHead>TTL</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {records
                      .filter(record => type === 'Todos' || record.record_type === type)
                      .map((record, index) => (
                        <TableRow key={index} className="hover:bg-muted/50">
                          <TableCell>
                            <Badge variant="outline" className="font-mono">
                              {record.record_type}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">{record.entry || '@'}</TableCell>
                          <TableCell>
                            <div className="max-w-[300px] break-words">
                              {Array.isArray(record.answers_list) 
                                ? record.answers_list.map((answer, i) => (
                                    <div key={i} className="text-sm">
                                      {answer}
                                    </div>
                                  ))
                                : record.answers_list}
                            </div>
                          </TableCell>
                          <TableCell>{record.ttl}</TableCell>
                        </TableRow>
                      ))}
                  </TableBody>
                </Table>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default RecordsPreview;
