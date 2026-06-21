import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDropzone } from 'react-dropzone';
import { Upload, X, MapPin, CheckCircle, AlertTriangle, Construction, Zap, Navigation, Layers } from 'lucide-react';
import api from '../../utils/api';
import { useRegions } from '../../hooks/useRegions';
import { Panel, Notice } from '../../components/common';
import toast from 'react-hot-toast';

const ISSUE_TYPES = [
  { value: 'pothole', label: 'Pothole', Icon: AlertTriangle },
  { value: 'damaged_sign', label: 'Damaged Sign', Icon: Construction },
  { value: 'broken_traffic_light', label: 'Broken Traffic Light', Icon: Zap },
  { value: 'flooded_road', label: 'Flooded Road', Icon: Navigation },
  { value: 'cracked_road', label: 'Cracked Road', Icon: Layers },
  { value: 'road_blockage', label: 'Road Blockage', Icon: AlertTriangle },
  { value: 'other', label: 'Other', Icon: AlertTriangle },
];
const SEVERITIES = [
  { value: 'low', label: 'Low', desc: 'Minor inconvenience' },
  { value: 'medium', label: 'Medium', desc: 'Needs attention soon' },
  { value: 'high', label: 'High', desc: 'Dangerous condition' },
  { value: 'critical', label: 'Critical', desc: 'Immediate hazard' },
];

