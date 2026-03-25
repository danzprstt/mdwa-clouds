import { CheckCircle, XCircle, Info } from 'lucide-react';

export default function Toast({ msg, type = 'ok' }) {
  const icons = { ok: <CheckCircle size={15} />, err: <XCircle size={15} />, info: <Info size={15} /> };
  return <div className={`toast ${type}`}>{icons[type]}{msg}</div>;
}
