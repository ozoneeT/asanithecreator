import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Upload, Trash2, Loader2, CheckCircle2, AlertCircle, Lock, RefreshCw } from 'lucide-react';
import type { ManifestEntry, UploadTicket } from '../lib/videoTypes';
import { probeVideo, putToR2, UnsupportedCodecError, type ProbedVideo } from '../lib/videoUpload';

const PASSWORD_KEY = 'asani.studio.password';

type Phase = 'idle' | 'probing' | 'signing' | 'uploading' | 'finalizing' | 'done' | 'error';

/**
 * Phone-first upload console.
 *
 * The R2 secret never reaches this page: /api/upload-url signs a one-time PUT
 * for exactly two keys, and the browser streams the file straight to R2. The
 * poster frame is captured locally from the chosen file, so thumbnails cost
 * nothing and no transcoding service is involved.
 */
const StudioPage: React.FC = () => {
  const navigate = useNavigate();

  const [password, setPassword] = useState<string>(() => sessionStorage.getItem(PASSWORD_KEY) ?? '');
  const [unlocked, setUnlocked] = useState(false);
  const [storageConfigured, setStorageConfigured] = useState(true);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tags, setTags] = useState('');
  const [file, setFile] = useState<File | null>(null);

  const [phase, setPhase] = useState<Phase>('idle');
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const [videos, setVideos] = useState<ManifestEntry[]>([]);
  const [publicHost, setPublicHost] = useState('');
  const [listLoading, setListLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const authHeaders = useCallback(
    (extra: Record<string, string> = {}) => ({ 'x-studio-password': password, ...extra }),
    [password],
  );

  const say = (text: string, error = false) => { setMessage(text); setIsError(error); };

  // ── Library listing ────────────────────────────────────────
  const refreshList = useCallback(async () => {
    setListLoading(true);
    try {
      const res = await fetch('/api/videos', { headers: authHeaders() });
      if (!res.ok) { setVideos([]); return; }
      const data = await res.json();
      setVideos(data.videos ?? []);
      setPublicHost(data.publicHost ?? '');
    } catch {
      setVideos([]);
    } finally {
      setListLoading(false);
    }
  }, [authHeaders]);

  useEffect(() => { if (unlocked) void refreshList(); }, [unlocked, refreshList]);

  // ── Unlock ─────────────────────────────────────────────────
  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    say('');
    try {
      const res = await fetch('/api/studio-auth', { method: 'POST', headers: authHeaders() });
      if (res.status === 401) { say('Wrong password.', true); return; }
      if (!res.ok) { say('Could not reach the server.', true); return; }
      const data = await res.json();
      sessionStorage.setItem(PASSWORD_KEY, password);
      setStorageConfigured(data.storageConfigured);
      setUnlocked(true);
      say('');
    } catch {
      say('Could not reach the server.', true);
    }
  };

  // ── Upload ─────────────────────────────────────────────────
  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !title.trim()) { say('Pick a video and give it a title.', true); return; }

    setProgress(0);

    // 1. Check the codec and grab a poster frame before anything is uploaded,
    //    so a file that would break on Chrome fails here instead of on the site.
    let probed: ProbedVideo;
    try {
      setPhase('probing');
      say('Checking the video…');
      probed = await probeVideo(file);
    } catch (err) {
      setPhase('error');
      say(err instanceof UnsupportedCodecError || err instanceof Error
        ? err.message
        : 'Could not read that video.', true);
      return;
    }

    // 2. Sign one-time PUTs for the video and its poster.
    let ticket: UploadTicket;
    try {
      setPhase('signing');
      say('Preparing upload…');
      const res = await fetch('/api/upload-url', {
        method: 'POST',
        headers: authHeaders({ 'content-type': 'application/json' }),
        body: JSON.stringify({
          contentType: probed.contentType,
          posterContentType: probed.posterContentType,
        }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? `HTTP ${res.status}`);
      ticket = await res.json();
    } catch (err) {
      setPhase('error');
      say(err instanceof Error ? err.message : 'Could not start the upload.', true);
      return;
    }

    // 3. Stream both objects straight to R2.
    try {
      setPhase('uploading');
      say('Uploading…');
      await putToR2(ticket.videoPutUrl, file, probed.contentType, f => setProgress(Math.round(f * 100)));
      await putToR2(ticket.posterPutUrl, probed.posterBlob, probed.posterContentType);
    } catch (err) {
      setPhase('error');
      say(err instanceof Error ? err.message : 'Upload failed.', true);
      return;
    }

    // 4. Only now record it, so the manifest never lists a missing video.
    try {
      setPhase('finalizing');
      say('Saving…');
      const res = await fetch('/api/finalize', {
        method: 'POST',
        headers: authHeaders({ 'content-type': 'application/json' }),
        body: JSON.stringify({
          id: ticket.id,
          videoKey: ticket.videoKey,
          posterKey: ticket.posterKey,
          title: title.trim(),
          description: description.trim(),
          tags: tags.trim(),
          contentType: probed.contentType,
          width: probed.width,
          height: probed.height,
          duration: probed.duration,
        }),
      });
      if (!res.ok) throw new Error((await res.json().catch(() => ({}))).error ?? `HTTP ${res.status}`);
    } catch (err) {
      setPhase('error');
      say(err instanceof Error ? err.message : 'Could not save the video.', true);
      return;
    }

    setPhase('done');
    say('Uploaded. It is live on the portfolio now.');
    setTitle(''); setDescription(''); setTags(''); setFile(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    void refreshList();
  };

  // ── Delete ─────────────────────────────────────────────────
  const handleDelete = async (video: ManifestEntry) => {
    if (!window.confirm(`Delete "${video.title}" permanently? This cannot be undone.`)) return;
    const res = await fetch('/api/delete-video', {
      method: 'POST',
      headers: authHeaders({ 'content-type': 'application/json' }),
      body: JSON.stringify({ id: video.id }),
    });
    if (!res.ok) { say('Could not delete that video.', true); return; }
    void refreshList();
  };

  // ── Lock screen ────────────────────────────────────────────
  if (!unlocked) {
    return (
      <div className="min-h-[100dvh] w-full bg-[#0a0a0a] text-white flex items-center justify-center p-6">
        <form onSubmit={handleUnlock} className="w-full max-w-sm">
          <div className="flex items-center gap-3 mb-6">
            <Lock className="w-5 h-5 text-[#bfff00]" />
            <h1 className="text-2xl font-bold serif">Studio</h1>
          </div>
          <p className="text-white/50 text-sm mb-6">Upload and manage portfolio videos.</p>
          <input
            type="password" value={password} onChange={e => setPassword(e.target.value)}
            placeholder="Studio password" autoComplete="current-password"
            className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-[#bfff00]/60 mb-4"
          />
          <button type="submit" className="w-full bg-[#7000FF] hover:bg-[#6000E0] transition-colors rounded-xl px-4 py-3 font-semibold">
            Unlock
          </button>
          {message && <p className="mt-4 text-sm text-red-400 flex items-center gap-2"><AlertCircle className="w-4 h-4" />{message}</p>}
        </form>
      </div>
    );
  }

  const busy = phase === 'probing' || phase === 'signing' || phase === 'uploading' || phase === 'finalizing';
  const busyLabel = phase === 'probing' ? 'Checking…'
    : phase === 'signing' ? 'Preparing…'
    : phase === 'uploading' ? 'Uploading…' : 'Saving…';

  return (
    <div className="min-h-[100dvh] w-full bg-[#0a0a0a] text-white overflow-y-auto">
      <div className="max-w-2xl mx-auto p-6 pb-24">
        <div className="flex items-center justify-between mb-8">
          <button onClick={() => navigate('/')} className="p-2 -ml-2 rounded-full hover:bg-white/10 transition-colors" aria-label="Go home">
            <ChevronLeft className="w-6 h-6" />
          </button>
          <h1 className="text-xl font-bold serif">Studio</h1>
          <button onClick={refreshList} className="p-2 -mr-2 rounded-full hover:bg-white/10 transition-colors" aria-label="Refresh list">
            <RefreshCw className={`w-5 h-5 ${listLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {!storageConfigured && (
          <div className="mb-8 flex items-start gap-2 text-sm text-amber-300 bg-amber-400/10 border border-amber-400/25 rounded-xl p-4">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>
              Cloudflare R2 isn&apos;t configured on the server yet, so uploads will fail.
              Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET and R2_PUBLIC_HOST first.
            </span>
          </div>
        )}

        {/* ── Upload form ── */}
        <form onSubmit={handleUpload} className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-8">
          <label className="block mb-4">
            <span className="text-sm text-white/70 mb-2 block">Video file</span>
            <input
              ref={fileInputRef} type="file" accept="video/*"
              onChange={e => { setFile(e.target.files?.[0] ?? null); say(''); setPhase('idle'); }}
              disabled={busy}
              className="w-full text-sm text-white/70 file:mr-4 file:py-2.5 file:px-4 file:rounded-full file:border-0 file:bg-[#7000FF] file:text-white file:font-semibold file:cursor-pointer"
            />
          </label>

          <input
            type="text" value={title} onChange={e => setTitle(e.target.value)}
            placeholder="Title — e.g. Wedding Film — ADELOVE25" disabled={busy}
            className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 mb-3 placeholder-white/30 focus:outline-none focus:border-[#bfff00]/60"
          />
          <textarea
            value={description} onChange={e => setDescription(e.target.value)}
            placeholder="Caption shown under the video" rows={3} disabled={busy}
            className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 mb-3 placeholder-white/30 focus:outline-none focus:border-[#bfff00]/60 resize-none"
          />
          <input
            type="text" value={tags} onChange={e => setTags(e.target.value)}
            placeholder="#Tags #GoHere" disabled={busy}
            className="w-full bg-white/5 border border-white/15 rounded-xl px-4 py-3 mb-4 placeholder-white/30 focus:outline-none focus:border-[#bfff00]/60"
          />

          {phase === 'uploading' && (
            <div className="mb-4">
              <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-[#bfff00] transition-[width] duration-300" style={{ width: `${progress}%` }} />
              </div>
              <p className="text-xs text-white/50 mt-2">{progress}%</p>
            </div>
          )}

          <button
            type="submit" disabled={busy || !file || !title.trim()}
            className="w-full bg-[#7000FF] hover:bg-[#6000E0] disabled:bg-white/10 disabled:text-white/40 transition-colors rounded-xl px-4 py-3 font-semibold flex items-center justify-center gap-2"
          >
            {busy ? <><Loader2 className="w-4 h-4 animate-spin" />{busyLabel}</>
                  : <><Upload className="w-4 h-4" />Upload video</>}
          </button>

          {message && (
            <p className={`mt-4 text-sm flex items-start gap-2 ${isError ? 'text-red-400' : 'text-[#bfff00]'}`}>
              {isError ? <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" /> : <CheckCircle2 className="w-4 h-4 mt-0.5 shrink-0" />}
              {message}
            </p>
          )}
        </form>

        {/* ── Library ── */}
        <h2 className="text-sm uppercase tracking-widest text-white/40 mb-4">
          Library {videos.length > 0 && `(${videos.length})`}
        </h2>

        {videos.length === 0 && !listLoading && (
          <p className="text-white/40 text-sm">No videos uploaded yet. The portfolio is empty until you add one.</p>
        )}

        <ul className="space-y-3">
          {videos.map(video => (
            <li key={video.id} className="flex items-center gap-3 bg-white/5 border border-white/10 rounded-xl p-3">
              <img
                src={publicHost ? `https://${publicHost}/${video.posterKey}` : ''} alt="" loading="lazy"
                onError={e => { e.currentTarget.style.visibility = 'hidden'; }}
                className="w-12 h-16 object-cover rounded-lg bg-white/10 shrink-0"
              />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{video.title}</p>
                <p className="text-xs text-white/40">
                  {Math.round(video.duration)}s · {video.width}×{video.height}
                </p>
              </div>
              <button
                onClick={() => handleDelete(video)}
                className="p-2 rounded-full hover:bg-red-500/20 text-white/50 hover:text-red-400 transition-colors shrink-0"
                aria-label={`Delete ${video.title}`}
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default StudioPage;
