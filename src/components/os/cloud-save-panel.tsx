import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";

import { ActionButton, Chip } from "@/components/os/ui";
import { supabase } from "@/integrations/supabase/client";
import {
  deleteCloudSave,
  getCloudSaveLink,
  listCloudSaves,
  registerCloudSave,
} from "@/lib/cloud-saves.functions";
import { useHud } from "@/lib/hud-state";
import { useI18n } from "@/lib/i18n";

async function sha256Hex(file: File) {
  const buf = await crypto.subtle.digest("SHA-256", await file.arrayBuffer());
  return Array.from(new Uint8Array(buf))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

const fmtSize = (n: number) =>
  n > 1048576 ? `${(n / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(n / 1024))} KB`;

function useSaves() {
  const { userId } = useHud();
  const fetchSaves = useServerFn(listCloudSaves);
  return useQuery({
    queryKey: ["cloud-saves"],
    queryFn: () => fetchSaves(),
    enabled: Boolean(userId),
  });
}

export function CloudSaveWidget() {
  const { lang } = useI18n();
  const { userId } = useHud();
  const { data } = useSaves();
  if (!userId)
    return (
      <p className="text-[11px] text-muted-foreground">
        {lang === "pt" ? "Entre para guardar os seus saves na nuvem." : "Sign in to store your saves in the cloud."}
      </p>
    );
  const total = (data ?? []).reduce((s, x) => s + x.sizeBytes, 0);
  return (
    <div className="space-y-2 text-[11px]">
      <div className="flex justify-between">
        <span className="text-muted-foreground">{lang === "pt" ? "Saves guardados" : "Stored saves"}</span>
        <span className="font-display">{data?.length ?? 0}</span>
      </div>
      <div className="flex justify-between">
        <span className="text-muted-foreground">{lang === "pt" ? "Espaço usado" : "Used space"}</span>
        <span className="font-display">{fmtSize(total)}</span>
      </div>
      {data?.[0] ? (
        <p className="truncate text-muted-foreground">
          ↺ {data[0].gameName} · {data[0].slot}
        </p>
      ) : null}
    </div>
  );
}

export function CloudSaveFull() {
  const { lang } = useI18n();
  const pt = lang === "pt";
  const { userId } = useHud();
  const qc = useQueryClient();
  const { data, isLoading } = useSaves();
  const register = useServerFn(registerCloudSave);
  const getLink = useServerFn(getCloudSaveLink);
  const remove = useServerFn(deleteCloudSave);

  const [game, setGame] = useState("");
  const [slot, setSlot] = useState("Slot 1");
  const [note, setNote] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const upload = useMutation({
    mutationFn: async () => {
      if (!userId || !file || !game.trim()) throw new Error(pt ? "Preencha o jogo e escolha o ficheiro." : "Fill in game and pick a file.");
      if (file.size > 52428800) throw new Error(pt ? "Máximo 50 MB." : "Max 50 MB.");
      const hash = await sha256Hex(file);
      const safe = file.name.replace(/[^\w.-]+/g, "_");
      const path = `${userId}/${Date.now()}-${safe}`;
      const { error } = await supabase.storage.from("game-saves").upload(path, file);
      if (error) throw new Error(error.message);
      await register({
        data: { gameName: game, slot, fileName: file.name, storagePath: path, sizeBytes: file.size, sha256: hash, note },
      });
      return hash;
    },
    onSuccess: (hash) => {
      toast.success(pt ? `Save sincronizado · SHA-256 ${hash.slice(0, 10)}…` : `Save synced · SHA-256 ${hash.slice(0, 10)}…`);
      setFile(null);
      setNote("");
      qc.invalidateQueries({ queryKey: ["cloud-saves"] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const link = useMutation({
    mutationFn: (v: { id: string; share: boolean }) => getLink({ data: v }),
    onSuccess: async (r, v) => {
      if (v.share) {
        await navigator.clipboard?.writeText(r.url).catch(() => {});
        toast.success(pt ? "Link de partilha copiado (válido 15 min)." : "Share link copied (valid 15 min).");
      } else window.open(r.url, "_blank");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: (id: string) => remove({ data: { id } }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cloud-saves"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  if (!userId)
    return <p className="text-sm text-muted-foreground">{pt ? "Entre para usar o Cloud Save." : "Sign in to use Cloud Save."}</p>;

  const input = "w-full rounded-md border border-border bg-background/40 px-3 py-2 text-sm";

  return (
    <div className="grid gap-6 lg:grid-cols-[320px_1fr]">
      <div className="space-y-3">
        <h3 className="font-display text-sm uppercase tracking-widest">{pt ? "Enviar save" : "Upload save"}</h3>
        <input className={input} placeholder={pt ? "Jogo (ex: Elden Ring)" : "Game (e.g. Elden Ring)"} value={game} onChange={(e) => setGame(e.target.value)} />
        <input className={input} placeholder="Slot" value={slot} onChange={(e) => setSlot(e.target.value)} />
        <input className={input} placeholder={pt ? "Nota da versão (opcional)" : "Version note (optional)"} value={note} onChange={(e) => setNote(e.target.value)} />
        <input type="file" className="w-full text-xs" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
        <ActionButton onClick={() => upload.mutate()} disabled={upload.isPending}>
          {upload.isPending ? (pt ? "A sincronizar…" : "Syncing…") : pt ? "Sincronizar na nuvem" : "Sync to cloud"}
        </ActionButton>
        <p className="text-[11px] text-muted-foreground">
          {pt
            ? "O ficheiro é verificado por SHA-256 no seu dispositivo. Links de partilha expiram em 15 minutos."
            : "Files are verified with SHA-256 on your device. Share links expire in 15 minutes."}
        </p>
      </div>
      <div className="space-y-2">
        <h3 className="font-display text-sm uppercase tracking-widest">{pt ? "Cofre" : "Vault"}</h3>
        {isLoading ? <p className="text-sm text-muted-foreground">…</p> : null}
        {data?.length === 0 ? <p className="text-sm text-muted-foreground">{pt ? "Nenhum save ainda." : "No saves yet."}</p> : null}
        {(data ?? []).map((s) => (
          <div key={s.id} className="flex flex-wrap items-center gap-3 rounded-md border border-border bg-background/30 p-3">
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-sm">
                {s.gameName} <Chip>{s.slot}</Chip>
              </p>
              <p className="truncate text-[11px] text-muted-foreground">
                {s.fileName} · {fmtSize(s.sizeBytes)} · {new Date(s.createdAt).toLocaleString()} · {s.sha256.slice(0, 12)}…
              </p>
              {s.note ? <p className="text-[11px] text-muted-foreground">{s.note}</p> : null}
            </div>
            <ActionButton onClick={() => link.mutate({ id: s.id, share: false })}>{pt ? "Baixar" : "Download"}</ActionButton>
            <ActionButton onClick={() => link.mutate({ id: s.id, share: true })}>{pt ? "Partilhar" : "Share"}</ActionButton>
            <ActionButton onClick={() => del.mutate(s.id)}>{pt ? "Apagar" : "Delete"}</ActionButton>
          </div>
        ))}
      </div>
    </div>
  );
}
