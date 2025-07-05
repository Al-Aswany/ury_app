import React, { useEffect, useState } from 'react';
import { X, Circle, Square, RectangleHorizontal, AlertTriangle, Loader } from 'lucide-react';
import { usePOSStore } from '../store/pos-store';
import { Dialog, DialogContent } from './ui/dialog';
import { Button } from './ui/button';
import { cn } from '../lib/utils';
import { getRooms, getTables, Room, Table } from '../lib/table-api';

interface Props {
  onClose: () => void;
}

const TableIcon = ({ type, className }: { type: 'round' | 'square' | 'rectangle' | undefined; className?: string }) => {
  switch (type) {
    case 'round':
      return <Circle className={className} />;
    case 'square':
      return <Square className={className} />;
    case 'rectangle':
      return <RectangleHorizontal className={className} />;
    default:
      return <Square className={className} />;
  }
};

const TableSelectionDialog: React.FC<Props> = ({ onClose }) => {
  const { selectedTable, setSelectedTable, posProfile } = usePOSStore();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [tables, setTables] = useState<Table[]>([]);
  const [tablesCache, setTablesCache] = useState<Record<string, Table[]>>({});
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [loadingRooms, setLoadingRooms] = useState(false);
  const [loadingTables, setLoadingTables] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch rooms on mount
  useEffect(() => {
    async function fetchRooms() {
      if (!posProfile?.branch) return;
      setLoadingRooms(true);
      setError(null);
      try {
        const fetchedRooms = await getRooms(posProfile.branch);
        setRooms(fetchedRooms);
        if (fetchedRooms.length > 0) {
          setSelectedRoom(fetchedRooms[0].name);
        }
      } catch (e) {
        setError('Failed to load rooms');
      } finally {
        setLoadingRooms(false);
      }
    }
    fetchRooms();
  }, [posProfile?.branch]);

  // Fetch tables when selectedRoom changes, but cache per room
  useEffect(() => {
    async function fetchTables() {
      if (!selectedRoom) return;
      setError(null);
      // If already cached, use cache
      if (tablesCache[selectedRoom]) {
        setTables(tablesCache[selectedRoom]);
        setLoadingTables(false);
        return;
      }
      setLoadingTables(true);
      try {
        const fetchedTables = await getTables(selectedRoom);
        setTables(fetchedTables);
        setTablesCache(prev => ({ ...prev, [selectedRoom]: fetchedTables }));
      } catch (e) {
        setError('Failed to load tables');
        setTables([]);
      } finally {
        setLoadingTables(false);
      }
    }
    fetchTables();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRoom]);

  // Clear cache when modal closes
  useEffect(() => {
    if (!selectedRoom) {
      setTablesCache({});
    }
  }, [onClose]);

  return (
    <Dialog open onOpenChange={onClose}>
      <DialogContent className="bg-white rounded-lg w-full max-w-2xl mx-auto p-0">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900">Select Table</h2>
          <Button onClick={onClose} variant="ghost" size="icon">
            <X className="w-5 h-5" />
          </Button>
        </div>
        <div className="p-4">
          {/* Room Selection */}
          {loadingRooms ? (
            <div className="mb-6 text-center text-gray-500">Loading rooms...</div>
          ) : error ? (
            <div className="mb-6 flex flex-col items-center justify-center gap-2 text-red-500">
              <AlertTriangle className="w-8 h-8 mb-1" />
              <span>{error}</span>
            </div>
          ) : rooms.length === 0 ? (
            <div className="mb-6 flex flex-col items-center justify-center gap-2 text-gray-400">
              <Square className="w-8 h-8 mb-1" />
              <span>No rooms found</span>
            </div>
          ) : (
            <div className="flex gap-2 mb-6">
              {rooms.map(room => (
                <Button
                  key={room.name}
                  onClick={() => setSelectedRoom(room.name)}
                  variant={selectedRoom === room.name ? 'default' : 'outline'}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-medium',
                    selectedRoom === room.name
                      ? 'bg-primary text-white border-primary'
                      : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
                  )}
                >
                  {room.name}
                </Button>
              ))}
            </div>
          )}

          {/* Table Grid */}
          {loadingTables ? (
            <div className="flex flex-col items-center justify-center gap-2 text-gray-500 mt-8">
              <Loader className="w-8 h-8 animate-spin mb-1" />
              <span>Loading tables...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center justify-center gap-2 text-red-500 mt-8">
              <AlertTriangle className="w-8 h-8 mb-1" />
              <span>{error}</span>
            </div>
          ) : tables.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2 text-gray-400 mt-8">
              <Square className="w-8 h-8 mb-1" />
              <span>No tables found</span>
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              {tables.map(table => (
                <Button
                  key={table.name}
                  onClick={() => {
                    setSelectedTable(table.name);
                    onClose();
                  }}
                  variant={selectedTable === table.name ? 'default' : 'outline'}
                  className={cn(
                    'p-4 rounded-lg border-2 flex flex-col items-center gap-2 transition-colors',
                    selectedTable === table.name
                      ? 'border-primary-600 bg-primary-50'
                      : 'border-gray-200 hover:border-primary-300 hover:bg-gray-50'
                  )}
                  disabled={table.occupied === 1}
                >
                  <TableIcon type={undefined} className="w-8 h-8" />
                  <div className="text-center">
                    <div className="font-medium">{table.name}</div>
                    <div className="text-sm text-gray-500">{table.is_take_away ? 'Take Away' : 'Dine In'}</div>
                  </div>
                </Button>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default TableSelectionDialog; 