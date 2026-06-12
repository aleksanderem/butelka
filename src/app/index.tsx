import {
  Button,
  Card,
  Description,
  Input,
  Label,
  TextField,
  Typography,
} from "heroui-native";
import type { JSX } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ScrollView, Text, View } from "react-native";

type Phase = "lobby" | "spinning" | "chosen" | "task";
type ChallengeType = "prawda" | "wyzwanie";

type Player = {
  id: string;
  name: string;
};

const truthPrompts = [
  "Jaka byla twoja najdziwniejsza pierwsza randka?",
  "Kiedy ostatnio udawales, ze rozumiesz temat?",
  "Kto z pokoju najlatwiej rozbawilby cie do lez?",
  "Jaki sekret z dzieciństwa nadal cie smieszy?",
];

const darePrompts = [
  "Powiedz komplement kazdej osobie w pokoju.",
  "Zrob przez 10 sekund dramatyczna reklame butelki.",
  "Wyslij ostatnio uzyta emotke do wybranej osoby.",
  "Opowiedz historie zaczynajac kazde zdanie od slowa 'butelka'.",
];

const initialPlayers: Player[] = [
  { id: "player-1", name: "Ty" },
  { id: "player-2", name: "Maja" },
  { id: "player-3", name: "Olek" },
];

function makeRoomCode(): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

  return Array.from({ length: 5 }, () => alphabet[Math.floor(Math.random() * alphabet.length)]).join(
    "",
  );
}

function createPlayerName(index: number): string {
  return `Gracz ${index}`;
}

function getPrompt(type: ChallengeType): string {
  const prompts = type === "prawda" ? truthPrompts : darePrompts;

  return prompts[Math.floor(Math.random() * prompts.length)];
}

