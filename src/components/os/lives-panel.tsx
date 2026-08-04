import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { Coffee, Radio, Video, VideoOff } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "sonner";

import { ActionButton, Avatar, Chip } from "@/components/os/ui";
import { supabase } from "@/integrations/supabase/client";
import { useHud } from "@/lib/hud-state";
import { useI18n } from "@/lib/i18n";
import { listLiveRooms } from "@/lib/cards.functions";
import { endLive, sendCoffee, startLive } from "@/lib/live.functions";

type ChatRow = {
  id: string;
  room_id: string;
  user_id: string;
  content: string;
  created_at: string;
};

const ICE = [{ urls: "stun:stun.l.google.com:19302" }];

function useLiveRooms() {
  const fetchRooms = useServerFn(listLiveRooms);
  return useQuery({
    queryKey: ["live-rooms"],
    queryFn: () => fetchRooms(),
    refetchInterval: 20_000,
  });
}

export function LivesWidget() {
  const { lang } = useI18n();
  const { data } = useLiveRooms();

  if ((data?.length ?? 0) === 0) {
    return (
      <p className="text-[11px] text-muted-foreground">
        {lang === "pt" ? "Nenhuma live agora. Abre a tua!" : "No live right now. Start yours!"}
      </p>
    );
  }

  return (
    <div className="scroll-hidden flex gap-2 overflow-x-auto">
      {data?.map((l) => (
        <div key={l.id} className="w-32 shrink-0 rounded-lg border border-border/50 bg-surface-2/40 p-2">
          <div
            className="mb-2 grid h-14 place-items-center rounded-md border border-border/50"
            style={{
              background: "radial-gradient(circle at 50% 40%, var(--neon-pink)33, transparent)",
            }}
          >
            <Radio className="h-4 w-4 text-neon-pink" />
          </div>
          <div className="flex items-center gap-1.5">
            <Avatar name={l.title} glow="var(--neon-pink)" />
            <div className="min-w-0">
              <p className="truncate font-display text-[10px]">{l.title}</p>
              <p className="truncate text-[9px] text-muted-foreground">{l.game}</p>
            </div>
          </div>
          <p className="mt-1.5 text-[9px] tracking-wider text-muted-foreground uppercase">
            {l.viewer_count} {lang === "pt" ? "a ver" : "watching"}
          </p>
        </div>
      ))}
    </div>
  );
}

