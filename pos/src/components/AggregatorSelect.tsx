import { useEffect, useState } from 'react';
import { usePOSStore } from '../store/pos-store';
import { Select, SelectItem } from './ui/select';
import { getAggregators, type Aggregator } from '../lib/aggregator-api';

interface AggregatorSelectProps {
  disabled?: boolean;
}

export function AggregatorSelect({ disabled }: AggregatorSelectProps) {
  const { selectedAggregator, setSelectedAggregator } = usePOSStore();
  const [aggregators, setAggregators] = useState<Aggregator[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchAggregators = async () => {
      setLoading(true);
      try {
        const data = await getAggregators();
        setAggregators(data);
      } catch (error) {
        console.error('Failed to fetch aggregators:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAggregators();
  }, []);

  return (
    <div>
      <Select
        value={selectedAggregator?.customer || ''}
        onValueChange={(value) => {
          const aggregator = aggregators.find(a => a.customer === value);
          setSelectedAggregator(aggregator || null);
        }}
        disabled={disabled || loading}
        placeholder={loading ? 'Loading aggregators...' : 'Select an aggregator'}
      >
        {aggregators.map((aggregator) => (
          <SelectItem 
            key={aggregator.customer} 
            value={aggregator.customer}
            className="capitalize"
          >
            {aggregator.customer}
          </SelectItem>
        ))}
      </Select>
    </div>
  );
} 