export default function HomeScreen(): JSX.Element {
  const [roomCode, setRoomCode] = useState(makeRoomCode);
  const [joinCode, setJoinCode] = useState("");
  const [players, setPlayers] = useState<Player[]>(initialPlayers);
  const [phase, setPhase] = useState<Phase>("lobby");
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const [luckyIndex, setLuckyIndex] = useState<number | null>(null);
  const [challengeType, setChallengeType] = useState<ChallengeType | null>(null);
  const [challengeText, setChallengeText] = useState<string | null>(null);
  const spinTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const luckyPlayer = luckyIndex === null ? null : players[luckyIndex];
  const canSpin = phase !== "spinning" && players.length >= 2;
  const normalizedJoinCode = joinCode.trim().toUpperCase();

  const roomStatus = useMemo(() => {
    if (phase === "spinning") {
      return "Karta przechodzi miedzy telefonami";
    }

    if (luckyPlayer) {
      return `${luckyPlayer.name} zostal szczesliwcem`;
    }

    return "Czekamy na graczy";
  }, [luckyPlayer, phase]);

  useEffect(() => {
    return () => {
      if (spinTimerRef.current) {
        clearTimeout(spinTimerRef.current);
      }
    };
  }, []);

  function handleCreateRoom(): void {
    setRoomCode(makeRoomCode());
    setPlayers(initialPlayers);
    setPhase("lobby");
    setActiveIndex(null);
    setLuckyIndex(null);
    setChallengeType(null);
    setChallengeText(null);
  }

  function handleJoinRoom(): void {
    if (!normalizedJoinCode) {
      return;
    }

    setRoomCode(normalizedJoinCode);
    setJoinCode("");
    setPhase("lobby");
    setLuckyIndex(null);
    setChallengeType(null);
    setChallengeText(null);
  }

  function handleAddPlayer(): void {
    setPlayers((currentPlayers) => [
      ...currentPlayers,
      {
        id: `player-${Date.now()}`,
        name: createPlayerName(currentPlayers.length + 1),
      },
    ]);
  }

  function handleSpin(): void {
    if (!canSpin) {
      return;
    }

    if (spinTimerRef.current) {
      clearTimeout(spinTimerRef.current);
    }

    const targetIndex = Math.floor(Math.random() * players.length);
    const rounds = players.length * 2 + targetIndex + 1;
    let step = 0;

    setPhase("spinning");
    setLuckyIndex(null);
    setChallengeType(null);
    setChallengeText(null);
    setActiveIndex(0);

    const tick = () => {
      step += 1;
      const nextIndex = step % players.length;
      setActiveIndex(nextIndex);

      if (step >= rounds) {
        setActiveIndex(targetIndex);
        setLuckyIndex(targetIndex);
        setPhase("chosen");
        return;
      }

      spinTimerRef.current = setTimeout(tick, 420);
    };

    spinTimerRef.current = setTimeout(tick, 420);
  }

  function handlePickChallenge(type: ChallengeType): void {
    setChallengeType(type);
    setChallengeText(getPrompt(type));
    setPhase("task");
  }

  return (
    <ScrollView className="flex-1 bg-background" contentContainerClassName="gap-5 px-5 py-8">
      <View className="gap-2">
        <Typography.Heading className="text-4xl">Butelka</Typography.Heading>
        <Typography.Paragraph className="text-muted">
          Mobilna gra imprezowa z pokojem, wspolna tura i losowaniem prawdy albo wyzwania.
        </Typography.Paragraph>
      </View>

      <Card className="gap-5" variant="secondary">
        <Card.Header className="items-start justify-between gap-4">
          <View className="gap-1">
            <Card.Description>Pokoj</Card.Description>
            <Card.Title className="text-3xl tracking-widest">{roomCode}</Card.Title>
          </View>
          <View className="rounded-full bg-background px-3 py-2">
            <Text className="text-sm font-semibold text-foreground">{players.length} graczy</Text>
          </View>
        </Card.Header>

        <Card.Body className="gap-3">
          <TextField>
            <Label>Kod pokoju</Label>
            <Input
              autoCapitalize="characters"
              maxLength={5}
              onChangeText={setJoinCode}
              placeholder="np. A7K2P"
              value={joinCode}
            />
            <Description>Wpisz kod od hosta albo utworz nowy pokoj.</Description>
          </TextField>
        </Card.Body>

        <Card.Footer className="gap-3">
          <Button className="flex-1" onPress={handleJoinRoom} variant="secondary">
            Dolacz
          </Button>
          <Button className="flex-1" onPress={handleCreateRoom} variant="primary">
            Nowy pokoj
          </Button>
        </Card.Footer>
      </Card>

      <Card className="gap-5">
        <Card.Header className="gap-1">
          <Card.Title>Tura</Card.Title>
          <Card.Description>{roomStatus}</Card.Description>
        </Card.Header>

        <Card.Body className="gap-4">
          <View className="flex-row flex-wrap gap-3">
            {players.map((player, index) => {
              const isActive = activeIndex === index;
              const isLucky = luckyIndex === index;

              return (
                <View
                  className={`min-h-24 w-[30%] min-w-24 flex-1 items-center justify-center rounded-lg border px-3 py-4 ${
                    isActive
                      ? "border-accent bg-accent"
                      : isLucky
                        ? "border-success bg-success/15"
                        : "border-border bg-secondary"
                  }`}
                  key={player.id}
                >
                  <Text
                    className={`text-center text-xs font-medium ${
                      isActive ? "text-accent-foreground" : "text-muted"
                    }`}
                  >
                    Telefon
                  </Text>
                  <Text
                    className={`mt-2 text-center text-lg font-bold ${
                      isActive ? "text-accent-foreground" : "text-foreground"
                    }`}
                  >
                    {isActive ? "Ty" : player.name}
                  </Text>
                </View>
              );
            })}
          </View>

          <Button onPress={handleAddPlayer} variant="tertiary">
            Dodaj telefon testowy
          </Button>
        </Card.Body>

        <Card.Footer className="gap-3">
          <Button className="flex-1" isDisabled={!canSpin} onPress={handleSpin} variant="primary">
            Losuj szczesliwca
          </Button>
        </Card.Footer>
      </Card>

      {luckyPlayer ? (
        <Card className="gap-5" variant="tertiary">
          <Card.Header className="gap-1">
            <Card.Description>Szczesliwiec</Card.Description>
            <Card.Title className="text-2xl">{luckyPlayer.name}</Card.Title>
          </Card.Header>

          <Card.Body className="gap-4">
            {phase === "task" && challengeType && challengeText ? (
              <View className="gap-2 rounded-lg bg-background p-4">
                <Text className="text-sm font-semibold uppercase tracking-widest text-muted">
                  {challengeType}
                </Text>
                <Text className="text-xl font-semibold leading-7 text-foreground">
                  {challengeText}
                </Text>
              </View>
            ) : (
              <Typography.Paragraph className="text-muted">
                Wybierz prawde albo wyzwanie, a gra wylosuje zadanie do wykonania.
              </Typography.Paragraph>
            )}
          </Card.Body>

          <Card.Footer className="gap-3">
            <Button
              className="flex-1"
              onPress={() => handlePickChallenge("prawda")}
              variant="secondary"
            >
              Prawda
            </Button>
            <Button
              className="flex-1"
              onPress={() => handlePickChallenge("wyzwanie")}
              variant="primary"
            >
              Wyzwanie
            </Button>
          </Card.Footer>
        </Card>
      ) : null}
    </ScrollView>
  );
}