export function LivesFull() {
  const { lang } = useI18n();
  const { userId } = useHud();
  const queryClient = useQueryClient();
  const { data: rooms } = useLiveRooms();

  const startFn = useServerFn(startLive);
  const endFn = useServerFn(endLive);
  const coffeeFn = useServerFn(sendCoffee);

  const [roomId, setRoomId] = useState<string | null>(null);
  const [title, setTitle] = useState("Ranqueada ao vivo");
  const [game, setGame] = useState("Valorant");
  const [messages, setMessages] = useState<ChatRow[]>([]);
  const [draft, setDraft] = useState("");
  const [broadcasting, setBroadcasting] = useState(false);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const peersRef = useRef<Map<string, RTCPeerConnection>>(new Map());

  const activeRoom = useMemo(
    () => rooms?.find((r) => r.id === roomId) ?? rooms?.[0] ?? null,
    [rooms, roomId],
  );
  const currentRoomId = activeRoom?.id ?? null;
  const isOwner = Boolean(userId && activeRoom && activeRoom.user_id === userId);

  // Load + subscribe to chat for the selected room.
  useEffect(() => {
    if (!currentRoomId) {
      setMessages([]);
      return;
    }
    let mounted = true;

    void supabase
      .from("chat_messages")
      .select("id, room_id, user_id, content, created_at")
      .eq("room_id", currentRoomId)
      .order("created_at", { ascending: true })
      .limit(80)
      .then(({ data }) => {
        if (mounted && data) setMessages(data as ChatRow[]);
      });

    const channel = supabase
      .channel(`chat:${currentRoomId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `room_id=eq.${currentRoomId}`,
        },
        (payload) => {
          const row = payload.new as ChatRow;
          setMessages((prev) => (prev.some((m) => m.id === row.id) ? prev : [...prev, row]));
        },
      )
      .subscribe();

    return () => {
      mounted = false;
      void supabase.removeChannel(channel);
    };
  }, [currentRoomId]);

  // WebRTC signalling over Realtime broadcast.
  useEffect(() => {
    if (!currentRoomId || !userId) return;

    const channel = supabase.channel(`webrtc:${currentRoomId}`, {
      config: { broadcast: { self: false } },
    });

    async function makePeer(target: string) {
      const peer = new RTCPeerConnection({ iceServers: ICE });
      peersRef.current.set(target, peer);
      peer.onicecandidate = (event) => {
        if (event.candidate) {
          void channel.send({
            type: "broadcast",
            event: "ice",
            payload: { to: target, from: userId, candidate: event.candidate.toJSON() },
          });
        }
      };
      peer.ontrack = (event) => {
        if (videoRef.current && event.streams[0]) {
          videoRef.current.srcObject = event.streams[0];
        }
      };
      return peer;
    }

    channel
      .on("broadcast", { event: "join" }, async ({ payload }) => {
        if (!broadcasting || !streamRef.current) return;
        const peer = await makePeer(payload.from as string);
        streamRef.current.getTracks().forEach((track) => peer.addTrack(track, streamRef.current!));
        const offer = await peer.createOffer();
        await peer.setLocalDescription(offer);
        void channel.send({
          type: "broadcast",
          event: "offer",
          payload: { to: payload.from, from: userId, sdp: offer },
        });
      })
      .on("broadcast", { event: "offer" }, async ({ payload }) => {
        if (payload.to !== userId) return;
        const peer = await makePeer(payload.from as string);
        await peer.setRemoteDescription(payload.sdp as RTCSessionDescriptionInit);
        const answer = await peer.createAnswer();
        await peer.setLocalDescription(answer);
        void channel.send({
          type: "broadcast",
          event: "answer",
          payload: { to: payload.from, from: userId, sdp: answer },
        });
      })
      .on("broadcast", { event: "answer" }, async ({ payload }) => {
        if (payload.to !== userId) return;
        const peer = peersRef.current.get(payload.from as string);
        if (peer) await peer.setRemoteDescription(payload.sdp as RTCSessionDescriptionInit);
      })
      .on("broadcast", { event: "ice" }, async ({ payload }) => {
        if (payload.to !== userId) return;
        const peer = peersRef.current.get(payload.from as string);
        if (peer) await peer.addIceCandidate(payload.candidate as RTCIceCandidateInit);
      })
      .subscribe((status) => {
        if (status === "SUBSCRIBED" && !isOwner) {
          void channel.send({ type: "broadcast", event: "join", payload: { from: userId } });
        }
      });

    return () => {
      peersRef.current.forEach((peer) => peer.close());
      peersRef.current.clear();
      void supabase.removeChannel(channel);
    };
  }, [currentRoomId, userId, broadcasting, isOwner]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  const start = useMutation({
    mutationFn: async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      const room = await startFn({ data: { title, game } });
      return room;
    },
    onSuccess: (room) => {
      setRoomId(room.id);
      setBroadcasting(true);
      void queryClient.invalidateQueries({ queryKey: ["live-rooms"] });
      toast.success(lang === "pt" ? "Live no ar" : "You are live");
    },
    onError: () =>
      toast.error(lang === "pt" ? "Não foi possível iniciar a live" : "Could not start the live"),
  });

  const stop = useMutation({
    mutationFn: async () => {
      if (currentRoomId) await endFn({ data: { roomId: currentRoomId } });
    },
    onSuccess: () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;
      setBroadcasting(false);
      void queryClient.invalidateQueries({ queryKey: ["live-rooms"] });
    },
  });

  const coffee = useMutation({
    mutationFn: () =>
      coffeeFn({ data: { recipientId: activeRoom!.user_id, amount: 5, message: "☕" } }),
    onSuccess: () => {
      toast.success(lang === "pt" ? "Café enviado (5.00)" : "Coffee sent (5.00)");
      void queryClient.invalidateQueries({ queryKey: ["wallet"] });
    },
    onError: (error: Error) =>
      toast.error(
        error.message.includes("insufficient_funds")
          ? lang === "pt"
            ? "Saldo insuficiente"
            : "Insufficient balance"
          : lang === "pt"
            ? "Falha ao enviar café"
            : "Could not send coffee",
      ),
  });

  async function sendMessage() {
    const content = draft.trim();
    if (!content || !currentRoomId || !userId) return;
    setDraft("");
    const { error } = await supabase
      .from("chat_messages")
      .insert({ room_id: currentRoomId, user_id: userId, content });
    if (error) toast.error(lang === "pt" ? "Mensagem não enviada" : "Message not sent");
  }

  if (!userId) {
    return (
      <div className="space-y-4 text-center">
        <p className="text-[11px] text-muted-foreground">
          {lang === "pt"
            ? "Inicie sessão para assistir lives, conversar e enviar cafés."
            : "Sign in to watch lives, chat and send coffees."}
        </p>
        <Link
          to="/auth"
          className="inline-block rounded-lg bg-primary px-4 py-2 font-display text-[11px] tracking-[0.16em] text-primary-foreground uppercase"
        >
          {lang === "pt" ? "Entrar" : "Sign in"}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1.5fr_1fr]">
      <div className="space-y-3">
        <div className="relative aspect-video overflow-hidden rounded-xl border border-border/60 bg-[linear-gradient(140deg,var(--surface-2),var(--background))]">
          {activeRoom ? (
            <span className="absolute top-2 left-2 z-10">
              <Chip glow="var(--neon-pink)">LIVE</Chip>
            </span>
          ) : null}
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted={broadcasting}
            className="h-full w-full object-cover"
          />
          {!activeRoom && !broadcasting ? (
            <div className="absolute inset-0 grid place-items-center">
              <Radio className="h-10 w-10 text-neon-pink" />
            </div>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {broadcasting ? (
            <ActionButton onClick={() => stop.mutate()}>
              <span className="flex items-center gap-1.5">
                <VideoOff className="h-3.5 w-3.5" /> {lang === "pt" ? "Terminar live" : "End live"}
              </span>
            </ActionButton>
          ) : (
            <ActionButton onClick={() => start.mutate()}>
              <span className="flex items-center gap-1.5">
                <Video className="h-3.5 w-3.5" />{" "}
                {start.isPending
                  ? lang === "pt"
                    ? "A ligar..."
                    : "Connecting..."
                  : lang === "pt"
                    ? "Iniciar live"
                    : "Go live"}
              </span>
            </ActionButton>
          )}
          {activeRoom && !isOwner ? (
            <ActionButton variant="ghost" onClick={() => coffee.mutate()}>
              <span className="flex items-center gap-1.5">
                <Coffee className="h-3.5 w-3.5" /> {lang === "pt" ? "Enviar café" : "Send coffee"}
              </span>
            </ActionButton>
          ) : null}
          {activeRoom ? (
            <span className="text-[10px] tracking-wider text-muted-foreground uppercase">
              {activeRoom.title} · {activeRoom.game}
            </span>
          ) : null}
        </div>

        {!broadcasting ? (
          <div className="flex flex-wrap gap-2">
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="flex-1 rounded-lg border border-border/60 bg-background px-2 py-1.5 text-[11px]"
              placeholder={lang === "pt" ? "Título da live" : "Live title"}
            />
            <input
              value={game}
              onChange={(e) => setGame(e.target.value)}
              className="w-32 rounded-lg border border-border/60 bg-background px-2 py-1.5 text-[11px]"
              placeholder={lang === "pt" ? "Jogo" : "Game"}
            />
          </div>
        ) : null}

        {(rooms?.length ?? 0) > 0 ? (
          <div className="flex flex-wrap gap-2">
            {rooms?.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setRoomId(r.id)}
                className={`rounded-lg border px-2 py-1 text-[10px] ${
                  r.id === currentRoomId ? "border-primary text-foreground" : "border-border/60 text-muted-foreground"
                }`}
              >
                {r.title}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="flex max-h-[420px] flex-col rounded-xl border border-border/50 bg-surface-2/40 p-3">
        <p className="mb-2 font-display text-[11px] tracking-[0.18em] uppercase">Chat</p>
        <ul className="scroll-hidden flex-1 space-y-2 overflow-y-auto text-[11px]">
          {messages.length === 0 ? (
            <li className="text-muted-foreground">
              {lang === "pt" ? "Sem mensagens ainda." : "No messages yet."}
            </li>
          ) : (
            messages.map((m) => (
              <li key={m.id} className="flex gap-2">
                <span className="font-display text-neon-cyan">
                  {m.user_id === userId ? (lang === "pt" ? "Tu" : "You") : m.user_id.slice(0, 6)}
                </span>
                <span className="text-muted-foreground">{m.content}</span>
              </li>
            ))
          )}
        </ul>
        <div className="mt-2 flex gap-2">
          <input
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") void sendMessage();
            }}
            disabled={!currentRoomId}
            className="flex-1 rounded-lg border border-border/60 bg-background px-2 py-1.5 text-[11px]"
            placeholder={
              currentRoomId
                ? lang === "pt"
                  ? "Escreve uma mensagem"
                  : "Write a message"
                : lang === "pt"
                  ? "Entra numa live para falar"
                  : "Join a live to chat"
            }
          />
          <ActionButton variant="ghost" onClick={() => void sendMessage()}>
            {lang === "pt" ? "Enviar" : "Send"}
          </ActionButton>
        </div>
      </div>
    </div>
  );
}