export default function SubmitReport() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState<{ id: number; number: string } | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', issue_type: '', severity: 'medium', region_id: '', latitude: '', longitude: '', address: '' });

  const { data: regions } = useRegions();
  const onDrop = useCallback((accepted: File[]) => setFiles(prev => [...prev, ...accepted].slice(0, 5)), []);
  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'image/*': ['.jpg', '.jpeg', '.png', '.webp'] }, maxFiles: 5, maxSize: 10 * 1024 * 1024 });

  const getGPS = () => {
    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => { setForm(f => ({ ...f, latitude: String(pos.coords.latitude.toFixed(6)), longitude: String(pos.coords.longitude.toFixed(6)), address: `${pos.coords.latitude.toFixed(4)}, ${pos.coords.longitude.toFixed(4)}` })); setGpsLoading(false); toast.success('Location captured'); },
      () => { setGpsLoading(false); toast.error('Could not get your location'); }
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => { if (v) fd.append(k, v as string); });
      files.forEach(f => fd.append('images', f));
      const { data } = await api.post('/reports', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setSubmitted({ id: data.data.id, number: data.data.report_number });
    } catch (err: any) { toast.error(err.response?.data?.message || 'Submission failed'); }
    finally { setLoading(false); }
  };
  const set = (k: string) => (e: any) => setForm(f => ({ ...f, [k]: e.target.value }));

  if (submitted) {
    return (
      <div style={{ maxWidth: 480, margin: '40px auto', textAlign: 'center' }}>
        <CheckCircle size={36} style={{ color: 'var(--secondary)', marginBottom: 14 }} />
        <h2 className="text-h1" style={{ margin: '0 0 6px' }}>Report Submitted</h2>
        <p className="text-meta" style={{ marginBottom: 4 }}>Your report number is</p>
        <div className="text-mono" style={{ color: 'var(--secondary-700)', fontSize: '1.1rem', fontWeight: 700, marginBottom: 20 }}>{submitted.number}</div>
        <p style={{ color: 'var(--text-2)', fontSize: '0.85rem', marginBottom: 22 }}>You'll receive status updates as this moves through inspection and repair.</p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
          <button onClick={() => navigate(`/dashboard/reports/${submitted.id}`)} className="btn btn-cta">View Report</button>
          <button onClick={() => { setSubmitted(null); setStep(1); setForm({ title: '', description: '', issue_type: '', severity: 'medium', region_id: '', latitude: '', longitude: '', address: '' }); setFiles([]); }} className="btn btn-std">Submit Another</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 580 }}>
      <h1 className="text-h1" style={{ margin: '0 0 4px' }}>Report a Road Issue</h1>
      <p className="text-meta" style={{ margin: '0 0 20px' }}>Step {step} of 3 — {['Issue details', 'Location', 'Photos & review'][step - 1]}</p>

      <Panel variant="bordered">
        <div className="panel-body">
          {step === 1 && (
            <>
              <div className="field">
                <label className="field-label">Issue title</label>
                <input className="input" value={form.title} onChange={set('title')} placeholder="e.g. Large pothole on Independence Ave" />
              </div>
              <div className="field">
                <label className="field-label">Issue type</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  {ISSUE_TYPES.map(({ value, label, Icon }) => (
                    <button key={value} type="button" onClick={() => setForm(f => ({ ...f, issue_type: value }))}
                      style={{ display: 'flex', alignItems: 'center', gap: 8, textAlign: 'left', padding: '9px 11px', borderRadius: 'var(--r-base)', border: `1px solid ${form.issue_type === value ? 'var(--secondary)' : 'var(--line)'}`, background: form.issue_type === value ? 'var(--secondary-100)' : 'transparent', fontSize: '0.8rem', cursor: 'pointer' }}>
                      <Icon size={13} /> {label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="field">
                <label className="field-label">Severity</label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
                  {SEVERITIES.map(({ value, label, desc }) => (
                    <button key={value} type="button" onClick={() => setForm(f => ({ ...f, severity: value }))}
                      style={{ textAlign: 'left', padding: '9px 11px', borderRadius: 'var(--r-base)', border: `1px solid ${form.severity === value ? 'var(--secondary)' : 'var(--line)'}`, background: form.severity === value ? 'var(--secondary-100)' : 'transparent', cursor: 'pointer' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.8rem' }}>{label}</div>
                      <div className="text-meta">{desc}</div>
                    </button>
                  ))}
                </div>
              </div>
              <div className="field">
                <label className="field-label">Description</label>
                <textarea className="input" rows={4} value={form.description} onChange={set('description')} placeholder="Describe the issue — size, danger level, duration…" />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="field">
                <label className="field-label">Region</label>
                <select className="input" value={form.region_id} onChange={set('region_id')}>
                  <option value="">Select region…</option>
                  {regions?.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                </select>
              </div>
              <div className="field">
                <label className="field-label">Street address</label>
                <input className="input" value={form.address} onChange={set('address')} placeholder="e.g. B1 Highway, Windhoek North" />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                <div className="field"><label className="field-label">Latitude</label><input className="input" type="number" step="any" value={form.latitude} onChange={set('latitude')} /></div>
                <div className="field"><label className="field-label">Longitude</label><input className="input" type="number" step="any" value={form.longitude} onChange={set('longitude')} /></div>
              </div>
              <button onClick={getGPS} disabled={gpsLoading} className="btn btn-std" style={{ width: '100%', justifyContent: 'center' }}>
                <MapPin size={14} /> {gpsLoading ? 'Getting location…' : 'Use my current GPS location'}
              </button>
              {form.latitude && form.longitude && <div style={{ marginTop: 12 }}><Notice type="success" message={`GPS captured: ${form.latitude}, ${form.longitude}`} /></div>}
            </>
          )}

          {step === 3 && (
            <>
              <div {...getRootProps()} style={{ border: `1.5px dashed ${isDragActive ? 'var(--secondary)' : 'var(--line-strong)'}`, borderRadius: 'var(--r-base)', padding: 28, textAlign: 'center', cursor: 'pointer', background: isDragActive ? 'var(--secondary-100)' : 'var(--n-25)' }}>
                <input {...getInputProps()} />
                <Upload size={26} style={{ color: 'var(--text-3)', marginBottom: 8 }} />
                <p style={{ fontWeight: 600, margin: '0 0 3px', fontSize: '0.85rem' }}>{isDragActive ? 'Drop images here' : 'Upload photos'}</p>
                <p className="text-meta" style={{ margin: 0 }}>Max 5 images, 10MB each</p>
              </div>
              {files.length > 0 && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginTop: 12 }}>
                  {files.map((file, i) => (
                    <div key={i} style={{ position: 'relative', borderRadius: 'var(--r-tight)', overflow: 'hidden' }}>
                      <img src={URL.createObjectURL(file)} alt="" style={{ width: '100%', aspectRatio: '1', objectFit: 'cover' }} />
                      <button onClick={() => setFiles(f => f.filter((_, idx) => idx !== i))} style={{ position: 'absolute', top: 4, right: 4, width: 18, height: 18, borderRadius: '50%', background: 'var(--error)', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><X size={10} style={{ color: 'white' }} /></button>
                    </div>
                  ))}
                </div>
              )}
              <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--line)' }}>
                {[['Title', form.title || '—'], ['Type', ISSUE_TYPES.find(t => t.value === form.issue_type)?.label || '—'], ['Severity', form.severity], ['Photos', `${files.length} attached`]].map(([l, v]) => (
                  <div key={l} style={{ display: 'flex', justifyContent: 'space-between', padding: '4px 0', fontSize: '0.8rem' }}><span style={{ color: 'var(--text-3)' }}>{l}</span><span style={{ fontWeight: 600 }}>{v}</span></div>
                ))}
              </div>
            </>
          )}
        </div>
        <div className="panel-foot">
          {step > 1 && <button onClick={() => setStep(step - 1)} className="btn-std">Back</button>}
          {step < 3
            ? <button onClick={() => setStep(step + 1)} disabled={step === 1 && (!form.title || !form.issue_type)} className="btn btn-cta">Next</button>
            : <button onClick={handleSubmit} disabled={loading || !form.region_id} className="btn btn-cta">{loading ? 'Submitting…' : 'Submit Report'}</button>}
        </div>
      </Panel>
    </div>
  );
}
