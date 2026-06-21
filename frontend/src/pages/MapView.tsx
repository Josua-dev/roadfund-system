import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Filter, RefreshCw, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../utils/api';
import { useRegions } from '../hooks/useRegions';
import { Panel, SeverityTag, StatusTag } from '../components/common';
import { formatDate, issueTypeConfig } from '../utils/helpers';
import type { IssueType } from '../types';

let L: any;
const sevColor: Record<string, string> = { low: '#3C5E78', medium: '#A8762E', high: '#8A4A1E', critical: '#963B3B' };

export default function MapView() {
  const mapRef = useRef<HTMLDivElement>(null);
  const leafletMap = useRef<any>(null);
  const markersLayer = useRef<any>(null);
  const [selected, setSelected] = useState<any>(null);
  const [filters, setFilters] = useState({ severity: '', status: '', region_id: '' });
  const [showFilters, setShowFilters] = useState(false);
  const [mapReady, setMapReady] = useState(false);

  const { data: mapData, refetch, isFetching } = useQuery({
    queryKey: ['map-data', filters],
    queryFn: async () => {
      const params = new URLSearchParams(Object.fromEntries(Object.entries(filters).filter(([, v]) => v)));
      return (await api.get(`/reports/map?${params}`)).data.data;
    },
  });
  const { data: regions } = useRegions();

  useEffect(() => {
    if (!mapRef.current || leafletMap.current) return;
    (async () => {
      L = await import('leaflet');
      leafletMap.current = L.map(mapRef.current, { center: [-22.5597, 17.0832], zoom: 6, zoomControl: false });
      L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', { attribution: '© OpenStreetMap © CARTO', subdomains: 'abcd', maxZoom: 19 }).addTo(leafletMap.current);
      L.control.zoom({ position: 'bottomright' }).addTo(leafletMap.current);
      markersLayer.current = L.layerGroup().addTo(leafletMap.current);
      setMapReady(true);
    })();
    return () => { if (leafletMap.current) { leafletMap.current.remove(); leafletMap.current = null; } };
  }, []);

  useEffect(() => {
    if (!mapReady || !markersLayer.current || !L) return;
    markersLayer.current.clearLayers();
    (mapData || []).forEach((report: any) => {
      if (!report.latitude || !report.longitude) return;
      const color = sevColor[report.severity] || '#807C73';
      const marker = L.marker([report.latitude, report.longitude], {
        icon: L.divIcon({ html: `<div style="width:14px;height:14px;background:${color};border:2px solid white;border-radius:50%;box-shadow:0 1px 4px rgba(19,27,36,0.4)"></div>`, className: '', iconSize: [14, 14], iconAnchor: [7, 7] }),
      });
      marker.on('click', () => setSelected(report));
      markersLayer.current.addLayer(marker);
    });
  }, [mapData, mapReady]);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14, height: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 14, flexWrap: 'wrap' }}>
        <div>
          <h1 className="text-h1" style={{ margin: 0 }}>Live Map</h1>
          <p className="text-meta" style={{ margin: '3px 0 0' }}>{mapData?.length || 0} locations shown</p>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={() => refetch()} className="btn-icon"><RefreshCw size={14} className={isFetching ? 'skel' : ''} /></button>
          <button onClick={() => setShowFilters(!showFilters)} className="btn-std" style={{ borderColor: showFilters ? 'var(--secondary)' : undefined, color: showFilters ? 'var(--secondary-700)' : undefined }}><Filter size={13} /> Filter</button>
        </div>
      </div>

      {showFilters && (
        <Panel variant="bordered" style={{ padding: '10px 14px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          <select value={filters.severity} onChange={e => setFilters(f => ({ ...f, severity: e.target.value }))} className="input input-sm" style={{ width: 'auto' }}>
            <option value="">All severities</option>{['low', 'medium', 'high', 'critical'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={filters.status} onChange={e => setFilters(f => ({ ...f, status: e.target.value }))} className="input input-sm" style={{ width: 'auto' }}>
            <option value="">All statuses</option>{['reported', 'under_review', 'verified', 'assigned', 'in_progress', 'completed'].map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
          </select>
          <select value={filters.region_id} onChange={e => setFilters(f => ({ ...f, region_id: e.target.value }))} className="input input-sm" style={{ width: 'auto' }}>
            <option value="">All regions</option>{(regions || []).map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </Panel>
      )}

      <div style={{ display: 'flex', gap: 14, flex: 1, minHeight: 480 }}>
        <div ref={mapRef} className="panel-bordered" style={{ flex: 1, overflow: 'hidden' }} />
        {selected && (
          <Panel variant="bordered" style={{ width: 280, flexShrink: 0, overflowY: 'auto' }}>
            <div className="panel-header">
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.85rem' }}>{selected.title}</div>
                <div className="text-mono" style={{ fontSize: '0.7rem', color: 'var(--text-3)' }}>{selected.report_number}</div>
              </div>
              <button onClick={() => setSelected(null)} className="btn-icon"><X size={14} /></button>
            </div>
            <div className="panel-body">
              <div style={{ display: 'flex', gap: 6, marginBottom: 14 }}><SeverityTag severity={selected.severity} /><StatusTag status={selected.status} /></div>
              {[['Type', issueTypeConfig[selected.issue_type as IssueType]?.label], ['Region', selected.region_name], ['Date', formatDate(selected.created_at)]].map(([l, v]) => (
                <div key={l as string} style={{ display: 'flex', gap: 8, fontSize: '0.8rem', marginBottom: 7 }}><span style={{ width: 50, color: 'var(--text-3)' }}>{l}</span><span>{v}</span></div>
              ))}
              <Link to={`/dashboard/reports/${selected.id}`} className="btn btn-cta" style={{ width: '100%', justifyContent: 'center', marginTop: 6 }}>View Full Report</Link>
            </div>
          </Panel>
        )}
      </div>
    </div>
  );
}
